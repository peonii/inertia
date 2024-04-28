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

	err = a.powerupRepo.Create(r.Context(), &body)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to create powerup")
		return
	}

	a.sendJson(w, http.StatusOK, nil)
}
