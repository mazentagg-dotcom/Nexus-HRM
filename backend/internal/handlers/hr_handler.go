package handlers

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"

	"nexus-hrm/internal/models"
	"nexus-hrm/internal/services"
	"nexus-hrm/internal/utils"
)

type HRHandler struct {
	service *services.HRService
	db      *sql.DB
}

func NewHRHandler(s *services.HRService, db *sql.DB) *HRHandler {
	return &HRHandler{service: s, db: db}
}

func (h *HRHandler) GetDashboard(c *gin.Context) {
	data, err := h.service.GetDashboard()
	if err != nil {
		utils.InternalError(c, "Failed to load dashboard")
		return
	}
	utils.Success(c, data)
}

func (h *HRHandler) GetDepartments(c *gin.Context) {
	p := utils.GetPagination(c)
	search := c.Query("search")

	departments, total, err := h.service.GetDepartments(search, p.Page, p.PageSize)
	if err != nil {
		utils.InternalError(c, "Failed to load departments")
		return
	}
	utils.Paginated(c, departments, total, p)
}

func (h *HRHandler) GetDepartment(c *gin.Context) {
	id := c.Param("id")
	dept, err := h.service.GetDepartment(id)
	if err != nil {
		utils.InternalError(c, "Failed to load department")
		return
	}
	if dept == nil {
		utils.NotFound(c, "Department not found")
		return
	}
	utils.Success(c, dept)
}

func (h *HRHandler) CreateDepartment(c *gin.Context) {
	var req models.CreateDepartmentRequest
	if !utils.BindAndValidate(c, &req) {
		return
	}

	dept, err := h.service.CreateDepartment(&req)
	if err != nil {
		utils.Error(c, http.StatusConflict, "Conflict", err.Error())
		return
	}
	utils.Created(c, dept)
}

func (h *HRHandler) UpdateDepartment(c *gin.Context) {
	id := c.Param("id")
	var req models.UpdateDepartmentRequest
	if !utils.BindAndValidate(c, &req) {
		return
	}

	dept, err := h.service.UpdateDepartment(id, &req)
	if err != nil {
		if err == services.ErrNotFound {
			utils.NotFound(c, "Department not found")
			return
		}
		utils.InternalError(c, "Failed to update department")
		return
	}
	utils.Success(c, dept)
}

func (h *HRHandler) DeleteDepartment(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteDepartment(id); err != nil {
		utils.InternalError(c, "Failed to delete department")
		return
	}
	utils.NoContent(c)
}

func (h *HRHandler) GetEmployees(c *gin.Context) {
	p := utils.GetPagination(c)
	search := c.Query("search")
	department := c.Query("department")
	status := c.DefaultQuery("status", "active")

	employees, total, err := h.service.GetEmployees(search, department, status, p.Page, p.PageSize)
	if err != nil {
		utils.InternalError(c, "Failed to load employees")
		return
	}
	utils.Paginated(c, employees, total, p)
}

func (h *HRHandler) GetEmployee(c *gin.Context) {
	id := c.Param("id")
	emp, err := h.service.GetEmployee(id)
	if err != nil {
		utils.InternalError(c, "Failed to load employee")
		return
	}
	if emp == nil {
		utils.NotFound(c, "Employee not found")
		return
	}
	utils.Success(c, emp)
}

func (h *HRHandler) CreateEmployee(c *gin.Context) {
	var req models.CreateEmployeeRequest
	if !utils.BindAndValidate(c, &req) {
		return
	}

	emp, err := h.service.CreateEmployee(&req)
	if err != nil {
		utils.Error(c, http.StatusConflict, "Conflict", err.Error())
		return
	}
	utils.Created(c, emp)
}

func (h *HRHandler) UpdateEmployee(c *gin.Context) {
	id := c.Param("id")
	var req models.UpdateEmployeeRequest
	if !utils.BindAndValidate(c, &req) {
		return
	}

	emp, err := h.service.UpdateEmployee(id, &req)
	if err != nil {
		if err == services.ErrNotFound {
			utils.NotFound(c, "Employee not found")
			return
		}
		utils.InternalError(c, "Failed to update employee")
		return
	}
	utils.Success(c, emp)
}

