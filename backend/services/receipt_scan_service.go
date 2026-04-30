package services

import (
	"context"
	"errors"
	"fmt"
	"log"
	"mime/multipart"
	"strings"
	"time"

	"SpendWise/models"
	"SpendWise/repositories"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type OCRProvider interface {
	ExtractText(ctx context.Context, file multipart.File, header *multipart.FileHeader) (string, error)
}

type ReceiptScanService struct {
	DB          *gorm.DB
	OCRProvider OCRProvider
	NowFunc     func() time.Time
}

type CategorySuggestion struct {
	ID         uint    `json:"id"`
	Name       string  `json:"name"`
	Confidence float64 `json:"confidence"`
}

type ReceiptScanSuggestion struct {
	Type               string              `json:"type"`
	Amount             int64               `json:"amount"`
	TransactionDate    string              `json:"transaction_date"`
	Merchant           string              `json:"merchant"`
	Note               string              `json:"note"`
	CategorySuggestion *CategorySuggestion `json:"category_suggestion,omitempty"`
	Confidence         float64             `json:"confidence"`
	RawText            string              `json:"raw_text,omitempty"`
}

func NewReceiptScanService(db *gorm.DB, provider OCRProvider) *ReceiptScanService {
	return &ReceiptScanService{
		DB:          db,
		OCRProvider: provider,
		NowFunc:     time.Now,
	}
}

func (s *ReceiptScanService) ScanReceipt(ctx context.Context, userID uint, header *multipart.FileHeader) (*ReceiptScanSuggestion, error) {
	if userID == 0 {
		return nil, errors.New("userID is required")
	}
	if header == nil {
		return nil, errors.New("receipt file is required")
	}
	if s.OCRProvider == nil {
		return nil, errors.New("ocr provider is not configured")
	}

	file, err := header.Open()
	if err != nil {
		return nil, errors.New("failed to open uploaded file")
	}
	defer file.Close()

	rawText, err := s.OCRProvider.ExtractText(ctx, file, header)
	if err != nil {
		return nil, errors.New("failed to scan receipt")
	}

	normalizedText := strings.TrimSpace(rawText)
	if normalizedText == "" {
		normalizedText = "receipt uploaded"
	}

	amount, amountFound := ParseAmountFromReceiptText(normalizedText)
	transactionDate, dateFound := ParseDateFromReceiptText(normalizedText, s.NowFunc())
	merchant := ParseMerchantFromReceiptText(normalizedText)

	categories, err := repositories.GetCategoriesByUserID(s.DB, userID)
	if err != nil {
		return nil, err
	}

	category, categoryFound := SuggestCategoryForReceipt(categories, normalizedText)
	categorySuggestion := &CategorySuggestion{
		ID:         category.ID,
		Name:       category.Name,
		Confidence: 0.45,
	}
	if categoryFound {
		categorySuggestion.Confidence = 0.75
	}

	confidence := calculateReceiptConfidence(amountFound, dateFound, categoryFound)

	suggestion := &ReceiptScanSuggestion{
		Type:               models.TypeExpense,
		Amount:             amount,
		TransactionDate:    transactionDate.UTC().Format(time.RFC3339),
		Merchant:           merchant,
		Note:               fmt.Sprintf("%s - scanned receipt", merchant),
		CategorySuggestion: categorySuggestion,
		Confidence:         confidence,
	}

	if gin.Mode() != gin.ReleaseMode {
		suggestion.RawText = truncateForDebug(normalizedText, 500)
	}

	return suggestion, nil
}

func calculateReceiptConfidence(amountFound bool, dateFound bool, categoryFound bool) float64 {
	score := 0.2
	if amountFound {
		score += 0.4
	}
	if dateFound {
		score += 0.2
	}
	if categoryFound {
		score += 0.2
	}
	if score > 1 {
		return 1
	}
	return score
}

func truncateForDebug(rawText string, maxLen int) string {
	if len(rawText) <= maxLen {
		return rawText
	}
	log.Printf("receipt raw text truncated from %d to %d chars", len(rawText), maxLen)
	return rawText[:maxLen]
}
