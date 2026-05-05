package services

import (
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"SpendWise/internal/domain/models"
)

var (
	amountTokenRegex = regexp.MustCompile(`(?i)(?:rp|idr)?\s*[0-9][0-9.,]{2,20}`)
	datePatterns     = []string{
		"02/01/2006",
		"02-01-2006",
		"2006-01-02",
	}
	dateFindRegex = regexp.MustCompile(`\b(\d{2}[/-]\d{2}[/-]\d{4}|\d{4}-\d{2}-\d{2})\b`)
	clockRegex    = regexp.MustCompile(`\b\d{1,2}:\d{2}(:\d{2})?\b`)
)

var (
	strongIncomeSignals = []string{
		"dana masuk",
		"uang masuk",
		"transfer masuk",
		"masuk ke rekening",
		"credited",
	}
	incomeSignals = []string{
		"masuk",
		"menerima",
		"diterima",
		"received",
		"credit",
		"incoming",
		"deposit",
		"top up",
		"gaji",
		"salary",
	}
	strongExpenseSignals = []string{
		"grand total",
		"total",
		"pembayaran",
		"bayar",
		"purchase",
		"spent",
		"withdrawal",
		"transfer keluar",
	}
	expenseSignals = []string{
		"belanja",
		"debit",
		"paid",
		"keluar",
	}
	incomeAmountContext  = []string{"dana", "masuk", "transfer", "credited", "received", "gaji", "salary", "deposit"}
	expenseAmountContext = []string{"total", "grand total", "jumlah", "bayar", "subtotal", "payment", "purchase"}
)

type amountCandidate struct {
	value int64
	score int
}

func detectTransactionType(rawText string) string {
	text := strings.ToLower(rawText)

	incomeScore := countSignals(text, strongIncomeSignals, 4) + countSignals(text, incomeSignals, 2)
	expenseScore := countSignals(text, strongExpenseSignals, 4) + countSignals(text, expenseSignals, 2)

	if strings.Contains(text, "receipt") || strings.Contains(text, "struk") {
		expenseScore++
	}
	if strings.Contains(text, "rekening") && strings.Contains(text, "masuk") {
		incomeScore += 2
	}

	if incomeScore > expenseScore {
		return models.TypeIncome
	}
	if expenseScore > incomeScore {
		return models.TypeExpense
	}

	if incomeScore >= 4 {
		return models.TypeIncome
	}
	return models.TypeExpense
}

func countSignals(text string, signals []string, weight int) int {
	score := 0
	for _, signal := range signals {
		if strings.Contains(text, signal) {
			score += weight
		}
	}
	return score
}

func ParseAmountFromReceiptText(rawText string) (int64, bool) {
	transactionType := detectTransactionType(rawText)
	candidates := collectAmountCandidates(rawText, transactionType)
	if len(candidates) > 0 {
		sort.SliceStable(candidates, func(i, j int) bool {
			if candidates[i].score == candidates[j].score {
				return candidates[i].value > candidates[j].value
			}
			return candidates[i].score > candidates[j].score
		})
		return candidates[0].value, true
	}
	return 0, false
}

