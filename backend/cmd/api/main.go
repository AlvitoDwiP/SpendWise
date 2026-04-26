package main

import (
	"log"

	"SpendWise/config"
	"SpendWise/handlers"
	"SpendWise/models"

	"github.com/gin-gonic/gin"
)

func main() {
	if err := config.InitDB(); err != nil {
		log.Fatal(err)
	}

	db := config.GetDB()
	if err := db.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Transaction{},
	); err != nil {
		log.Fatal(err)
	}

	router := gin.Default()

	authHandler := handlers.NewAuthHandler(db)
	categoryHandler := handlers.NewCategoryHandler(db)
	transactionHandler := handlers.NewTransactionHandler(db)

	router.POST("/auth/register", authHandler.Register)
	router.POST("/auth/login", authHandler.Login)
	router.POST("/categories", categoryHandler.CreateCategory)
	router.GET("/categories", categoryHandler.GetCategories)
	router.POST("/transactions", transactionHandler.CreateTransaction)
	router.GET("/transactions/recent", transactionHandler.GetRecentTransactions)

	log.Println("API server running on port 8080")
	if err := router.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
