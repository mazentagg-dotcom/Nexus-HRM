package services

import (
	"fmt"
	"math"
	"time"

	"github.com/google/uuid"

	"nexus-hrm/internal/models"
)

type DepartmentRepo interface {
	FindAll(search string, page, pageSize int) ([]models.Department, int64, error)
	FindByID(id string) (*models.Department, error)
	Create(d *models.Department) error
	Update(d *models.Department) error
	Delete(id string) error
	Count() (int64, error)
}

type EmployeeRepo interface {
	FindAll(search, department, status string, page, pageSize int) ([]models.Employee, int64, error)
	FindByID(id string) (*models.Employee, error)
	FindByUserID(userID string) (*models.Employee, error)
	FindByDepartmentID(deptID string) ([]models.Employee, error)
	FindByReportingTo(managerID string) ([]models.Employee, error)
	Create(e *models.Employee) error
	Update(e *models.Employee) error
	Delete(id string) error
	Count(status string) (int64, error)
}

type AttendanceRepo interface {
	FindAll(employeeID, dateFrom, dateTo, status string, page, pageSize int) ([]models.Attendance, int64, error)
	CheckIn(employeeID string) (*models.Attendance, error)
	CheckOut(employeeID string) (*models.Attendance, error)
}

type LeaveRequestRepo interface {
	FindAll(employeeID, status, leaveType string, page, pageSize int) ([]models.LeaveRequest, int64, error)
	FindByID(id string) (*models.LeaveRequest, error)
	Create(lr *models.LeaveRequest) error
	UpdateStatus(id, status, approverID string) error
	RejectWithReason(id, approverID, reason string) error
	CountByStatus(status string) (int64, error)
}

type PayrollRepo interface {
	FindAll(employeeID, status string, page, pageSize int) ([]models.PayrollRecord, int64, error)
	FindByID(id string) (*models.PayrollRecord, error)
	Create(pr *models.CreatePayrollRequest) error
	Update(pr *models.UpdatePayrollRequest, id string) error
}

type DocumentRepo interface {
	FindByEmployeeID(employeeID string) ([]models.EmployeeDocument, error)
	FindAll(employeeID, docType string, page, pageSize int) ([]models.EmployeeDocument, int64, error)
	FindByID(id string) (*models.EmployeeDocument, error)
	Create(doc *models.CreateEmployeeDocumentRequest, employeeID string) error
	Delete(id string) error
}

type LoanRepo interface {
	FindByEmployeeID(employeeID string, page, pageSize int) ([]models.LoanRequest, int64, error)
	FindAll(status string, page, pageSize int) ([]models.LoanRequest, int64, error)
	FindByID(id string) (*models.LoanRequest, error)
	Create(employeeID string, req *models.CreateLoanRequest) (*models.LoanRequest, error)
	UpdateStatus(id, status, approvedBy string) error
}

type DeductionRepo interface {
	FindAll(employeeID, status, deductionType, month string, page, pageSize int) ([]models.Deduction, int64, error)
	FindByID(id string) (*models.Deduction, error)
	Create(d *models.CreateDeductionRequest, createdBy string) error
	Update(d *models.UpdateDeductionRequest, id string) error
	Delete(id string) error
}

type RequestRepo interface {
	FindAll(employeeID, status, requestType string, page, pageSize int) ([]models.Request, int64, error)
	FindByID(id string) (*models.Request, error)
	Create(req *models.CreateRequest) error
	UpdateStatus(id, status, reviewedBy string) error
	UpdateStatusWithReason(id, status, reviewedBy, reason string) error
	Delete(id string) error
}

type NotifService interface {
	CreateNotification(userID, title, message, ntype string, link *string) (*models.Notification, error)
}

type ConfigProvider interface {
	GetLeaveBalanceDefaults() (annual, sick, personal float64)
}

