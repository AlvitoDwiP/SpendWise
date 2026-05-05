package main

import (
	"log"

	"SpendWise/internal/app/api"
)

func main() {
	if err := api.Run(); err != nil {
		log.Fatal(err)
	}
}
