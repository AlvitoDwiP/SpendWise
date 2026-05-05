package handlers

import (
	"crypto/rand"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"SpendWise/internal/delivery/http/dto"
	"SpendWise/internal/domain/models"
	"SpendWise/internal/services"
	"SpendWise/internal/utils"

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

const maxProfilePhotoSizeBytes int64 = 2 * 1024 * 1024

var allowedProfilePhotoMimeTypes = map[string]string{
	"image/jpeg": ".jpg",
	"image/png":  ".png",
	"image/webp": ".webp",
}

var allowedProfilePhotoExtensions = map[string]struct{}{
	".jpg":  {},
	".jpeg": {},
	".png":  {},
	".webp": {},
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

func (h *UserHandler) UpdateProfilePhoto(c *gin.Context) {
	userID, ok := utils.GetUserIDFromContext(c)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized")
		return
	}

	currentUser, err := services.GetCurrentUser(h.DB, userID)
	if err != nil {
		utils.ErrorResponse(c, userStatusFromError(err), err.Error())
		return
	}

	fileHeader, err := c.FormFile("photo")
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Photo file is required.")
		return
	}
	if fileHeader.Size <= 0 {
		utils.ErrorResponse(c, http.StatusBadRequest, "Photo file is required.")
		return
	}
	if fileHeader.Size > maxProfilePhotoSizeBytes {
		utils.ErrorResponse(c, http.StatusBadRequest, "Photo must be 2MB or smaller.")
		return
	}

	photoExt, err := validateProfilePhotoFile(fileHeader)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	savedPhotoPath, err := saveProfilePhotoFile(c, fileHeader, userID, photoExt)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to upload profile photo.")
		return
	}

	updatedUser, err := services.UpdateCurrentUserProfilePhoto(h.DB, userID, savedPhotoPath)
	if err != nil {
		_ = os.Remove(strings.TrimPrefix(savedPhotoPath, "/"))
		utils.ErrorResponse(c, userStatusFromError(err), err.Error())
		return
	}

	if currentUser.ProfilePhotoURL != nil {
		removeOldProfilePhotoIfInternal(*currentUser.ProfilePhotoURL)
	}

	utils.SuccessResponse(c, http.StatusOK, "Profile photo updated successfully.", dto.ToUserResponse(updatedUser))
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
		errMessage == "profile photo url is required" ||
		errMessage == "current_password is required" ||
		errMessage == "new_password is required" ||
		errMessage == "new_password must be at least 6 characters" {
		return http.StatusBadRequest
	}

	return http.StatusBadRequest
}

func validateProfilePhotoFile(fileHeader *multipart.FileHeader) (string, error) {
	if fileHeader == nil {
		return "", errors.New("Photo file is required.")
	}

	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
	if _, ok := allowedProfilePhotoExtensions[ext]; !ok {
		return "", errors.New("Only JPG, JPEG, PNG, and WEBP files are allowed.")
	}

	file, err := fileHeader.Open()
	if err != nil {
		return "", errors.New("Failed to read photo file.")
	}
	defer file.Close()

	buffer := make([]byte, 512)
	bytesRead, err := io.ReadFull(file, buffer)
	if err != nil && !errors.Is(err, io.EOF) && !errors.Is(err, io.ErrUnexpectedEOF) {
		return "", errors.New("Failed to read photo file.")
	}

	detectedMimeType := http.DetectContentType(buffer[:bytesRead])
	detectedExt, ok := allowedProfilePhotoMimeTypes[detectedMimeType]
	if !ok {
		return "", errors.New("Only JPG, JPEG, PNG, and WEBP files are allowed.")
	}

	return detectedExt, nil
}

func saveProfilePhotoFile(c *gin.Context, fileHeader *multipart.FileHeader, userID uint, fileExt string) (string, error) {
	uploadDir := filepath.Join("uploads", "profile-photos")
	if err := os.MkdirAll(uploadDir, 0o755); err != nil {
		return "", err
	}

	randomSuffix, err := generateProfilePhotoSuffix()
	if err != nil {
		return "", err
	}

	fileName := fmt.Sprintf("user-%d-%d-%s%s", userID, time.Now().UnixNano(), randomSuffix, fileExt)
	destination := filepath.Join(uploadDir, fileName)
	if err := c.SaveUploadedFile(fileHeader, destination); err != nil {
		return "", err
	}

	return "/" + filepath.ToSlash(destination), nil
}

func removeOldProfilePhotoIfInternal(photoPath string) {
	trimmed := strings.TrimSpace(photoPath)
	if trimmed == "" || strings.HasPrefix(trimmed, "http://") || strings.HasPrefix(trimmed, "https://") {
		return
	}

	cleaned := filepath.Clean(strings.TrimPrefix(trimmed, "/"))
	allowedPrefix := filepath.Clean(filepath.Join("uploads", "profile-photos")) + string(os.PathSeparator)
	if !strings.HasPrefix(cleaned+string(os.PathSeparator), allowedPrefix) {
		return
	}

	_ = os.Remove(cleaned)
}

func generateProfilePhotoSuffix() (string, error) {
	bytes := make([]byte, 8)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}

	return fmt.Sprintf("%x", bytes), nil
}
