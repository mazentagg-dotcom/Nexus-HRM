package handlers

import (
	"errors"

	"nexus-hrm/internal/models"
	"nexus-hrm/internal/services"
	"nexus-hrm/internal/utils"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	service *services.AuthService
}

func NewAuthHandler(s *services.AuthService) *AuthHandler {
	return &AuthHandler{service: s}
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if !utils.BindAndValidate(c, &req) {
		return
	}

	resp, err := h.service.Login(req.Email, req.Password)
	if err != nil {
		if errors.Is(err, services.ErrInvalidCredentials) {
			utils.Unauthorized(c, "Invalid email or password")
			return
		}
		if errors.Is(err, services.ErrUserInactive) {
			utils.Forbidden(c, "Account is inactive")
			return
		}
		utils.InternalError(c, "Failed to login")
		return
	}

	utils.Success(c, resp)
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req models.CreateUserRequest
	if !utils.BindAndValidate(c, &req) {
		return
	}

	user, err := h.service.Register(&req)
	if err != nil {
		if errors.Is(err, services.ErrUserExists) {
			utils.Conflict(c, "User with this email already exists")
			return
		}
		utils.InternalError(c, "Failed to create user")
		return
	}

	utils.Created(c, user)
}

func (h *AuthHandler) GetMe(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.Unauthorized(c, "User not authenticated")
		return
	}

	resp, err := h.service.GetMe(userID.(string))
	if err != nil {
		if errors.Is(err, services.ErrUserNotFound) {
			utils.NotFound(c, "User not found")
			return
		}
		utils.InternalError(c, "Failed to get user")
		return
	}

	utils.Success(c, resp)
}

func (h *AuthHandler) ChangePassword(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.Unauthorized(c, "User not authenticated")
		return
	}

	var req models.ChangePasswordRequest
	if !utils.BindAndValidate(c, &req) {
		return
	}

	err := h.service.ChangePassword(userID.(string), req.CurrentPassword, req.NewPassword)
	if err != nil {
		if errors.Is(err, services.ErrInvalidPassword) {
			utils.BadRequest(c, "Current password is incorrect")
			return
		}
		if errors.Is(err, services.ErrUserNotFound) {
			utils.NotFound(c, "User not found")
			return
		}
		utils.InternalError(c, "Failed to change password")
		return
	}

	utils.SuccessWithMessage(c, "Password changed successfully", nil)
}
