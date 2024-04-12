package api

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

func (a *api) userMeHandler(w http.ResponseWriter, r *http.Request) {
	uid := a.session(r)

	user, err := a.userRepo.FindOne(r.Context(), uid)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find user")
		return
	}

	a.sendJson(w, http.StatusOK, user)
}

func (a *api) userByIdHandler(w http.ResponseWriter, r *http.Request) {
	uid := chi.URLParam(r, "id")

	user, err := a.userRepo.FindOne(r.Context(), uid)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find user")
		return
	}

	a.sendJson(w, http.StatusOK, user)
}

func (a *api) userStatsHandler(w http.ResponseWriter, r *http.Request) {
	uid := chi.URLParam(r, "id")

	user, err := a.userStatsRepo.Get(r.Context(), uid)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find user")
		return
	}

	a.sendJson(w, http.StatusOK, user)
}

func (a *api) leaderboardHandler(w http.ResponseWriter, r *http.Request) {
	cursor := r.URL.Query().Get("cursor")
	if cursor == "" {
		cursor = "0"
	}

	offset, err := strconv.Atoi(cursor)
	if err != nil {
		a.sendError(w, r, http.StatusBadRequest, err, "invalid cursor")
		return
	}

	users, err := a.userStatsRepo.GetTop(r.Context(), offset)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find users")
		return
	}

	a.sendJson(w, http.StatusOK, users)
}

type placementResponse struct {
	Placement int `json:"placement"`
}

func (a *api) leaderboardPlacementHandler(w http.ResponseWriter, r *http.Request) {
	uid := chi.URLParam(r, "id")

	placement, err := a.userStatsRepo.GetPlacementOfUser(r.Context(), uid)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find user")
		return
	}

	a.sendJson(w, http.StatusOK, placementResponse{Placement: placement})
}
