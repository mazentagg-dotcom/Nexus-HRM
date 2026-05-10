package models

type CreateRoleRequest struct {
	Name          string   `json:"name" binding:"required"`
	Slug          string   `json:"slug" binding:"required"`
	Description   string   `json:"description"`
	PermissionIDs []string `json:"permission_ids"`
}

type UpdateRoleRequest struct {
	Name          *string   `json:"name"`
	Slug          *string   `json:"slug"`
	Description   *string   `json:"description"`
	PermissionIDs *[]string `json:"permission_ids"`
	IsActive      *bool     `json:"is_active"`
}
