package models

import "time"

type User struct {
	ID           uint          `gorm:"primaryKey"`
	Name         string        `gorm:"not null"`
	Email        string        `gorm:"unique;not null"`
	PasswordHash string        `gorm:"not null"`
	Categories   []Category    `gorm:"foreignKey:UserID"`
	Transactions []Transaction `gorm:"foreignKey:UserID"`
	CreatedAt    time.Time
	UpdatedAt    time.Time
}
