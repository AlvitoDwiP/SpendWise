package routes

import (
	"SpendWise/internal/delivery/http/handlers"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterReportRoutes(router *gin.RouterGroup, db *gorm.DB) {
	reportHandler := handlers.NewReportHandler(db)

	router.GET("/reports/monthly", reportHandler.GetMonthlyReport)
}
