package handlers

import (
	"strconv"

	"github.com/gin-gonic/gin"

	"nexus-hrm/internal/models"
	"nexus-hrm/internal/services"
	"nexus-hrm/internal/utils"
)

type SystemConfigHandler struct {
	service *services.SystemConfigService
}

func NewSystemConfigHandler(s *services.SystemConfigService) *SystemConfigHandler {
	return &SystemConfigHandler{service: s}
}

func (h *SystemConfigHandler) GetConfig(c *gin.Context) {
	cfg, err := h.service.GetConfig()
	if err != nil {
		utils.InternalError(c, "Failed to load system configuration")
		return
	}
	utils.Success(c, cfg)
}

func (h *SystemConfigHandler) UpdateConfig(c *gin.Context) {
	var req models.UpdateSystemConfigRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Invalid request body")
		return
	}

	existing, err := h.service.GetConfig()
	if err != nil {
		utils.InternalError(c, "Failed to load current configuration")
		return
	}

	if req.WorkingHoursPerDay != nil {
		existing.WorkingHoursPerDay = *req.WorkingHoursPerDay
	}
	if req.WorkingDaysPerMonth != nil {
		existing.WorkingDaysPerMonth = *req.WorkingDaysPerMonth
	}
	if req.GracePeriodMinutes != nil {
		existing.GracePeriodMinutes = *req.GracePeriodMinutes
	}
	if req.StandardStartTime != nil {
		existing.StandardStartTime = *req.StandardStartTime
	}
	if req.StandardEndTime != nil {
		existing.StandardEndTime = *req.StandardEndTime
	}
	if req.WeekendDays != nil {
		existing.WeekendDays = *req.WeekendDays
	}
	if req.AbsenceMode != nil {
		existing.AbsenceMode = *req.AbsenceMode
	}
	if req.FixedAbsenceAmount != nil {
		existing.FixedAbsenceAmount = *req.FixedAbsenceAmount
	}
	if req.ProgressiveAbsenceAmounts != nil {
		existing.ProgressiveAbsenceAmounts = *req.ProgressiveAbsenceAmounts
	}
	if req.EnableLateDeduction != nil {
		existing.EnableLateDeduction = *req.EnableLateDeduction
	}
	if req.LateThresholdHours != nil {
		existing.LateThresholdHours = *req.LateThresholdHours
	}
	if req.LateDeductionType != nil {
		existing.LateDeductionType = *req.LateDeductionType
	}
	if req.LateDeductionFraction != nil {
		existing.LateDeductionFraction = *req.LateDeductionFraction
	}
	if req.LateFixedAmount != nil {
		existing.LateFixedAmount = *req.LateFixedAmount
	}
	if req.PayrollFrequency != nil {
		existing.PayrollFrequency = *req.PayrollFrequency
	}
	if req.DefaultPayrollDay != nil {
		existing.DefaultPayrollDay = *req.DefaultPayrollDay
	}
	if req.AutoGeneratePayslip != nil {
		existing.AutoGeneratePayslip = *req.AutoGeneratePayslip
	}
	if req.AllowNegativeSalary != nil {
		existing.AllowNegativeSalary = *req.AllowNegativeSalary
	}
	if req.OvertimeEnabled != nil {
		existing.OvertimeEnabled = *req.OvertimeEnabled
	}
	if req.OvertimeRateMultiplier != nil {
		existing.OvertimeRateMultiplier = *req.OvertimeRateMultiplier
	}
	if req.AnnualTaxBulkAmount != nil {
		existing.AnnualTaxBulkAmount = *req.AnnualTaxBulkAmount
	}
	if req.AnnualInsuranceBulkAmount != nil {
		existing.AnnualInsuranceBulkAmount = *req.AnnualInsuranceBulkAmount
	}
	if req.MedicalInsuranceEnabled != nil {
		existing.MedicalInsuranceEnabled = *req.MedicalInsuranceEnabled
	}
	if req.MedicalDeductionType != nil {
		existing.MedicalDeductionType = *req.MedicalDeductionType
	}
	if req.MedicalFixedMonthlyAmount != nil {
		existing.MedicalFixedMonthlyAmount = *req.MedicalFixedMonthlyAmount
	}
	if req.MedicalPercentageRate != nil {
		existing.MedicalPercentageRate = *req.MedicalPercentageRate
	}
	if req.MedicalApplyTo != nil {
		existing.MedicalApplyTo = *req.MedicalApplyTo
	}
	if req.LoanEnabled != nil {
		existing.LoanEnabled = *req.LoanEnabled
	}
	if req.LoanDefaultBehavior != nil {
		existing.LoanDefaultBehavior = *req.LoanDefaultBehavior
	}
	if req.LoanAutoDeduct != nil {
		existing.LoanAutoDeduct = *req.LoanAutoDeduct
	}

	if err := h.service.UpdateConfig(existing); err != nil {
		utils.InternalError(c, "Failed to update system configuration")
		return
	}
	utils.Success(c, existing)
}

func (h *SystemConfigHandler) GetBranches(c *gin.Context) {
	branches, err := h.service.GetBranches()
	if err != nil {
		utils.InternalError(c, "Failed to load branches")
		return
	}
	if branches == nil {
		branches = []models.CompanyBranch{}
	}
	utils.Success(c, branches)
}

func (h *SystemConfigHandler) CreateBranch(c *gin.Context) {
	var req models.CreateBranchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Invalid request body")
		return
	}
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}
	branch, err := h.service.CreateBranch(req.Name, isActive)
	if err != nil {
		utils.InternalError(c, "Failed to create branch")
		return
	}
	utils.Created(c, branch)
}

func (h *SystemConfigHandler) UpdateBranch(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		utils.BadRequest(c, "Invalid branch ID")
		return
	}
	var req models.CreateBranchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Invalid request body")
		return
	}
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}
	if err := h.service.UpdateBranch(id, req.Name, isActive); err != nil {
		utils.InternalError(c, "Failed to update branch")
		return
	}
	utils.Success(c, gin.H{"id": id})
}

func (h *SystemConfigHandler) DeleteBranch(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		utils.BadRequest(c, "Invalid branch ID")
		return
	}
	if err := h.service.DeleteBranch(id); err != nil {
		utils.InternalError(c, "Failed to delete branch")
		return
	}
	utils.Success(c, gin.H{"deleted": true})
}
