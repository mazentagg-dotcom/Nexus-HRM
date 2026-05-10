package handlers

import (
	"errors"

	"nexus-hrm/internal/models"
	"nexus-hrm/internal/services"
	"nexus-hrm/internal/utils"

	"github.com/gin-gonic/gin"
)

type RoleHandler struct {
	service *services.RoleService
}

func NewRoleHandler(s *services.RoleService) *RoleHandler {
	return &RoleHandler{service: s}
}

func (h *RoleHandler) GetRoles(c *gin.Context) {
	roles, err := h.service.GetRoles()
	if err != nil {
		utils.InternalError(c, "Failed to fetch roles")
		return
	}

	utils.Success(c, roles)
}

func (h *RoleHandler) GetRole(c *gin.Context) {
	id := c.Param("id")

	role, err := h.service.GetRole(id)
	if err != nil {
		if errors.Is(err, services.ErrNotFound) {
			utils.NotFound(c, "Role not found")
			return
		}
		utils.InternalError(c, "Failed to fetch role")
		return
	}

	utils.Success(c, role)
}

func (h *RoleHandler) CreateRole(c *gin.Context) {
	var req models.CreateRoleRequest
	if !utils.BindAndValidate(c, &req) {
		return
	}

	role, err := h.service.CreateRole(&req)
	if err != nil {
		if errors.Is(err, services.ErrAlreadyExists) {
			utils.Conflict(c, "Role already exists")
			return
		}
		utils.InternalError(c, "Failed to create role")
		return
	}

	utils.Created(c, role)
}

func (h *RoleHandler) UpdateRole(c *gin.Context) {
	id := c.Param("id")

	var req models.UpdateRoleRequest
	if !utils.BindAndValidate(c, &req) {
		return
	}

	role, err := h.service.UpdateRole(id, &req)
	if err != nil {
		if errors.Is(err, services.ErrNotFound) {
			utils.NotFound(c, "Role not found")
			return
		}
		utils.InternalError(c, "Failed to update role")
		return
	}

	utils.Success(c, role)
}

func (h *RoleHandler) DeleteRole(c *gin.Context) {
	id := c.Param("id")

	if err := h.service.DeleteRole(id); err != nil {
		if errors.Is(err, services.ErrNotFound) {
			utils.NotFound(c, "Role not found")
			return
		}
		utils.InternalError(c, "Failed to delete role")
		return
	}

	utils.SuccessWithMessage(c, "Role deleted successfully", nil)
}
