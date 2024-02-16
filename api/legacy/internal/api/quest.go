package api

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/peonii/inertia/internal/domain"
)

func (a *api) teamQuestsHandler(w http.ResponseWriter, r *http.Request) {
	teamID := chi.URLParam(r, "id")

	quests, err := a.questRepo.FindActiveByTeamID(r.Context(), teamID)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find quests")
		return
	}

	a.sendJson(w, http.StatusOK, quests)
}

func (a *api) questByIdHandler(w http.ResponseWriter, r *http.Request) {
	questID := chi.URLParam(r, "id")

	quest, err := a.questRepo.FindOne(r.Context(), questID)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find quest")
		return
	}

	a.sendJson(w, http.StatusOK, quest)
}

func (a *api) createQuestHandler(w http.ResponseWriter, r *http.Request) {
	uid := a.session(r)
	u, err := a.userRepo.FindOne(r.Context(), uid)

	var questc domain.QuestCreate
	if err := json.NewDecoder(r.Body).Decode(&questc); err != nil {
		a.sendError(w, r, http.StatusBadRequest, err, "failed to decode quest")
		return
	}

	game, err := a.gameRepo.FindOne(r.Context(), questc.GameID)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find game")
		return
	}

	if game.CanEdit(u) {
		a.sendError(w, r, http.StatusForbidden, nil, "you are not the host of this game")
		return
	}

	quest, err := a.questRepo.Create(r.Context(), &questc)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to create quest")
		return
	}

	a.sendJson(w, http.StatusCreated, quest)
}

func (a *api) completeQuestHandler(w http.ResponseWriter, r *http.Request) {
	uid := a.session(r)
	u, err := a.userRepo.FindOne(r.Context(), uid)

	id := chi.URLParam(r, "id")
	quest, err := a.questRepo.FindActive(r.Context(), id)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find quest")
		return
	}

	team, err := a.teamRepo.FindOne(r.Context(), quest.TeamID)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find team")
		return
	}

	isMember, err := a.teamRepo.IsTeamMember(r.Context(), team, u)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to check team membership")
		return
	}

	if !isMember {
		a.sendError(w, r, http.StatusForbidden, nil, "you are not a member of this team")
		return
	}

	err = a.questRepo.Complete(r.Context(), id)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to complete quest")
		return
	}

	a.sendJson(w, http.StatusOK, nil)
}
