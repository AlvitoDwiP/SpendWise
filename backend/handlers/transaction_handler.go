package handlers

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"SpendWise/dto"
	"SpendWise/services"
	"SpendWise/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type TransactionHandler struct {
	DB *gorm.DB
}

const (
	defaultTransactionLimit  = 20
	maxTransactionLimit      = 100
	defaultTransactionOffset = 0
)

type createTransactionRequest struct {
	CategoryID      uint   `json:"category_id" binding:"required"`
	Type            string `json:"type" binding:"required"`
	Amount          int64  `json:"amount" binding:"required"`
	Title           string `json:"title" binding:"required"`
	Note            string `json:"note"`
	TransactionDate string `json:"transaction_date" binding:"required"`
}

func NewTransactionHandler(db *gorm.DB) *TransactionHandler {
	return &TransactionHandler{DB: db}
}

func (h *TransactionHandler) GetTransactions(c *gin.Context) {
	userID, ok := utils.GetUserIDFromContext(c)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized")
		return
	}

	limit, offset, err := parseTransactionPagination(c)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	transactions, err := services.GetTransactionsByUserID(h.DB, userID, limit, offset)
	if err != nil {
		utils.ErrorResponse(c, statusFromError(err), err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "transactions loaded", dto.ToTransactionResponses(transactions))
}

func (h *TransactionHandler) GetTransactionByID(c *gin.Context) {
	userID, ok := utils.GetUserIDFromContext(c)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized")
		return
	}

	transactionID, err := parseTransactionID(c)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	transaction, err := services.GetTransactionByID(h.DB, userID, transactionID)
	if err != nil {
		utils.ErrorResponse(c, statusFromError(err), err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "transaction loaded", dto.ToTransactionResponse(transaction))
}

func (h *TransactionHandler) CreateTransaction(c *gin.Context) {
	userID, ok := utils.GetUserIDFromContext(c)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized")
		return
	}

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

	utils.SuccessResponse(c, http.StatusCreated, "transaction created", dto.ToTransactionResponse(transaction))
}

func (h *TransactionHandler) UpdateTransaction(c *gin.Context) {
	userID, ok := utils.GetUserIDFromContext(c)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized")
		return
	}

	transactionID, err := parseTransactionID(c)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

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

	transaction, err := services.UpdateTransaction(
		h.DB,
		userID,
		transactionID,
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

	utils.SuccessResponse(c, http.StatusOK, "transaction updated", dto.ToTransactionResponse(transaction))
}

func (h *TransactionHandler) DeleteTransaction(c *gin.Context) {
	userID, ok := utils.GetUserIDFromContext(c)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized")
		return
	}

	transactionID, err := parseTransactionID(c)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := services.DeleteTransaction(h.DB, userID, transactionID); err != nil {
		utils.ErrorResponse(c, statusFromError(err), err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "transaction deleted", nil)
}

func (h *TransactionHandler) GetRecentTransactions(c *gin.Context) {
	userID, ok := utils.GetUserIDFromContext(c)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized")
		return
	}

	limit := 10
	if value := c.Query("limit"); value != "" {
		parsedLimit, err := strconv.Atoi(value)
		if err != nil {
			utils.ErrorResponse(c, http.StatusBadRequest, "limit must be a number")
			return
		}
		limit = parsedLimit
	}

	transactions, err := services.GetRecentTransactionsByUserID(h.DB, userID, limit)
	if err != nil {
		utils.ErrorResponse(c, statusFromError(err), err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "recent transactions loaded", dto.ToTransactionResponses(transactions))
}

func parseTransactionID(c *gin.Context) (uint, error) {
	value := c.Param("id")
	id, err := strconv.ParseUint(value, 10, 64)
	if err != nil || id == 0 {
		return 0, errors.New("transaction id must be a positive number")
	}

	return uint(id), nil
}

func parseTransactionPagination(c *gin.Context) (int, int, error) {
	limit := defaultTransactionLimit
	if value := c.Query("limit"); value != "" {
		parsedLimit, err := strconv.Atoi(value)
		if err != nil {
			return 0, 0, errors.New("limit must be a number")
		}
		if parsedLimit <= 0 {
			return 0, 0, errors.New("limit must be greater than 0")
		}
		if parsedLimit > maxTransactionLimit {
			parsedLimit = maxTransactionLimit
		}
		limit = parsedLimit
	}

	offset := defaultTransactionOffset
	if value := c.Query("offset"); value != "" {
		parsedOffset, err := strconv.Atoi(value)
		if err != nil {
			return 0, 0, errors.New("offset must be a number")
		}
		if parsedOffset < 0 {
			return 0, 0, errors.New("offset must be 0 or greater")
		}
		offset = parsedOffset
	}

	return limit, offset, nil
}
