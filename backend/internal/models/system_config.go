package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"
)

type JSONFloatArray []float64

func (a JSONFloatArray) Value() (driver.Value, error) {
	if a == nil {
		return "[]", nil
	}
	b, err := json.Marshal(a)
	return string(b), err
}

func (a *JSONFloatArray) Scan(src interface{}) error {
	if src == nil {
		*a = JSONFloatArray{}
		return nil
	}
	var b []byte
	switch v := src.(type) {
	case string:
		b = []byte(v)
	case []byte:
		b = v
	}
	return json.Unmarshal(b, a)
}

type JSONStringArray []string

func (a JSONStringArray) Value() (driver.Value, error) {
	if a == nil {
		return "[]", nil
	}
	b, err := json.Marshal(a)
	return string(b), err
}

func (a *JSONStringArray) Scan(src interface{}) error {
	if src == nil {
		*a = JSONStringArray{}
		return nil
	}
	var b []byte
	switch v := src.(type) {
	case string:
		b = []byte(v)
	case []byte:
		b = v
	}
	return json.Unmarshal(b, a)
}

type CompanyBranch struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CreateBranchRequest struct {
	Name     string `json:"name" binding:"required"`
	IsActive *bool  `json:"is_active"`
}

type SystemConfig struct {
	ID                        int             `json:"id"`
	WorkingHoursPerDay        float64         `json:"working_hours_per_day"`
	WorkingDaysPerMonth       int             `json:"working_days_per_month"`
	GracePeriodMinutes        int             `json:"grace_period_minutes"`
	StandardStartTime         string          `json:"standard_start_time"`
	StandardEndTime           string          `json:"standard_end_time"`
	WeekendDays               json.RawMessage `json:"weekend_days"`
	AbsenceMode               string          `json:"absence_mode"`
	FixedAbsenceAmount        float64         `json:"fixed_absence_amount"`
	ProgressiveAbsenceAmounts json.RawMessage `json:"progressive_absence_amounts"`
	EnableLateDeduction       bool            `json:"enable_late_deduction"`
	LateThresholdHours        float64         `json:"late_threshold_hours"`
	LateDeductionType         string          `json:"late_deduction_type"`
	LateDeductionFraction     string          `json:"late_deduction_fraction"`
	LateFixedAmount           float64         `json:"late_fixed_amount"`
	PayrollFrequency          string          `json:"payroll_frequency"`
	DefaultPayrollDay         int             `json:"default_payroll_day"`
	AutoGeneratePayslip       bool            `json:"auto_generate_payslip"`
	AllowNegativeSalary       bool            `json:"allow_negative_salary"`
	OvertimeEnabled           bool            `json:"overtime_enabled"`
	OvertimeRateMultiplier    float64         `json:"overtime_rate_multiplier"`
	AnnualTaxBulkAmount       float64         `json:"annual_tax_bulk_amount"`
	AnnualInsuranceBulkAmount float64         `json:"annual_insurance_bulk_amount"`
	MedicalInsuranceEnabled   bool            `json:"medical_insurance_enabled"`
	MedicalDeductionType      string          `json:"medical_deduction_type"`
	MedicalFixedMonthlyAmount float64         `json:"medical_fixed_monthly_amount"`
	MedicalPercentageRate     float64         `json:"medical_percentage_rate"`
	MedicalApplyTo            string          `json:"medical_apply_to"`
	LoanEnabled               bool            `json:"loan_enabled"`
	LoanDefaultBehavior       string          `json:"loan_default_behavior"`
	LoanAutoDeduct            bool            `json:"loan_auto_deduct"`
	AnnualLeaveBalance        float64         `json:"annual_leave_balance"`
	SickLeaveBalance          float64         `json:"sick_leave_balance"`
	PersonalLeaveBalance      float64         `json:"personal_leave_balance"`
	UpdatedBy                 *string         `json:"updated_by,omitempty"`
	CreatedAt                 time.Time       `json:"created_at"`
	UpdatedAt                 time.Time       `json:"updated_at"`
}

type UpdateSystemConfigRequest struct {
	WorkingHoursPerDay        *float64         `json:"working_hours_per_day"`
	WorkingDaysPerMonth       *int             `json:"working_days_per_month"`
	GracePeriodMinutes        *int             `json:"grace_period_minutes"`
	StandardStartTime         *string          `json:"standard_start_time"`
	StandardEndTime           *string          `json:"standard_end_time"`
	WeekendDays               *json.RawMessage `json:"weekend_days"`
	AbsenceMode               *string          `json:"absence_mode"`
	FixedAbsenceAmount        *float64         `json:"fixed_absence_amount"`
	ProgressiveAbsenceAmounts *json.RawMessage `json:"progressive_absence_amounts"`
	EnableLateDeduction       *bool            `json:"enable_late_deduction"`
	LateThresholdHours        *float64         `json:"late_threshold_hours"`
	LateDeductionType         *string          `json:"late_deduction_type"`
	LateDeductionFraction     *string          `json:"late_deduction_fraction"`
	LateFixedAmount           *float64         `json:"late_fixed_amount"`
	PayrollFrequency          *string          `json:"payroll_frequency"`
	DefaultPayrollDay         *int             `json:"default_payroll_day"`
	AutoGeneratePayslip       *bool            `json:"auto_generate_payslip"`
	AllowNegativeSalary       *bool            `json:"allow_negative_salary"`
	OvertimeEnabled           *bool            `json:"overtime_enabled"`
	OvertimeRateMultiplier    *float64         `json:"overtime_rate_multiplier"`
	AnnualTaxBulkAmount       *float64         `json:"annual_tax_bulk_amount"`
	AnnualInsuranceBulkAmount *float64         `json:"annual_insurance_bulk_amount"`
	MedicalInsuranceEnabled   *bool            `json:"medical_insurance_enabled"`
	MedicalDeductionType      *string          `json:"medical_deduction_type"`
	MedicalFixedMonthlyAmount *float64         `json:"medical_fixed_monthly_amount"`
	MedicalPercentageRate     *float64         `json:"medical_percentage_rate"`
	MedicalApplyTo            *string          `json:"medical_apply_to"`
	LoanEnabled               *bool            `json:"loan_enabled"`
	LoanDefaultBehavior       *string          `json:"loan_default_behavior"`
	LoanAutoDeduct            *bool            `json:"loan_auto_deduct"`
	AnnualLeaveBalance        *float64         `json:"annual_leave_balance"`
	SickLeaveBalance          *float64         `json:"sick_leave_balance"`
	PersonalLeaveBalance      *float64         `json:"personal_leave_balance"`
}
