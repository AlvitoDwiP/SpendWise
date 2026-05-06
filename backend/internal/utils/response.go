package utils

import "github.com/gin-gonic/gin"

type ErrorCode string

const (
	ErrorCodeValidation   ErrorCode = "VALIDATION_ERROR"
	ErrorCodeUnauthorized ErrorCode = "UNAUTHORIZED"
	ErrorCodeForbidden    ErrorCode = "FORBIDDEN"
	ErrorCodeNotFound     ErrorCode = "NOT_FOUND"
	ErrorCodeConflict     ErrorCode = "CONFLICT"
	ErrorCodeInternal     ErrorCode = "INTERNAL_ERROR"
	ErrorCodeBadRequest   ErrorCode = "BAD_REQUEST"
)

type successResponse struct {
	Success bool   `json:"success"`
	Data    any    `json:"data"`
	Message string `json:"message,omitempty"`
}

type errorDetail struct {
	Code    ErrorCode `json:"code"`
	Message string    `json:"message"`
}

type errorResponse struct {
	Success bool        `json:"success"`
	Error   errorDetail `json:"error"`
	Message string      `json:"message,omitempty"`
}

func SuccessResponse(c *gin.Context, statusCode int, message string, data any) {
	c.JSON(statusCode, successResponse{
		Success: true,
		Data:    data,
		Message: message,
	})
}

func ErrorResponse(c *gin.Context, statusCode int, message string) {
	ErrorResponseWithCode(c, statusCode, CodeFromStatus(statusCode), message)
}

func ErrorResponseWithCode(c *gin.Context, statusCode int, code ErrorCode, message string) {
	c.JSON(statusCode, errorResponse{
		Success: false,
		Error: errorDetail{
			Code:    code,
			Message: message,
		},
		Message: message,
	})
}

func CodeFromStatus(statusCode int) ErrorCode {
	switch statusCode {
	case 400:
		return ErrorCodeValidation
	case 401:
		return ErrorCodeUnauthorized
	case 403:
		return ErrorCodeForbidden
	case 404:
		return ErrorCodeNotFound
	case 409:
		return ErrorCodeConflict
	case 500:
		return ErrorCodeInternal
	default:
		return ErrorCodeBadRequest
	}
}
