package services

import (
	"testing"
	"time"

	"SpendWise/models"
)

func TestParseAmountFromReceiptText(t *testing.T) {
	text := "TOKO ABC\nSubtotal: Rp12.000\nGrand Total: Rp58.000\nTunai: 60000"
	amount, ok := ParseAmountFromReceiptText(text)
	if !ok {
		t.Fatalf("expected amount to be found")
	}
	if amount != 58000 {
		t.Fatalf("expected 58000, got %d", amount)
	}
}

func TestParseDateFromReceiptText(t *testing.T) {
	fallback := time.Date(2026, 4, 30, 10, 0, 0, 0, time.UTC)
	date, found := ParseDateFromReceiptText("Tanggal: 30/04/2026", fallback)
	if !found {
		t.Fatalf("expected date to be found")
	}
	if date.Format("2006-01-02") != "2026-04-30" {
		t.Fatalf("expected 2026-04-30, got %s", date.Format("2006-01-02"))
	}
}

func TestSuggestCategoryForReceiptFallback(t *testing.T) {
	categories := []models.Category{
		{ID: 10, Name: "Savings", Type: models.TypeIncome},
		{ID: 20, Name: "General", Type: models.TypeExpense},
		{ID: 30, Name: "Other", Type: models.TypeExpense},
	}

	category, matched := SuggestCategoryForReceipt(categories, "merchant unknown")
	if matched {
		t.Fatalf("expected keyword match to be false")
	}
	if category.ID != 20 {
		t.Fatalf("expected General fallback ID 20, got %d", category.ID)
	}
}