func (h *HRHandler) GetAttendance(c *gin.Context) {
	p := utils.GetPagination(c)
	employeeID := c.Query("employee_id")
	dateFrom := c.Query("date_from")
	dateTo := c.Query("date_to")
	status := c.Query("status")

	records, total, err := h.service.GetAttendance(employeeID, dateFrom, dateTo, status, p.Page, p.PageSize)
	if err != nil {
		utils.InternalError(c, "Failed to load attendance")
		return
	}
	utils.Paginated(c, records, total, p)
}

func (h *HRHandler) CheckIn(c *gin.Context) {
	userID := c.GetString("user_id")
	emp, err := h.service.FindEmployeeByUserID(userID)
	if err != nil {
		utils.BadRequest(c, "No employee profile found for your account")
		return
	}
	if emp == nil {
		utils.BadRequest(c, "No employee profile found for your account")
		return
	}

	record, err := h.service.CheckIn(emp.ID)
	if err != nil {
		utils.InternalError(c, "Check-in failed")
		return
	}
	utils.Success(c, record)
}

func (h *HRHandler) CheckOut(c *gin.Context) {
	userID := c.GetString("user_id")
	emp, err := h.service.FindEmployeeByUserID(userID)
	if err != nil || emp == nil {
		utils.BadRequest(c, "No employee profile found for your account")
		return
	}

	record, err := h.service.CheckOut(emp.ID)
	if err != nil {
		utils.InternalError(c, "Check-out failed")
		return
	}
	utils.Success(c, record)
}

func (h *HRHandler) GetLeaveRequests(c *gin.Context) {
	p := utils.GetPagination(c)
	employeeID := c.Query("employee_id")
	status := c.Query("status")
	leaveType := c.Query("leave_type")

	leaves, total, err := h.service.GetLeaveRequests(employeeID, status, leaveType, p.Page, p.PageSize)
	if err != nil {
		utils.InternalError(c, "Failed to load leave requests")
		return
	}
	utils.Paginated(c, leaves, total, p)
}

func (h *HRHandler) CreateLeaveRequest(c *gin.Context) {
	var req models.CreateLeaveRequest
	if !utils.BindAndValidate(c, &req) {
		return
	}

	lr, err := h.service.CreateLeaveRequest(&req)
	if err != nil {
		utils.Error(c, http.StatusConflict, "Conflict", err.Error())
		return
	}
	utils.Created(c, lr)
}

func (h *HRHandler) ApproveLeave(c *gin.Context) {
	id := c.Param("id")
	userID := c.GetString("user_id")

	lr, err := h.service.ApproveLeave(id, userID)
	if err != nil {
		utils.InternalError(c, "Failed to approve leave request")
		return
	}
	utils.Success(c, lr)
}

func (h *HRHandler) RejectLeave(c *gin.Context) {
	id := c.Param("id")
	userID := c.GetString("user_id")

	var req struct {
		Reason string `json:"reason"`
	}
	if !utils.BindAndValidate(c, &req) {
		return
	}

	lr, err := h.service.RejectLeave(id, userID, req.Reason)
	if err != nil {
		utils.InternalError(c, "Failed to reject leave request")
		return
	}
	utils.Success(c, lr)
}

func (h *HRHandler) GetPayrollRecords(c *gin.Context) {
	p := utils.GetPagination(c)
	employeeID := c.Query("employee_id")
	status := c.Query("status")

	records, total, err := h.service.GetPayrollRecords(employeeID, status, p.Page, p.PageSize)
	if err != nil {
		utils.InternalError(c, "Failed to load payroll records")
		return
	}
	utils.Paginated(c, records, total, p)
}

func (h *HRHandler) GetPayrollRecord(c *gin.Context) {
	id := c.Param("id")
	record, err := h.service.GetPayrollRecord(id)
	if err != nil {
		utils.InternalError(c, "Failed to load payroll record")
		return
	}
	if record == nil {
		utils.NotFound(c, "Payroll record not found")
		return
	}
	utils.Success(c, record)
}

