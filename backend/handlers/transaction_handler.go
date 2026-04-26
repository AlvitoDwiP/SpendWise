package handlers

import (
	"net/http"
	"strconv"
	"time"

	"SpendWise/models"
	"SpendWise/services"
	"SpendWise/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type TransactionHandler struct {
	DB *gorm.DB
}

type createTransactionRequest struct {
	CategoryID      uint   `json:"category_id" binding:"required"`
	Type            string `json:"type" binding:"required"`
	Amount          int64  `json:"amount" binding:"required"`
	Title           string `json:"title" binding:"required"`
	Note            string `json:"note"`
	TransactionDate string `json:"transaction_date" binding:"required"`
}

type transactionResponse struct {
	ID              uint              `json:"id"`
	UserID          uint              `json:"user_id"`
	CategoryID      uint              `json:"category_id"`
	Type            string            `json:"type"`
	Amount          int64             `json:"amount"`
	Title           string            `json:"title"`
	Note            string            `json:"note"`
	TransactionDate time.Time         `json:"transaction_date"`
	Category        *categoryResponse `json:"category,omitempty"`
	CreatedAt       time.Time         `json:"created_at"`
	UpdatedAt       time.Time         `json:"updated_at"`
}

func NewTransactionHandler(db *gorm.DB) *TransactionHandler {
	return &TransactionHandler{DB: db}
}

func (h *TransactionHandler) CreateTransaction(c *gin.Context) {
	var request createTransactionRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "invalid request body")
		return
	}

	transactionDate, err := time.Parse(time.RFC3339, request.TransactionDate)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "transaction_date must be RFC3339 format")
		return
	}

	userID := uint(1)
	transaction, err := services.CreateTransaction(
		h.DB,
		userID,
		request.CategoryID,
		request.Type,
		request.Amount,
		request.Title,
		request.Note,
		transactionDate,
	)
	if err != nil {
		utils.ErrorResponse(c, statusFromError(err), err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "transaction created", toTransactionResponse(*transaction))
}

func (h *TransactionHandler) GetRecentTransactions(c *gin.Context) {
	limit := 10
	if value := c.Query("limit"); value != "" {
		parsedLimit, err := strconv.Atoi(value)
		if err != nil {
			utils.ErrorResponse(c, http.StatusBadRequest, "limit must be a number")
			return
		}
		limit = parsedLimit
	}

	userID := uint(1)
	transactions, err := services.GetRecentTransactionsByUserID(h.DB, userID, limit)
	if err != nil {
		utils.ErrorResponse(c, statusFromError(err), err.Error())
		return
	}

	response := make([]transactionResponse, 0, len(transactions))
	for _, transaction := range transactions {
		response = append(response, toTransactionResponse(transaction))
	}

	utils.SuccessResponse(c, http.StatusOK, "recent transactions loaded", response)
}

func toTransactionResponse(transaction models.Transaction) transactionResponse {
	response := transactionResponse{
		ID:              transaction.ID,
		UserID:          transaction.UserID,
		CategoryID:      transaction.CategoryID,
		Type:            transaction.Type,
		Amount:          transaction.Amount,
		Title:           transaction.Title,
		Note:            transaction.Note,
		TransactionDate: transaction.TransactionDate,
		CreatedAt:       transaction.CreatedAt,
		UpdatedAt:       transaction.UpdatedAt,
	}

	if transaction.Category.ID != 0 {
		category := toCategoryResponse(transaction.Category)
		response.Category = &category
	}

	return response
}
