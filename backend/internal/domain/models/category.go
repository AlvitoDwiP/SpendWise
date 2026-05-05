package models

import "time"

type Category struct {
	ID           uint   `gorm:"primaryKey"`
	UserID       uint   `gorm:"not null;index"`
	Name         string `gorm:"not null"`
	Type         string `gorm:"not null;index"`
	Icon         string
	Color        string
	User         User          `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Transactions []Transaction `gorm:"foreignKey:CategoryID"`
	CreatedAt    time.Time
	UpdatedAt    time.Time
}
