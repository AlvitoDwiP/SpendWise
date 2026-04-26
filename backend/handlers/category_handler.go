package handlers

import (
	"errors"
	"net/http"
	"time"

	"SpendWise/models"
	"SpendWise/services"
	"SpendWise/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CategoryHandler struct {
	DB *gorm.DB
}

type createCategoryRequest struct {
	Name  string `json:"name" binding:"required"`
	Type  string `json:"type" binding:"required"`
	Icon  string `json:"icon"`
	Color string `json:"color"`
}

type categoryResponse struct {
	ID        uint      `json:"id"`
	UserID    uint      `json:"user_id"`
	Name      string    `json:"name"`
	Type      string    `json:"type"`
	Icon      string    `json:"icon"`
	Color     string    `json:"color"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func NewCategoryHandler(db *gorm.DB) *CategoryHandler {
	return &CategoryHandler{DB: db}
}

func (h *CategoryHandler) CreateCategory(c *gin.Context) {
	var request createCategoryRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "invalid request body")
		return
	}

	userID := utils.GetDummyUserID()
	category, err := services.CreateCategory(h.DB, userID, request.Name, request.Type, request.Icon, request.Color)
	if err != nil {
		utils.ErrorResponse(c, statusFromError(err), err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "category created", toCategoryResponse(*category))
}

func (h *CategoryHandler) GetCategories(c *gin.Context) {
	userID := utils.GetDummyUserID()
	categories, err := services.GetCategoriesByUserID(h.DB, userID)
	if err != nil {
		utils.ErrorResponse(c, statusFromError(err), err.Error())
		return
	}

	response := make([]categoryResponse, 0, len(categories))
	for _, category := range categories {
		response = append(response, toCategoryResponse(category))
	}

	utils.SuccessResponse(c, http.StatusOK, "categories loaded", response)
}

func toCategoryResponse(category models.Category) categoryResponse {
	return categoryResponse{
		ID:        category.ID,
		UserID:    category.UserID,
		Name:      category.Name,
		Type:      category.Type,
		Icon:      category.Icon,
		Color:     category.Color,
		CreatedAt: category.CreatedAt,
		UpdatedAt: category.UpdatedAt,
	}
}

func statusFromError(err error) int {
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return http.StatusNotFound
	}

	return http.StatusBadRequest
}
