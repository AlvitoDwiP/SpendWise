package services

import (
	"errors"
	"time"

	"SpendWise/internal/domain/models"

	"gorm.io/gorm"
)

type MonthlyReportItem struct {
	Month   int   `json:"month"`
	Income  int64 `json:"income"`
	Expense int64 `json:"expense"`
}

type MonthlyReport struct {
	Year   int                 `json:"year"`
	Months []MonthlyReportItem `json:"months"`
}

type monthlyReportRow struct {
	Month int
	Type  string
	Total int64
}

func GetMonthlyReport(db *gorm.DB, userID uint, year int) (*MonthlyReport, error) {
	if userID == 0 {
		return nil, errors.New("userID is required")
	}
	if year < 2000 || year > 2100 {
		return nil, errors.New("year must be between 2000 and 2100")
	}

	report := MonthlyReport{
		Year:   year,
		Months: make([]MonthlyReportItem, 12),
	}
	for i := range report.Months {
		report.Months[i] = MonthlyReportItem{Month: i + 1}
	}

	startOfYear := time.Date(year, time.January, 1, 0, 0, 0, 0, time.Local)
	startOfNextYear := startOfYear.AddDate(1, 0, 0)

	var rows []monthlyReportRow
	if err := db.
		Model(&models.Transaction{}).
		Select("EXTRACT(MONTH FROM transaction_date)::int AS month, type, COALESCE(SUM(amount), 0) AS total").
		Where("user_id = ? AND transaction_date >= ? AND transaction_date < ?", userID, startOfYear, startOfNextYear).
		Group("EXTRACT(MONTH FROM transaction_date), type").
		Scan(&rows).Error; err != nil {
		return nil, err
	}

	for _, row := range rows {
		if row.Month < 1 || row.Month > 12 {
			continue
		}

		item := &report.Months[row.Month-1]
		switch row.Type {
		case models.TypeIncome:
			item.Income = row.Total
		case models.TypeExpense:
			item.Expense = row.Total
		}
	}

	return &report, nil
}
