package services

import "testing"

func TestCalculateReceiptConfidenceHighForStrongIncomeSignal(t *testing.T) {
	confidence := calculateReceiptConfidence(true, true, true, "income", true)
	if confidence < 0.75 {
		t.Fatalf("expected confidence >= 0.75, got %f", confidence)
	}
}
