package services

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

type stubImageMagickRunner struct {
	runFn func(ctx context.Context, inputPath string, outputPath string) error
}

func (s *stubImageMagickRunner) Run(ctx context.Context, inputPath string, outputPath string) error {
	return s.runFn(ctx, inputPath, outputPath)
}

func TestImageMagickConverterBypassForPNG(t *testing.T) {
	converter := &ImageMagickConverter{}
	output, cleanup, err := converter.ConvertToOCRCompatible(context.Background(), "/tmp/a.png", "image/png")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	defer cleanup()
	if output != "/tmp/a.png" {
		t.Fatalf("expected unchanged path, got %s", output)
	}
}

func TestImageMagickConverterHEICSuccess(t *testing.T) {
	converter := &ImageMagickConverter{
		Runner: &stubImageMagickRunner{
			runFn: func(_ context.Context, _ string, outputPath string) error {
				return os.WriteFile(outputPath, []byte("jpg-content"), 0o600)
			},
		},
	}

	output, cleanup, err := converter.ConvertToOCRCompatible(context.Background(), "/tmp/a.heic", "image/heic")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if !strings.HasSuffix(output, ".jpg") {
		t.Fatalf("expected jpg output, got %s", output)
	}
	if _, err := os.Stat(output); err != nil {
		t.Fatalf("expected output exists, got %v", err)
	}
	cleanup()
	if _, err := os.Stat(output); !os.IsNotExist(err) {
		t.Fatalf("expected output removed after cleanup, stat err: %v", err)
	}
}

func TestImageMagickConverterHEICMissingMagick(t *testing.T) {
	converter := &ImageMagickConverter{
		Runner: &stubImageMagickRunner{
			runFn: func(_ context.Context, _ string, _ string) error {
				return ErrHEICConversionRequiresImageMagick
			},
		},
	}

	_, _, err := converter.ConvertToOCRCompatible(context.Background(), "/tmp/a.heic", "image/heic")
	if !errors.Is(err, ErrHEICConversionRequiresImageMagick) {
		t.Fatalf("expected imagemagick error, got %v", err)
	}
}

func TestInferContentTypeFromHeaderOrExt(t *testing.T) {
	value := inferContentTypeFromHeaderOrExt("", "photo.heif")
	if value != "image/heif" {
		t.Fatalf("expected image/heif, got %s", value)
	}
	if inferContentTypeFromHeaderOrExt("image/png", "x.heic") != "image/png" {
		t.Fatalf("header content type should be preferred")
	}
	if inferContentTypeFromHeaderOrExt("", filepath.Base("x.unknown")) != "" {
		t.Fatalf("expected empty fallback for unknown extension")
	}
}
