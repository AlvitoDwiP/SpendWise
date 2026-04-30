package routes

import (
	"SpendWise/handlers"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterTransactionRoutes(router *gin.RouterGroup, db *gorm.DB) {
	transactionHandler := handlers.NewTransactionHandler(db)

	router.GET("/transactions/recent", transactionHandler.GetRecentTransactions)
	router.GET("/transactions", transactionHandler.GetTransactions)
	router.GET("/transactions/:id", transactionHandler.GetTransactionByID)
	router.POST("/transactions", transactionHandler.CreateTransaction)
	router.POST("/transactions/scan-receipt", transactionHandler.ScanReceipt)
	router.PUT("/transactions/:id", transactionHandler.UpdateTransaction)
	router.DELETE("/transactions/:id", transactionHandler.DeleteTransaction)
}
