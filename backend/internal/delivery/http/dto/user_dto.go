package dto

import "SpendWise/internal/domain/models"

type UserResponse struct {
	ID              uint    `json:"id"`
	Name            string  `json:"name"`
	Email           string  `json:"email"`
	Picture         *string `json:"picture,omitempty"`
	ProfilePhotoURL *string `json:"profile_photo_url,omitempty"`
}

func ToUserResponse(user *models.User) UserResponse {
	if user == nil {
		return UserResponse{}
	}

	return UserResponse{
		ID:              user.ID,
		Name:            user.Name,
		Email:           user.Email,
		Picture:         user.Picture,
		ProfilePhotoURL: user.ProfilePhotoURL,
	}
}
