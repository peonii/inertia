package api

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/peonii/inertia/internal/domain"
)

func (a *api) authorizeHandler(w http.ResponseWriter, r *http.Request) {
	queryParams := r.URL.Query()

	// We're implementing only one response type
	responseType := queryParams.Get("response_type")
	if responseType != "code" {
		a.sendError(w, r, http.StatusBadRequest, nil, "invalid response type")
		return
	}

	// We don't support scopes (no need)
	// Nor do we require a client_id (also no need)

	redirectUri := queryParams.Get("redirect_uri")
	if redirectUri == "" {
		a.sendError(w, r, http.StatusBadRequest, nil, "invalid redirect uri")
		return
	}

	// We need to set a cookie for redirect_uri
	// since we're redirecting to Discord for
	// account authorization
	http.SetCookie(w, &http.Cookie{
		Name:     "redirect_uri",
		Value:    redirectUri,
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Now().Add(5 * time.Minute),
	})

	state := make([]byte, 16)
	if _, err := rand.Read(state); err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to generate state")
		return
	}

	stateEnc := base64.URLEncoding.EncodeToString(state)

	http.SetCookie(w, &http.Cookie{
		Name:     "state",
		Value:    stateEnc,
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Now().Add(5 * time.Minute),
	})

	discordEndpoint := fmt.Sprintf("https://discord.com/oauth2/authorize?response_type=code&client_id=%s&scope=identify%%20email&state=%s&redirect_uri=%s",
		a.config.DiscordClientID,
		stateEnc,
		a.config.DiscordRedirectURI,
	)

	http.Redirect(w, r, discordEndpoint, http.StatusFound)
}

func (a *api) authorizeCallbackHandler(w http.ResponseWriter, r *http.Request) {
	queryParams := r.URL.Query()

	state := queryParams.Get("state")
	if state == "" {
		a.sendError(w, r, http.StatusBadRequest, nil, "invalid state")
		return
	}

	cookie, err := r.Cookie("state")
	if err != nil {
		a.sendError(w, r, http.StatusBadRequest, err, "invalid state")
		return
	}

	if cookie.Value != state {
		a.sendError(w, r, http.StatusBadRequest, nil, "invalid state")
		return
	}

	code := queryParams.Get("code")
	if code == "" {
		a.sendError(w, r, http.StatusBadRequest, nil, "invalid code")
		return
	}

	cookie, err = r.Cookie("redirect_uri")
	if err != nil {
		a.sendError(w, r, http.StatusBadRequest, err, "invalid redirect uri")
		return
	}

	redirectUri := cookie.Value

	data := url.Values{}
	data.Set("client_id", a.config.DiscordClientID)
	data.Set("client_secret", a.config.DiscordClientSecret)
	data.Set("grant_type", "authorization_code")
	data.Set("code", code)
	data.Set("redirect_uri", a.config.DiscordRedirectURI)

	endpoint := "https://discord.com/api/oauth2/token"
	req, err := http.NewRequest("POST", endpoint, strings.NewReader(data.Encode()))
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to create request")
		return
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to make request")
		return
	}
	defer resp.Body.Close()

	var tokenResp struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to decode response")
		return
	}

	req, err = http.NewRequest("GET", "https://discord.com/api/v10/users/@me", nil)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to create request")
		return
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", tokenResp.AccessToken))
	var userResp struct {
		ID       string `json:"id"`
		Username string `json:"username"`
		Email    string `json:"email"`
		Image    string `json:"avatar"`
	}

	resp, err = http.DefaultClient.Do(req)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to make request")
		return
	}
	defer resp.Body.Close()

	if err := json.NewDecoder(resp.Body).Decode(&userResp); err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to decode response")
		return
	}

	user, err := a.userRepo.FindByDiscordID(r.Context(), userResp.ID)
	if err != nil {
		// User doesn't exist, create a new one

		userCreate := &domain.UserCreate{
			DiscordID: userResp.ID,
			Name:      userResp.Username,
			Email:     userResp.Email,
			Image:     userResp.Image,

			AccessToken:  tokenResp.AccessToken,
			RefreshToken: tokenResp.RefreshToken,

			AuthLevel: domain.UserAuthLevelBasic,
		}

		user, err = a.userRepo.Create(r.Context(), userCreate)
		if err != nil {
			a.sendError(w, r, http.StatusInternalServerError, err, "failed to create user")
			return
		}
	} else {
		// User exists, update their tokens, image and name

		user.AccessToken = tokenResp.AccessToken
		user.RefreshToken = tokenResp.RefreshToken
		user.Image = userResp.Image
		user.Name = userResp.Username

		user, err = a.userRepo.Update(r.Context(), user)
		if err != nil {
			a.sendError(w, r, http.StatusInternalServerError, err, "failed to update user")
			return
		}
	}

	oauthCode, err := a.oauthCodeRepo.CreateOAuthCode(r.Context(), user.ID)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to create oauth code")
		return
	}

	// Redirect to redirect_uri with code
	http.Redirect(w, r, fmt.Sprintf("%s?code=%s", redirectUri, oauthCode.Code), http.StatusFound)
}

