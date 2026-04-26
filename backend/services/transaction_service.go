package services

import (
	"errors"
	"strings"
	"time"

	"SpendWise/models"
	"SpendWise/repositories"

	"gorm.io/gorm"
)

func CreateTransaction(db *gorm.DB, userID uint, categoryID uint, transactionType string, amount int64, title string, note string, transactionDate time.Time) (*models.Transaction, error) {
	if userID == 0 {
		return nil, errors.New("userID is required")
	}
	if categoryID == 0 {
		return nil, errors.New("categoryID is required")
	}
	if !isValidType(transactionType) {
		return nil, errors.New("transaction type must be income or expense")
	}
	if amount <= 0 {
		return nil, errors.New("amount must be greater than 0")
	}
	if strings.TrimSpace(title) == "" {
		return nil, errors.New("transaction title is required")
	}
	if transactionDate.IsZero() {
		return nil, errors.New("transaction date is required")
	}

	category, err := repositories.GetCategoryByID(db, categoryID)
	if err != nil {
		return nil, err
	}
	if category.UserID != userID {
		return nil, errors.New("category does not belong to user")
	}
	if category.Type != transactionType {
		return nil, errors.New("category type does not match transaction type")
	}

	transaction := models.Transaction{
		UserID:          userID,
		CategoryID:      categoryID,
		Type:            transactionType,
		Amount:          amount,
		Title:           strings.TrimSpace(title),
		Note:            note,
		TransactionDate: transactionDate,
	}

	if err := repositories.CreateTransaction(db, &transaction); err != nil {
		return nil, err
	}

	return &transaction, nil
}

func GetRecentTransactionsByUserID(db *gorm.DB, userID uint, limit int) ([]models.Transaction, error) {
	if userID == 0 {
		return nil, errors.New("userID is required")
	}
	if limit <= 0 {
		return nil, errors.New("limit must be greater than 0")
	}

	return repositories.GetRecentTransactionsByUserID(db, userID, limit)
}
