package api

import (
	"encoding/json"
	"net/http"

	"go.uber.org/zap"
)

type apiError struct {
	Error string `json:"error"`
	Code  int    `json:"code"`
}

func (a *api) sendJson(w http.ResponseWriter, code int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)

	if err := json.NewEncoder(w).Encode(data); err != nil {
		a.logger.Error("failed to encode json", zap.Error(err))
	}
}

func (a *api) sendError(w http.ResponseWriter, r *http.Request, code int, err error, msg string) {
	a.logger.Error(msg,
		zap.Error(err),
		zap.String("method", r.Method),
		zap.String("path", r.URL.Path),
		zap.String("remote_addr", r.RemoteAddr),
		zap.String("user_agent", r.UserAgent()),
	)

	a.sendJson(w, code, apiError{
		Error: msg,
		Code:  code,
	})
}