type HRService struct {
	deptRepo       DepartmentRepo
	empRepo        EmployeeRepo
	attRepo        AttendanceRepo
	leaveRepo      LeaveRequestRepo
	payrollRepo    PayrollRepo
	docRepo        DocumentRepo
	notifService   NotifService
	loanRepo       LoanRepo
	deductionRepo  DeductionRepo
	requestRepo    RequestRepo
	configProvider ConfigProvider
}

func NewHRService(dept DepartmentRepo, emp EmployeeRepo, att AttendanceRepo, leave LeaveRequestRepo, payroll PayrollRepo, doc DocumentRepo, notif NotifService, loan LoanRepo, deduction DeductionRepo, request RequestRepo, cfg ConfigProvider) *HRService {
	return &HRService{
		deptRepo:       dept,
		empRepo:        emp,
		attRepo:        att,
		leaveRepo:      leave,
		payrollRepo:    payroll,
		docRepo:        doc,
		notifService:   notif,
		loanRepo:       loan,
		deductionRepo:  deduction,
		requestRepo:    request,
		configProvider: cfg,
	}
}

func (s *HRService) GetDashboard() (map[string]interface{}, error) {
	var errs []error

	totalEmp, err := s.empRepo.Count("")
	if err != nil {
		errs = append(errs, err)
	}
	activeEmp, err := s.empRepo.Count("active")
	if err != nil {
		errs = append(errs, err)
	}
	totalDepts, err := s.deptRepo.Count()
	if err != nil {
		errs = append(errs, err)
	}
	pendingLeaves, err := s.leaveRepo.CountByStatus("pending")
	if err != nil {
		errs = append(errs, err)
	}

	if len(errs) > 0 {
		return map[string]interface{}{
			"total_employees":   totalEmp,
			"active_employees":  activeEmp,
			"total_departments": totalDepts,
			"pending_leaves":    pendingLeaves,
			"monthly_payroll":   0.0,
			"attendance_rate":   0.0,
		}, nil
	}

	now := time.Now()
	currentMonth := fmt.Sprintf("%d-%02d", now.Year(), now.Month())

	payrollItems, _, _ := s.payrollRepo.FindAll("", "", 1, 10000)
	var monthlyPayroll float64
	for _, pr := range payrollItems {
		if len(pr.PayPeriodStart) >= 7 && pr.PayPeriodStart[:7] == currentMonth && pr.Status == "paid" {
			monthlyPayroll += pr.NetPay
		}
	}

	attItems, _, _ := s.attRepo.FindAll("", "", "", "", 1, 100000)
	var totalAtt, presentAtt int
	for _, a := range attItems {
		totalAtt++
		if a.Status == "present" || a.Status == "late" {
			presentAtt++
		}
	}
	var attendanceRate float64
	if totalAtt > 0 {
		attendanceRate = float64(presentAtt) / float64(totalAtt) * 100
	}

	return map[string]interface{}{
		"total_employees":   totalEmp,
		"active_employees":  activeEmp,
		"total_departments": totalDepts,
		"pending_leaves":    pendingLeaves,
		"monthly_payroll":   monthlyPayroll,
		"attendance_rate":   math.Round(attendanceRate*10) / 10,
	}, nil
}

func (s *HRService) GetDepartments(search string, page, pageSize int) ([]models.Department, int64, error) {
	return s.deptRepo.FindAll(search, page, pageSize)
}

func (s *HRService) GetDepartment(id string) (*models.Department, error) {
	d, err := s.deptRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if d == nil {
		return nil, ErrNotFound
	}
	return d, nil
}

func (s *HRService) CreateDepartment(req *models.CreateDepartmentRequest) (*models.Department, error) {
	d := &models.Department{
		Name:        req.Name,
		Code:        req.Code,
		ParentID:    req.ParentID,
		ManagerID:   req.ManagerID,
		Description: req.Description,
		Budget:      req.Budget,
		IsActive:    true,
	}

	if err := s.deptRepo.Create(d); err != nil {
		return nil, err
	}

	return d, nil
}