func (h *HRHandler) CreatePayrollRecord(c *gin.Context) {
	var req models.CreatePayrollRequest
	if !utils.BindAndValidate(c, &req) {
		return
	}

	record, err := h.service.CreatePayroll(&req)
	if err != nil {
		utils.Error(c, http.StatusConflict, "Conflict", err.Error())
		return
	}
	utils.Created(c, record)
}

func (h *HRHandler) UpdatePayrollRecord(c *gin.Context) {
	id := c.Param("id")
	var req models.UpdatePayrollRequest
	if !utils.BindAndValidate(c, &req) {
		return
	}

	record, err := h.service.UpdatePayroll(id, &req)
	if err != nil {
		if err == services.ErrNotFound {
			utils.NotFound(c, "Payroll record not found")
			return
		}
		utils.InternalError(c, "Failed to update payroll record")
		return
	}
	utils.Success(c, record)
}

func (h *HRHandler) GetEmployeeDocuments(c *gin.Context) {
	p := utils.GetPagination(c)
	employeeID := c.Query("employee_id")
	docType := c.Query("type")

	docs, total, err := h.service.GetEmployeeDocuments(employeeID, docType, p.Page, p.PageSize)
	if err != nil {
		utils.InternalError(c, "Failed to load documents")
		return
	}
	utils.Paginated(c, docs, total, p)
}

func (h *HRHandler) GetEmployeeDocument(c *gin.Context) {
	id := c.Param("id")
	doc, err := h.service.GetEmployeeDocument(id)
	if err != nil {
		utils.InternalError(c, "Failed to load document")
		return
	}
	if doc == nil {
		utils.NotFound(c, "Document not found")
		return
	}
	utils.Success(c, doc)
}

func (h *HRHandler) CreateEmployeeDocument(c *gin.Context) {
	employeeID := c.Param("employee_id")
	if employeeID == "" {
		employeeID = c.Query("employee_id")
	}
	if employeeID == "" {
		utils.BadRequest(c, "Employee ID is required")
		return
	}

	var req models.CreateEmployeeDocumentRequest
	if !utils.BindAndValidate(c, &req) {
		return
	}

	doc, err := h.service.CreateEmployeeDocument(employeeID, &req)
	if err != nil {
		utils.Error(c, http.StatusConflict, "Conflict", err.Error())
		return
	}
	utils.Created(c, doc)
}

func (h *HRHandler) DeleteEmployeeDocument(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteEmployeeDocument(id); err != nil {
		utils.InternalError(c, "Failed to delete document")
		return
	}
	utils.NoContent(c)
}

func (h *HRHandler) GetOrgChart(c *gin.Context) {
	departments, _, err := h.service.GetDepartments("", 1, 100)
	if err != nil {
		utils.InternalError(c, "Failed to load org chart data")
		return
	}

	type TreeNode struct {
		ID       string     `json:"id"`
		Name     string     `json:"name"`
		Code     string     `json:"code"`
		ParentID *string    `json:"parent_id"`
		Children []TreeNode `json:"children"`
	}

	nodeMap := make(map[string]*TreeNode)
	roots := []TreeNode{}

	for _, d := range departments {
		node := &TreeNode{
			ID:       d.ID,
			Name:     d.Name,
			Code:     d.Code,
			ParentID: d.ParentID,
			Children: []TreeNode{},
		}
		nodeMap[d.ID] = node
	}

	for _, node := range nodeMap {
		if node.ParentID != nil {
			if parent, ok := nodeMap[*node.ParentID]; ok {
				parent.Children = append(parent.Children, *node)
			} else {
				roots = append(roots, *node)
			}
		} else {
			roots = append(roots, *node)
		}
	}

	utils.Success(c, roots)
}

func (h *HRHandler) GetEmployeesByDepartment(c *gin.Context) {
	deptID := c.Param("id")
	employees, err := h.service.FindEmployeeByDepartmentID(deptID)
	if err != nil {
		utils.InternalError(c, "Failed to load department employees")
		return
	}
	utils.Success(c, employees)
}

func (h *HRHandler) GetEmployeesByManager(c *gin.Context) {
	managerID := c.Param("id")
	employees, err := h.service.FindEmployeeByReportingTo(managerID)
	if err != nil {
		utils.InternalError(c, "Failed to load team members")
		return
	}
	utils.Success(c, employees)
}
