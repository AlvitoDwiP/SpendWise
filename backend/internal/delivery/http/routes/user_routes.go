package routes

import (
	"SpendWise/internal/delivery/http/handlers"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterUserRoutes(router *gin.RouterGroup, db *gorm.DB) {
	userHandler := handlers.NewUserHandler(db)

	router.GET("/me", userHandler.GetMe)
	router.PUT("/me", userHandler.UpdateProfile)
	router.PUT("/me/photo", userHandler.UpdateProfilePhoto)
	router.PUT("/me/password", userHandler.ChangePassword)
	router.POST("/me/reset-data", userHandler.ResetUserData)
}
