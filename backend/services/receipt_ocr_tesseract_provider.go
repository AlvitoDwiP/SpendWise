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
	Runner  TesseractCommandRunner
	Timeout time.Duration
}

func NewTesseractOCRProvider() *TesseractOCRProvider {
	return &TesseractOCRProvider{
		Runner:  &execTesseractRunner{},
		Timeout: 15 * time.Second,
	}
}

func (p *TesseractOCRProvider) Name() string {
	return "tesseract"
}

func (p *TesseractOCRProvider) ExtractText(ctx context.Context, file multipart.File, _ *multipart.FileHeader) (string, error) {
	tempFile, err := os.CreateTemp("", "spendwise-receipt-*.img")
	if err != nil {
		return "", errors.New("failed to create temporary OCR file")
	}
	tempPath := tempFile.Name()

	defer func() {
		_ = tempFile.Close()
		_ = os.Remove(tempPath)
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

	text, err := runner.Run(runCtx, tempPath)
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
