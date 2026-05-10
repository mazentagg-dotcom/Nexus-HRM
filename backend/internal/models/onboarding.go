package models

import "time"

type OnboardingTemplate struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	DepartmentID *string   `json:"department_id,omitempty"`
	IsActive     bool      `json:"is_active"`
	CreatedBy    string    `json:"created_by"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type OnboardingTask struct {
	ID            string `json:"id"`
	TemplateID    string `json:"template_id"`
	Title         string `json:"title"`
	Description   string `json:"description"`
	OrderNum      int    `json:"order_num"`
	DaysFromStart int    `json:"days_from_start"`
	IsRequired    bool   `json:"is_required"`
}

type OnboardingInstance struct {
	ID         string    `json:"id"`
	TemplateID string    `json:"template_id"`
	EmployeeID string    `json:"employee_id"`
	StartDate  time.Time `json:"start_date"`
	Status     string    `json:"status"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type OnboardingTaskProgress struct {
	ID          string     `json:"id"`
	InstanceID  string     `json:"instance_id"`
	TaskID      string     `json:"task_id"`
	Status      string     `json:"status"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
	CompletedBy *string    `json:"completed_by,omitempty"`
	Notes       string     `json:"notes"`
}
