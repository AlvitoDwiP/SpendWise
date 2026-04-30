package services

import (
	"context"
	"errors"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

type stubTesseractRunner struct {
	runFn func(ctx context.Context, imagePath string) (string, error)
}

func (s *stubTesseractRunner) Run(ctx context.Context, imagePath string) (string, error) {
	return s.runFn(ctx, imagePath)
}

func TestTesseractOCRProviderExtractText(t *testing.T) {
	var receivedPath string
	provider := &TesseractOCRProvider{
		Runner: &stubTesseractRunner{
			runFn: func(_ context.Context, imagePath string) (string, error) {
				receivedPath = imagePath
				if !strings.Contains(filepath.Base(imagePath), "spendwise-receipt-") {
					t.Fatalf("unexpected temp filename: %s", imagePath)
				}
				return "Dana Rp2.000.000 masuk ke rekening", nil
			},
		},
	}

	file, header := createMultipartFileForTest(t, "receipt.png", []byte("fake-image-content"))
	defer file.Close()

	text, err := provider.ExtractText(context.Background(), file, header)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if text == "" {
		t.Fatalf("expected OCR text")
	}
	if receivedPath == "" {
		t.Fatalf("expected runner to receive temp path")
	}
	if _, err := os.Stat(receivedPath); !os.IsNotExist(err) {
		t.Fatalf("expected temp file removed after OCR, stat err: %v", err)
	}
}

func TestTesseractOCRProviderNotInstalled(t *testing.T) {
	provider := &TesseractOCRProvider{
		Runner: &stubTesseractRunner{
			runFn: func(_ context.Context, _ string) (string, error) {
				return "", ErrOCREngineNotConfigured
			},
		},
	}

	file, header := createMultipartFileForTest(t, "receipt.jpg", []byte("img"))
	defer file.Close()

	_, err := provider.ExtractText(context.Background(), file, header)
	if !errors.Is(err, ErrOCREngineNotConfigured) {
		t.Fatalf("expected ErrOCREngineNotConfigured, got %v", err)
	}
}

func createMultipartFileForTest(t *testing.T, name string, content []byte) (multipart.File, *multipart.FileHeader) {
	t.Helper()

	tempFile, err := os.CreateTemp("", "spendwise-ocr-upload-*"+filepath.Ext(name))
	if err != nil {
		t.Fatalf("failed creating temp upload file: %v", err)
	}
	if _, err := tempFile.Write(content); err != nil {
		t.Fatalf("failed writing temp upload file: %v", err)
	}
	if _, err := tempFile.Seek(0, 0); err != nil {
		t.Fatalf("failed seeking temp upload file: %v", err)
	}

	header := &multipart.FileHeader{
		Filename: name,
		Size:     int64(len(content)),
	}
	return tempFile, header
}
