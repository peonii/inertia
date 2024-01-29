package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

func (a *api) userMeHandler(w http.ResponseWriter, r *http.Request) {
	uid := r.Context().Value("uid").(string)

	user, err := a.userRepo.FindOne(r.Context(), uid)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find user")
		return
	}

	a.sendJson(w, http.StatusOK, user)
}

func (a *api) userByIdHandler(w http.ResponseWriter, r *http.Request) {
	uid := chi.URLParam(r, "id")

	user, err := a.userRepo.FindOne(r.Context(), uid)
	if err != nil {
		a.sendError(w, r, http.StatusNotFound, err, "failed to find user")
		return
	}

	a.sendJson(w, http.StatusOK, user)
}
