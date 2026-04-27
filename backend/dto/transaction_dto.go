package dto

import (
	"time"

	"SpendWise/models"
)

type TransactionResponse struct {
	ID              uint              `json:"id"`
	CategoryID      uint              `json:"category_id"`
	Type            string            `json:"type"`
	Amount          int64             `json:"amount"`
	Title           string            `json:"title"`
	Note            string            `json:"note"`
	TransactionDate time.Time         `json:"transaction_date"`
	Category        *CategoryResponse `json:"category,omitempty"`
}

func ToTransactionResponse(transaction *models.Transaction) TransactionResponse {
	if transaction == nil {
		return TransactionResponse{}
	}

	response := TransactionResponse{
		ID:              transaction.ID,
		CategoryID:      transaction.CategoryID,
		Type:            transaction.Type,
		Amount:          transaction.Amount,
		Title:           transaction.Title,
		Note:            transaction.Note,
		TransactionDate: transaction.TransactionDate,
	}

	if transaction.Category.ID != 0 {
		category := ToCategoryResponse(&transaction.Category)
		response.Category = &category
	}

	return response
}

func ToTransactionResponses(transactions []models.Transaction) []TransactionResponse {
	response := make([]TransactionResponse, 0, len(transactions))
	for i := range transactions {
		response = append(response, ToTransactionResponse(&transactions[i]))
	}

	return response
}
