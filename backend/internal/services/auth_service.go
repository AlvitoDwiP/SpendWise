package services

import (
	"context"
	"errors"
	"os"
	"strings"

	"SpendWise/internal/domain/models"
	"SpendWise/internal/domain/repositories"
	"SpendWise/internal/utils"

	"google.golang.org/api/idtoken"
	"gorm.io/gorm"
)

const minPasswordLength = 6

var ErrInvalidEmailOrPassword = errors.New("invalid email or password")

type GoogleUserInfo struct {
	GoogleID string
	Email    string
	Name     string
	Picture  *string
}

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

func LoginWithGoogle(ctx context.Context, db *gorm.DB, idToken string) (*models.User, error) {
	idToken = strings.TrimSpace(idToken)
	if idToken == "" {
		return nil, errors.New("id_token is required")
	}

	googleClientID := strings.TrimSpace(os.Getenv("GOOGLE_CLIENT_ID"))
	if googleClientID == "" {
		return nil, errors.New("google client id is not configured")
	}

	payload, err := idtoken.Validate(ctx, idToken, googleClientID)
	if err != nil {
		return nil, errors.New("invalid google token")
	}

	info, err := extractGoogleUserInfo(payload)
	if err != nil {
		return nil, err
	}

	if user, findErr := repositories.GetUserByGoogleID(db, info.GoogleID); findErr == nil {
		if info.Picture != nil {
			user.Picture = info.Picture
			_ = repositories.UpdateUser(db, user)
		}
		return sanitizeUser(user), nil
	} else if !errors.Is(findErr, gorm.ErrRecordNotFound) {
		return nil, findErr
	}

	userByEmail, err := repositories.GetUserByEmail(db, info.Email)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	if userByEmail != nil {
		if userByEmail.GoogleID == nil {
			userByEmail.GoogleID = &info.GoogleID
		}
		if info.Picture != nil {
			userByEmail.Picture = info.Picture
		}
		if err := repositories.UpdateUser(db, userByEmail); err != nil {
			return nil, err
		}
		return sanitizeUser(userByEmail), nil
	}

	name := strings.TrimSpace(info.Name)
	if name == "" {
		name = strings.Split(info.Email, "@")[0]
	}

	user := models.User{
		Name:         name,
		Email:        info.Email,
		GoogleID:     &info.GoogleID,
		Picture:      info.Picture,
		PasswordHash: "",
	}
	if err := repositories.CreateUser(db, &user); err != nil {
		return nil, err
	}

	return sanitizeUser(&user), nil
}

func extractGoogleUserInfo(payload *idtoken.Payload) (*GoogleUserInfo, error) {
	if payload == nil {
		return nil, errors.New("invalid google token")
	}

	googleID := strings.TrimSpace(payload.Subject)
	if googleID == "" {
		return nil, errors.New("invalid google token")
	}

	emailValue, ok := payload.Claims["email"].(string)
	if !ok || strings.TrimSpace(emailValue) == "" {
		return nil, errors.New("email is required in google payload")
	}
	email := strings.TrimSpace(emailValue)

	name, _ := payload.Claims["name"].(string)
	name = strings.TrimSpace(name)

	var picture *string
	if pictureValue, ok := payload.Claims["picture"].(string); ok {
		trimmed := strings.TrimSpace(pictureValue)
		if trimmed != "" {
			picture = &trimmed
		}
	}

	return &GoogleUserInfo{
		GoogleID: googleID,
		Email:    email,
		Name:     name,
		Picture:  picture,
	}, nil
}

func sanitizeUser(user *models.User) *models.User {
	if user == nil {
		return nil
	}

	user.PasswordHash = ""
	return user
}
