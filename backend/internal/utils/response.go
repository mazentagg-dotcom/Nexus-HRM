package utils

import (
	"net/http"
	"reflect"

	"github.com/gin-gonic/gin"
)

func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, gin.H{"success": true, "data": data})
}

func SuccessWithMessage(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusOK, gin.H{"success": true, "message": message, "data": data})
}

func Created(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, gin.H{"success": true, "data": data})
}

func CreatedWithMessage(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusCreated, gin.H{"success": true, "message": message, "data": data})
}

func NoContent(c *gin.Context) {
	c.Status(http.StatusNoContent)
}

func BadRequest(c *gin.Context, message string) {
	c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Bad Request", "message": message})
}

func Unauthorized(c *gin.Context, message string) {
	c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Unauthorized", "message": message})
}

func Forbidden(c *gin.Context, message string) {
	c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "Forbidden", "message": message})
}

func NotFound(c *gin.Context, message string) {
	c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Not Found", "message": message})
}

func Conflict(c *gin.Context, message string) {
	c.JSON(http.StatusConflict, gin.H{"success": false, "error": "Conflict", "message": message})
}

func InternalError(c *gin.Context, message string) {
	c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Internal Server Error", "message": message})
}

func Error(c *gin.Context, statusCode int, errType string, message string) {
	c.JSON(statusCode, gin.H{"success": false, "error": errType, "message": message})
}

func Paginated(c *gin.Context, data interface{}, total int64, pagination Pagination) {
	if data == nil || (reflect.ValueOf(data).Kind() == reflect.Slice && reflect.ValueOf(data).IsNil()) {
		data = []interface{}{}
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"items":       data,
			"total":       total,
			"page":        pagination.Page,
			"page_size":   pagination.PageSize,
			"total_pages": (total + int64(pagination.PageSize) - 1) / int64(pagination.PageSize),
		},
	})
}
