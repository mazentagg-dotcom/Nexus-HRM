package models

import "time"

type LoanRequest struct {
	ID                 string    `json:"id"`
	EmployeeID         string    `json:"employee_id"`
	EmployeeName       string    `json:"employee_name,omitempty"`
	Amount             float64   `json:"amount"`
	Purpose            string    `json:"purpose"`
	MonthlyInstallment float64   `json:"monthly_installment"`
	RepaymentMonths    int       `json:"repayment_months"`
	Status             string    `json:"status"`
	ApprovedBy         *string   `json:"approved_by,omitempty"`
	RejectionReason    *string   `json:"rejection_reason,omitempty"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

type CreateLoanRequest struct {
	Amount          float64 `json:"amount" binding:"required,gt=0"`
	Purpose         string  `json:"purpose" binding:"required,min=3"`
	RepaymentMonths int     `json:"repayment_months" binding:"required,min=1,max=60"`
}
