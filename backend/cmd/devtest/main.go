package main

import (
	"log"
	"time"

	"SpendWise/config"
	"SpendWise/models"
	"SpendWise/services"

	"gorm.io/gorm"
)

func main() {
	if err := config.InitDB(); err != nil {
		log.Fatal(err)
	}

	db := config.GetDB()
	if err := db.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Transaction{},
	); err != nil {
		log.Fatal(err)
	}

	log.Println("Database connected and migrated successfully")

	testEmail := "test-spendwise@example.com"
	otherTestEmail := "test-spendwise-other@example.com"
	for _, email := range []string{testEmail, otherTestEmail} {
		if err := deleteTestUser(db, email); err != nil {
			log.Fatal(err)
		}
	}

	user := models.User{
		Name:         "SpendWise Test User",
		Email:        testEmail,
		PasswordHash: "temporary-password-hash",
	}
	if err := db.Create(&user).Error; err != nil {
		log.Fatal(err)
	}
	log.Printf("dummy user created: id=%d email=%s", user.ID, user.Email)

	category, err := services.CreateCategory(db, user.ID, "Salary", models.TypeIncome, "wallet", "#16a34a")
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("category created via service: id=%d name=%s", category.ID, category.Name)

	transaction, err := services.CreateTransaction(
		db,
		user.ID,
		category.ID,
		models.TypeIncome,
		5000000,
		"Monthly salary",
		"Service validation transaction",
		time.Now(),
	)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("transaction created via service: id=%d title=%s amount=%d", transaction.ID, transaction.Title, transaction.Amount)

	recentTransactions, err := services.GetRecentTransactionsByUserID(db, user.ID, 5)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("recent transactions loaded via service: count=%d", len(recentTransactions))
	for _, recentTransaction := range recentTransactions {
		log.Printf(
			"recent transaction: id=%d title=%s amount=%d category=%s",
			recentTransaction.ID,
			recentTransaction.Title,
			recentTransaction.Amount,
			recentTransaction.Category.Name,
		)
	}

	if _, err := services.CreateTransaction(db, user.ID, category.ID, models.TypeIncome, 0, "Invalid amount", "", time.Now()); err != nil {
		log.Printf("negative test passed: amount 0 failed: %v", err)
	} else {
		log.Fatal("negative test failed: amount 0 should fail")
	}

	if _, err := services.CreateCategory(db, user.ID, "Invalid Type", "invalid", "x", "#000000"); err != nil {
		log.Printf("negative test passed: invalid type failed: %v", err)
	} else {
		log.Fatal("negative test failed: invalid type should fail")
	}

	otherUser := models.User{
		Name:         "Other SpendWise Test User",
		Email:        otherTestEmail,
		PasswordHash: "temporary-password-hash",
	}
	if err := db.Create(&otherUser).Error; err != nil {
		log.Fatal(err)
	}

	otherCategory, err := services.CreateCategory(db, otherUser.ID, "Other Salary", models.TypeIncome, "wallet", "#2563eb")
	if err != nil {
		log.Fatal(err)
	}

	if _, err := services.CreateTransaction(db, user.ID, otherCategory.ID, models.TypeIncome, 10000, "Wrong owner", "", time.Now()); err != nil {
		log.Printf("negative test passed: category owned by another user failed: %v", err)
	} else {
		log.Fatal("negative test failed: category owned by another user should fail")
	}
}

func deleteTestUser(db *gorm.DB, email string) error {
	var user models.User
	if err := db.Where("email = ?", email).Find(&user).Error; err != nil {
		return err
	}
	if user.ID == 0 {
		return nil
	}
	if err := db.Where("user_id = ?", user.ID).Delete(&models.Transaction{}).Error; err != nil {
		return err
	}
	if err := db.Where("user_id = ?", user.ID).Delete(&models.Category{}).Error; err != nil {
		return err
	}

	return db.Delete(&user).Error
}
