package main

import (
	"log"
	"strings"
	"time"

	"SpendWise/config"
	"SpendWise/middlewares"
	"SpendWise/models"
	"SpendWise/routes"
	"SpendWise/services"

	"github.com/gin-contrib/cors"
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

	frontendURL := config.GetEnv("FRONTEND_URL", "http://localhost:3000")
	frontendURLs := parseAllowedOrigins(frontendURL)

	router.Use(cors.New(cors.Config{
		AllowOrigins: frontendURLs,
		AllowOriginFunc: func(origin string) bool {
			if strings.HasSuffix(origin, ".devtunnels.ms") {
				return true
			}
			for _, allowed := range frontendURLs {
				if allowed == origin {
					return true
				}
			}
			return false
		},
		AllowMethods: []string{
			"GET",
			"POST",
			"PUT",
			"DELETE",
			"OPTIONS",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Authorization",
		},
		ExposeHeaders: []string{
			"Content-Length",
		},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	routes.RegisterAuthRoutes(router, db)

	protected := router.Group("/")
	protected.Use(middlewares.AuthMiddleware())
	routes.RegisterUserRoutes(protected, db)
	routes.RegisterCategoryRoutes(protected, db)
	ocrProvider, ocrProviderName, err := services.NewOCRProviderFromName(config.GetEnv("OCR_PROVIDER", "mock"))
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("OCR provider: %s", ocrProviderName)
	routes.RegisterTransactionRoutes(protected, db, ocrProvider)
	routes.RegisterDashboardRoutes(protected, db)
	routes.RegisterReportRoutes(protected, db)

	port := config.GetEnv("APP_PORT", "8080")
	log.Println("API server running on port " + port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}

func parseAllowedOrigins(raw string) []string {
	parts := strings.Split(raw, ",")
	origins := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			origins = append(origins, trimmed)
		}
	}
	if len(origins) == 0 {
		return []string{"http://localhost:3000"}
	}
	return origins
}
