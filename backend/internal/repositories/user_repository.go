package repositories

import (
	"database/sql"
	"fmt"
	"strings"

	"nexus-hrm/internal/models"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) FindByID(id string) (*models.User, error) {
	var u models.User
	var avatar sql.NullString
	var lastLogin sql.NullTime

	query := `SELECT id, email, first_name, last_name, COALESCE(phone, ''), COALESCE(avatar, ''),
		active, verified, last_login, created_at, updated_at
		FROM users WHERE id = $1`

	err := r.db.QueryRow(query, id).Scan(
		&u.ID, &u.Email, &u.FirstName, &u.LastName,
		&u.Phone, &avatar, &u.Active, &u.Verified,
		&lastLogin, &u.CreatedAt, &u.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	}
	if err != nil {
		return nil, fmt.Errorf("query user: %w", err)
	}

	u.Avatar = toStringPtr(avatar)
	u.LastLogin = nullTimeToTimePtr(lastLogin)

	return &u, nil
}

func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
	var u models.User
	var avatar sql.NullString
	var lastLogin sql.NullTime
	var passwordHash string

	query := `SELECT id, email, first_name, last_name, COALESCE(phone, ''), COALESCE(avatar, ''),
		active, verified, last_login, created_at, updated_at, password_hash
		FROM users WHERE email = $1`

	err := r.db.QueryRow(query, email).Scan(
		&u.ID, &u.Email, &u.FirstName, &u.LastName,
		&u.Phone, &avatar, &u.Active, &u.Verified,
		&lastLogin, &u.CreatedAt, &u.UpdatedAt, &passwordHash,
	)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	}
	if err != nil {
		return nil, fmt.Errorf("query user by email: %w", err)
	}

	u.Avatar = toStringPtr(avatar)
	u.LastLogin = nullTimeToTimePtr(lastLogin)
	u.Password = passwordHash

	return &u, nil
}

func (r *UserRepository) FindAll(search, status string, page, pageSize int) ([]models.User, int64, error) {
	var conditions []string
	var args []interface{}
	argIdx := 1

	if search != "" {
		conditions = append(conditions, fmt.Sprintf("(first_name ILIKE $%d OR last_name ILIKE $%d OR email ILIKE $%d)", argIdx, argIdx, argIdx))
		args = append(args, "%"+search+"%")
		argIdx++
	}
	if status != "" {
		if status == "active" {
			conditions = append(conditions, fmt.Sprintf("active = true"))
		} else if status == "inactive" {
			conditions = append(conditions, fmt.Sprintf("active = false"))
		}
	}

	where := ""
	if len(conditions) > 0 {
		where = " WHERE " + strings.Join(conditions, " AND ")
	}

	var total int64
	countQuery := "SELECT COUNT(*) FROM users" + where
	if err := r.db.QueryRow(countQuery, args...).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("count users: %w", err)
	}

	offset := (page - 1) * pageSize
	args = append(args, pageSize, offset)

	query := fmt.Sprintf(`SELECT id, email, first_name, last_name, COALESCE(phone, ''), COALESCE(avatar, ''),
		active, verified, last_login, created_at, updated_at
		FROM users%s ORDER BY created_at DESC LIMIT $%d OFFSET $%d`,
		where, argIdx, argIdx+1)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("query users: %w", err)
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		var avatar sql.NullString
		var lastLogin sql.NullTime

		err := rows.Scan(
			&u.ID, &u.Email, &u.FirstName, &u.LastName,
			&u.Phone, &avatar, &u.Active, &u.Verified,
			&lastLogin, &u.CreatedAt, &u.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("scan user: %w", err)
		}

		u.Avatar = toStringPtr(avatar)
		u.LastLogin = nullTimeToTimePtr(lastLogin)

		users = append(users, u)
	}

	return users, total, nil
}

func (r *UserRepository) Create(user *models.User) error {
	query := `INSERT INTO users (id, email, first_name, last_name, phone, avatar, password_hash, active)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`

	_, err := r.db.Exec(query,
		user.ID, user.Email, user.FirstName, user.LastName,
		user.Phone, user.Avatar, user.Password, true,
	)
	if err != nil {
		return fmt.Errorf("create user: %w", err)
	}
	return nil
}

func (r *UserRepository) Update(user *models.User) error {
	query := `UPDATE users SET first_name = $1, last_name = $2, phone = $3, avatar = $4, active = $5, updated_at = NOW()
		WHERE id = $6`

	_, err := r.db.Exec(query,
		user.FirstName, user.LastName, user.Phone, user.Avatar, user.Active, user.ID,
	)
	if err != nil {
		return fmt.Errorf("update user: %w", err)
	}
	return nil
}

func (r *UserRepository) UpdatePassword(id, hash string) error {
	_, err := r.db.Exec(`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, hash, id)
	if err != nil {
		return fmt.Errorf("update password: %w", err)
	}
	return nil
}

func (r *UserRepository) Deactivate(id string) error {
	_, err := r.db.Exec(`UPDATE users SET active = false, updated_at = NOW() WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("deactivate user: %w", err)
	}
	return nil
}

func (r *UserRepository) UpdateLastLogin(id string) error {
	_, err := r.db.Exec(`UPDATE users SET last_login = NOW() WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("update last login: %w", err)
	}
	return nil
}

func (r *UserRepository) Count() (int64, error) {
	var count int64
	err := r.db.QueryRow(`SELECT COUNT(*) FROM users`).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("count users: %w", err)
	}
	return count, nil
}
