package repositories

import (
	"database/sql"
	"fmt"
	"strings"

	"nexus-hrm/internal/models"
)

type DeductionRepository struct {
	db *sql.DB
}

func NewDeductionRepository(db *sql.DB) *DeductionRepository {
	return &DeductionRepository{db: db}
}

func (r *DeductionRepository) FindAll(employeeID, status, deductionType, month string, page, pageSize int) ([]models.Deduction, int64, error) {
	var items []models.Deduction
	var total int64

	baseCount := "SELECT COUNT(*) FROM deductions d"
	baseList := `SELECT d.id, d.employee_id, COALESCE(e.first_name || ' ' || e.last_name, ''), d.deduction_type,
		d.amount, d.month, d.reason, d.status, d.created_by, d.created_at, d.updated_at
		FROM deductions d LEFT JOIN employees e ON d.employee_id = e.id`

	var where []string
	var args []interface{}
	argN := 1

	if employeeID != "" {
		where = append(where, fmt.Sprintf("d.employee_id = $%d", argN))
		args = append(args, employeeID)
		argN++
	}
	if status != "" {
		where = append(where, fmt.Sprintf("d.status = $%d", argN))
		args = append(args, status)
		argN++
	}
	if deductionType != "" {
		where = append(where, fmt.Sprintf("d.deduction_type = $%d", argN))
		args = append(args, deductionType)
		argN++
	}
	if month != "" {
		where = append(where, fmt.Sprintf("d.month = $%d", argN))
		args = append(args, month)
		argN++
	}

	whereClause := ""
	if len(where) > 0 {
		whereClause = " WHERE " + strings.Join(where, " AND ")
	}

	err := r.db.QueryRow(baseCount+whereClause, args...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("count deductions: %w", err)
	}

	listQ := baseList + whereClause + " ORDER BY d.created_at DESC"
	listQ += fmt.Sprintf(" LIMIT $%d OFFSET $%d", argN, argN+1)
	args = append(args, pageSize, (page-1)*pageSize)

	rows, err := r.db.Query(listQ, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("list deductions: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var d models.Deduction
		var empName, reason, createdBy sql.NullString
		if err := rows.Scan(&d.ID, &d.EmployeeID, &empName, &d.DeductionType, &d.Amount, &d.Month, &reason, &d.Status, &createdBy, &d.CreatedAt, &d.UpdatedAt); err != nil {
			return nil, 0, fmt.Errorf("scan deduction: %w", err)
		}
		d.EmployeeName = empName.String
		d.Reason = toStringPtr(reason)
		d.CreatedBy = toStringPtr(createdBy)
		items = append(items, d)
	}

	return items, total, rows.Err()
}

func (r *DeductionRepository) FindByID(id string) (*models.Deduction, error) {
	q := `SELECT d.id, d.employee_id, COALESCE(e.first_name || ' ' || e.last_name, ''), d.deduction_type,
		d.amount, d.month, d.reason, d.status, d.created_by, d.created_at, d.updated_at
		FROM deductions d LEFT JOIN employees e ON d.employee_id = e.id WHERE d.id = $1`
	var d models.Deduction
	var empName, reason, createdBy sql.NullString
	err := r.db.QueryRow(q, id).Scan(&d.ID, &d.EmployeeID, &empName, &d.DeductionType, &d.Amount, &d.Month, &reason, &d.Status, &createdBy, &d.CreatedAt, &d.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("find deduction: %w", err)
	}
	d.EmployeeName = empName.String
	d.Reason = toStringPtr(reason)
	d.CreatedBy = toStringPtr(createdBy)
	return &d, nil
}

func (r *DeductionRepository) Create(d *models.CreateDeductionRequest, createdBy string) error {
	status := d.Status
	if status == "" {
		status = "pending"
	}
	q := `INSERT INTO deductions (employee_id, deduction_type, amount, month, reason, status, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := r.db.Exec(q, d.EmployeeID, d.DeductionType, d.Amount, d.Month, d.Reason, status, createdBy)
	return err
}

func (r *DeductionRepository) Update(d *models.UpdateDeductionRequest, id string) error {
	q := `UPDATE deductions SET
		deduction_type = COALESCE($2, deduction_type),
		amount = COALESCE($3, amount),
		month = COALESCE($4, month),
		reason = COALESCE($5, reason),
		status = COALESCE($6, status)
		WHERE id = $1`
	_, err := r.db.Exec(q, id, d.DeductionType, d.Amount, d.Month, d.Reason, d.Status)
	return err
}

func (r *DeductionRepository) Delete(id string) error {
	_, err := r.db.Exec("DELETE FROM deductions WHERE id = $1", id)
	return err
}