func parseAmountToken(raw string) (int64, bool) {
	cleaned := strings.TrimSpace(raw)
	cleaned = strings.TrimPrefix(strings.ToLower(cleaned), "rp")
	cleaned = strings.TrimPrefix(cleaned, "idr")
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

func collectAmountCandidates(rawText string, transactionType string) []amountCandidate {
	matches := amountTokenRegex.FindAllStringIndex(rawText, -1)
	if len(matches) == 0 {
		return nil
	}

	textLower := strings.ToLower(rawText)
	candidates := make([]amountCandidate, 0, len(matches))
	for _, match := range matches {
		token := rawText[match[0]:match[1]]
		value, ok := parseAmountToken(token)
		if !ok || value < 100 {
			continue
		}

		score := scoreAmountToken(rawText, textLower, token, value, match[0], match[1], transactionType)
		if score <= 0 {
			continue
		}
		candidates = append(candidates, amountCandidate{value: value, score: score})
	}
	return candidates
}

func scoreAmountToken(rawText, textLower, token string, value int64, start, end int, transactionType string) int {
	tokenLower := strings.ToLower(token)
	score := 10

	if strings.Contains(tokenLower, "rp") || strings.Contains(tokenLower, "idr") {
		score += 30
	}
	if strings.Count(token, ".")+strings.Count(token, ",") >= 1 {
		score += 8
	}

	context := textLower[max(0, start-40):min(len(textLower), end+40)]
	if transactionType == models.TypeIncome {
		score += contextKeywordScore(context, incomeAmountContext)
		score -= contextKeywordScore(context, []string{"change", "kembali", "tunai", "cash"})
	} else {
		score += contextKeywordScore(context, expenseAmountContext)
		if strings.Contains(context, "grand total") {
			score += 28
		} else if strings.Contains(context, "total") {
			score += 20
		} else if strings.Contains(context, "jumlah") || strings.Contains(context, "bayar") {
			score += 14
		} else if strings.Contains(context, "subtotal") {
			score += 6
		}
		score -= contextKeywordScore(context, []string{"change", "kembali"})
		if strings.Contains(context, "cash") || strings.Contains(context, "tunai") {
			score -= 6
		}
	}
	leftContext := textLower[max(0, start-18):start]
	if strings.Contains(leftContext, "cash") || strings.Contains(leftContext, "tunai") {
		score -= 24
	}
	if strings.Contains(leftContext, "change") || strings.Contains(leftContext, "kembali") {
		score -= 28
	}

	if looksLikeDateToken(token) || looksLikeClockToken(token) {
		return -1
	}
	if looksLikeAccountNumber(token, value) && !strings.Contains(tokenLower, "rp") && !strings.Contains(tokenLower, "idr") {
		return -1
	}
	if value > 2_000_000_000 {
		return -1
	}

	return score
}

func contextKeywordScore(context string, keywords []string) int {
	score := 0
	for _, keyword := range keywords {
		if strings.Contains(context, keyword) {
			score += 12
		}
	}
	return score
}

func looksLikeDateToken(token string) bool {
	cleaned := strings.TrimSpace(strings.ToLower(token))
	cleaned = strings.TrimPrefix(cleaned, "rp")
	cleaned = strings.TrimPrefix(cleaned, "idr")
	cleaned = strings.TrimSpace(cleaned)
	for _, pattern := range datePatterns {
		if _, err := time.Parse(pattern, cleaned); err == nil {
			return true
		}
	}
	return false
}

func looksLikeClockToken(token string) bool {
	return clockRegex.MatchString(token)
}

func looksLikeAccountNumber(token string, value int64) bool {
	digits := onlyDigits(token)
	if len(digits) >= 10 && strings.Count(token, ".")+strings.Count(token, ",") == 0 {
		return true
	}
	return len(digits) >= 9 && value >= 100_000_000 && strings.Count(token, ".")+strings.Count(token, ",") == 0
}

func onlyDigits(value string) string {
	var b strings.Builder
	for _, char := range value {
		if char >= '0' && char <= '9' {
			b.WriteRune(char)
		}
	}
	return b.String()
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

func SuggestCategoryForReceipt(categories []models.Category, rawText string, transactionType string) (models.Category, bool) {
	incomeCategories := make([]models.Category, 0, len(categories))
	expenseCategories := make([]models.Category, 0, len(categories))
	for _, category := range categories {
		if category.Type == models.TypeIncome {
			incomeCategories = append(incomeCategories, category)
		}
		if category.Type == models.TypeExpense {
			expenseCategories = append(expenseCategories, category)
		}
	}

	lowerText := strings.ToLower(rawText)
	if transactionType == models.TypeIncome {
		if len(incomeCategories) == 0 {
			if len(expenseCategories) == 0 {
				return models.Category{}, false
			}
			return pickFallbackByName(expenseCategories, []string{"general", "other"}), false
		}
		if containsAny(lowerText, []string{"gaji", "salary"}) {
			if category, ok := findCategoryByHints(incomeCategories, []string{"salary", "gaji"}); ok {
				return category, true
			}
		}
		if category, ok := findCategoryByHints(incomeCategories, []string{"transfer", "income", "pendapatan"}); ok {
			return category, true
		}
		return pickFallbackByName(incomeCategories, []string{"general", "other"}), false
	}

	if len(expenseCategories) == 0 {
		if len(incomeCategories) == 0 {
			return models.Category{}, false
		}
		return pickFallbackByName(incomeCategories, []string{"general", "other"}), false
	}

	keywordGroups := []struct {
		match []string
		hints []string
	}{
		{match: []string{"food", "makan", "restoran", "restaurant", "cafe", "kopi", "indomaret", "alfamart", "grocer"}, hints: []string{"food", "grocer", "makan"}},
		{match: []string{"transport", "bensin", "pertamina", "grab", "gojek", "ojek", "taxi"}, hints: []string{"transport", "travel", "bensin"}},
		{match: []string{"bill", "listrik", "internet", "pulsa", "pln", "telkom", "wifi"}, hints: []string{"bill", "util", "listrik", "internet", "pulsa"}},
	}

	for _, group := range keywordGroups {
		if !containsAny(lowerText, group.match) {
			continue
		}
		if category, ok := findCategoryByHints(expenseCategories, group.hints); ok {
			return category, true
		}
	}

	return pickFallbackByName(expenseCategories, []string{"general", "other"}), false
}

func containsAny(text string, keywords []string) bool {
	for _, keyword := range keywords {
		if strings.Contains(text, keyword) {
			return true
		}
	}
	return false
}

func findCategoryByHints(categories []models.Category, hints []string) (models.Category, bool) {
	for _, category := range categories {
		name := strings.ToLower(strings.TrimSpace(category.Name))
		for _, hint := range hints {
			if strings.Contains(name, hint) {
				return category, true
			}
		}
	}
	return models.Category{}, false
}

func pickFallbackByName(categories []models.Category, preferred []string) models.Category {
	for _, pref := range preferred {
		for _, category := range categories {
			if strings.EqualFold(strings.TrimSpace(category.Name), pref) {
				return category
			}
		}
	}
	return categories[0]
}
