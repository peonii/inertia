package api

import (
	"encoding/json"
	"net/http"

	"github.com/peonii/inertia/internal/domain"
)

func (a *api) usePowerupHandler(w http.ResponseWriter, r *http.Request) {
	uid := a.session(r)

	var body domain.PowerupCreate
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		a.sendError(w, r, http.StatusBadRequest, err, "failed to decode powerup")
	}

	team, err := a.teamRepo.FindOne(r.Context(), body.CasterID)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find team")
	}

	user, err := a.userRepo.FindOne(r.Context(), uid)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find user")
	}

	isMember, err := a.teamRepo.IsTeamMember(r.Context(), team, user)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to check team membership")
	}

	if !isMember {
		a.sendError(w, r, http.StatusUnauthorized, nil, "user is not a member of the team")
		return
	}

	cost := 0
	switch body.Type {
	case domain.PowerupTypeBlacklist:
		cost = 600
	case domain.PowerupTypeFreezeHunters:
		cost = 1000
	case domain.PowerupTypeFreezeRunners:
		cost = 1000
	case domain.PowerupTypeHunt:
		cost = 200
	case domain.PowerupTypeHideTracker:
		cost = 500
	case domain.PowerupTypeRevealHunters:
		cost = 400
	}

	if team.Balance < cost {
		a.sendError(w, r, http.StatusUnauthorized, nil, "team does not have enough balance")
		return
	}

	newBalance := team.Balance - cost
	tu := domain.TeamUpdate{
		Balance: &newBalance,
	}

	team, err = a.teamRepo.Update(r.Context(), body.CasterID, &tu)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to update team balance")
		return
	}

	err = a.powerupRepo.Create(r.Context(), &body)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to create powerup")
		return
	}

	a.sendJson(w, http.StatusOK, nil)
}
