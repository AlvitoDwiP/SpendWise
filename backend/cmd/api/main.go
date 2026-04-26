package main

import (
	"log"

	"SpendWise/config"
	"SpendWise/handlers"
	"SpendWise/middlewares"
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

	api := router.Group("/")
	api.Use(middlewares.AuthMiddleware())
	api.POST("/categories", categoryHandler.CreateCategory)
	api.GET("/categories", categoryHandler.GetCategories)
	api.POST("/transactions", transactionHandler.CreateTransaction)
	api.GET("/transactions/recent", transactionHandler.GetRecentTransactions)

	log.Println("API server running on port 8080")
	if err := router.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
