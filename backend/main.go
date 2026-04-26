package main

import (
	"log"

	"SpendWise/config"
)

func main() {
	if err := config.InitDB(); err != nil {
		log.Fatal(err)
	}

	log.Println("Database connected successfully")
}
