package repositories

import (
	"database/sql"
	"fmt"
	"strings"

	"nexus-hrm/internal/models"
)

type RoleRepository struct {
	db *sql.DB
}

func NewRoleRepository(db *sql.DB) *RoleRepository {
	return &RoleRepository{db: db}
}

func (r *RoleRepository) FindByUserID(userID string) ([]models.Role, error) {
	query := `SELECT r.id, r.name, r.slug, COALESCE(r.description, ''), r.is_system, r.is_active, r.created_at, r.updated_at
		FROM roles r
		JOIN user_roles ur ON ur.role_id = r.id
		WHERE ur.user_id = $1`

	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("query user roles: %w", err)
	}
	defer rows.Close()

	return scanRoles(rows)
}

func (r *RoleRepository) FindByUserIDWithPermissions(userID string) ([]models.Role, []string, error) {
	query := `SELECT DISTINCT r.id, r.name, r.slug, COALESCE(r.description, ''), r.is_system, r.is_active, r.created_at, r.updated_at
		FROM roles r
		JOIN user_roles ur ON ur.role_id = r.id
		WHERE ur.user_id = $1`

	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, nil, fmt.Errorf("query user roles: %w", err)
	}
	defer rows.Close()

	roles, err := scanRoles(rows)
	if err != nil {
		return nil, nil, err
	}

	permQuery := `SELECT DISTINCT p.name
		FROM permissions p
		JOIN role_permissions rp ON rp.permission_id = p.id
		JOIN user_roles ur ON ur.role_id = rp.role_id
		WHERE ur.user_id = $1`

	permRows, err := r.db.Query(permQuery, userID)
	if err != nil {
		return nil, nil, fmt.Errorf("query user permissions: %w", err)
	}
	defer permRows.Close()

	var permissions []string
	for permRows.Next() {
		var slug string
		if err := permRows.Scan(&slug); err != nil {
			return nil, nil, fmt.Errorf("scan permission: %w", err)
		}
		permissions = append(permissions, slug)
	}

	return roles, permissions, nil
}

func (r *RoleRepository) FindByID(id string) (*models.Role, error) {
	var role models.Role
	query := `SELECT id, name, slug, COALESCE(description, ''), is_system, is_active, created_at, updated_at FROM roles WHERE id = $1`

	err := r.db.QueryRow(query, id).Scan(&role.ID, &role.Name, &role.Slug, &role.Description, &role.IsSystem, &role.IsActive, &role.CreatedAt, &role.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("role not found")
	}
	if err != nil {
		return nil, fmt.Errorf("query role: %w", err)
	}

	return &role, nil
}

func (r *RoleRepository) FindAll() ([]models.Role, error) {
	query := `SELECT id, name, slug, COALESCE(description, ''), is_system, is_active, created_at, updated_at FROM roles ORDER BY name`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("query roles: %w", err)
	}
	defer rows.Close()

	return scanRoles(rows)
}

func (r *RoleRepository) Create(role *models.Role) error {
	query := `INSERT INTO roles (id, name, slug, description) VALUES ($1, $2, $3, $4)`
	_, err := r.db.Exec(query, role.ID, role.Name, role.Slug, role.Description)
	if err != nil {
		return fmt.Errorf("create role: %w", err)
	}
	return nil
}

func (r *RoleRepository) Update(role *models.Role) error {
	query := `UPDATE roles SET name = $1, slug = $2, description = $3, is_active = $4, updated_at = NOW() WHERE id = $5`
	_, err := r.db.Exec(query, role.Name, role.Slug, role.Description, role.IsActive, role.ID)
	if err != nil {
		return fmt.Errorf("update role: %w", err)
	}
	return nil
}

func (r *RoleRepository) Delete(id string) error {
	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("begin transaction: %w", err)
	}
	defer tx.Rollback()

	if _, err := tx.Exec(`DELETE FROM role_permissions WHERE role_id = $1`, id); err != nil {
		return fmt.Errorf("delete role permissions: %w", err)
	}
	if _, err := tx.Exec(`DELETE FROM user_roles WHERE role_id = $1`, id); err != nil {
		return fmt.Errorf("delete user roles: %w", err)
	}
	if _, err := tx.Exec(`DELETE FROM roles WHERE id = $1`, id); err != nil {
		return fmt.Errorf("delete role: %w", err)
	}

	return tx.Commit()
}

func (r *RoleRepository) FindBySlug(slug string) (*models.Role, error) {
	var role models.Role
	query := `SELECT id, name, slug, COALESCE(description, ''), is_system, is_active, created_at, updated_at FROM roles WHERE slug = $1`

	err := r.db.QueryRow(query, slug).Scan(&role.ID, &role.Name, &role.Slug, &role.Description, &role.IsSystem, &role.IsActive, &role.CreatedAt, &role.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("role not found")
	}
	if err != nil {
		return nil, fmt.Errorf("query role by slug: %w", err)
	}

	return &role, nil
}

func (r *RoleRepository) AssignRoleToUser(userID, roleID string) error {
	_, err := r.db.Exec(`INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, userID, roleID)
	if err != nil {
		return fmt.Errorf("assign role to user: %w", err)
	}
	return nil
}

func (r *RoleRepository) RemoveUserRole(userID, roleID string) error {
	_, err := r.db.Exec(`DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2`, userID, roleID)
	if err != nil {
		return fmt.Errorf("remove user role: %w", err)
	}
	return nil
}

func (r *RoleRepository) SetRolePermissions(roleID string, permissionIDs []string) error {
	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("begin transaction: %w", err)
	}
	defer tx.Rollback()

	if _, err := tx.Exec(`DELETE FROM role_permissions WHERE role_id = $1`, roleID); err != nil {
		return fmt.Errorf("clear role permissions: %w", err)
	}

	if len(permissionIDs) > 0 {
		placeholders := make([]string, len(permissionIDs))
		args := make([]interface{}, len(permissionIDs)+1)
		args[0] = roleID
		for i, pid := range permissionIDs {
			placeholders[i] = fmt.Sprintf("($1, $%d)", i+2)
			args[i+1] = pid
		}
		query := `INSERT INTO role_permissions (role_id, permission_id) VALUES ` + strings.Join(placeholders, ", ")
		if _, err := tx.Exec(query, args...); err != nil {
			return fmt.Errorf("set role permissions: %w", err)
		}
	}

	return tx.Commit()
}

func scanRoles(rows *sql.Rows) ([]models.Role, error) {
	var roles []models.Role
	for rows.Next() {
		var role models.Role
		if err := rows.Scan(&role.ID, &role.Name, &role.Slug, &role.Description, &role.IsSystem, &role.IsActive, &role.CreatedAt, &role.UpdatedAt); err != nil {
			return nil, fmt.Errorf("scan role: %w", err)
		}
		roles = append(roles, role)
	}
	return roles, nil
}
