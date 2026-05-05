package services

import (
	"context"
	"errors"
	"fmt"
	"log"
	"mime/multipart"
	"strings"
	"time"

	"SpendWise/internal/domain/models"
	"SpendWise/internal/domain/repositories"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type OCRProvider interface {
	ExtractText(ctx context.Context, file multipart.File, header *multipart.FileHeader) (string, error)
}

type namedOCRProvider interface {
	Name() string
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
		if errors.Is(err, ErrOCREngineNotConfigured) {
			return nil, ErrOCREngineNotConfigured
		}
		if errors.Is(err, ErrHEICConversionRequiresImageMagick) {
			return nil, err
		}
		if errors.Is(err, ErrHEICConversionFailed) {
			return nil, err
		}
		return nil, errors.New("failed to scan receipt")
	}

	normalizedText := strings.TrimSpace(rawText)
	if normalizedText == "" {
		return nil, errors.New("OCR text is empty, try a clearer image")
	}
	providerName := getOCRProviderName(s.OCRProvider)
	if gin.Mode() != gin.ReleaseMode {
		log.Printf("OCR RAW TEXT (%s): %s", providerName, truncateForDebug(normalizedText, 500))
	}

	amount, amountFound := ParseAmountFromReceiptText(normalizedText)
	transactionDate, dateFound := ParseDateFromReceiptText(normalizedText, s.NowFunc())
	merchant := ParseMerchantFromReceiptText(normalizedText)
	transactionType := detectTransactionType(normalizedText)

	categories, err := repositories.GetCategoriesByUserID(s.DB, userID)
	if err != nil {
		return nil, err
	}

	category, categoryFound := SuggestCategoryForReceipt(categories, normalizedText, transactionType)
	var categorySuggestion *CategorySuggestion
	if category.ID != 0 {
		categoryConfidence := 0.45
		if categoryFound {
			categoryConfidence = 0.78
		}
		categorySuggestion = &CategorySuggestion{
			ID:         category.ID,
			Name:       category.Name,
			Confidence: categoryConfidence,
		}
	}

	confidence := calculateReceiptConfidence(amountFound, dateFound, categoryFound, transactionType, categorySuggestion != nil)

	suggestion := &ReceiptScanSuggestion{
		Type:               transactionType,
		Amount:             amount,
		TransactionDate:    transactionDate.UTC().Format(time.RFC3339),
		Merchant:           merchant,
		Note:               fmt.Sprintf("%s - scanned receipt", merchant),
		CategorySuggestion: categorySuggestion,
		Confidence:         confidence,
	}
	if providerName == "mock" {
		suggestion.Note = suggestion.Note + " [mock OCR provider active]"
		if suggestion.Confidence > 0.35 {
			suggestion.Confidence = 0.35
		}
	}

	if gin.Mode() != gin.ReleaseMode {
		suggestion.RawText = truncateForDebug(normalizedText, 500)
	}

	return suggestion, nil
}

func calculateReceiptConfidence(amountFound bool, dateFound bool, categoryFound bool, transactionType string, hasCategory bool) float64 {
	score := 0.15
	if amountFound {
		score += 0.35
	}
	if dateFound {
		score += 0.15
	}
	if transactionType == models.TypeIncome {
		score += 0.2
	} else {
		score += 0.1
	}
	if categoryFound {
		score += 0.15
	} else if hasCategory {
		score -= 0.05
	} else {
		score -= 0.1
	}
	if score < 0.1 {
		return 0.1
	}
	if score > 0.98 {
		return 0.98
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

func getOCRProviderName(provider OCRProvider) string {
	named, ok := provider.(namedOCRProvider)
	if !ok {
		return "unknown"
	}
	name := strings.ToLower(strings.TrimSpace(named.Name()))
	if name == "" {
		return "unknown"
	}
	return name
}
