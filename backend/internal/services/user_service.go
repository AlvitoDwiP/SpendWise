package services

import (
	"errors"
	"strings"

	"SpendWise/internal/domain/models"
	"SpendWise/internal/domain/repositories"
	"SpendWise/internal/utils"

	"gorm.io/gorm"
)

var ErrInvalidUserID = errors.New("user id is required")
var ErrCurrentPasswordInvalid = errors.New("current password is incorrect")

func GetCurrentUser(db *gorm.DB, userID uint) (*models.User, error) {
	if userID == 0 {
		return nil, ErrInvalidUserID
	}

	user, err := repositories.GetUserByID(db, userID)
	if err != nil {
		return nil, err
	}

	return sanitizeUser(user), nil
}

func UpdateCurrentUserName(db *gorm.DB, userID uint, name string) (*models.User, error) {
	if userID == 0 {
		return nil, ErrInvalidUserID
	}

	trimmedName := strings.TrimSpace(name)
	if trimmedName == "" {
		return nil, errors.New("name is required")
	}

	user, err := repositories.GetUserByID(db, userID)
	if err != nil {
		return nil, err
	}

	user.Name = trimmedName
	if err := repositories.UpdateUser(db, user); err != nil {
		return nil, err
	}

	return sanitizeUser(user), nil
}

func ChangeCurrentUserPassword(db *gorm.DB, userID uint, currentPassword string, newPassword string) error {
	if userID == 0 {
		return ErrInvalidUserID
	}
	if strings.TrimSpace(currentPassword) == "" {
		return errors.New("current_password is required")
	}
	if strings.TrimSpace(newPassword) == "" {
		return errors.New("new_password is required")
	}
	if len(newPassword) < minPasswordLength {
		return errors.New("new_password must be at least 6 characters")
	}

	user, err := repositories.GetUserByID(db, userID)
	if err != nil {
		return err
	}

	if !utils.CheckPasswordHash(currentPassword, user.PasswordHash) {
		return ErrCurrentPasswordInvalid
	}

	newPasswordHash, err := utils.HashPassword(newPassword)
	if err != nil {
		return err
	}

	user.PasswordHash = newPasswordHash
	if err := repositories.UpdateUser(db, user); err != nil {
		return err
	}

	return nil
}

func UpdateCurrentUserProfilePhoto(db *gorm.DB, userID uint, photoURL string) (*models.User, error) {
	if userID == 0 {
		return nil, ErrInvalidUserID
	}

	trimmedPhotoURL := strings.TrimSpace(photoURL)
	if trimmedPhotoURL == "" {
		return nil, errors.New("profile photo url is required")
	}

	user, err := repositories.GetUserByID(db, userID)
	if err != nil {
		return nil, err
	}

	user.ProfilePhotoURL = &trimmedPhotoURL
	if err := repositories.UpdateUser(db, user); err != nil {
		return nil, err
	}

	return sanitizeUser(user), nil
}

func DeleteCurrentUser(db *gorm.DB, userID uint) error {
	if userID == 0 {
		return ErrInvalidUserID
	}

	tx := db.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	if err := tx.Where("user_id = ?", userID).Delete(&models.Transaction{}).Error; err != nil {
		_ = tx.Rollback().Error
		return err
	}

	if err := tx.Where("user_id = ?", userID).Delete(&models.Category{}).Error; err != nil {
		_ = tx.Rollback().Error
		return err
	}

	if err := repositories.DeleteUserByID(tx, userID); err != nil {
		_ = tx.Rollback().Error
		return err
	}

	if err := tx.Commit().Error; err != nil {
		_ = tx.Rollback().Error
		return err
	}

	return nil
}
