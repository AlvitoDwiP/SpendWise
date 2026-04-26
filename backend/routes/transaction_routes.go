package routes

import (
	"SpendWise/handlers"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterTransactionRoutes(router *gin.RouterGroup, db *gorm.DB) {
	transactionHandler := handlers.NewTransactionHandler(db)

	router.POST("/transactions", transactionHandler.CreateTransaction)
	router.GET("/transactions/recent", transactionHandler.GetRecentTransactions)
}
