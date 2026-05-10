package services

import (
	"fmt"

	"github.com/google/uuid"

	"nexus-hrm/internal/models"
)

type RoleServiceRepository interface {
	FindAll() ([]models.Role, error)
	FindByID(id string) (*models.Role, error)
	Create(role *models.Role) error
	Update(role *models.Role) error
	Delete(id string) error
	SetRolePermissions(roleID string, permissionIDs []string) error
}

type RoleService struct {
	repo RoleServiceRepository
}

func NewRoleService(repo RoleServiceRepository) *RoleService {
	return &RoleService{repo: repo}
}

func (s *RoleService) GetRoles() ([]models.Role, error) {
	return s.repo.FindAll()
}

func (s *RoleService) GetRole(id string) (*models.Role, error) {
	role, err := s.repo.FindByID(id)
	if err != nil {
		return nil, ErrNotFound
	}
	return role, nil
}

func (s *RoleService) CreateRole(req *models.CreateRoleRequest) (*models.Role, error) {
	role := &models.Role{
		ID:          uuid.New().String(),
		Name:        req.Name,
		Slug:        req.Slug,
		Description: req.Description,
		IsActive:    true,
	}

	if err := s.repo.Create(role); err != nil {
		return nil, fmt.Errorf("create role: %w", err)
	}

	if len(req.PermissionIDs) > 0 {
		if err := s.repo.SetRolePermissions(role.ID, req.PermissionIDs); err != nil {
			return nil, fmt.Errorf("set role permissions: %w", err)
		}
	}

	return role, nil
}

func (s *RoleService) UpdateRole(id string, req *models.UpdateRoleRequest) (*models.Role, error) {
	role, err := s.repo.FindByID(id)
	if err != nil {
		return nil, ErrNotFound
	}

	if req.Name != nil {
		role.Name = *req.Name
	}
	if req.Slug != nil {
		role.Slug = *req.Slug
	}
	if req.Description != nil {
		role.Description = *req.Description
	}
	if req.IsActive != nil {
		role.IsActive = *req.IsActive
	}

	if err := s.repo.Update(role); err != nil {
		return nil, fmt.Errorf("update role: %w", err)
	}

	if req.PermissionIDs != nil {
		if err := s.repo.SetRolePermissions(role.ID, *req.PermissionIDs); err != nil {
			return nil, fmt.Errorf("set role permissions: %w", err)
		}
	}

	return role, nil
}

func (s *RoleService) DeleteRole(id string) error {
	if err := s.repo.Delete(id); err != nil {
		return ErrNotFound
	}
	return nil
}
