package api

import "net/http"

func (a *api) healthHandler(w http.ResponseWriter, r *http.Request) {
	a.sendJson(w, http.StatusOK, map[string]string{
		"status": "ok",
	})
}