func (s *HRService) UpdateDepartment(id string, req *models.UpdateDepartmentRequest) (*models.Department, error) {
	d, err := s.deptRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if d == nil {
		return nil, ErrNotFound
	}

	if req.Name != nil {
		d.Name = *req.Name
	}
	if req.Code != nil {
		d.Code = *req.Code
	}
	if req.ParentID != nil {
		d.ParentID = req.ParentID
	}
	if req.ManagerID != nil {
		d.ManagerID = req.ManagerID
	}
	if req.Description != nil {
		d.Description = req.Description
	}
	if req.Budget != nil {
		d.Budget = req.Budget
	}
	if req.IsActive != nil {
		d.IsActive = *req.IsActive
	}

	if err := s.deptRepo.Update(d); err != nil {
		return nil, err
	}

	return d, nil
}

func (s *HRService) DeleteDepartment(id string) error {
	return s.deptRepo.Delete(id)
}

func (s *HRService) GetEmployees(search, department, status string, page, pageSize int) ([]models.Employee, int64, error) {
	return s.empRepo.FindAll(search, department, status, page, pageSize)
}

func (s *HRService) GetEmployee(id string) (*models.Employee, error) {
	e, err := s.empRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if e == nil {
		return nil, ErrNotFound
	}
	return e, nil
}

func (s *HRService) CreateEmployee(req *models.CreateEmployeeRequest) (*models.Employee, error) {
	e := &models.Employee{
		FirstName:      req.FirstName,
		LastName:       req.LastName,
		Email:          req.Email,
		Phone:          req.Phone,
		Gender:         req.Gender,
		DepartmentID:   req.DepartmentID,
		Position:       req.Position,
		EmploymentType: req.EmploymentType,
		ReportsTo:      req.ReportsTo,
		Salary:         req.Salary,
		SalaryCurrency: req.SalaryCurrency,
		PayFrequency:   req.PayFrequency,
	}

	if req.EmployeeCode != "" {
		e.EmployeeCode = req.EmployeeCode
	} else {
		e.EmployeeCode = "EMP-" + uuid.New().String()[:8]
	}

	if req.DateOfBirth != nil {
		dob := *req.DateOfBirth
		t, _ := parseDate(dob)
		e.DateOfBirth = t
	}

	if req.HireDate != "" {
		t, _ := parseDate(req.HireDate)
		if t != nil {
			e.HireDate = *t
		}
	}

	if err := s.empRepo.Create(e); err != nil {
		return nil, err
	}

	return e, nil
}

func (s *HRService) UpdateEmployee(id string, req *models.UpdateEmployeeRequest) (*models.Employee, error) {
	e, err := s.empRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if e == nil {
		return nil, ErrNotFound
	}

	if req.FirstName != nil {
		e.FirstName = *req.FirstName
	}
	if req.LastName != nil {
		e.LastName = *req.LastName
	}
	if req.Email != nil {
		e.Email = *req.Email
	}
	if req.Phone != nil {
		e.Phone = req.Phone
	}
	if req.Gender != nil {
		e.Gender = req.Gender
	}
	if req.DateOfBirth != nil {
		t, _ := parseDate(*req.DateOfBirth)
		e.DateOfBirth = t
	}
	if req.Address != nil {
		e.Address = req.Address
	}
	if req.DepartmentID != nil {
		e.DepartmentID = req.DepartmentID
	}
	if req.Position != nil {
		e.Position = req.Position
	}
	if req.EmploymentType != nil {
		e.EmploymentType = req.EmploymentType
	}
	if req.Status != nil {
		e.Status = *req.Status
	}
	if req.ReportsTo != nil {
		e.ReportsTo = req.ReportsTo
	}
	if req.Salary != nil {
		e.Salary = req.Salary
	}
	if req.SalaryCurrency != nil {
		e.SalaryCurrency = req.SalaryCurrency
	}
	if req.PayFrequency != nil {
		e.PayFrequency = req.PayFrequency
	}
	if req.Bio != nil {
		e.Bio = req.Bio
	}
	if req.Notes != nil {
		e.Notes = req.Notes
	}

	if err := s.empRepo.Update(e); err != nil {
		return nil, err
	}

	return e, nil
}

