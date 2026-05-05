package models

import "time"

type Transaction struct {
	ID              uint   `gorm:"primaryKey"`
	UserID          uint   `gorm:"not null;index"`
	CategoryID      uint   `gorm:"not null;index"`
	Type            string `gorm:"not null;index"`
	Amount          int64  `gorm:"not null"`
	Title           string `gorm:"not null"`
	Note            string
	TransactionDate time.Time `gorm:"not null;index"`
	User            User      `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Category        Category  `gorm:"constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`
	CreatedAt       time.Time
	UpdatedAt       time.Time
}
