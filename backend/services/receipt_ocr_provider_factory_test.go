package services

import "testing"

func TestNewOCRProviderFromNameMock(t *testing.T) {
	provider, name, err := NewOCRProviderFromName("mock")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if name != "mock" {
		t.Fatalf("expected mock provider name, got %s", name)
	}
	if _, ok := provider.(*MockOCRProvider); !ok {
		t.Fatalf("expected *MockOCRProvider")
	}
}

func TestNewOCRProviderFromNameTesseract(t *testing.T) {
	provider, name, err := NewOCRProviderFromName("tesseract")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if name != "tesseract" {
		t.Fatalf("expected tesseract provider name, got %s", name)
	}
	if _, ok := provider.(*TesseractOCRProvider); !ok {
		t.Fatalf("expected *TesseractOCRProvider")
	}
}
