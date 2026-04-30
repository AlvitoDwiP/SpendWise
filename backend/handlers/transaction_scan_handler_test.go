package handlers

import (
	"bytes"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"

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
