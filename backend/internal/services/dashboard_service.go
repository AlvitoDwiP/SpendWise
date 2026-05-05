package services

import (
	"errors"
	"time"

	"SpendWise/internal/domain/models"

	"gorm.io/gorm"
)

type DashboardSummary struct {
	CurrentBalance            int64 `json:"current_balance"`
	ThisMonthIncome           int64 `json:"this_month_income"`
	ThisMonthExpense          int64 `json:"this_month_expense"`
	ThisMonthTransactionCount int64 `json:"this_month_transaction_count"`
}

func GetDashboardSummary(db *gorm.DB, userID uint, now time.Time) (*DashboardSummary, error) {
	if userID == 0 {
		return nil, errors.New("userID is required")
	}

	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	startOfNextMonth := startOfMonth.AddDate(0, 1, 0)

	summary := DashboardSummary{}
	if err := db.
		Model(&models.Transaction{}).
		Where("user_id = ?", userID).
		Select(
			"COALESCE(SUM(CASE WHEN type = ? THEN amount WHEN type = ? THEN -amount ELSE 0 END), 0)",
			models.TypeIncome,
			models.TypeExpense,
		).
		Scan(&summary.CurrentBalance).Error; err != nil {
		return nil, err
	}

	if err := db.
		Model(&models.Transaction{}).
		Where("user_id = ? AND type = ? AND transaction_date >= ? AND transaction_date < ?", userID, models.TypeIncome, startOfMonth, startOfNextMonth).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&summary.ThisMonthIncome).Error; err != nil {
		return nil, err
	}

	if err := db.
		Model(&models.Transaction{}).
		Where("user_id = ? AND type = ? AND transaction_date >= ? AND transaction_date < ?", userID, models.TypeExpense, startOfMonth, startOfNextMonth).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&summary.ThisMonthExpense).Error; err != nil {
		return nil, err
	}

	if err := db.
		Model(&models.Transaction{}).
		Where("user_id = ? AND transaction_date >= ? AND transaction_date < ?", userID, startOfMonth, startOfNextMonth).
		Count(&summary.ThisMonthTransactionCount).Error; err != nil {
		return nil, err
	}

	return &summary, nil
}
