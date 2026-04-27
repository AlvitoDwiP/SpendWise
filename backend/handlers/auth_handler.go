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

type AuthHandler struct {
	DB *gorm.DB
}

type registerRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type loginRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type loginResponse struct {
	User  dto.UserResponse `json:"user"`
	Token string           `json:"token"`
}

func NewAuthHandler(db *gorm.DB) *AuthHandler {
	return &AuthHandler{DB: db}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var request registerRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "invalid request body")
		return
	}

	user, err := services.Register(h.DB, request.Name, request.Email, request.Password)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "user registered", dto.ToUserResponse(user))
}

func (h *AuthHandler) Login(c *gin.Context) {
	var request loginRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "invalid request body")
		return
	}

	user, err := services.Login(h.DB, request.Email, request.Password)
	if err != nil {
		utils.ErrorResponse(c, authStatusFromError(err), err.Error())
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Email)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "failed to generate token")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "login success", loginResponse{
		User:  dto.ToUserResponse(user),
		Token: token,
	})
}

func authStatusFromError(err error) int {
	if errors.Is(err, services.ErrInvalidEmailOrPassword) {
		return http.StatusUnauthorized
	}

	return http.StatusBadRequest
}
