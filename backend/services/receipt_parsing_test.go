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

func TestParseAmountFromReceiptTextIncomeNotification(t *testing.T) {
	text := "Sobat BRI! Dana Rp2.000.000 masuk ke rekening ... pada 28/04/2026 09:53:51"
	amount, ok := ParseAmountFromReceiptText(text)
	if !ok {
		t.Fatalf("expected amount to be found")
	}
	if amount != 2000000 {
		t.Fatalf("expected 2000000, got %d", amount)
	}
}

func TestParseAmountFromReceiptTextExpenseTotalPrioritized(t *testing.T) {
	text := "Total Rp25.300 Cash Rp100.000 Change Rp74.700"
	amount, ok := ParseAmountFromReceiptText(text)
	if !ok {
		t.Fatalf("expected amount to be found")
	}
	if amount != 25300 {
		t.Fatalf("expected 25300, got %d", amount)
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

func TestParseDateFromIncomeNotificationText(t *testing.T) {
	fallback := time.Date(2026, 4, 30, 10, 0, 0, 0, time.UTC)
	date, found := ParseDateFromReceiptText(
		"Sobat BRI! Dana Rp2.000.000 masuk ke rekening ... pada 28/04/2026 09:53:51",
		fallback,
	)
	if !found {
		t.Fatalf("expected date to be found")
	}
	if date.Format("2006-01-02") != "2026-04-28" {
		t.Fatalf("expected 2026-04-28, got %s", date.Format("2006-01-02"))
	}
}

func TestSuggestCategoryForReceiptFallback(t *testing.T) {
	categories := []models.Category{
		{ID: 10, Name: "Savings", Type: models.TypeIncome},
		{ID: 20, Name: "General", Type: models.TypeExpense},
		{ID: 30, Name: "Other", Type: models.TypeExpense},
	}

	category, matched := SuggestCategoryForReceipt(categories, "merchant unknown", models.TypeExpense)
	if matched {
		t.Fatalf("expected keyword match to be false")
	}
	if category.ID != 20 {
		t.Fatalf("expected General fallback ID 20, got %d", category.ID)
	}
}

func TestDetectTransactionTypeIncome(t *testing.T) {
	text := "Sobat BRI! Dana Rp2.000.000 masuk ke rekening ... pada 28/04/2026 09:53:51"
	transactionType := detectTransactionType(text)
	if transactionType != models.TypeIncome {
		t.Fatalf("expected type %s, got %s", models.TypeIncome, transactionType)
	}
}
