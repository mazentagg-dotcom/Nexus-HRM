package middleware

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID      string   `json:"user_id"`
	Email       string   `json:"email"`
	Role        string   `json:"role"`
	Permissions []string `json:"permissions"`
	jwt.RegisteredClaims
}

func GenerateToken(userID, email, role string, permissions []string, secret string, expiry time.Duration) (string, error) {
	claims := &Claims{
		UserID:      userID,
		Email:       email,
		Role:        role,
		Permissions: permissions,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "nexus-hrm",
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func AuthMiddleware(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Unauthorized", "message": "Authorization header is required"})
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Unauthorized", "message": "Invalid authorization header format"})
			c.Abort()
			return
		}

		tokenString := parts[1]
		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
			}
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Unauthorized", "message": "Invalid or expired token"})
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("user_email", claims.Email)
		c.Set("user_role", claims.Role)
		c.Set("user_permissions", claims.Permissions)
		c.Next()
	}
}

func RequirePermission(permission string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("user_role")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "Forbidden", "message": "Role not found"})
			c.Abort()
			return
		}

		if roleStr, ok := role.(string); ok && roleStr == "super_admin" {
			c.Next()
			return
		}

		permissionsVal, exists := c.Get("user_permissions")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "Forbidden", "message": "Permissions not found"})
			c.Abort()
			return
		}

		permissions, ok := permissionsVal.([]string)
		if !ok {
			c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "Forbidden", "message": "Invalid permissions format"})
			c.Abort()
			return
		}

		for _, p := range permissions {
			if p == permission || p == "*" {
				c.Next()
				return
			}
			parts := strings.Split(permission, ".")
			if len(parts) == 2 {
				prefix := parts[0] + "."
				if p == prefix {
					c.Next()
					return
				}
				if p == parts[0] {
					c.Next()
					return
				}
			}
		}

		c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "Forbidden", "message": "Insufficient permissions"})
		c.Abort()
	}
}

func RequireAnyPermission(permissions []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("user_role")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "Forbidden", "message": "Role not found"})
			c.Abort()
			return
		}

		if roleStr, ok := role.(string); ok && roleStr == "super_admin" {
			c.Next()
			return
		}

		permissionsVal, exists := c.Get("user_permissions")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "Forbidden", "message": "Permissions not found"})
			c.Abort()
			return
		}

		userPerms, ok := permissionsVal.([]string)
		if !ok {
			c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "Forbidden", "message": "Invalid permissions format"})
			c.Abort()
			return
		}

		for _, required := range permissions {
			for _, p := range userPerms {
				if p == required || p == "*" {
					c.Next()
					return
				}
				parts := strings.Split(required, ".")
				if len(parts) == 2 {
					if p == parts[0] || p == parts[0]+"." {
						c.Next()
						return
					}
				}
			}
		}

		c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "Forbidden", "message": "Insufficient permissions"})
		c.Abort()
	}
}

func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("user_role")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "Forbidden", "message": "Role not found"})
			c.Abort()
			return
		}

		roleStr, ok := role.(string)
		if !ok {
			c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "Forbidden", "message": "Invalid role format"})
			c.Abort()
			return
		}

		for _, r := range roles {
			if roleStr == r {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "Forbidden", "message": "Required role not found"})
		c.Abort()
	}
}
