package services

import (
	"regexp"
	"strconv"
	"strings"
	"time"

	"SpendWise/models"
)

var (
	amountCandidateRegex = regexp.MustCompile(`(?i)(grand\s*total|total|jumlah|subtotal|bayar|tunai)[^\d]{0,20}([0-9][0-9.,]{1,20})`)
	anyAmountRegex       = regexp.MustCompile(`([0-9][0-9.,]{3,20})`)
	datePatterns         = []string{
		"02/01/2006",
		"02-01-2006",
		"2006-01-02",
	}
	dateFindRegex = regexp.MustCompile(`\b(\d{2}[/-]\d{2}[/-]\d{4}|\d{4}-\d{2}-\d{2})\b`)
)

func ParseAmountFromReceiptText(rawText string) (int64, bool) {
	matches := amountCandidateRegex.FindAllStringSubmatch(rawText, -1)
	if len(matches) > 0 {
		priority := map[string]int{
			"grand total": 5,
			"total":       4,
			"jumlah":      3,
			"bayar":       2,
			"tunai":       2,
			"subtotal":    1,
		}

		bestScore := -1
		var bestAmount int64
		for _, match := range matches {
			keyword := strings.ToLower(strings.TrimSpace(match[1]))
			amount, ok := parseAmountToken(match[2])
			if !ok {
				continue
			}
			score := priority[keyword]
			if score > bestScore {
				bestScore = score
				bestAmount = amount
			}
		}
		if bestScore >= 0 {
			return bestAmount, true
		}
	}

	fallback := anyAmountRegex.FindAllStringSubmatch(rawText, -1)
	for i := len(fallback) - 1; i >= 0; i-- {
		if amount, ok := parseAmountToken(fallback[i][1]); ok {
			return amount, true
		}
	}

	return 0, false
}

func parseAmountToken(raw string) (int64, bool) {
	cleaned := strings.TrimSpace(raw)
	cleaned = strings.ReplaceAll(cleaned, "Rp", "")
	cleaned = strings.ReplaceAll(cleaned, "rp", "")
	cleaned = strings.ReplaceAll(cleaned, " ", "")
	cleaned = strings.ReplaceAll(cleaned, ".", "")
	cleaned = strings.ReplaceAll(cleaned, ",", "")
	if cleaned == "" {
		return 0, false
	}

	value, err := strconv.ParseInt(cleaned, 10, 64)
	if err != nil || value <= 0 {
		return 0, false
	}
	return value, true
}

func ParseDateFromReceiptText(rawText string, fallback time.Time) (time.Time, bool) {
	candidates := dateFindRegex.FindAllString(rawText, -1)
	for _, candidate := range candidates {
		for _, pattern := range datePatterns {
			if parsed, err := time.Parse(pattern, candidate); err == nil {
				return parsed, true
			}
		}
	}

	return fallback, false
}

func ParseMerchantFromReceiptText(rawText string) string {
	lines := strings.Split(rawText, "\n")
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" {
			continue
		}
		lower := strings.ToLower(trimmed)
		if strings.Contains(lower, "total") ||
			strings.Contains(lower, "subtotal") ||
			strings.Contains(lower, "jumlah") ||
			strings.Contains(lower, "bayar") ||
			strings.Contains(lower, "tunai") {
			continue
		}

		if len(trimmed) > 60 {
			trimmed = trimmed[:60]
		}
		return trimmed
	}

	return "Unknown merchant"
}

func SuggestCategoryForReceipt(categories []models.Category, rawText string) (models.Category, bool) {
	expenseCategories := make([]models.Category, 0, len(categories))
	for _, category := range categories {
		if category.Type == models.TypeExpense {
			expenseCategories = append(expenseCategories, category)
		}
	}

	if len(expenseCategories) == 0 {
		return models.Category{}, false
	}

	lowerText := strings.ToLower(rawText)

	keywordGroups := [][]string{
		{"food", "makan", "restoran", "restaurant", "cafe", "kopi", "indomaret", "alfamart", "grocer"},
		{"transport", "bensin", "pertamina", "grab", "gojek", "ojek", "taxi"},
		{"bill", "listrik", "internet", "pulsa", "pln", "telkom", "wifi"},
	}

	categoryKeywordHints := []string{
		"food",
		"transport",
		"bill",
	}

	for idx, group := range keywordGroups {
		matched := false
		for _, keyword := range group {
			if strings.Contains(lowerText, keyword) {
				matched = true
				break
			}
		}
		if !matched {
			continue
		}

		for _, category := range expenseCategories {
			name := strings.ToLower(category.Name)
			if strings.Contains(name, categoryKeywordHints[idx]) ||
				(idx == 0 && (strings.Contains(name, "grocer") || strings.Contains(name, "makan"))) ||
				(idx == 1 && strings.Contains(name, "travel")) ||
				(idx == 2 && strings.Contains(name, "util")) {
				return category, true
			}
		}
	}

	for _, category := range expenseCategories {
		if strings.EqualFold(strings.TrimSpace(category.Name), "general") {
			return category, false
		}
	}
	for _, category := range expenseCategories {
		if strings.EqualFold(strings.TrimSpace(category.Name), "other") {
			return category, false
		}
	}

	return expenseCategories[0], false
}
