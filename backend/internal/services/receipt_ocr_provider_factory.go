package services

import (
	"fmt"
	"strings"
)

func NewOCRProviderFromName(providerName string) (OCRProvider, string, error) {
	name := strings.ToLower(strings.TrimSpace(providerName))
	if name == "" {
		name = "mock"
	}

	switch name {
	case "mock":
		return NewMockOCRProvider(), "mock", nil
	case "tesseract":
		return NewTesseractOCRProvider(), "tesseract", nil
	default:
		return nil, "", fmt.Errorf("unsupported OCR_PROVIDER value: %s", providerName)
	}
}
