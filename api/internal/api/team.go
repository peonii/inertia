package api

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/peonii/inertia/internal/domain"
)

func (a *api) teamsByGameIDHandler(w http.ResponseWriter, r *http.Request) {
	gid := chi.URLParam(r, "id")

	teams, err := a.teamRepo.FindByGameID(r.Context(), gid)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find teams")
		return
	}

	a.sendJson(w, http.StatusOK, teams)
}

func (a *api) joinedTeamsHandler(w http.ResponseWriter, r *http.Request) {
	uid := a.session(r)

	teams, err := a.teamRepo.FindByUserID(r.Context(), uid)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find teams")
		return
	}

	a.sendJson(w, http.StatusOK, teams)
}

func (a *api) createTeamHandler(w http.ResponseWriter, r *http.Request) {
	var teamc domain.TeamCreate
	if err := json.NewDecoder(r.Body).Decode(&teamc); err != nil {
		a.sendError(w, r, http.StatusBadRequest, err, "failed to decode team")
	}

	team, err := a.teamRepo.Create(r.Context(), &teamc)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to create team")
		return
	}

	a.sendJson(w, http.StatusOK, team)
}
