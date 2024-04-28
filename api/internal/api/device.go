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

	_, err := a.notifRepo.GetDeviceByToken(r.Context(), device.Token)
	if err != nil {
		_, err := a.notifRepo.CreateDevice(r.Context(), &device)
		if err != nil {
			a.sendError(w, r, http.StatusInternalServerError, err, "failed to create device")
			return
		}

		a.sendJson(w, http.StatusOK, nil)
	} else {
		// Device already exists
		a.sendJson(w, http.StatusOK, nil)
	}
}

func (a *api) UNSTABLE_testNotificationDelivery(w http.ResponseWriter, r *http.Request) {
	// This is a test endpoint to send a notification to a device
	// This is an unstable endpoint and should be removed in production
	// It is intended for testing purposes only

	user := a.session(r)

	devices, err := a.notifRepo.GetDevicesForUser(r.Context(), user)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to get devices")
		return
	}

	for _, device := range devices {
		notification := domain.Notification{
			Title:    "Test Notification",
			Body:     "This is a test notification",
			DeviceID: device.ID,
			Priority: 10,
		}

		err := a.scheduleNotification(&notification)
		if err != nil {
			a.sendError(w, r, http.StatusInternalServerError, err, "failed to schedule notification")
			return
		}
	}

	a.sendJson(w, http.StatusOK, nil)
}
