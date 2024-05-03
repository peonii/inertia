package api

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/peonii/inertia/internal/domain"
	"go.uber.org/zap"
)

type wsAuthPayload struct {
	Token  string `json:"t"`
	GameID string `json:"g"`
}

func (a *api) getUserFromPayload(ctx context.Context, payload *wsAuthPayload) (*domain.User, error) {
	token := payload.Token

	jt, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil {
		return nil, err
	}

	if !jt.Valid {
		return nil, fmt.Errorf("invalid jwt")
	}

	uid, err := jt.Claims.GetSubject()
	if err != nil {
		return nil, err
	}

	user, err := a.userRepo.FindOne(ctx, uid)
	return user, err
}

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

	csrfState := queryParams.Get("state")
	if csrfState == "" {
		a.sendError(w, r, http.StatusBadRequest, nil, "must provide state")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "csrf_state",
		Value:    csrfState,
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Now().Add(5 * time.Minute),
	})

	// We need to set a cookie for redirect_uri
	// since we're redirecting to Discord for
	// account authorization
	http.SetCookie(w, &http.Cookie{
		Name:     "redirect_uri",
		Value:    redirectUri,
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Now().Add(5 * time.Minute),
	})

	provider := queryParams.Get("provider")
	if provider == "" {
		a.sendError(w, r, http.StatusBadRequest, nil, "must provide provider")
		return
	}

	if provider == "discord" {
		state := make([]byte, 16)
		if _, err := rand.Read(state); err != nil {
			a.sendError(w, r, http.StatusInternalServerError, err, "failed to generate state")
			return
		}

		stateEnc := base64.URLEncoding.EncodeToString(state)

		http.SetCookie(w, &http.Cookie{
			Name:  "state",
			Value: stateEnc,

			SameSite: http.SameSiteLaxMode,
			HttpOnly: true,
			Secure:   true,

			Expires: time.Now().Add(5 * time.Minute),
		})

		discordEndpoint := fmt.Sprintf("https://discord.com/oauth2/authorize?response_type=code&client_id=%s&scope=identify%%20email&state=%s&redirect_uri=%s",
			a.config.DiscordClientID,
			stateEnc,
			a.config.DiscordRedirectURI,
		)

		http.Redirect(w, r, discordEndpoint, http.StatusFound)
	} else if provider == "test" {
		// randomName := make([]byte, 16)
		// if _, err := rand.Read(randomName); err != nil {
		// 	a.sendError(w, r, http.StatusInternalServerError, err, "failed to generate random name")
		// 	return
		// }

		// randomNameEnc := base64.URLEncoding.EncodeToString(randomName)

		// userCreate := &domain.UserCreate{
		// 	Name:        randomNameEnc,
		// 	DisplayName: randomNameEnc,
		// 	Image:       "",

		// 	AuthRole: domain.UserAuthRoleBasic,
		// }

		// a.logger.Info("creating user",
		// 	zap.Any("user", userCreate),
		// )

		// user, err := a.userRepo.Create(r.Context(), userCreate)
		// if err != nil {
		// 	a.sendError(w, r, http.StatusInternalServerError, err, "failed to create user")
		// 	return
		// }

		// accountCreate := &domain.AccountCreate{
		// 	UserID:       user.ID,
		// 	AccountType:  "test",
		// 	AccountID:    randomNameEnc,
		// 	Email:        randomNameEnc + "-test",
		// 	AccessToken:  "",
		// 	RefreshToken: "",
		// }

		// _, err = a.accountRepo.Create(r.Context(), accountCreate)
		// if err != nil {
		// 	a.sendError(w, r, http.StatusInternalServerError, err, "failed to create account")
		// 	return
		// }

		// err = a.userStatsRepo.Init(r.Context(), user.ID)
		// if err != nil {
		// 	a.sendError(w, r, http.StatusInternalServerError, err, "failed to init stats")
		// 	return
		// }

		// g, err := a.gameRepo.Create(r.Context(), &domain.GameCreate{
		// 	Name:   "Test Game",
		// 	HostID: user.ID,

		// 	TimeStart: time.Now(),
		// 	TimeEnd:   time.Now().Add(1 * time.Hour),

		// 	LocLat: 0,
		// 	LocLng: 0,
		// })
		// if err != nil {
		// 	a.sendError(w, r, http.StatusInternalServerError, err, "failed to create game")
		// 	return
		// }

		// t, err := a.teamRepo.Create(r.Context(), &domain.TeamCreate{
		// 	Name:       "Test Team",
		// 	GameID:     g.ID,
		// 	Color:      "#ff0000",
		// 	Emoji:      "🔴",
		// 	GameInvite: "",
		// })
		// if err != nil {
		// 	a.sendError(w, r, http.StatusInternalServerError, err, "failed to create team")
		// 	return
		// }

		// err = a.teamRepo.AddTeamMember(r.Context(), t.ID, user.ID)
		// if err != nil {
		// 	a.sendError(w, r, http.StatusInternalServerError, err, "failed to add team member")
		// 	return
		// }

		// oauthCode, err := a.oauthCodeRepo.CreateOAuthCode(r.Context(), user.ID)
		// if err != nil {
		// 	a.sendError(w, r, http.StatusInternalServerError, err, "failed to create oauth code")
		// 	return
		// }

		// // Redirect to redirect_uri with code
		// http.Redirect(w, r, fmt.Sprintf("%s?code=%s&state=%s", redirectUri, oauthCode.Code, csrfState), http.StatusFound)
		a.sendError(w, r, http.StatusNotImplemented, nil, "test provider not implemented")
		return
	} else {
		a.sendError(w, r, http.StatusBadRequest, nil, "invalid provider - must be \"discord\"")
		return
	}
}

