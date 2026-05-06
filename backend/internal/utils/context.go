package utils

import "github.com/gin-gonic/gin"

const UserIDContextKey = "userID"

func GetUserIDFromContext(c *gin.Context) (uint, bool) {
	value, exists := c.Get(UserIDContextKey)
	if !exists {
		return 0, false
	}

	userID, ok := value.(uint)
	if !ok || userID == 0 {
		return 0, false
	}

	return userID, true
}

func RequireUserID(c *gin.Context) (uint, bool) {
	userID, ok := GetUserIDFromContext(c)
	if !ok {
		ErrorResponse(c, 401, "unauthorized")
		return 0, false
	}

	return userID, true
}
