package api

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/peonii/inertia/internal/domain"
)

func (a *api) allGamesHandler(w http.ResponseWriter, r *http.Request) {
	games, err := a.gameRepo.FindAll(r.Context())
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find games")
		return
	}

  if len(games) == 0 {
    a.sendJson(w, http.StatusOK, []domain.Game{})
    return
  }

	a.sendJson(w, http.StatusOK, games)
}

func (a *api) hostedGamesHandler(w http.ResponseWriter, r *http.Request) {
	uid := a.session(r)

	games, err := a.gameRepo.FindAllByHostID(r.Context(), uid)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find games")
		return
	}

	a.sendJson(w, http.StatusOK, games)
}

func (a *api) gameByIdHandler(w http.ResponseWriter, r *http.Request) {
	uid := chi.URLParam(r, "id")

	game, err := a.gameRepo.FindOne(r.Context(), uid)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find game")
		return
	}

	a.sendJson(w, http.StatusOK, game)
}

func (a *api) createGameHandler(w http.ResponseWriter, r *http.Request) {
	uid := a.session(r)

	var gamec domain.GameCreate
	if err := json.NewDecoder(r.Body).Decode(&gamec); err != nil {
		a.sendError(w, r, http.StatusBadRequest, err, "failed to decode game")
		return
	}

	gamec.HostID = uid

	game, err := a.gameRepo.Create(r.Context(), &gamec)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to create game")
		return
	}

	a.sendJson(w, http.StatusCreated, game)
}
