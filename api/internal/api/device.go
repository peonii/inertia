package api

import (
	"encoding/json"
	"net/http"

	"github.com/peonii/inertia/internal/domain"
)

func (a *api) registerDeviceHandler(w http.ResponseWriter, r *http.Request) {
	s := a.session(r)

	var device domain.DeviceCreate
	if err := json.NewDecoder(r.Body).Decode(&device); err != nil {
		a.sendError(w, r, http.StatusBadRequest, err, "invalid device")
		return
	}

	device.UserID = s

	_, err := a.notifRepo.CreateDevice(r.Context(), &device)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to create device")
		return
	}

	a.sendJson(w, http.StatusOK, nil)
}