func (s *HRService) GetAttendance(employeeID, dateFrom, dateTo, status string, page, pageSize int) ([]models.Attendance, int64, error) {
	return s.attRepo.FindAll(employeeID, dateFrom, dateTo, status, page, pageSize)
}

func (s *HRService) CheckIn(employeeID string) (*models.Attendance, error) {
	return s.attRepo.CheckIn(employeeID)
}

func (s *HRService) CheckOut(employeeID string) (*models.Attendance, error) {
	return s.attRepo.CheckOut(employeeID)
}

func (s *HRService) GetLeaveRequests(employeeID, status, leaveType string, page, pageSize int) ([]models.LeaveRequest, int64, error) {
	return s.leaveRepo.FindAll(employeeID, status, leaveType, page, pageSize)
}

func (s *HRService) CreateLeaveRequest(req *models.CreateLeaveRequest) (*models.LeaveRequest, error) {
	startDate, err := parseDate(req.StartDate)
	if err != nil {
		return nil, fmt.Errorf("invalid start_date: %w", err)
	}
	endDate, err := parseDate(req.EndDate)
	if err != nil {
		return nil, fmt.Errorf("invalid end_date: %w", err)
	}

	lr := &models.LeaveRequest{
		EmployeeID:   req.EmployeeID,
		LeaveType:    req.LeaveType,
		StartDate:    *startDate,
		EndDate:      *endDate,
		DurationDays: req.DurationDays,
		Reason:       req.Reason,
		Status:       "pending",
	}

	if err := s.leaveRepo.Create(lr); err != nil {
		return nil, err
	}

	return lr, nil
}

func (s *HRService) ApproveLeave(id, approverID string) (*models.LeaveRequest, error) {
	lr, err := s.leaveRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if lr == nil {
		return nil, ErrNotFound
	}
	if lr.Status != "pending" {
		return nil, fmt.Errorf("cannot approve a %s leave request", lr.Status)
	}
	if err := s.leaveRepo.UpdateStatus(id, "approved", approverID); err != nil {
		return nil, fmt.Errorf("approve leave: %w", err)
	}

	if lr.EmployeeID != "" {
		emp, empErr := s.empRepo.FindByID(lr.EmployeeID)
		notifierID := lr.EmployeeID
		if empErr == nil && emp != nil && emp.UserID != nil {
			notifierID = *emp.UserID
		}
		link := "/leave"
		s.notifService.CreateNotification(notifierID, "Leave Approved", fmt.Sprintf("Your %s leave request has been approved.", lr.LeaveType), "success", &link)
	}

	return lr, nil
}

func (s *HRService) RejectLeave(id, approverID, reason string) (*models.LeaveRequest, error) {
	lr, err := s.leaveRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if lr == nil {
		return nil, ErrNotFound
	}
	if lr.Status != "pending" {
		return nil, fmt.Errorf("cannot reject a %s leave request", lr.Status)
	}
	if err := s.leaveRepo.RejectWithReason(id, approverID, reason); err != nil {
		return nil, fmt.Errorf("reject leave: %w", err)
	}

	if lr.EmployeeID != "" {
		emp, empErr := s.empRepo.FindByID(lr.EmployeeID)
		notifierID := lr.EmployeeID
		if empErr == nil && emp != nil && emp.UserID != nil {
			notifierID = *emp.UserID
		}
		link := "/leave"
		s.notifService.CreateNotification(notifierID, "Leave Rejected", fmt.Sprintf("Your %s leave request has been rejected.", lr.LeaveType), "warning", &link)
	}

	return lr, nil
}

