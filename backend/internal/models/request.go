package models

import "time"

type Request struct {
	ID              string     `json:"id"`
	EmployeeID      string     `json:"employee_id"`
	EmployeeName    string     `json:"employee_name,omitempty"`
	RequestType     string     `json:"request_type"`
	Reason          string     `json:"reason"`
	Status          string     `json:"status"`
	ReviewedBy      *string    `json:"reviewed_by,omitempty"`
	ReviewedAt      *time.Time `json:"reviewed_at,omitempty"`
	RejectionReason *string    `json:"rejection_reason,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

type CreateRequest struct {
	EmployeeID  string `json:"employee_id" binding:"required"`
	RequestType string `json:"request_type" binding:"required"`
	Reason      string `json:"reason" binding:"required"`
}
