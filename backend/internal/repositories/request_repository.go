package repositories

import (
	"database/sql"
	"fmt"
	"strings"

	"nexus-hrm/internal/models"
)

type RequestRepository struct {
	db *sql.DB
}

func NewRequestRepository(db *sql.DB) *RequestRepository {
	return &RequestRepository{db: db}
}

func (r *RequestRepository) FindAll(employeeID, status, requestType string, page, pageSize int) ([]models.Request, int64, error) {
	var items []models.Request
	var total int64

	baseCount := "SELECT COUNT(*) FROM requests r"
	baseList := `SELECT r.id, r.employee_id, COALESCE(e.first_name || ' ' || e.last_name, ''), r.request_type,
		r.reason, r.status, r.reviewed_by, r.reviewed_at, r.rejection_reason, r.created_at, r.updated_at
		FROM requests r LEFT JOIN employees e ON r.employee_id = e.id`

	var where []string
	var args []interface{}
	argN := 1

	if employeeID != "" {
		where = append(where, fmt.Sprintf("r.employee_id = $%d", argN))
		args = append(args, employeeID)
		argN++
	}
	if status != "" {
		where = append(where, fmt.Sprintf("r.status = $%d", argN))
		args = append(args, status)
		argN++
	}
	if requestType != "" {
		where = append(where, fmt.Sprintf("r.request_type = $%d", argN))
		args = append(args, requestType)
		argN++
	}

	whereClause := ""
	if len(where) > 0 {
		whereClause = " WHERE " + strings.Join(where, " AND ")
	}

	err := r.db.QueryRow(baseCount+whereClause, args...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("count requests: %w", err)
	}

	listQ := baseList + whereClause + " ORDER BY r.created_at DESC"
	listQ += fmt.Sprintf(" LIMIT $%d OFFSET $%d", argN, argN+1)
	args = append(args, pageSize, (page-1)*pageSize)

	rows, err := r.db.Query(listQ, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("list requests: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var req models.Request
		var empName, reviewedBy, rejectionReason sql.NullString
		var reviewedAt sql.NullTime
		if err := rows.Scan(&req.ID, &req.EmployeeID, &empName, &req.RequestType, &req.Reason, &req.Status, &reviewedBy, &reviewedAt, &rejectionReason, &req.CreatedAt, &req.UpdatedAt); err != nil {
			return nil, 0, fmt.Errorf("scan request: %w", err)
		}
		req.EmployeeName = empName.String
		req.ReviewedBy = toStringPtr(reviewedBy)
		req.RejectionReason = toStringPtr(rejectionReason)
		req.ReviewedAt = nullTimeToTimePtr(reviewedAt)
		items = append(items, req)
	}

	return items, total, rows.Err()
}

func (r *RequestRepository) FindByID(id string) (*models.Request, error) {
	q := `SELECT r.id, r.employee_id, COALESCE(e.first_name || ' ' || e.last_name, ''), r.request_type,
		r.reason, r.status, r.reviewed_by, r.reviewed_at, r.rejection_reason, r.created_at, r.updated_at
		FROM requests r LEFT JOIN employees e ON r.employee_id = e.id WHERE r.id = $1`
	var req models.Request
	var empName, reviewedBy, rejectionReason sql.NullString
	var reviewedAt sql.NullTime
	err := r.db.QueryRow(q, id).Scan(&req.ID, &req.EmployeeID, &empName, &req.RequestType, &req.Reason, &req.Status, &reviewedBy, &reviewedAt, &rejectionReason, &req.CreatedAt, &req.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("find request: %w", err)
	}
	req.EmployeeName = empName.String
	req.ReviewedBy = toStringPtr(reviewedBy)
	req.RejectionReason = toStringPtr(rejectionReason)
	req.ReviewedAt = nullTimeToTimePtr(reviewedAt)
	return &req, nil
}

func (r *RequestRepository) Create(req *models.CreateRequest) error {
	q := `INSERT INTO requests (employee_id, request_type, reason, status)
		VALUES ($1, $2, $3, 'pending')`
	_, err := r.db.Exec(q, req.EmployeeID, req.RequestType, req.Reason)
	return err
}

func (r *RequestRepository) UpdateStatus(id, status, reviewedBy string) error {
	q := `UPDATE requests SET status = $2, reviewed_by = $3, reviewed_at = NOW() WHERE id = $1`
	_, err := r.db.Exec(q, id, status, reviewedBy)
	return err
}

func (r *RequestRepository) UpdateStatusWithReason(id, status, reviewedBy, reason string) error {
	q := `UPDATE requests SET status = $2, reviewed_by = $3, reviewed_at = NOW(), rejection_reason = $4 WHERE id = $1`
	_, err := r.db.Exec(q, id, status, reviewedBy, reason)
	return err
}

func (r *RequestRepository) Delete(id string) error {
	_, err := r.db.Exec("DELETE FROM requests WHERE id = $1", id)
	return err
}
