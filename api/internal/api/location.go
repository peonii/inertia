package api

import (
	"encoding/json"
	"net/http"

	"github.com/peonii/inertia/internal/domain"
)

type LocationPayload struct {
	Location domain.LocationCreate `json:"location"`
	GameID   string                `json:"game_id"`
}

func (a *api) updateLocationHandler(w http.ResponseWriter, r *http.Request) {
	uid := a.session(r)
	var loc LocationPayload
	if err := json.NewDecoder(r.Body).Decode(&loc); err != nil {
		a.sendError(w, r, http.StatusBadRequest, err, "failed to decode location")
	}

	loc.Location.UserID = uid

	err := a.locationRepo.Store(r.Context(), &loc.Location)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to update location")
		return
	}

	a.wsHub.Broadcast <- wsLocationMsg{
		GameID:   loc.GameID,
		Location: loc.Location,
		UserID:   uid,
	}

	a.sendJson(w, http.StatusOK, loc)
}
