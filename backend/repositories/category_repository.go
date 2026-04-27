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

func GetCategoryByIDAndUserID(db *gorm.DB, id uint, userID uint) (*models.Category, error) {
	var category models.Category
	result := db.
		Where("id = ? AND user_id = ?", id, userID).
		Limit(1).
		Find(&category)
	if result.Error != nil {
		return nil, result.Error
	}
	if result.RowsAffected == 0 {
		return nil, gorm.ErrRecordNotFound
	}

	return &category, nil
}

func UpdateCategory(db *gorm.DB, category *models.Category) error {
	result := db.
		Model(&models.Category{}).
		Where("id = ? AND user_id = ?", category.ID, category.UserID).
		Updates(map[string]any{
			"name":  category.Name,
			"type":  category.Type,
			"icon":  category.Icon,
			"color": category.Color,
		})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}

func DeleteCategory(db *gorm.DB, category *models.Category) error {
	result := db.
		Where("id = ? AND user_id = ?", category.ID, category.UserID).
		Delete(&models.Category{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}

func CountTransactionsByCategoryIDAndUserID(db *gorm.DB, categoryID uint, userID uint) (int64, error) {
	var count int64
	err := db.
		Model(&models.Transaction{}).
		Where("category_id = ? AND user_id = ?", categoryID, userID).
		Count(&count).Error

	return count, err
}
