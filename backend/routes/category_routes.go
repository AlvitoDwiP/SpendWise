package routes

import (
	"SpendWise/handlers"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterCategoryRoutes(router *gin.RouterGroup, db *gorm.DB) {
	categoryHandler := handlers.NewCategoryHandler(db)

	router.POST("/categories", categoryHandler.CreateCategory)
	router.GET("/categories", categoryHandler.GetCategories)
}
