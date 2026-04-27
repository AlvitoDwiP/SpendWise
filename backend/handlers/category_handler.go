package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"SpendWise/dto"
	"SpendWise/services"
	"SpendWise/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CategoryHandler struct {
	DB *gorm.DB
}

type categoryRequest struct {
	Name  string `json:"name" binding:"required"`
	Type  string `json:"type" binding:"required"`
	Icon  string `json:"icon"`
	Color string `json:"color"`
}

func NewCategoryHandler(db *gorm.DB) *CategoryHandler {
	return &CategoryHandler{DB: db}
}

func (h *CategoryHandler) CreateCategory(c *gin.Context) {
	userID, ok := utils.GetUserIDFromContext(c)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized")
		return
	}

	var request categoryRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "invalid request body")
		return
	}

	category, err := services.CreateCategory(h.DB, userID, request.Name, request.Type, request.Icon, request.Color)
	if err != nil {
		utils.ErrorResponse(c, statusFromError(err), err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "category created", dto.ToCategoryResponse(category))
}

func (h *CategoryHandler) GetCategories(c *gin.Context) {
	userID, ok := utils.GetUserIDFromContext(c)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized")
		return
	}

	categories, err := services.GetCategoriesByUserID(h.DB, userID)
	if err != nil {
		utils.ErrorResponse(c, statusFromError(err), err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "categories loaded", dto.ToCategoryResponses(categories))
}

func (h *CategoryHandler) GetCategoryByID(c *gin.Context) {
	userID, ok := utils.GetUserIDFromContext(c)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized")
		return
	}

	categoryID, err := parseCategoryID(c)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	category, err := services.GetCategoryByID(h.DB, userID, categoryID)
	if err != nil {
		utils.ErrorResponse(c, statusFromError(err), err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "category loaded", dto.ToCategoryResponse(category))
}

func (h *CategoryHandler) UpdateCategory(c *gin.Context) {
	userID, ok := utils.GetUserIDFromContext(c)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized")
		return
	}

	categoryID, err := parseCategoryID(c)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	var request categoryRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "invalid request body")
		return
	}

	category, err := services.UpdateCategory(h.DB, userID, categoryID, request.Name, request.Type, request.Icon, request.Color)
	if err != nil {
		utils.ErrorResponse(c, statusFromError(err), err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "category updated", dto.ToCategoryResponse(category))
}

func (h *CategoryHandler) DeleteCategory(c *gin.Context) {
	userID, ok := utils.GetUserIDFromContext(c)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "unauthorized")
		return
	}

	categoryID, err := parseCategoryID(c)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := services.DeleteCategory(h.DB, userID, categoryID); err != nil {
		utils.ErrorResponse(c, statusFromError(err), err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "category deleted", nil)
}

func parseCategoryID(c *gin.Context) (uint, error) {
	value := c.Param("id")
	id, err := strconv.ParseUint(value, 10, 64)
	if err != nil || id == 0 {
		return 0, errors.New("category id must be a positive number")
	}

	return uint(id), nil
}

func statusFromError(err error) int {
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return http.StatusNotFound
	}
	if errors.Is(err, services.ErrCategoryInUse) {
		return http.StatusBadRequest
	}

	return http.StatusBadRequest
}
