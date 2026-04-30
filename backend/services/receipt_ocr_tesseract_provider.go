package services

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"os/exec"
	"time"
)

var ErrOCREngineNotConfigured = errors.New("OCR engine is not installed or not configured")

type TesseractCommandRunner interface {
	Run(ctx context.Context, imagePath string) (string, error)
}

type execTesseractRunner struct{}

func (r *execTesseractRunner) Run(ctx context.Context, imagePath string) (string, error) {
	cmd := exec.CommandContext(ctx, "tesseract", imagePath, "stdout")
	var stdout bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		if errors.Is(err, exec.ErrNotFound) {
			return "", ErrOCREngineNotConfigured
		}
		return "", fmt.Errorf("tesseract failed: %w", err)
	}

	return stdout.String(), nil
}

type TesseractOCRProvider struct {
	Runner    TesseractCommandRunner
	Converter ImageConverter
	Timeout   time.Duration
}

func NewTesseractOCRProvider() *TesseractOCRProvider {
	return &TesseractOCRProvider{
		Runner:    &execTesseractRunner{},
		Converter: NewImageMagickConverter(),
		Timeout:   15 * time.Second,
	}
}

func (p *TesseractOCRProvider) Name() string {
	return "tesseract"
}

func (p *TesseractOCRProvider) ExtractText(ctx context.Context, file multipart.File, header *multipart.FileHeader) (string, error) {
	tempFile, err := os.CreateTemp("", "spendwise-receipt-upload-*")
	if err != nil {
		return "", errors.New("failed to create temporary OCR file")
	}
	uploadPath := tempFile.Name()

	defer func() {
		_ = tempFile.Close()
		_ = os.Remove(uploadPath)
	}()

	if _, err := io.Copy(tempFile, file); err != nil {
		return "", errors.New("failed to write temporary OCR file")
	}

	timeout := p.Timeout
	if timeout <= 0 {
		timeout = 15 * time.Second
	}
	runCtx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	runner := p.Runner
	if runner == nil {
		runner = &execTesseractRunner{}
	}

	converter := p.Converter
	if converter == nil {
		converter = NewImageMagickConverter()
	}
	declaredContentType := ""
	filename := ""
	if header != nil {
		declaredContentType = header.Header.Get("Content-Type")
		filename = header.Filename
	}
	inputContentType := inferContentTypeFromHeaderOrExt(declaredContentType, filename)
	ocrPath, cleanupConverted, err := converter.ConvertToOCRCompatible(runCtx, uploadPath, inputContentType)
	if err != nil {
		if errors.Is(err, ErrHEICConversionRequiresImageMagick) {
			return "", ErrHEICConversionRequiresImageMagick
		}
		return "", err
	}
	defer cleanupConverted()

	text, err := runner.Run(runCtx, ocrPath)
	if err != nil {
		if errors.Is(err, ErrOCREngineNotConfigured) {
			return "", ErrOCREngineNotConfigured
		}
		if errors.Is(runCtx.Err(), context.DeadlineExceeded) {
			return "", errors.New("OCR processing timed out")
		}
		return "", err
	}

	return text, nil
}
