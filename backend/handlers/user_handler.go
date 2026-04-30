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

type updateProfileRequest struct {
	Name string `json:"name" binding:"required"`
}

type changePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required"`
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

func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID, ok := utils.GetUserIDFromContext(c)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized")
		return
	}

	var request updateProfileRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "name is required")
		return
	}

	user, err := services.UpdateCurrentUserName(h.DB, userID, request.Name)
	if err != nil {
		utils.ErrorResponse(c, userStatusFromError(err), err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Profile updated successfully", dto.ToUserResponse(user))
}

func (h *UserHandler) ChangePassword(c *gin.Context) {
	userID, ok := utils.GetUserIDFromContext(c)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized")
		return
	}

	var request changePasswordRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "current_password and new_password are required")
		return
	}

	if err := services.ChangeCurrentUserPassword(h.DB, userID, request.CurrentPassword, request.NewPassword); err != nil {
		utils.ErrorResponse(c, userStatusFromError(err), err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Password changed successfully", nil)
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
	if errors.Is(err, services.ErrCurrentPasswordInvalid) {
		return http.StatusUnauthorized
	}
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return http.StatusNotFound
	}

	errMessage := err.Error()
	if errMessage == "name is required" ||
		errMessage == "current_password is required" ||
		errMessage == "new_password is required" ||
		errMessage == "new_password must be at least 6 characters" {
		return http.StatusBadRequest
	}

	return http.StatusBadRequest
}