func (s *HRService) GetPayrollRecords(employeeID, status string, page, pageSize int) ([]models.PayrollRecord, int64, error) {
	return s.payrollRepo.FindAll(employeeID, status, page, pageSize)
}

func (s *HRService) GetPayrollRecord(id string) (*models.PayrollRecord, error) {
	pr, err := s.payrollRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if pr == nil {
		return nil, ErrNotFound
	}
	return pr, nil
}

func (s *HRService) CreatePayroll(req *models.CreatePayrollRequest) (*models.PayrollRecord, error) {
	if err := s.payrollRepo.Create(req); err != nil {
		return nil, err
	}

	records, _, err := s.payrollRepo.FindAll(req.EmployeeID, "", 1, 5)
	if err != nil {
		return nil, fmt.Errorf("create payroll: %w", err)
	}
	if len(records) == 0 {
		return nil, fmt.Errorf("payroll record created but not found")
	}
	return &records[len(records)-1], nil
}

func (s *HRService) UpdatePayroll(id string, req *models.UpdatePayrollRequest) (*models.PayrollRecord, error) {
	if err := s.payrollRepo.Update(req, id); err != nil {
		return nil, err
	}

	pr, err := s.payrollRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if pr == nil {
		return nil, ErrNotFound
	}
	return pr, nil
}

func (s *HRService) GetEmployeeDocuments(employeeID, docType string, page, pageSize int) ([]models.EmployeeDocument, int64, error) {
	return s.docRepo.FindAll(employeeID, docType, page, pageSize)
}

func (s *HRService) GetEmployeeDocument(id string) (*models.EmployeeDocument, error) {
	d, err := s.docRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if d == nil {
		return nil, ErrNotFound
	}
	return d, nil
}

func (s *HRService) CreateEmployeeDocument(employeeID string, req *models.CreateEmployeeDocumentRequest) (*models.EmployeeDocument, error) {
	if err := s.docRepo.Create(req, employeeID); err != nil {
		return nil, err
	}

	d, err := s.docRepo.FindByEmployeeID(employeeID)
	if err != nil {
		return nil, fmt.Errorf("find created document: %w", err)
	}
	if len(d) == 0 {
		return nil, fmt.Errorf("document created but not found")
	}
	return &d[len(d)-1], nil
}

func (s *HRService) DeleteEmployeeDocument(id string) error {
	return s.docRepo.Delete(id)
}

func (s *HRService) FindEmployeeByUserID(userID string) (*models.Employee, error) {
	e, err := s.empRepo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}
	if e == nil {
		return nil, ErrNotFound
	}
	return e, nil
}

func (s *HRService) FindEmployeeByReportingTo(managerID string) ([]models.Employee, error) {
	return s.empRepo.FindByReportingTo(managerID)
}

func (s *HRService) FindEmployeeByDepartmentID(deptID string) ([]models.Employee, error) {
	return s.empRepo.FindByDepartmentID(deptID)
}

