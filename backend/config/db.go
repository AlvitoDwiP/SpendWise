package config

import (
	"fmt"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB

func InitDB() error {
	if err := godotenv.Load(); err != nil {
		return fmt.Errorf("failed to load .env: %w", err)
	}

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		GetEnv("DB_HOST", ""),
		GetEnv("DB_USER", ""),
		GetEnv("DB_PASSWORD", ""),
		GetEnv("DB_NAME", ""),
		GetEnv("DB_PORT", ""),
		GetEnv("DB_SSLMODE", ""),
	)

	conn, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return fmt.Errorf("failed to open database connection: %w", err)
	}

	sqlDB, err := conn.DB()
	if err != nil {
		return fmt.Errorf("failed to get database instance: %w", err)
	}

	if err := sqlDB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	db = conn
	return nil
}

func GetDB() *gorm.DB {
	return db
}
