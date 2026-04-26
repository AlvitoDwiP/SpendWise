package services

import (
	"errors"
	"strings"

	"SpendWise/models"
	"SpendWise/repositories"
	"SpendWise/utils"

	"gorm.io/gorm"
)

const minPasswordLength = 6

var ErrInvalidEmailOrPassword = errors.New("invalid email or password")

func Register(db *gorm.DB, name string, email string, password string) (*models.User, error) {
	name = strings.TrimSpace(name)
	email = strings.TrimSpace(email)

	if name == "" {
		return nil, errors.New("name is required")
	}
	if email == "" {
		return nil, errors.New("email is required")
	}
	if strings.TrimSpace(password) == "" {
		return nil, errors.New("password is required")
	}
	if len(password) < minPasswordLength {
		return nil, errors.New("password must be at least 6 characters")
	}

	existingUser, err := repositories.GetUserByEmail(db, email)
	if err == nil && existingUser != nil {
		return nil, errors.New("email already used")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	passwordHash, err := utils.HashPassword(password)
	if err != nil {
		return nil, err
	}

	user := models.User{
		Name:         name,
		Email:        email,
		PasswordHash: passwordHash,
	}
	if err := repositories.CreateUser(db, &user); err != nil {
		return nil, err
	}

	return sanitizeUser(&user), nil
}

func Login(db *gorm.DB, email string, password string) (*models.User, error) {
	email = strings.TrimSpace(email)

	if email == "" {
		return nil, errors.New("email is required")
	}
	if strings.TrimSpace(password) == "" {
		return nil, errors.New("password is required")
	}

	user, err := repositories.GetUserByEmail(db, email)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrInvalidEmailOrPassword
	}
	if err != nil {
		return nil, err
	}
	if !utils.CheckPasswordHash(password, user.PasswordHash) {
		return nil, ErrInvalidEmailOrPassword
	}

	return sanitizeUser(user), nil
}

func sanitizeUser(user *models.User) *models.User {
	if user == nil {
		return nil
	}

	user.PasswordHash = ""
	return user
}
