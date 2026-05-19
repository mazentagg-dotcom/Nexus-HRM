package models

import "time"

type Department struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Code        string    `json:"code"`
	ParentID    *string   `json:"parent_id,omitempty"`
	ManagerID   *string   `json:"manager_id,omitempty"`
	Description *string   `json:"description,omitempty"`
	Budget      *float64  `json:"budget,omitempty"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type CreateDepartmentRequest struct {
	Name        string   `json:"name" binding:"required"`
	Code        string   `json:"code" binding:"required"`
	ParentID    *string  `json:"parent_id"`
	ManagerID   *string  `json:"manager_id"`
	Description *string  `json:"description"`
	Budget      *float64 `json:"budget"`
}

type UpdateDepartmentRequest struct {
	Name        *string  `json:"name"`
	Code        *string  `json:"code"`
	ParentID    *string  `json:"parent_id"`
	ManagerID   *string  `json:"manager_id"`
	Description *string  `json:"description"`
	Budget      *float64 `json:"budget"`
	IsActive    *bool    `json:"is_active"`
}

type Employee struct {
	ID                string     `json:"id"`
	UserID            *string    `json:"user_id,omitempty"`
	EmployeeCode      string     `json:"employee_code"`
	FirstName         string     `json:"first_name"`
	LastName          string     `json:"last_name"`
	Email             string     `json:"email"`
	Phone             *string    `json:"phone,omitempty"`
	Gender            *string    `json:"gender,omitempty"`
	DateOfBirth       *time.Time `json:"date_of_birth,omitempty"`
	Address           *string    `json:"address,omitempty"`
	City              *string    `json:"city,omitempty"`
	State             *string    `json:"state,omitempty"`
	Country           *string    `json:"country,omitempty"`
	ZipCode           *string    `json:"zip_code,omitempty"`
	DepartmentID      *string    `json:"department_id,omitempty"`
	DepartmentName    *string    `json:"department_name,omitempty"`
	Position          *string    `json:"position,omitempty"`
	EmploymentType    *string    `json:"employment_type,omitempty"`
	Status            string     `json:"status"`
	HireDate          time.Time  `json:"hire_date"`
	ConfirmationDate  *time.Time `json:"confirmation_date,omitempty"`
	ReportsTo         *string    `json:"reports_to,omitempty"`
	WorkLocation      *string    `json:"work_location,omitempty"`
	Salary            *float64   `json:"salary,omitempty"`
	SalaryCurrency    *string    `json:"salary_currency,omitempty"`
	PayFrequency      *string    `json:"pay_frequency,omitempty"`
	BankName          *string    `json:"bank_name,omitempty"`
	BankAccount       *string    `json:"bank_account,omitempty"`
	BankRouting       *string    `json:"bank_routing,omitempty"`
	TaxID             *string    `json:"tax_id,omitempty"`
	EmergencyName     *string    `json:"emergency_contact_name,omitempty"`
	EmergencyPhone    *string    `json:"emergency_contact_phone,omitempty"`
	EmergencyRelation *string    `json:"emergency_contact_relation,omitempty"`
	Bio               *string    `json:"bio,omitempty"`
	Notes             *string    `json:"notes,omitempty"`
	IsActive          bool       `json:"is_active"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
}

type CreateEmployeeRequest struct {
	FirstName      string   `json:"first_name" binding:"required"`
	LastName       string   `json:"last_name" binding:"required"`
	Email          string   `json:"email" binding:"required,email"`
	EmployeeCode   string   `json:"employee_code"`
	Phone          *string  `json:"phone"`
	Gender         *string  `json:"gender"`
	DateOfBirth    *string  `json:"date_of_birth"`
	Address        *string  `json:"address"`
	DepartmentID   *string  `json:"department_id"`
	Position       *string  `json:"position"`
	EmploymentType *string  `json:"employment_type"`
	HireDate       string   `json:"hire_date" binding:"required"`
	ReportsTo      *string  `json:"reports_to"`
	Salary         *float64 `json:"salary"`
	SalaryCurrency *string  `json:"salary_currency"`
	PayFrequency   *string  `json:"pay_frequency"`
}

