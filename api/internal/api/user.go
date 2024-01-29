package api

import "net/http"

func (a *api) userMeHandler(w http.ResponseWriter, r *http.Request) {
	uid := r.Context().Value("uid").(int64)

	user, err := a.userRepo.FindOne(r.Context(), uid)
	if err != nil {
		a.sendError(w, r, http.StatusInternalServerError, err, "failed to find user")
		return
	}

	a.sendJson(w, http.StatusOK, user)
}
