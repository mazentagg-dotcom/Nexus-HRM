package models

import "time"

type Deduction struct {
	ID            string    `json:"id"`
	EmployeeID    string    `json:"employee_id"`
	EmployeeName  string    `json:"employee_name,omitempty"`
	DeductionType string    `json:"deduction_type"`
	Amount        float64   `json:"amount"`
	Month         string    `json:"month"`
	Reason        *string   `json:"reason,omitempty"`
	Status        string    `json:"status"`
	CreatedBy     *string   `json:"created_by,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type CreateDeductionRequest struct {
	EmployeeID    string  `json:"employee_id" binding:"required"`
	DeductionType string  `json:"deduction_type" binding:"required"`
	Amount        float64 `json:"amount" binding:"required,gte=0"`
	Month         string  `json:"month" binding:"required"`
	Reason        *string `json:"reason"`
	Status        string  `json:"status"`
}

type UpdateDeductionRequest struct {
	DeductionType *string  `json:"deduction_type"`
	Amount        *float64 `json:"amount"`
	Month         *string  `json:"month"`
	Reason        *string  `json:"reason"`
	Status        *string  `json:"status"`
}
