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

func (a *api) teamByIDHandler(w http.ResponseWriter, r *http.Request) {
	tid := chi.URLParam(r, "id")

	team, err := a.teamRepo.FindOne(r.Context(), tid)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find team")
		return
	}

	a.sendJson(w, http.StatusOK, team)
}

func (a *api) joinedTeamsHandler(w http.ResponseWriter, r *http.Request) {
	uid := a.session(r)

	teams, err := a.teamRepo.FindByUserID(r.Context(), uid)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find teams")
		return
	}

	if len(teams) == 0 {
		a.sendJson(w, http.StatusOK, []domain.Team{})
		return
	}

	a.sendJson(w, http.StatusOK, teams)
}

func (a *api) joinTeamHandler(w http.ResponseWriter, r *http.Request) {
	uid := a.session(r)

	tid := chi.URLParam(r, "id")

	var body struct {
		GameInviteCode string `json:"invite"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		a.sendError(w, r, http.StatusBadRequest, err, "failed to decode body")
		return
	}

	invite, err := a.gameInviteRepo.FindBySlug(r.Context(), body.GameInviteCode)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find invite")
		return
	}

	team, err := a.teamRepo.FindOne(r.Context(), tid)
	if team.GameID != invite.GameID {
		a.sendError(w, r, http.StatusUnauthorized, err, "failed to verify invite")
		return
	}

	err = a.teamRepo.AddTeamMember(r.Context(), tid, uid)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to join team")
		return
	}

	// We can bail early because user stats are a secondary thing
	stats, err := a.userStatsRepo.Get(r.Context(), uid)
	if err != nil {
		a.sendJson(w, http.StatusOK, nil)
		return
	}

	stats.Games++
	err = a.userStatsRepo.Update(r.Context(), uid, stats)

	a.sendJson(w, http.StatusOK, nil)
}

func (a *api) createTeamHandler(w http.ResponseWriter, r *http.Request) {
	var teamc domain.TeamCreate
	if err := json.NewDecoder(r.Body).Decode(&teamc); err != nil {
		a.sendError(w, r, http.StatusBadRequest, err, "failed to decode team")
	}

	invite, err := a.gameInviteRepo.FindBySlug(r.Context(), teamc.GameInvite)
	if err != nil {
		a.sendError(w, r, http.StatusUnauthorized, err, "invalid invite")
		return
	}

	teamc.GameID = invite.GameID

	team, err := a.teamRepo.Create(r.Context(), &teamc)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to create team")
		return
	}

	a.sendJson(w, http.StatusOK, team)
}
