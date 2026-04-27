package dto

import "SpendWise/models"

type CategoryResponse struct {
	ID    uint   `json:"id"`
	Name  string `json:"name"`
	Type  string `json:"type"`
	Icon  string `json:"icon"`
	Color string `json:"color"`
}

func ToCategoryResponse(category *models.Category) CategoryResponse {
	if category == nil {
		return CategoryResponse{}
	}

	return CategoryResponse{
		ID:    category.ID,
		Name:  category.Name,
		Type:  category.Type,
		Icon:  category.Icon,
		Color: category.Color,
	}
}

func ToCategoryResponses(categories []models.Category) []CategoryResponse {
	response := make([]CategoryResponse, 0, len(categories))
	for i := range categories {
		response = append(response, ToCategoryResponse(&categories[i]))
	}

	return response
}
