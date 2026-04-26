package middlewares

import (
	"net/http"
	"strings"

	"SpendWise/utils"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			utils.ErrorResponse(c, http.StatusUnauthorized, "authorization header is required")
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") || strings.TrimSpace(parts[1]) == "" {
			utils.ErrorResponse(c, http.StatusUnauthorized, "invalid authorization header")
			c.Abort()
			return
		}

		claims, err := utils.ValidateToken(strings.TrimSpace(parts[1]))
		if err != nil {
			utils.ErrorResponse(c, http.StatusUnauthorized, "invalid or expired token")
			c.Abort()
			return
		}
		if claims.UserID == 0 {
			utils.ErrorResponse(c, http.StatusUnauthorized, "invalid or expired token")
			c.Abort()
			return
		}

		c.Set(utils.UserIDContextKey, claims.UserID)
		c.Next()
	}
}
