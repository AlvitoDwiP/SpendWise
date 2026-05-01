package routes

import (
	"SpendWise/handlers"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterAuthRoutes(router *gin.Engine, db *gorm.DB) {
	authHandler := handlers.NewAuthHandler(db)

	router.POST("/auth/register", authHandler.Register)
	router.POST("/auth/login", authHandler.Login)
	router.POST("/auth/google", authHandler.GoogleLogin)
}
