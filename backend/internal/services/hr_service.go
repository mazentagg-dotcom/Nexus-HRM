package services

import (
	"fmt"
	"time"

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

type NotifService interface {
	CreateNotification(userID, title, message, ntype string, link *string) (*models.Notification, error)
}

type HRService struct {
	deptRepo     DepartmentRepo
	empRepo      EmployeeRepo
	attRepo      AttendanceRepo
	leaveRepo    LeaveRequestRepo
	payrollRepo  PayrollRepo
	docRepo      DocumentRepo
	notifService NotifService
	loanRepo     LoanRepo
}

func NewHRService(dept DepartmentRepo, emp EmployeeRepo, att AttendanceRepo, leave LeaveRequestRepo, payroll PayrollRepo, doc DocumentRepo, notif NotifService, loan LoanRepo) *HRService {
	return &HRService{
		deptRepo:     dept,
		empRepo:      emp,
		attRepo:      att,
		leaveRepo:    leave,
		payrollRepo:  payroll,
		docRepo:      doc,
		notifService: notif,
		loanRepo:     loan,
	}
}

func (s *HRService) GetDashboard() (map[string]interface{}, error) {
	totalEmp, _ := s.empRepo.Count("")
	activeEmp, _ := s.empRepo.Count("active")
	totalDepts, _ := s.deptRepo.Count()
	pendingLeaves, _ := s.leaveRepo.CountByStatus("pending")

	return map[string]interface{}{
		"total_employees":   totalEmp,
		"active_employees":  activeEmp,
		"total_departments": totalDepts,
		"pending_leaves":    pendingLeaves,
		"monthly_payroll":   0,
		"attendance_rate":   94.2,
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
	d.ParentID = req.ParentID
	d.ManagerID = req.ManagerID
	d.Description = req.Description
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

	if req.DateOfBirth != nil {
		dob := *req.DateOfBirth
		t, _ := parseDate(dob)
		e.DateOfBirth = t
	}

	if req.HireDate != "" {
		t, _ := parseDate(req.HireDate)
		e.HireDate = *t
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
	lr := &models.LeaveRequest{
		EmployeeID:   req.EmployeeID,
		LeaveType:    req.LeaveType,
		StartDate:    timeNow(),
		EndDate:      timeNow(),
		DurationDays: req.DurationDays,
		Reason:       req.Reason,
		Status:       "pending",
	}

	if req.StartDate != "" {
		t, _ := parseDate(req.StartDate)
		if t != nil {
			lr.StartDate = *t
		}
	}
	if req.EndDate != "" {
		t, _ := parseDate(req.EndDate)
		if t != nil {
			lr.EndDate = *t
		}
	}

	if err := s.leaveRepo.Create(lr); err != nil {
		return nil, err
	}

	return lr, nil
}

func (s *HRService) ApproveLeave(id, approverID string) (*models.LeaveRequest, error) {
	if err := s.leaveRepo.UpdateStatus(id, "approved", approverID); err != nil {
		return nil, fmt.Errorf("approve leave: %w", err)
	}

	lr, err := s.leaveRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if lr != nil && lr.EmployeeID != "" {
		link := "/leave"
		s.notifService.CreateNotification(lr.EmployeeID, "Leave Approved", fmt.Sprintf("Your %s leave request has been approved.", lr.LeaveType), "success", &link)
	}

	return lr, nil
}

func (s *HRService) RejectLeave(id, approverID, reason string) (*models.LeaveRequest, error) {
	if err := s.leaveRepo.UpdateStatus(id, "rejected", approverID); err != nil {
		return nil, fmt.Errorf("reject leave: %w", err)
	}

	lr, err := s.leaveRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if lr != nil && lr.EmployeeID != "" {
		link := "/leave"
		s.notifService.CreateNotification(lr.EmployeeID, "Leave Rejected", fmt.Sprintf("Your %s leave request has been rejected.", lr.LeaveType), "warning", &link)
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

	records, _, err := s.payrollRepo.FindAll(req.EmployeeID, "", 1, 1)
	if err != nil || len(records) == 0 {
		return nil, err
	}

	return &records[0], nil
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
	if err != nil || len(d) == 0 {
		return nil, err
	}

	return &d[0], nil
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
	leaves, _, err := s.leaveRepo.FindAll(employeeID, "", "", 1, 1000)
	if err != nil {
		return nil, err
	}

	type balance struct {
		Total float64
		Used  float64
	}
	balances := map[string]*balance{
		"annual":   {Total: 20},
		"sick":     {Total: 10},
		"personal": {Total: 5},
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
		b := balances[t]
		remaining := b.Total - b.Used
		if remaining < 0 {
			remaining = 0
		}
		result = append(result, map[string]interface{}{
			"type":      t,
			"label":     labels[t],
			"total":     b.Total,
			"used":      b.Used,
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
	if err := s.loanRepo.UpdateStatus(id, status, approverID); err != nil {
		return nil, err
	}
	return s.loanRepo.FindByID(id)
}
