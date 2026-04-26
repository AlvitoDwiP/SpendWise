package routes

import (
	"SpendWise/handlers"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterDashboardRoutes(router *gin.RouterGroup, db *gorm.DB) {
	dashboardHandler := handlers.NewDashboardHandler(db)

	router.GET("/dashboard/summary", dashboardHandler.GetSummary)
}
