package services

import (
	"context"
	"errors"
	"mime/multipart"
	"net/textproto"
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

type stubImageConverter struct {
	convertFn func(ctx context.Context, inputPath string, contentType string) (outputPath string, cleanup func(), err error)
}

func (s *stubImageConverter) ConvertToOCRCompatible(ctx context.Context, inputPath string, contentType string) (string, func(), error) {
	return s.convertFn(ctx, inputPath, contentType)
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
		Converter: &stubImageConverter{
			convertFn: func(_ context.Context, inputPath string, _ string) (string, func(), error) {
				return inputPath, func() {}, nil
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
		Converter: &stubImageConverter{
			convertFn: func(_ context.Context, inputPath string, _ string) (string, func(), error) {
				return inputPath, func() {}, nil
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

func TestTesseractOCRProviderHEICUsesConvertedPath(t *testing.T) {
	const convertedPath = "/tmp/converted.jpg"
	var runnerPath string
	provider := &TesseractOCRProvider{
		Runner: &stubTesseractRunner{
			runFn: func(_ context.Context, imagePath string) (string, error) {
				runnerPath = imagePath
				return "ok", nil
			},
		},
		Converter: &stubImageConverter{
			convertFn: func(_ context.Context, _ string, contentType string) (string, func(), error) {
				if contentType != "image/heic" {
					t.Fatalf("expected heic content type, got %s", contentType)
				}
				return convertedPath, func() {}, nil
			},
		},
	}

	file, header := createMultipartFileForTest(t, "receipt.heic", []byte("heic-content"))
	header.Header = make(textproto.MIMEHeader)
	header.Header.Set("Content-Type", "image/heic")
	defer file.Close()

	_, err := provider.ExtractText(context.Background(), file, header)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if runnerPath != convertedPath {
		t.Fatalf("expected runner path %s, got %s", convertedPath, runnerPath)
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
