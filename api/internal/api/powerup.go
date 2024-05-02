package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/peonii/inertia/internal/domain"
)

func (a *api) getPowerupsForGameHandler(w http.ResponseWriter, r *http.Request) {
	gameID := chi.URLParam(r, "id")

	powerups, err := a.powerupRepo.GetActiveByGameID(r.Context(), gameID)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find powerups")
		return
	}

	a.sendJson(w, http.StatusOK, powerups)
}

func (a *api) usePowerupHandler(w http.ResponseWriter, r *http.Request) {
	uid := a.session(r)

	var body domain.PowerupCreate
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		a.sendError(w, r, http.StatusBadRequest, err, "failed to decode powerup")
		return
	}

	team, err := a.teamRepo.FindOne(r.Context(), body.CasterID)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find team")
		return
	}

	user, err := a.userRepo.FindOne(r.Context(), uid)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find user")
		return
	}

	isMember, err := a.teamRepo.IsTeamMember(r.Context(), team, user)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to check team membership")
		return
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

	pow, err := a.powerupRepo.Create(r.Context(), &body)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to create powerup")
		return
	}

	go func(a *api) {
		members, err := a.teamRepo.FindMembers(r.Context(), team.ID)
		if err != nil {
			return
		}

		users, err := a.gameRepo.FindAllUsersIDs(r.Context(), team.GameID)
		if err != nil {
			return
		}

		// Remove all team members from notified users
		for _, member := range members {
			for i, user := range users {
				if user == member.ID {
					users = append(users[:i], users[i+1:]...)
					break
				}
			}
		}

		devices, err := a.notifRepo.GetDevicesForUsers(r.Context(), users)
		if err != nil {
			return
		}

		for _, device := range devices {
			notif := domain.Notification{
				Title:    "Quest completed",
				Body:     fmt.Sprintf("The team %s used a powerup!", team.Name),
				Priority: 10,
				DeviceID: device.ID,
			}

			if err := a.scheduleNotification(&notif); err != nil {
				continue
			}
		}
	}(a)

	a.WsHub.BroadcastPwp <- wsPowerupMsg{
		Powerup: pow,
	}

	a.sendJson(w, http.StatusOK, nil)
}
