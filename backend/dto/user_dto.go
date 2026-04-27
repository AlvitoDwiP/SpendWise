package dto

import "SpendWise/models"

type UserResponse struct {
	ID    uint   `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

func ToUserResponse(user *models.User) UserResponse {
	if user == nil {
		return UserResponse{}
	}

	return UserResponse{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
	}
}
