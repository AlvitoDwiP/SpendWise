package services

import (
	"errors"
	"strings"

	"SpendWise/models"
	"SpendWise/repositories"

	"gorm.io/gorm"
)

func CreateCategory(db *gorm.DB, userID uint, name string, categoryType string, icon string, color string) (*models.Category, error) {
	if userID == 0 {
		return nil, errors.New("userID is required")
	}
	if strings.TrimSpace(name) == "" {
		return nil, errors.New("category name is required")
	}
	if !isValidType(categoryType) {
		return nil, errors.New("category type must be income or expense")
	}

	category := models.Category{
		UserID: userID,
		Name:   strings.TrimSpace(name),
		Type:   categoryType,
		Icon:   icon,
		Color:  color,
	}

	if err := repositories.CreateCategory(db, &category); err != nil {
		return nil, err
	}

	return &category, nil
}

func GetCategoriesByUserID(db *gorm.DB, userID uint) ([]models.Category, error) {
	if userID == 0 {
		return nil, errors.New("userID is required")
	}

	return repositories.GetCategoriesByUserID(db, userID)
}

func isValidType(value string) bool {
	return value == models.TypeIncome || value == models.TypeExpense
}
