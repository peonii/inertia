package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/peonii/inertia/internal/domain"
)

func (a *api) teamQuestsHandler(w http.ResponseWriter, r *http.Request) {
	teamID := chi.URLParam(r, "id")

	quests, err := a.questRepo.FindActiveByTeamID(r.Context(), teamID)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find quests")
		return
	}

	a.sendJson(w, http.StatusOK, quests)
}

func (a *api) questByIdHandler(w http.ResponseWriter, r *http.Request) {
	questID := chi.URLParam(r, "id")

	quest, err := a.questRepo.FindOne(r.Context(), questID)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find quest")
		return
	}

	a.sendJson(w, http.StatusOK, quest)
}

func (a *api) createQuestGroupHandler(w http.ResponseWriter, r *http.Request) {
	uid := a.session(r)
	u, err := a.userRepo.FindOne(r.Context(), uid)

	var group domain.QuestGroupCreate
	if err := json.NewDecoder(r.Body).Decode(&group); err != nil {
		a.sendError(w, r, http.StatusBadRequest, err, "failed to decode quest group")
		return
	}

	game, err := a.gameRepo.FindOne(r.Context(), group.GameID)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find game")
		return
	}

	if !game.CanEdit(u) {
		a.sendError(w, r, http.StatusForbidden, nil, "cannot edit someone else's game")
		return
	}

	g, err := a.questRepo.CreateGroup(r.Context(), &group)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to create quest group")
		return
	}

	a.sendJson(w, http.StatusCreated, g)
}

func (a *api) createQuestHandler(w http.ResponseWriter, r *http.Request) {
	uid := a.session(r)
	u, err := a.userRepo.FindOne(r.Context(), uid)

	var questc domain.QuestCreate
	if err := json.NewDecoder(r.Body).Decode(&questc); err != nil {
		a.sendError(w, r, http.StatusBadRequest, err, "failed to decode quest")
		return
	}

	if questc.QuestType != "main" && questc.QuestType != "side" {
		a.sendError(w, r, http.StatusBadRequest, nil, "quest type must be 'main' or 'side'")
		return
	}

	_, err = a.questRepo.FindGroup(r.Context(), questc.GroupID)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find quest group")
		return
	}

	game, err := a.gameRepo.FindOne(r.Context(), questc.GameID)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find game")
		return
	}

	if !game.CanEdit(u) {
		a.sendError(w, r, http.StatusForbidden, nil, "you are not the host of this game")
		return
	}

	quest, err := a.questRepo.Create(r.Context(), &questc)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to create quest")
		return
	}

	a.sendJson(w, http.StatusCreated, quest)
}

func (a *api) completeQuestHandler(w http.ResponseWriter, r *http.Request) {
	uid := a.session(r)
	u, err := a.userRepo.FindOne(r.Context(), uid)

	id := chi.URLParam(r, "id")
	quest, err := a.questRepo.FindActive(r.Context(), id)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find quest")
		return
	}

	team, err := a.teamRepo.FindOne(r.Context(), quest.TeamID)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find team")
		return
	}

	isMember, err := a.teamRepo.IsTeamMember(r.Context(), team, u)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to check team membership")
		return
	}

	if !isMember {
		a.sendError(w, r, http.StatusForbidden, nil, "you are not a member of this team")
		return
	}

	err = a.questRepo.Complete(r.Context(), id)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to complete quest")
		return
	}

	newXp := team.XP + quest.XP
	newBalance := team.Balance + quest.Money

	teamUpdate := domain.TeamUpdate{
		XP:      &newXp,
		Balance: &newBalance,
	}
	_, err = a.teamRepo.Update(r.Context(), team.ID, &teamUpdate)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to update team")
		return
	}

	go func() {
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
				Body:     fmt.Sprintf("The team %s completed the quest %s", team.Name, quest.Title),
				Priority: 10,
				DeviceID: device.ID,
			}

			if err := a.scheduleNotification(&notif); err != nil {
				continue
			}
		}

		for _, member := range members {
			stats, err := a.userStatsRepo.Get(r.Context(), member.ID)
			if err != nil {
				continue
			}

			stats.XP += int64(quest.XP)
			stats.Quests += 1

			a.userStatsRepo.Update(r.Context(), member.ID, stats)
		}
	}()

	a.sendJson(w, http.StatusOK, nil)
}

func (a *api) vetoQuestHandler(w http.ResponseWriter, r *http.Request) {
	uid := a.session(r)
	u, err := a.userRepo.FindOne(r.Context(), uid)

	id := chi.URLParam(r, "id")
	quest, err := a.questRepo.FindActive(r.Context(), id)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find quest")
		return
	}

	if quest.QuestType != "side" {
		a.sendError(w, r, http.StatusForbidden, nil, "you can only veto side quests")
		return
	}

	team, err := a.teamRepo.FindOne(r.Context(), quest.TeamID)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find team")
		return
	}

	isMember, err := a.teamRepo.IsTeamMember(r.Context(), team, u)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to check team membership")
		return
	}

	if !isMember {
		a.sendError(w, r, http.StatusForbidden, nil, "you are not a member of this team")
		return
	}

	err = a.questRepo.Complete(r.Context(), id)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to complete quest")
		return
	}

	newVetoPeriodEnd := time.Now().Add(20 * time.Minute)
	teamUpdate := domain.TeamUpdate{
		VetoPeriodEnd: &newVetoPeriodEnd,
	}
	_, err = a.teamRepo.Update(r.Context(), team.ID, &teamUpdate)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to update team")
		return
	}

	a.sendJson(w, http.StatusOK, nil)
}

func (a *api) generateNewSideQuestHandler(w http.ResponseWriter, r *http.Request) {
	uid := a.session(r)
	tid := chi.URLParam(r, "team_id")
	u, err := a.userRepo.FindOne(r.Context(), uid)

	team, err := a.teamRepo.FindOne(r.Context(), tid)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find team")
		return
	}

	isMember, err := a.teamRepo.IsTeamMember(r.Context(), team, u)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to check team membership")
		return
	}

	if !isMember {
		a.sendError(w, r, http.StatusForbidden, nil, "you are not a member of this team")
		return
	}

	if team.IsVeto() {
		a.sendError(w, r, http.StatusForbidden, nil, "you are in a veto period")
		return
	}

	hasActiveSide, err := a.questRepo.TeamHasActiveSide(r.Context(), tid)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to check for active side quest")
		return
	}

	if hasActiveSide {
		a.sendError(w, r, http.StatusForbidden, nil, "you already have an active side quest")
		return
	}

	a.questRepo.GenerateSideQuest(r.Context(), tid)

	a.sendJson(w, http.StatusOK, nil)
}
