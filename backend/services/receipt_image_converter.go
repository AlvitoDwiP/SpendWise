package services

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

var ErrHEICConversionRequiresImageMagick = errors.New("HEIC conversion requires ImageMagick. Install it with: brew install imagemagick")
var ErrHEICConversionFailed = errors.New("HEIC conversion failed. Please install ImageMagick or upload JPG/PNG.")

type ImageConverter interface {
	ConvertToOCRCompatible(ctx context.Context, inputPath string, contentType string) (outputPath string, cleanup func(), err error)
}

type ImageMagickCommandRunner interface {
	Run(ctx context.Context, inputPath string, outputPath string) error
}

type execImageMagickRunner struct{}

func (r *execImageMagickRunner) Run(ctx context.Context, inputPath string, outputPath string) error {
	cmd := exec.CommandContext(ctx, "magick", inputPath, outputPath)
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		if errors.Is(err, exec.ErrNotFound) {
			return ErrHEICConversionRequiresImageMagick
		}
		return fmt.Errorf("imagemagick conversion failed: %w", err)
	}
	return nil
}

type ImageMagickConverter struct {
	Runner  ImageMagickCommandRunner
	Timeout time.Duration
}

func NewImageMagickConverter() *ImageMagickConverter {
	return &ImageMagickConverter{
		Runner:  &execImageMagickRunner{},
		Timeout: 15 * time.Second,
	}
}

func (c *ImageMagickConverter) ConvertToOCRCompatible(ctx context.Context, inputPath string, contentType string) (string, func(), error) {
	cleanupNoop := func() {}
	if !isHEICContentType(contentType) {
		return inputPath, cleanupNoop, nil
	}

	timeout := c.Timeout
	if timeout <= 0 {
		timeout = 15 * time.Second
	}
	runCtx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	outputFile, err := os.CreateTemp("", "spendwise-receipt-converted-*.jpg")
	if err != nil {
		return "", cleanupNoop, errors.New("failed to create temporary converted image file")
	}
	outputPath := outputFile.Name()
	_ = outputFile.Close()

	cleanup := func() {
		_ = os.Remove(outputPath)
	}

	runner := c.Runner
	if runner == nil {
		runner = &execImageMagickRunner{}
	}

	if err := runner.Run(runCtx, inputPath, outputPath); err != nil {
		cleanup()
		if errors.Is(err, ErrHEICConversionRequiresImageMagick) {
			return "", cleanupNoop, ErrHEICConversionRequiresImageMagick
		}
		if errors.Is(runCtx.Err(), context.DeadlineExceeded) {
			return "", cleanupNoop, errors.New("HEIC conversion timed out")
		}
		return "", cleanupNoop, ErrHEICConversionFailed
	}

	return outputPath, cleanup, nil
}

func inferContentTypeFromHeaderOrExt(contentType string, filename string) string {
	normalized := strings.ToLower(strings.TrimSpace(contentType))
	if normalized != "" && normalized != "application/octet-stream" {
		return normalized
	}
	ext := strings.ToLower(strings.TrimSpace(filepath.Ext(filename)))
	switch ext {
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".webp":
		return "image/webp"
	case ".heic":
		return "image/heic"
	case ".heif":
		return "image/heif"
	default:
		return ""
	}
}

func isHEICContentType(contentType string) bool {
	switch strings.ToLower(strings.TrimSpace(contentType)) {
	case "image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence":
		return true
	default:
		return false
	}
}
