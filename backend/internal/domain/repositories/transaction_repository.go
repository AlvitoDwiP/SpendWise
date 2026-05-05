package repositories

import (
	"SpendWise/internal/domain/models"

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

func GetTransactionsByUserIDPaginated(db *gorm.DB, userID uint, limit int, offset int) ([]models.Transaction, error) {
	var transactions []models.Transaction
	err := db.
		Preload("Category").
		Where("user_id = ?", userID).
		Order("transaction_date DESC, id DESC").
		Limit(limit).
		Offset(offset).
		Find(&transactions).Error

	return transactions, err
}

func CountTransactionsByUserID(db *gorm.DB, userID uint) (int64, error) {
	var total int64
	err := db.
		Model(&models.Transaction{}).
		Where("user_id = ?", userID).
		Count(&total).Error

	return total, err
}

func GetTransactionsByFilter(db *gorm.DB, filter TransactionFilter) ([]models.Transaction, error) {
	var transactions []models.Transaction
	err := applyTransactionFilter(db, filter).
		Preload("Category").
		Order("transaction_date DESC").
		Limit(filter.Limit).
		Offset(filter.Offset).
		Find(&transactions).Error

	return transactions, err
}

func CountTransactionsByFilter(db *gorm.DB, filter TransactionFilter) (int64, error) {
	var total int64
	err := applyTransactionFilter(db.Model(&models.Transaction{}), filter).
		Count(&total).Error

	return total, err
}

func GetTransactionByIDAndUserID(db *gorm.DB, id uint, userID uint) (*models.Transaction, error) {
	var transaction models.Transaction
	result := db.
		Preload("Category").
		Where("id = ? AND user_id = ?", id, userID).
		Limit(1).
		Find(&transaction)
	if result.Error != nil {
		return nil, result.Error
	}
	if result.RowsAffected == 0 {
		return nil, gorm.ErrRecordNotFound
	}

	return &transaction, nil
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

func UpdateTransaction(db *gorm.DB, transaction *models.Transaction) error {
	result := db.
		Model(&models.Transaction{}).
		Where("id = ? AND user_id = ?", transaction.ID, transaction.UserID).
		Updates(map[string]any{
			"category_id":      transaction.CategoryID,
			"type":             transaction.Type,
			"amount":           transaction.Amount,
			"title":            transaction.Title,
			"note":             transaction.Note,
			"transaction_date": transaction.TransactionDate,
		})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}

func applyTransactionFilter(query *gorm.DB, filter TransactionFilter) *gorm.DB {
	query = query.Where("user_id = ?", filter.UserID)

	if filter.Type != "" {
		query = query.Where("type = ?", filter.Type)
	}
	if filter.CategoryID != nil {
		query = query.Where("category_id = ?", *filter.CategoryID)
	}
	if filter.StartDate != nil {
		query = query.Where("transaction_date >= ?", *filter.StartDate)
	}
	if filter.EndDate != nil {
		query = query.Where("transaction_date < ?", *filter.EndDate)
	}

	return query
}

func DeleteTransaction(db *gorm.DB, transaction *models.Transaction) error {
	result := db.
		Where("id = ? AND user_id = ?", transaction.ID, transaction.UserID).
		Delete(&models.Transaction{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}
