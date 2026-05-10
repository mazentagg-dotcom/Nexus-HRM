package utils

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

func BindAndValidate(c *gin.Context, obj interface{}) bool {
	if err := c.ShouldBindJSON(obj); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			details := make(map[string]string)
			for _, e := range validationErrors {
				field := strings.ToLower(e.Field())
				switch e.Tag() {
				case "required":
					details[field] = field + " is required"
				case "email":
					details[field] = "Invalid email format"
				case "min":
					details[field] = "Must be at least " + e.Param()
				case "max":
					details[field] = "Must be at most " + e.Param()
				case "oneof":
					details[field] = "Must be one of: " + e.Param()
				case "gte":
					details[field] = "Must be greater than or equal to " + e.Param()
				case "lte":
					details[field] = "Must be less than or equal to " + e.Param()
				default:
					details[field] = "Invalid value for " + field
				}
			}
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":   "Validation Error",
				"message": "Invalid input data",
				"details": details,
			})
		} else {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":   "Bad Request",
				"message": "Invalid request body: " + err.Error(),
			})
		}
		return false
	}
	return true
}