const (
	grantTypeAuthorizationCode = "authorization_code"
	grantTypeRefreshToken      = "refresh_token"
)

func (a *api) tokenCreationHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Code         string `json:"code"`          // Only used for authorization_code grant type
		RefreshToken string `json:"refresh_token"` // Only used for refresh_token grant type
		GrantType    string `json:"grant_type"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		a.sendError(w, r, http.StatusBadRequest, err, "failed to decode request body")
		return
	}

	if req.GrantType == grantTypeAuthorizationCode {
		code, err := a.oauthCodeRepo.FindOAuthCodeByToken(r.Context(), req.Code)
		if err != nil {
			a.sendError(w, r, http.StatusBadRequest, err, "invalid code")
		}

		if code.ExpiresAt.Before(time.Now()) {
			a.sendError(w, r, http.StatusBadRequest, err, "code expired")
		}

		rt, err := a.refreshTokenRepo.CreateRefreshToken(r.Context(), code.UserID)
		if err != nil {
			a.sendError(w, r, http.StatusInternalServerError, err, "failed to create token")
			return
		}

		at, err := a.accessTokenRepo.CreateAccessToken(code.UserID)
		if err != nil {
			a.sendError(w, r, http.StatusInternalServerError, err, "failed to create token")
			return
		}

		if err := a.oauthCodeRepo.DeleteOAuthCodeByToken(r.Context(), req.Code); err != nil {
			a.sendError(w, r, http.StatusInternalServerError, err, "failed to clean up")
			return
		}

		resp := struct {
			AccessToken  string `json:"access_token"`
			RefreshToken string `json:"refresh_token"`
			ExpiresIn    int    `json:"expires_in"`
			TokenType    string `json:"token_type"`
		}{
			AccessToken:  at,
			RefreshToken: rt.Token,
			ExpiresIn:    5 * 60,
			TokenType:    "Bearer",
		}

		a.sendJson(w, http.StatusOK, resp)
	} else if req.GrantType == grantTypeRefreshToken {
		rt, err := a.refreshTokenRepo.FindRefreshTokenByToken(r.Context(), req.RefreshToken)
		if err != nil {
			a.sendError(w, r, http.StatusBadRequest, err, "invalid refresh token")
			return
		}

		if rt.ExpiresAt.Before(time.Now()) {
			a.sendError(w, r, http.StatusBadRequest, err, "refresh token expired")
			return
		}

		at, err := a.accessTokenRepo.CreateAccessToken(rt.UserID)
		if err != nil {
			a.sendError(w, r, http.StatusInternalServerError, err, "failed to create token")
			return
		}

		resp := struct {
			AccessToken string `json:"access_token"`
			ExpiresIn   int    `json:"expires_in"`
			TokenType   string `json:"token_type"`
		}{
			AccessToken: at,
			ExpiresIn:   5 * 60,
			TokenType:   "Bearer",
		}

		a.sendJson(w, http.StatusOK, resp)
	} else {
		a.sendError(w, r, http.StatusBadRequest, nil, "unsupported grant type")
		return
	}
}
