package services

import (
	"errors"
	"strings"
	"time"

	"SpendWise/internal/domain/models"
	"SpendWise/internal/domain/repositories"

	"gorm.io/gorm"
)

type PaginatedTransactions struct {
	Items []models.Transaction
	Total int64
}

type TransactionListFilter struct {
	Type       string
	CategoryID *uint
	StartDate  *time.Time
	EndDate    *time.Time
	Limit      int
	Offset     int
}

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

func GetTransactionsByUserID(db *gorm.DB, userID uint, filter TransactionListFilter) (*PaginatedTransactions, error) {
	if userID == 0 {
		return nil, errors.New("userID is required")
	}
	filter.Type = strings.TrimSpace(filter.Type)
	if filter.Type != "" && !isValidType(filter.Type) {
		return nil, errors.New("transaction type must be income or expense")
	}
	if filter.CategoryID != nil {
		if *filter.CategoryID == 0 {
			return nil, errors.New("categoryID is required")
		}
		if _, err := repositories.GetCategoryByIDAndUserID(db, *filter.CategoryID, userID); err != nil {
			return nil, err
		}
	}
	if filter.Limit <= 0 {
		return nil, errors.New("limit must be greater than 0")
	}
	if filter.Offset < 0 {
		return nil, errors.New("offset must be 0 or greater")
	}
	if filter.StartDate != nil && filter.EndDate != nil && filter.StartDate.After(*filter.EndDate) {
		return nil, errors.New("start_date must be before or equal to end_date")
	}

	repositoryFilter := repositories.TransactionFilter{
		UserID:     userID,
		Type:       filter.Type,
		CategoryID: filter.CategoryID,
		StartDate:  filter.StartDate,
		EndDate:    filter.EndDate,
		Limit:      filter.Limit,
		Offset:     filter.Offset,
	}

	items, err := repositories.GetTransactionsByFilter(db, repositoryFilter)
	if err != nil {
		return nil, err
	}

	total, err := repositories.CountTransactionsByFilter(db, repositoryFilter)
	if err != nil {
		return nil, err
	}

	return &PaginatedTransactions{
		Items: items,
		Total: total,
	}, nil
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

	category, err := repositories.GetCategoryByIDAndUserID(db, categoryID, userID)
	if err != nil {
		return nil, "", err
	}
	if category.Type != transactionType {
		return nil, "", errors.New("category type does not match transaction type")
	}

	return category, trimmedTitle, nil
}
