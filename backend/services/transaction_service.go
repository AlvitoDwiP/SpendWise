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
	_, trimmedTitle, err := validateTransactionInput(db, userID, categoryID, transactionType, amount, title, transactionDate)
	if err != nil {
		return nil, err
	}

	transaction := models.Transaction{
		UserID:          userID,
		CategoryID:      categoryID,
		Type:            transactionType,
		Amount:          amount,
		Title:           trimmedTitle,
		Note:            note,
		TransactionDate: transactionDate,
	}

	if err := repositories.CreateTransaction(db, &transaction); err != nil {
		return nil, err
	}

	return &transaction, nil
}

func GetTransactionsByUserID(db *gorm.DB, userID uint, limit int, offset int) ([]models.Transaction, error) {
	if userID == 0 {
		return nil, errors.New("userID is required")
	}
	if limit <= 0 {
		return nil, errors.New("limit must be greater than 0")
	}
	if offset < 0 {
		return nil, errors.New("offset must be 0 or greater")
	}

	return repositories.GetTransactionsByUserIDPaginated(db, userID, limit, offset)
}

func GetTransactionByID(db *gorm.DB, userID uint, transactionID uint) (*models.Transaction, error) {
	if userID == 0 {
		return nil, errors.New("userID is required")
	}
	if transactionID == 0 {
		return nil, errors.New("transactionID is required")
	}

	return repositories.GetTransactionByIDAndUserID(db, transactionID, userID)
}

func UpdateTransaction(db *gorm.DB, userID uint, transactionID uint, categoryID uint, transactionType string, amount int64, title string, note string, transactionDate time.Time) (*models.Transaction, error) {
	if transactionID == 0 {
		return nil, errors.New("transactionID is required")
	}

	transaction, err := GetTransactionByID(db, userID, transactionID)
	if err != nil {
		return nil, err
	}

	_, trimmedTitle, err := validateTransactionInput(db, userID, categoryID, transactionType, amount, title, transactionDate)
	if err != nil {
		return nil, err
	}

	transaction.CategoryID = categoryID
	transaction.Type = transactionType
	transaction.Amount = amount
	transaction.Title = trimmedTitle
	transaction.Note = note
	transaction.TransactionDate = transactionDate

	if err := repositories.UpdateTransaction(db, transaction); err != nil {
		return nil, err
	}

	return repositories.GetTransactionByIDAndUserID(db, transactionID, userID)
}

func DeleteTransaction(db *gorm.DB, userID uint, transactionID uint) error {
	if userID == 0 {
		return errors.New("userID is required")
	}
	if transactionID == 0 {
		return errors.New("transactionID is required")
	}

	transaction, err := repositories.GetTransactionByIDAndUserID(db, transactionID, userID)
	if err != nil {
		return err
	}

	return repositories.DeleteTransaction(db, transaction)
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

func validateTransactionInput(db *gorm.DB, userID uint, categoryID uint, transactionType string, amount int64, title string, transactionDate time.Time) (*models.Category, string, error) {
	if userID == 0 {
		return nil, "", errors.New("userID is required")
	}
	if categoryID == 0 {
		return nil, "", errors.New("categoryID is required")
	}
	if !isValidType(transactionType) {
		return nil, "", errors.New("transaction type must be income or expense")
	}
	if amount <= 0 {
		return nil, "", errors.New("amount must be greater than 0")
	}

	trimmedTitle := strings.TrimSpace(title)
	if trimmedTitle == "" {
		return nil, "", errors.New("transaction title is required")
	}
	if transactionDate.IsZero() {
		return nil, "", errors.New("transaction date is required")
	}

	category, err := repositories.GetCategoryByID(db, categoryID)
	if err != nil {
		return nil, "", err
	}
	if category.UserID != userID {
		return nil, "", errors.New("category does not belong to user")
	}
	if category.Type != transactionType {
		return nil, "", errors.New("category type does not match transaction type")
	}

	return category, trimmedTitle, nil
}
