package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

func (a *api) allGamesHandler(w http.ResponseWriter, r *http.Request) {
	games, err := a.gameRepo.FindAll(r.Context())
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find games")
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
