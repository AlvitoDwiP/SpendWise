package handlers

import (
	"context"
	"errors"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"strconv"
	"strings"
	"time"

	"SpendWise/dto"
	"SpendWise/services"
	"SpendWise/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type TransactionHandler struct {
	DB                 *gorm.DB
	ReceiptScanService *services.ReceiptScanService
}

const (
	defaultTransactionLimit  = 20
	maxTransactionLimit      = 100
	defaultTransactionOffset = 0
	maxReceiptFileSizeBytes  = 5 << 20
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
	return &TransactionHandler{
		DB:                 db,
		ReceiptScanService: services.NewReceiptScanService(db, services.NewMockOCRProvider()),
	}
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

	filter, err := parseTransactionListFilter(c, limit, offset)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	transactions, err := services.GetTransactionsByUserID(h.DB, userID, filter)
	if err != nil {
		utils.ErrorResponse(c, statusFromError(err), err.Error())
		return
	}

	response := dto.PaginatedResponse[dto.TransactionResponse]{
		Items: dto.ToTransactionResponses(transactions.Items),
		Pagination: dto.PaginationMeta{
			Limit:  limit,
			Offset: offset,
			Total:  transactions.Total,
		},
	}

	c.JSON(http.StatusOK, response)
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

func (h *TransactionHandler) ScanReceipt(c *gin.Context) {
	userID, ok := utils.GetUserIDFromContext(c)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized")
		return
	}

	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxReceiptFileSizeBytes)
	fileHeader, err := c.FormFile("receipt")
	if err != nil {
		message := strings.ToLower(err.Error())
		if strings.Contains(message, "request body too large") {
			utils.ErrorResponse(c, http.StatusBadRequest, "file is too large (max 5MB)")
			return
		}
		utils.ErrorResponse(c, http.StatusBadRequest, "receipt file is required")
		return
	}

	contentType, err := detectContentType(fileHeader)
	if err != nil {
		log.Printf("scan receipt detect content type failed: %v", err)
		utils.ErrorResponse(c, http.StatusBadRequest, "failed to read uploaded file")
		return
	}

	if !isAllowedImageContentType(contentType) {
		utils.ErrorResponse(c, http.StatusBadRequest, "unsupported file type, only jpeg, png, and webp are allowed")
		return
	}

	suggestion, err := h.ReceiptScanService.ScanReceipt(context.Background(), userID, fileHeader)
	if err != nil {
		log.Printf("scan receipt failed for user %d: %v", userID, err)
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "receipt scan suggestion generated", suggestion)
}

func detectContentType(header *multipart.FileHeader) (string, error) {
	file, err := header.Open()
	if err != nil {
		return "", err
	}
	defer file.Close()

	buffer := make([]byte, 512)
	n, err := file.Read(buffer)
	if err != nil && !errors.Is(err, io.EOF) {
		return "", err
	}

	return http.DetectContentType(buffer[:n]), nil
}

func isAllowedImageContentType(contentType string) bool {
	switch contentType {
	case "image/jpeg", "image/png", "image/webp":
		return true
	default:
		return false
	}
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

func parseTransactionListFilter(c *gin.Context, limit int, offset int) (services.TransactionListFilter, error) {
	filter := services.TransactionListFilter{
		Type:   c.Query("type"),
		Limit:  limit,
		Offset: offset,
	}

	categoryID, err := parseOptionalUintQuery(c, "category_id")
	if err != nil {
		return services.TransactionListFilter{}, err
	}
	filter.CategoryID = categoryID

	startDate, err := parseOptionalDateQuery(c, "start_date")
	if err != nil {
		return services.TransactionListFilter{}, err
	}
	filter.StartDate = startDate

	endDate, err := parseOptionalDateQuery(c, "end_date")
	if err != nil {
		return services.TransactionListFilter{}, err
	}
	if endDate != nil {
		exclusiveEndDate := endDate.AddDate(0, 0, 1)
		filter.EndDate = &exclusiveEndDate
	}

	return filter, nil
}

func parseOptionalUintQuery(c *gin.Context, key string) (*uint, error) {
	value := c.Query(key)
	if value == "" {
		return nil, nil
	}

	parsed, err := strconv.ParseUint(value, 10, 64)
	if err != nil {
		return nil, errors.New(key + " must be a number")
	}

	result := uint(parsed)
	return &result, nil
}

func parseOptionalDateQuery(c *gin.Context, key string) (*time.Time, error) {
	value := c.Query(key)
	if value == "" {
		return nil, nil
	}

	parsed, err := time.Parse("2006-01-02", value)
	if err != nil {
		return nil, errors.New(key + " must be YYYY-MM-DD format")
	}

	return &parsed, nil
}
