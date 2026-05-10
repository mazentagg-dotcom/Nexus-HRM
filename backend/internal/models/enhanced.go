package models

import "time"

type LeaveBalance struct {
	ID            string    `json:"id"`
	EmployeeID    string    `json:"employee_id"`
	LeaveType     string    `json:"leave_type"`
	TotalDays     float64   `json:"total_days"`
	UsedDays      float64   `json:"used_days"`
	RemainingDays float64   `json:"remaining_days"`
	Year          int       `json:"year"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type TimeOffPolicy struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	LeaveType   string    `json:"leave_type"`
	DaysPerYear float64   `json:"days_per_year"`
	AccrualType string    `json:"accrual_type"`
	Description string    `json:"description"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type EmployeeAnnouncement struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	Type      string    `json:"type"`
	Priority  string    `json:"priority"`
	CreatedBy string    `json:"created_by"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type EmployeeAsset struct {
	ID           string     `json:"id"`
	EmployeeID   string     `json:"employee_id"`
	AssetName    string     `json:"asset_name"`
	AssetType    string     `json:"asset_type"`
	SerialNumber string     `json:"serial_number"`
	Status       string     `json:"status"`
	AssignedDate time.Time  `json:"assigned_date"`
	ReturnDate   *time.Time `json:"return_date,omitempty"`
	Condition    string     `json:"condition"`
	Notes        string     `json:"notes"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

type BenefitPlan struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	BenefitType  string    `json:"benefit_type"`
	Provider     string    `json:"provider"`
	CostPerMonth float64   `json:"cost_per_month"`
	IsActive     bool      `json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type BenefitEnrollment struct {
	ID         string     `json:"id"`
	PlanID     string     `json:"plan_id"`
	EmployeeID string     `json:"employee_id"`
	StartDate  time.Time  `json:"start_date"`
	EndDate    *time.Time `json:"end_date,omitempty"`
	Status     string     `json:"status"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
}
