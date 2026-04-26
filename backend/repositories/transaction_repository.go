package repositories

import (
	"SpendWise/models"

	"gorm.io/gorm"
)

func CreateTransaction(db *gorm.DB, transaction *models.Transaction) error {
	return db.Create(transaction).Error
}

func GetTransactionsByUserID(db *gorm.DB, userID uint) ([]models.Transaction, error) {
	var transactions []models.Transaction
	err := db.Where("user_id = ?", userID).Find(&transactions).Error
	return transactions, err
}

func GetRecentTransactionsByUserID(db *gorm.DB, userID uint, limit int) ([]models.Transaction, error) {
	var transactions []models.Transaction
	err := db.
		Preload("Category").
		Where("user_id = ?", userID).
		Order("transaction_date DESC").
		Limit(limit).
		Find(&transactions).Error

	return transactions, err
}