func parseDate(s string) (*time.Time, error) {
	t, err := time.Parse("2006-01-02", s)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func timeNow() time.Time {
	return time.Now()
}

func (s *HRService) GetLeaveBalance(employeeID string) ([]map[string]interface{}, error) {
	leaves, _, dbErr := s.leaveRepo.FindAll(employeeID, "approved", "", 1, 1000)
	if dbErr != nil {
		return nil, dbErr
	}

	type balance struct {
		Total float64
		Used  float64
	}

	var annualDefault, sickDefault, personalDefault float64 = 20, 10, 5
	if s.configProvider != nil {
		a, si, p := s.configProvider.GetLeaveBalanceDefaults()
		if a > 0 {
			annualDefault = a
		}
		if si > 0 {
			sickDefault = si
		}
		if p > 0 {
			personalDefault = p
		}
	}

	balances := map[string]*balance{
		"annual":   {Total: annualDefault},
		"sick":     {Total: sickDefault},
		"personal": {Total: personalDefault},
	}

	for _, l := range leaves {
		if b, ok := balances[l.LeaveType]; ok {
			b.Used += l.DurationDays
		}
	}

	var result []map[string]interface{}
	types := []string{"annual", "sick", "personal", "unpaid"}
	labels := map[string]string{"annual": "Annual Leave", "sick": "Sick Leave", "personal": "Personal Leave", "unpaid": "Unpaid Leave"}
	for _, t := range types {
		var total, used float64
		if b, ok := balances[t]; ok && b != nil {
			total = b.Total
			used = b.Used
		}
		remaining := total - used
		if remaining < 0 {
			remaining = 0
		}
		result = append(result, map[string]interface{}{
			"type":      t,
			"label":     labels[t],
			"total":     total,
			"used":      used,
			"remaining": remaining,
		})
	}
	return result, nil
}

func (s *HRService) GetMyLoans(employeeID string, page, pageSize int) ([]models.LoanRequest, int64, error) {
	return s.loanRepo.FindByEmployeeID(employeeID, page, pageSize)
}

func (s *HRService) GetAllLoans(status string, page, pageSize int) ([]models.LoanRequest, int64, error) {
	return s.loanRepo.FindAll(status, page, pageSize)
}

func (s *HRService) CreateLoan(employeeID string, req *models.CreateLoanRequest) (*models.LoanRequest, error) {
	return s.loanRepo.Create(employeeID, req)
}

func (s *HRService) UpdateLoanStatus(id, status, approverID string) (*models.LoanRequest, error) {
	loan, err := s.loanRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if loan == nil {
		return nil, ErrNotFound
	}
	if loan.Status != "pending" {
		return nil, fmt.Errorf("cannot update a %s loan request", loan.Status)
	}
	if err := s.loanRepo.UpdateStatus(id, status, approverID); err != nil {
		return nil, err
	}
	return s.loanRepo.FindByID(id)
}

func (s *HRService) GetDeductions(employeeID, status, deductionType, month string, page, pageSize int) ([]models.Deduction, int64, error) {
	return s.deductionRepo.FindAll(employeeID, status, deductionType, month, page, pageSize)
}

func (s *HRService) CreateDeduction(req *models.CreateDeductionRequest, createdBy string) error {
	return s.deductionRepo.Create(req, createdBy)
}

func (s *HRService) UpdateDeduction(id string, req *models.UpdateDeductionRequest) error {
	return s.deductionRepo.Update(req, id)
}

func (s *HRService) DeleteDeduction(id string) error {
	return s.deductionRepo.Delete(id)
}

func (s *HRService) GetRequests(employeeID, status, requestType string, page, pageSize int) ([]models.Request, int64, error) {
	return s.requestRepo.FindAll(employeeID, status, requestType, page, pageSize)
}

func (s *HRService) CreateRequest(req *models.CreateRequest) error {
	return s.requestRepo.Create(req)
}

func (s *HRService) ApproveRequest(id, reviewedBy string) (*models.Request, error) {
	req, err := s.requestRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if req == nil {
		return nil, ErrNotFound
	}
	if req.Status != "pending" {
		return nil, fmt.Errorf("cannot approve a %s request", req.Status)
	}
	if err := s.requestRepo.UpdateStatus(id, "approved", reviewedBy); err != nil {
		return nil, err
	}
	return s.requestRepo.FindByID(id)
}

func (s *HRService) RejectRequest(id, reviewedBy, reason string) (*models.Request, error) {
	req, err := s.requestRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if req == nil {
		return nil, ErrNotFound
	}
	if req.Status != "pending" {
		return nil, fmt.Errorf("cannot reject a %s request", req.Status)
	}
	if err := s.requestRepo.UpdateStatusWithReason(id, "rejected", reviewedBy, reason); err != nil {
		return nil, err
	}
	return s.requestRepo.FindByID(id)
}
