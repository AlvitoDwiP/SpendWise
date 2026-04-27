package handlers

import (
	"net/http"
	"strconv"
	"time"

	"SpendWise/services"
	"SpendWise/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ReportHandler struct {
	DB *gorm.DB
}

func NewReportHandler(db *gorm.DB) *ReportHandler {
	return &ReportHandler{DB: db}
}

func (h *ReportHandler) GetMonthlyReport(c *gin.Context) {
	userID, ok := utils.GetUserIDFromContext(c)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized")
		return
	}

	year := time.Now().Year()
	if value := c.Query("year"); value != "" {
		parsedYear, err := strconv.Atoi(value)
		if err != nil {
			utils.ErrorResponse(c, http.StatusBadRequest, "year must be a number")
			return
		}

		year = parsedYear
	}

	report, err := services.GetMonthlyReport(h.DB, userID, year)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "monthly report loaded", report)
}
