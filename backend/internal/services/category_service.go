package services

import (
	"errors"
	"strings"

	"SpendWise/internal/domain/models"
	"SpendWise/internal/domain/repositories"

	"gorm.io/gorm"
)

var ErrCategoryInUse = errors.New("category is used by transactions")

func CreateCategory(db *gorm.DB, userID uint, name string, categoryType string, icon string, color string) (*models.Category, error) {
	trimmedName, trimmedType, err := validateCategoryInput(userID, name, categoryType)
	if err != nil {
		return nil, err
	}

	category := models.Category{
		UserID: userID,
		Name:   trimmedName,
		Type:   trimmedType,
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

func GetCategoryByID(db *gorm.DB, userID uint, categoryID uint) (*models.Category, error) {
	if userID == 0 {
		return nil, errors.New("userID is required")
	}
	if categoryID == 0 {
		return nil, errors.New("categoryID is required")
	}

	return repositories.GetCategoryByIDAndUserID(db, categoryID, userID)
}

func UpdateCategory(db *gorm.DB, userID uint, categoryID uint, name string, categoryType string, icon string, color string) (*models.Category, error) {
	if categoryID == 0 {
		return nil, errors.New("categoryID is required")
	}

	trimmedName, trimmedType, err := validateCategoryInput(userID, name, categoryType)
	if err != nil {
		return nil, err
	}

	category, err := GetCategoryByID(db, userID, categoryID)
	if err != nil {
		return nil, err
	}

	category.Name = trimmedName
	category.Type = trimmedType
	category.Icon = icon
	category.Color = color

	if err := repositories.UpdateCategory(db, category); err != nil {
		return nil, err
	}

	return repositories.GetCategoryByIDAndUserID(db, categoryID, userID)
}

func DeleteCategory(db *gorm.DB, userID uint, categoryID uint) error {
	category, err := GetCategoryByID(db, userID, categoryID)
	if err != nil {
		return err
	}

	transactionCount, err := repositories.CountTransactionsByCategoryIDAndUserID(db, categoryID, userID)
	if err != nil {
		return err
	}
	if transactionCount > 0 {
		return ErrCategoryInUse
	}

	return repositories.DeleteCategory(db, category)
}

func validateCategoryInput(userID uint, name string, categoryType string) (string, string, error) {
	if userID == 0 {
		return "", "", errors.New("userID is required")
	}

	trimmedName := strings.TrimSpace(name)
	if trimmedName == "" {
		return "", "", errors.New("category name is required")
	}

	trimmedType := strings.TrimSpace(categoryType)
	if !isValidType(trimmedType) {
		return "", "", errors.New("category type must be income or expense")
	}

	return trimmedName, trimmedType, nil
}

func isValidType(value string) bool {
	return value == models.TypeIncome || value == models.TypeExpense
}
