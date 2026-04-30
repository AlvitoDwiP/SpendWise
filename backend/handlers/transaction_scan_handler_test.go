package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"SpendWise/services"
	"SpendWise/utils"

	"github.com/gin-gonic/gin"
)

func TestScanReceiptMissingFile(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.New()
	handler := NewTransactionHandler(nil)
	router.POST("/transactions/scan-receipt", withTestUser(), handler.ScanReceipt)

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	if err := writer.Close(); err != nil {
		t.Fatalf("failed to close writer: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, "/transactions/scan-receipt", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d", http.StatusBadRequest, rec.Code)
	}
}

func TestScanReceiptHEICConversionActionableError(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.New()
	provider := services.NewTesseractOCRProvider()
	provider.Converter = &services.ImageMagickConverter{
		Runner: &stubFailingImageMagickRunner{},
	}
	handler := NewTransactionHandlerWithProvider(nil, provider)
	router.POST("/transactions/scan-receipt", withTestUser(), handler.ScanReceipt)

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile("receipt", "income.heic")
	if err != nil {
		t.Fatalf("failed to create form file: %v", err)
	}
	heicHeader := []byte{
		0x00, 0x00, 0x00, 0x18,
		'f', 't', 'y', 'p', 'h', 'e', 'i', 'c',
		0x00, 0x00, 0x00, 0x00,
	}
	if _, err := part.Write(heicHeader); err != nil {
		t.Fatalf("failed to write form file: %v", err)
	}
	if err := writer.Close(); err != nil {
		t.Fatalf("failed to close writer: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, "/transactions/scan-receipt", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d", http.StatusBadRequest, rec.Code)
	}

	var payload struct {
		Message string `json:"message"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &payload); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	if !strings.Contains(payload.Message, "HEIC conversion requires ImageMagick") {
		t.Fatalf("unexpected message: %s", payload.Message)
	}
}

func TestScanReceiptInvalidFileType(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.New()
	handler := NewTransactionHandler(nil)
	router.POST("/transactions/scan-receipt", withTestUser(), handler.ScanReceipt)

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile("receipt", "test.txt")
	if err != nil {
		t.Fatalf("failed to create form file: %v", err)
	}
	if _, err := part.Write([]byte("not an image")); err != nil {
		t.Fatalf("failed to write form file: %v", err)
	}
	if err := writer.Close(); err != nil {
		t.Fatalf("failed to close writer: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, "/transactions/scan-receipt", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d", http.StatusBadRequest, rec.Code)
	}
}

func withTestUser() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set(utils.UserIDContextKey, uint(1))
		c.Next()
	}
}

type stubFailingImageMagickRunner struct{}

func (s *stubFailingImageMagickRunner) Run(_ context.Context, _ string, _ string) error {
	return services.ErrHEICConversionRequiresImageMagick
}
