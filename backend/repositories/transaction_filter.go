package repositories

import "time"

type TransactionFilter struct {
	UserID     uint
	Type       string
	CategoryID *uint
	StartDate  *time.Time
	EndDate    *time.Time
	Limit      int
	Offset     int
}
