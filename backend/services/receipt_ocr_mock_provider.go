package services

import (
	"context"
	"fmt"
	"mime/multipart"
	"strings"
)

type MockOCRProvider struct{}

func NewMockOCRProvider() *MockOCRProvider {
	return &MockOCRProvider{}
}

func (m *MockOCRProvider) Name() string {
	return "mock"
}

func (m *MockOCRProvider) ExtractText(_ context.Context, _ multipart.File, header *multipart.FileHeader) (string, error) {
	fileName := strings.TrimSpace(header.Filename)
	if fileName == "" {
		fileName = "uploaded receipt"
	}

	// TODO: Replace with real OCR backend provider implementation.
	return fmt.Sprintf("Receipt uploaded: %s\nOCR backend belum tersedia\nTotal: 58000\nDate: 30/04/2026\nMerchant: Indomaret", fileName), nil
}