type UpdateEmployeeRequest struct {
	FirstName      *string  `json:"first_name"`
	LastName       *string  `json:"last_name"`
	Email          *string  `json:"email"`
	Phone          *string  `json:"phone"`
	Gender         *string  `json:"gender"`
	DateOfBirth    *string  `json:"date_of_birth"`
	Address        *string  `json:"address"`
	DepartmentID   *string  `json:"department_id"`
	Position       *string  `json:"position"`
	EmploymentType *string  `json:"employment_type"`
	Status         *string  `json:"status"`
	ReportsTo      *string  `json:"reports_to"`
	Salary         *float64 `json:"salary"`
	SalaryCurrency *string  `json:"salary_currency"`
	PayFrequency   *string  `json:"pay_frequency"`
	Bio            *string  `json:"bio"`
	Notes          *string  `json:"notes"`
}

type Attendance struct {
	ID            string     `json:"id"`
	EmployeeID    string     `json:"employee_id"`
	EmployeeName  string     `json:"employee_name,omitempty"`
	Date          string     `json:"date"`
	ClockIn       *time.Time `json:"clock_in,omitempty"`
	ClockOut      *time.Time `json:"clock_out,omitempty"`
	Status        string     `json:"status"`
	WorkHours     *float64   `json:"work_hours,omitempty"`
	OvertimeHours *float64   `json:"overtime_hours,omitempty"`
	BreakMinutes  *int       `json:"break_minutes,omitempty"`
	Location      *string    `json:"location,omitempty"`
	Notes         *string    `json:"notes,omitempty"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

type LeaveRequest struct {
	ID              string     `json:"id"`
	EmployeeID      string     `json:"employee_id"`
	EmployeeName    string     `json:"employee_name,omitempty"`
	LeaveType       string     `json:"leave_type"`
	StartDate       time.Time  `json:"start_date"`
	EndDate         time.Time  `json:"end_date"`
	DurationDays    float64    `json:"duration_days"`
	Reason          string     `json:"reason"`
	Status          string     `json:"status"`
	ApproverID      *string    `json:"approver_id,omitempty"`
	ApprovedAt      *time.Time `json:"approved_at,omitempty"`
	RejectionReason *string    `json:"rejection_reason,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

type CreateLeaveRequest struct {
	EmployeeID   string  `json:"employee_id" binding:"required"`
	LeaveType    string  `json:"leave_type" binding:"required"`
	StartDate    string  `json:"start_date" binding:"required"`
	EndDate      string  `json:"end_date" binding:"required"`
	DurationDays float64 `json:"duration_days" binding:"required"`
	Reason       string  `json:"reason" binding:"required"`
}

type PayrollRecord struct {
	ID                 string    `json:"id"`
	EmployeeID         string    `json:"employee_id"`
	EmployeeName       string    `json:"employee_name,omitempty"`
	PayPeriodStart     string    `json:"pay_period_start"`
	PayPeriodEnd       string    `json:"pay_period_end"`
	BasicSalary        float64   `json:"basic_salary"`
	HousingAllowance   float64   `json:"housing_allowance"`
	TransportAllowance float64   `json:"transport_allowance"`
	MedicalAllowance   float64   `json:"medical_allowance"`
	FoodAllowance      float64   `json:"food_allowance"`
	Bonus              float64   `json:"bonus"`
	Commission         float64   `json:"commission"`
	OvertimePay        float64   `json:"overtime_pay"`
	OtherEarnings      float64   `json:"other_earnings"`
	GrossPay           float64   `json:"gross_pay"`
	TaxDeduction       float64   `json:"tax_deduction"`
	SocialSecurity     float64   `json:"social_security"`
	HealthInsurance    float64   `json:"health_insurance"`
	RetirementFund     float64   `json:"retirement_fund"`
	LoanDeduction      float64   `json:"loan_deduction"`
	TaxPenalty         float64   `json:"tax_penalty"`
	OtherDeductions    float64   `json:"other_deductions"`
	TotalDeductions    float64   `json:"total_deductions"`
	NetPay             float64   `json:"net_pay"`
	PayDate            *string   `json:"pay_date,omitempty"`
	PaymentMethod      *string   `json:"payment_method,omitempty"`
	Status             string    `json:"status"`
	Notes              *string   `json:"notes,omitempty"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

type CreatePayrollRequest struct {
	EmployeeID         string  `json:"employee_id" binding:"required"`
	PayPeriodStart     string  `json:"pay_period_start" binding:"required"`
	PayPeriodEnd       string  `json:"pay_period_end" binding:"required"`
	BasicSalary        float64 `json:"basic_salary" binding:"gte=0"`
	HousingAllowance   float64 `json:"housing_allowance"`
	TransportAllowance float64 `json:"transport_allowance"`
	MedicalAllowance   float64 `json:"medical_allowance"`
	FoodAllowance      float64 `json:"food_allowance"`
	Bonus              float64 `json:"bonus"`
	Commission         float64 `json:"commission"`
	OvertimePay        float64 `json:"overtime_pay"`
	OtherEarnings      float64 `json:"other_earnings"`
	TaxDeduction       float64 `json:"tax_deduction"`
	SocialSecurity     float64 `json:"social_security"`
	HealthInsurance    float64 `json:"health_insurance"`
	RetirementFund     float64 `json:"retirement_fund"`
	LoanDeduction      float64 `json:"loan_deduction"`
	OtherDeductions    float64 `json:"other_deductions"`
	PaymentMethod      *string `json:"payment_method"`
	Notes              *string `json:"notes"`
}

type UpdatePayrollRequest struct {
	BasicSalary        *float64 `json:"basic_salary"`
	HousingAllowance   *float64 `json:"housing_allowance"`
	TransportAllowance *float64 `json:"transport_allowance"`
	MedicalAllowance   *float64 `json:"medical_allowance"`
	FoodAllowance      *float64 `json:"food_allowance"`
	Bonus              *float64 `json:"bonus"`
	Commission         *float64 `json:"commission"`
	OvertimePay        *float64 `json:"overtime_pay"`
	OtherEarnings      *float64 `json:"other_earnings"`
	TaxDeduction       *float64 `json:"tax_deduction"`
	SocialSecurity     *float64 `json:"social_security"`
	HealthInsurance    *float64 `json:"health_insurance"`
	RetirementFund     *float64 `json:"retirement_fund"`
	LoanDeduction      *float64 `json:"loan_deduction"`
	OtherDeductions    *float64 `json:"other_deductions"`
	PayDate            *string  `json:"pay_date"`
	PaymentMethod      *string  `json:"payment_method"`
	Status             *string  `json:"status"`
	Notes              *string  `json:"notes"`
}

type EmployeeDocument struct {
	ID           string     `json:"id"`
	EmployeeID   string     `json:"employee_id"`
	DocumentType string     `json:"document_type"`
	Title        string     `json:"title"`
	Description  *string    `json:"description,omitempty"`
	FileName     string     `json:"file_name"`
	FileURL      string     `json:"file_url"`
	FileSize     int64      `json:"file_size"`
	FileType     *string    `json:"file_type,omitempty"`
	MimeType     *string    `json:"mime_type,omitempty"`
	IsVerified   bool       `json:"is_verified"`
	ExpiresAt    *time.Time `json:"expires_at,omitempty"`
	CreatedBy    *string    `json:"created_by,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

type CreateEmployeeDocumentRequest struct {
	EmployeeID   string  `json:"employee_id" binding:"required"`
	DocumentType string  `json:"document_type" binding:"required"`
	Title        string  `json:"title" binding:"required"`
	FileURL      string  `json:"file_url" binding:"required"`
	FileName     string  `json:"file_name" binding:"required"`
	FileSize     int64   `json:"file_size"`
	FileType     string  `json:"file_type"`
	MimeType     string  `json:"mime_type"`
	ExpiresAt    *string `json:"expires_at"`
	Description  *string `json:"description"`
}
