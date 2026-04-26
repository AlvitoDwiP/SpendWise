package main

import (
	"log"

	"SpendWise/config"
	"SpendWise/middlewares"
	"SpendWise/models"
	"SpendWise/routes"

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

	routes.RegisterAuthRoutes(router, db)

	protected := router.Group("/")
	protected.Use(middlewares.AuthMiddleware())
	routes.RegisterCategoryRoutes(protected, db)
	routes.RegisterTransactionRoutes(protected, db)
	routes.RegisterDashboardRoutes(protected, db)

	log.Println("API server running on port 8080")
	if err := router.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