func (a *api) authorizeDiscordCallbackHandler(w http.ResponseWriter, r *http.Request) {
	queryParams := r.URL.Query()

	csrfState, err := r.Cookie("csrf_state")
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to get csrf state")
		return
	}

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
		ID          string `json:"id"`
		Username    string `json:"username"`
		DisplayName string `json:"global_name"`
		Email       string `json:"email"`
		Image       string `json:"avatar"`
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

	var user *domain.User
	account, err := a.accountRepo.FindByAccountID(r.Context(), userResp.ID, "discord")
	if err != nil || account == nil {
		accts, err := a.accountRepo.FindByEmail(r.Context(), userResp.Email)
		if err != nil || len(accts) == 0 {
			// This means the user doesn't exist and we have to create them

			dn := userResp.DisplayName
			if dn == "" {
				dn = userResp.Username
			}

			userCreate := &domain.UserCreate{
				Name:        userResp.Username,
				DisplayName: dn,
				Image:       "https://cdn.discordapp.com/avatars/" + userResp.ID + "/" + userResp.Image + ".png",

				AuthRole: domain.UserAuthRoleBasic,
			}

			a.logger.Info("creating user",
				zap.Any("user", userCreate),
			)

			user, err = a.userRepo.Create(r.Context(), userCreate)
			if err != nil {
				a.sendError(w, r, http.StatusInternalServerError, err, "failed to create user")
				return
			}
		} else {
			user, err = a.userRepo.FindOne(r.Context(), account.UserID)
			if err != nil {
				a.sendError(w, r, http.StatusInternalServerError, err, "failed to find user (non-critical)")
				return
			}

			dn := userResp.DisplayName
			if dn == "" {
				dn = userResp.Username
			}

			user.Image = "https://cdn.discordapp.com/avatars/" + userResp.ID + "/" + userResp.Image + ".png"

			user, err = a.userRepo.Update(r.Context(), user)
			if err != nil {
				a.sendError(w, r, http.StatusInternalServerError, err, "failed to update user")
				return
			}

		}

		accountCreate := &domain.AccountCreate{
			UserID:       user.ID,
			AccountType:  "discord",
			AccountID:    userResp.ID,
			Email:        userResp.Email,
			AccessToken:  tokenResp.AccessToken,
			RefreshToken: tokenResp.RefreshToken,
		}

		_, err = a.accountRepo.Create(r.Context(), accountCreate)
		if err != nil {
			a.sendError(w, r, http.StatusInternalServerError, err, "failed to create account")
			return
		}
	} else {
		// User exists, update their image

		user, err = a.userRepo.FindOne(r.Context(), account.UserID)
		if err != nil {
			// Something went REALLY wrong
			a.sendError(w, r, http.StatusInternalServerError, err, "failed to find user")
			return
		}

		dn := userResp.DisplayName
		if dn == "" {
			dn = userResp.Username
		}

		user.Image = "https://cdn.discordapp.com/avatars/" + userResp.ID + "/" + userResp.Image + ".png"

		user, err = a.userRepo.Update(r.Context(), user)
		if err != nil {
			a.sendError(w, r, http.StatusInternalServerError, err, "failed to update user")
			return
		}

		account.AccessToken = tokenResp.AccessToken
		account.RefreshToken = tokenResp.RefreshToken

		_, err = a.accountRepo.Update(r.Context(), account)
	}

	_, err = a.userStatsRepo.Get(r.Context(), user.ID)
	if err != nil {
		if err := a.userStatsRepo.Init(r.Context(), user.ID); err != nil {
			a.sendError(w, r, http.StatusInternalServerError, err, "failed to init stats")
			return
		}
	}

	oauthCode, err := a.oauthCodeRepo.CreateOAuthCode(r.Context(), user.ID)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to create oauth code")
		return
	}

	// Redirect to redirect_uri with code
	http.Redirect(w, r, fmt.Sprintf("%s?code=%s&state=%s", redirectUri, oauthCode.Code, csrfState.Value), http.StatusFound)
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
			return
		}

		if code.ExpiresAt.Before(time.Now()) {
			a.sendError(w, r, http.StatusBadRequest, err, "code expired")
			return
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
