package services

import (
	"errors"

	"SpendWise/models"
	"SpendWise/repositories"

	"gorm.io/gorm"
)

var ErrInvalidUserID = errors.New("user id is required")

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
