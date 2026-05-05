package routes

import (
	"SpendWise/internal/delivery/http/handlers"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterDashboardRoutes(router *gin.RouterGroup, db *gorm.DB) {
	dashboardHandler := handlers.NewDashboardHandler(db)

	router.GET("/dashboard/summary", dashboardHandler.GetSummary)
}
