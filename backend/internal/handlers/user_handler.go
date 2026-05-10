package handlers

import (
	"errors"

	"nexus-hrm/internal/models"
	"nexus-hrm/internal/services"
	"nexus-hrm/internal/utils"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	service *services.UserService
}

func NewUserHandler(s *services.UserService) *UserHandler {
	return &UserHandler{service: s}
}

func (h *UserHandler) GetUsers(c *gin.Context) {
	search := c.Query("search")
	status := c.Query("status")
	pagination := utils.GetPagination(c)

	users, total, err := h.service.GetUsers(search, status, pagination.Page, pagination.PageSize)
	if err != nil {
		utils.InternalError(c, "Failed to fetch users")
		return
	}

	utils.Paginated(c, users, total, pagination)
}

func (h *UserHandler) GetUser(c *gin.Context) {
	id := c.Param("id")

	user, err := h.service.GetUser(id)
	if err != nil {
		if errors.Is(err, services.ErrUserNotFound) {
			utils.NotFound(c, "User not found")
			return
		}
		utils.InternalError(c, "Failed to fetch user")
		return
	}

	utils.Success(c, user)
}

func (h *UserHandler) CreateUser(c *gin.Context) {
	var req models.CreateUserRequest
	if !utils.BindAndValidate(c, &req) {
		return
	}

	user, err := h.service.CreateUser(&req)
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

func (h *UserHandler) UpdateUser(c *gin.Context) {
	id := c.Param("id")

	var req models.UpdateUserRequest
	if !utils.BindAndValidate(c, &req) {
		return
	}

	user, err := h.service.UpdateUser(id, &req)
	if err != nil {
		if errors.Is(err, services.ErrUserNotFound) {
			utils.NotFound(c, "User not found")
			return
		}
		utils.InternalError(c, "Failed to update user")
		return
	}

	utils.Success(c, user)
}

func (h *UserHandler) DeactivateUser(c *gin.Context) {
	id := c.Param("id")

	if err := h.service.DeactivateUser(id); err != nil {
		if errors.Is(err, services.ErrUserNotFound) {
			utils.NotFound(c, "User not found")
			return
		}
		utils.InternalError(c, "Failed to deactivate user")
		return
	}

	utils.SuccessWithMessage(c, "User deactivated successfully", nil)
}
