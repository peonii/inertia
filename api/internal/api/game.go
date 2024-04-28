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

func (a *api) updateGameHandler(w http.ResponseWriter, r *http.Request) {
	uid := a.session(r)
	gid := chi.URLParam(r, "id")

	game, err := a.gameRepo.FindOne(r.Context(), gid)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find game")
		return
	}

	if game.HostID != uid {
		a.sendError(w, r, http.StatusForbidden, nil, "cannot edit someone else's game")
		return
	}

	var gameu domain.GameUpdate
	if err := json.NewDecoder(r.Body).Decode(&gameu); err != nil {
		a.sendError(w, r, http.StatusBadRequest, err, "failed to decode game")
		return
	}

	game, err = a.gameRepo.Update(r.Context(), gid, &gameu)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to update game")
		return
	}

	a.sendJson(w, http.StatusOK, game)
}

func (a *api) deleteGameHandler(w http.ResponseWriter, r *http.Request) {
	uid := a.session(r)
	gid := chi.URLParam(r, "id")

	game, err := a.gameRepo.FindOne(r.Context(), gid)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find game")
		return
	}

	if game.HostID != uid {
		a.sendError(w, r, http.StatusForbidden, nil, "cannot delete someone else's game")
		return
	}

	if err := a.gameRepo.Delete(r.Context(), gid); err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to delete game")
		return
	}

	a.sendJson(w, http.StatusNoContent, nil)
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

func (a *api) generateMainQuestsHandler(w http.ResponseWriter, r *http.Request) {
	uid := a.session(r)
	gid := chi.URLParam(r, "id")

	game, err := a.gameRepo.FindOne(r.Context(), gid)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find game")
		return
	}

	if game.HostID != uid {
		a.sendError(w, r, http.StatusForbidden, nil, "cannot generate quests for someone else's game")
		return
	}

	if err := a.questRepo.GenerateMainQuests(r.Context(), gid); err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to generate main quests")
		return
	}

	a.sendJson(w, http.StatusNoContent, nil)
}

func (a *api) createGameInvite(w http.ResponseWriter, r *http.Request) {
	uid := a.session(r)
	gid := chi.URLParam(r, "id")

	game, err := a.gameRepo.FindOne(r.Context(), gid)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find game")
		return
	}

	if game.HostID != uid {
		a.sendError(w, r, http.StatusForbidden, nil, "cannot invite to someone else's game")
		return
	}

	var invite domain.GameInviteCreate
	invite.GameID = gid

	inv, err := a.gameInviteRepo.Create(r.Context(), &invite)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to create invite")
		return
	}

	a.sendJson(w, http.StatusCreated, inv)
}

func (a *api) purgeActiveQuestsHandler(w http.ResponseWriter, r *http.Request) {
	uid := a.session(r)
	gid := chi.URLParam(r, "id")

	game, err := a.gameRepo.FindOne(r.Context(), gid)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find game")
		return
	}

	if game.HostID != uid {
		a.sendError(w, r, http.StatusForbidden, nil, "cannot purge someone else's game")
		return
	}

	if err := a.questRepo.PurgeAllActive(r.Context(), gid); err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to purge active quests")
		return
	}

	a.sendJson(w, http.StatusNoContent, nil)
}
