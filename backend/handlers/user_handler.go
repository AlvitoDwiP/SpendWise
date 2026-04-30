package handlers

import (
	"errors"
	"net/http"

	"SpendWise/dto"
	"SpendWise/models"
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

func (h *UserHandler) ResetUserData(c *gin.Context) {
	userID, ok := utils.GetUserIDFromContext(c)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized")
		return
	}

	tx := h.DB.Begin()
	if tx.Error != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "failed to reset user data")
		return
	}

	if err := tx.Where("user_id = ?", userID).Delete(&models.Transaction{}).Error; err != nil {
		_ = tx.Rollback().Error
		utils.ErrorResponse(c, http.StatusInternalServerError, "failed to reset user data")
		return
	}

	if err := tx.Where("user_id = ?", userID).Delete(&models.Category{}).Error; err != nil {
		_ = tx.Rollback().Error
		utils.ErrorResponse(c, http.StatusInternalServerError, "failed to reset user data")
		return
	}

	if err := tx.Commit().Error; err != nil {
		_ = tx.Rollback().Error
		utils.ErrorResponse(c, http.StatusInternalServerError, "failed to reset user data")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "User data reset successfully", nil)
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
