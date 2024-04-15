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

	devices, err := a.notifRepo.GetDevicesForUser(r.Context(), uid)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to get devices")
		return
	}

	for _, device := range devices {
		n := domain.Notification{
			Title: "Published new location",
			Body:  "You published a new location",

			DeviceID: device.ID,
			Priority: 10,
		}
		marshaled, _ := json.Marshal(n)
		a.queue.PublishBytes(marshaled)
	}

	a.wsHub.Broadcast <- wsLocationMsg{
		GameID:   loc.GameID,
		Location: loc.Location,
		UserID:   uid,
	}

	a.sendJson(w, http.StatusOK, loc)
}
