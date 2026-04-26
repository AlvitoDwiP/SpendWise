package repositories

import (
	"SpendWise/models"

	"gorm.io/gorm"
)

func CreateCategory(db *gorm.DB, category *models.Category) error {
	return db.Create(category).Error
}

func GetCategoriesByUserID(db *gorm.DB, userID uint) ([]models.Category, error) {
	var categories []models.Category
	err := db.Where("user_id = ?", userID).Find(&categories).Error
	return categories, err
}

func GetCategoryByID(db *gorm.DB, id uint) (*models.Category, error) {
	var category models.Category
	if err := db.First(&category, id).Error; err != nil {
		return nil, err
	}

	return &category, nil
}
