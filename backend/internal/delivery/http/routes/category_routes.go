package routes

import (
	"SpendWise/internal/delivery/http/handlers"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterCategoryRoutes(router *gin.RouterGroup, db *gorm.DB) {
	categoryHandler := handlers.NewCategoryHandler(db)

	router.POST("/categories", categoryHandler.CreateCategory)
	router.GET("/categories", categoryHandler.GetCategories)
	router.GET("/categories/:id", categoryHandler.GetCategoryByID)
	router.PUT("/categories/:id", categoryHandler.UpdateCategory)
	router.DELETE("/categories/:id", categoryHandler.DeleteCategory)
}
