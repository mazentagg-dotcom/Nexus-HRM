package repositories

import (
	"database/sql"
	"fmt"

	"nexus-hrm/internal/models"
)

type SystemConfigRepository struct {
	db *sql.DB
}

func NewSystemConfigRepository(db *sql.DB) *SystemConfigRepository {
	return &SystemConfigRepository{db: db}
}

func (r *SystemConfigRepository) Get() (*models.SystemConfig, error) {
	q := `SELECT id,
		working_hours_per_day, working_days_per_month, grace_period_minutes,
		standard_start_time, standard_end_time, weekend_days,
		absence_mode, fixed_absence_amount, progressive_absence_amounts,
		enable_late_deduction, late_threshold_hours, late_deduction_type, late_deduction_fraction, late_fixed_amount,
		payroll_frequency, default_payroll_day, auto_generate_payslip, allow_negative_salary,
		overtime_enabled, overtime_rate_multiplier,
		annual_tax_bulk_amount, annual_insurance_bulk_amount,
		medical_insurance_enabled, medical_deduction_type, medical_fixed_monthly_amount, medical_percentage_rate, medical_apply_to,
		loan_enabled, loan_default_behavior, loan_auto_deduct,
		updated_by, created_at, updated_at
		FROM system_config WHERE id = 1`
	var cfg models.SystemConfig
	var updatedBy sql.NullString
	err := r.db.QueryRow(q).Scan(
		&cfg.ID,
		&cfg.WorkingHoursPerDay, &cfg.WorkingDaysPerMonth, &cfg.GracePeriodMinutes,
		&cfg.StandardStartTime, &cfg.StandardEndTime, &cfg.WeekendDays,
		&cfg.AbsenceMode, &cfg.FixedAbsenceAmount, &cfg.ProgressiveAbsenceAmounts,
		&cfg.EnableLateDeduction, &cfg.LateThresholdHours, &cfg.LateDeductionType, &cfg.LateDeductionFraction, &cfg.LateFixedAmount,
		&cfg.PayrollFrequency, &cfg.DefaultPayrollDay, &cfg.AutoGeneratePayslip, &cfg.AllowNegativeSalary,
		&cfg.OvertimeEnabled, &cfg.OvertimeRateMultiplier,
		&cfg.AnnualTaxBulkAmount, &cfg.AnnualInsuranceBulkAmount,
		&cfg.MedicalInsuranceEnabled, &cfg.MedicalDeductionType, &cfg.MedicalFixedMonthlyAmount, &cfg.MedicalPercentageRate, &cfg.MedicalApplyTo,
		&cfg.LoanEnabled, &cfg.LoanDefaultBehavior, &cfg.LoanAutoDeduct,
		&updatedBy, &cfg.CreatedAt, &cfg.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("get system config: %w", err)
	}
	if updatedBy.Valid {
		cfg.UpdatedBy = &updatedBy.String
	}
	return &cfg, nil
}

func (r *SystemConfigRepository) Update(cfg *models.SystemConfig) error {
	q := `UPDATE system_config SET
		working_hours_per_day = $1, working_days_per_month = $2, grace_period_minutes = $3,
		standard_start_time = $4, standard_end_time = $5, weekend_days = $6,
		absence_mode = $7, fixed_absence_amount = $8, progressive_absence_amounts = $9,
		enable_late_deduction = $10, late_threshold_hours = $11, late_deduction_type = $12, late_deduction_fraction = $13, late_fixed_amount = $14,
		payroll_frequency = $15, default_payroll_day = $16, auto_generate_payslip = $17, allow_negative_salary = $18,
		overtime_enabled = $19, overtime_rate_multiplier = $20,
		annual_tax_bulk_amount = $21, annual_insurance_bulk_amount = $22,
		medical_insurance_enabled = $23, medical_deduction_type = $24, medical_fixed_monthly_amount = $25, medical_percentage_rate = $26, medical_apply_to = $27,
		loan_enabled = $28, loan_default_behavior = $29, loan_auto_deduct = $30,
		updated_by = $31, updated_at = NOW()
		WHERE id = 1`
	_, err := r.db.Exec(q,
		cfg.WorkingHoursPerDay, cfg.WorkingDaysPerMonth, cfg.GracePeriodMinutes,
		cfg.StandardStartTime, cfg.StandardEndTime, string(cfg.WeekendDays),
		cfg.AbsenceMode, cfg.FixedAbsenceAmount, string(cfg.ProgressiveAbsenceAmounts),
		cfg.EnableLateDeduction, cfg.LateThresholdHours, cfg.LateDeductionType, cfg.LateDeductionFraction, cfg.LateFixedAmount,
		cfg.PayrollFrequency, cfg.DefaultPayrollDay, cfg.AutoGeneratePayslip, cfg.AllowNegativeSalary,
		cfg.OvertimeEnabled, cfg.OvertimeRateMultiplier,
		cfg.AnnualTaxBulkAmount, cfg.AnnualInsuranceBulkAmount,
		cfg.MedicalInsuranceEnabled, cfg.MedicalDeductionType, cfg.MedicalFixedMonthlyAmount, cfg.MedicalPercentageRate, cfg.MedicalApplyTo,
		cfg.LoanEnabled, cfg.LoanDefaultBehavior, cfg.LoanAutoDeduct,
		cfg.UpdatedBy,
	)
	return err
}

type BranchRepository struct {
	db *sql.DB
}

func NewBranchRepository(db *sql.DB) *BranchRepository {
	return &BranchRepository{db: db}
}

func (r *BranchRepository) FindAll() ([]models.CompanyBranch, error) {
	q := `SELECT id, name, is_active, created_at, updated_at FROM company_branches ORDER BY id`
	rows, err := r.db.Query(q)
	if err != nil {
		return nil, fmt.Errorf("list branches: %w", err)
	}
	defer rows.Close()

	var items []models.CompanyBranch
	for rows.Next() {
		var b models.CompanyBranch
		if err := rows.Scan(&b.ID, &b.Name, &b.IsActive, &b.CreatedAt, &b.UpdatedAt); err != nil {
			return nil, fmt.Errorf("scan branch: %w", err)
		}
		items = append(items, b)
	}
	return items, rows.Err()
}

func (r *BranchRepository) Create(name string, isActive bool) (*models.CompanyBranch, error) {
	q := `INSERT INTO company_branches (name, is_active) VALUES ($1, $2) RETURNING id, name, is_active, created_at, updated_at`
	var b models.CompanyBranch
	err := r.db.QueryRow(q, name, isActive).Scan(&b.ID, &b.Name, &b.IsActive, &b.CreatedAt, &b.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("create branch: %w", err)
	}
	return &b, nil
}

func (r *BranchRepository) Update(id int, name string, isActive bool) error {
	q := `UPDATE company_branches SET name = $2, is_active = $3, updated_at = NOW() WHERE id = $1`
	_, err := r.db.Exec(q, id, name, isActive)
	return err
}

func (r *BranchRepository) Delete(id int) error {
	_, err := r.db.Exec("DELETE FROM company_branches WHERE id = $1", id)
	return err
}
