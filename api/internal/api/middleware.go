package api

import (
	"context"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"go.uber.org/zap"
)

func (a *api) loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		a.logger.Info("request",
			zap.String("method", r.Method),
			zap.String("path", r.URL.Path),
			zap.String("remote_addr", r.RemoteAddr),
			zap.String("user_agent", r.UserAgent()),
		)
		next.ServeHTTP(w, r)
	})
}

func (a *api) authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := r.Header.Get("Authorization")
		if token == "" {
			a.sendError(w, r, http.StatusUnauthorized, nil, "missing authorization header")
			return
		}

		if !strings.HasPrefix(token, "Bearer ") {
			a.sendError(w, r, http.StatusUnauthorized, nil, "invalid authorization header")
			return
		}

		token = strings.TrimPrefix(token, "Bearer ")

		jt, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("JWT_SECRET")), nil
		})
		if err != nil {
			a.sendError(w, r, http.StatusUnauthorized, err, "failed to parse jwt")
		}

		if !jt.Valid {
			a.sendError(w, r, http.StatusUnauthorized, nil, "invalid jwt")
			return
		}

		uid, err := jt.Claims.GetSubject()
		if err != nil {
			a.sendError(w, r, http.StatusUnauthorized, err, "failed to get subject from jwt")
		}

		ctx := r.Context()
		ctx = context.WithValue(ctx, "uid", uid)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
