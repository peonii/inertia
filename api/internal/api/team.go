package api

import (
	"encoding/json"
	"errors"
	"fmt"
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

type ticketBuyRequest struct {
	Amount int    `json:"amount"`
	Type   string `json:"type"`
}

func (a *api) buyTicketHandler(w http.ResponseWriter, r *http.Request) {

	uid := a.session(r)
	tid := chi.URLParam(r, "id")

	var body ticketBuyRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		a.sendError(w, r, http.StatusBadRequest, err, "failed to decode body")
		return
	}

	team, err := a.teamRepo.FindOne(r.Context(), tid)
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
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to verify team membership")
		return
	}

	if !isMember {
		a.sendError(w, r, http.StatusUnauthorized, errors.New("user is not a member of the team"), "failed to verify team membership")
		return
	}

	cost := 0
	switch body.Type {
	case "bus":
		cost = 20
	case "tram":
		cost = 30
	case "m1":
		cost = 70
	case "m2":
		cost = 60
	case "km":
		cost = 70
	case "wkd":
		cost = 40
	}

	if team.Balance < body.Amount*cost {
		a.sendError(w, r, http.StatusUnauthorized, errors.New("team does not have enough balance"), "failed to verify team balance")
		return
	}

	newBalance := team.Balance - (body.Amount * cost)

	teamUpdate := domain.TeamUpdate{
		Balance: &newBalance,
	}

	team, err = a.teamRepo.Update(r.Context(), tid, &teamUpdate)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to update team balance")
		return
	}

	a.sendJson(w, http.StatusOK, nil)
}

func (a *api) catchTeamHandler(w http.ResponseWriter, r *http.Request) {
	uid := a.session(r)

	tid := chi.URLParam(r, "id")

	team, err := a.teamRepo.FindOne(r.Context(), tid)
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
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to verify team membership")
		return
	}

	if !isMember {
		a.sendError(w, r, http.StatusUnauthorized, err, "user is not a member of the team")
		return
	}

	otherTeams, err := a.teamRepo.FindByGameID(r.Context(), team.GameID)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find teams")
		return
	}

	hasEncountered := false

	for _, t := range otherTeams {
		if t.IsRunner {
			err = a.teamRepo.MakeHunter(r.Context(), t.ID)
			if err != nil {
				a.sendError(w, r, http.StatusInternalServerError, err, "failed to make team hunter")
				return
			}

			hasEncountered = true
		}
	}

	if !hasEncountered {
		a.sendError(w, r, http.StatusUnauthorized, errors.New("no runners found"), "can't catch runner if already runner")
		return
	}

	err = a.teamRepo.MakeRunner(r.Context(), tid)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to make team runner")
		return
	}

	a.WsHub.BroadcastCat <- wsCatchMsg{
		NewRunnerID: tid,
	}

	a.sendJson(w, http.StatusOK, nil)

	members, err := a.teamRepo.FindMembers(r.Context(), tid)
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
			Title:    "Team caught",
			Body:     fmt.Sprintf("The team %s just caught the runners!", team.Name),
			Priority: 10,
			DeviceID: device.ID,
		}

		if err := a.scheduleNotification(&notif); err != nil {
			continue
		}
	}
}
