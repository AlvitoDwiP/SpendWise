package handlers

import (
	"errors"
	"net/http"

	"SpendWise/dto"
	"SpendWise/services"
	"SpendWise/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type UserHandler struct {
	DB *gorm.DB
}

func NewUserHandler(db *gorm.DB) *UserHandler {
	return &UserHandler{DB: db}
}

func (h *UserHandler) GetMe(c *gin.Context) {
	userID, ok := utils.GetUserIDFromContext(c)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized")
		return
	}

	user, err := services.GetCurrentUser(h.DB, userID)
	if err != nil {
		utils.ErrorResponse(c, userStatusFromError(err), err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "user loaded", dto.ToUserResponse(user))
}

func userStatusFromError(err error) int {
	if errors.Is(err, services.ErrInvalidUserID) {
		return http.StatusUnauthorized
	}
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return http.StatusNotFound
	}

	return http.StatusBadRequest
}
