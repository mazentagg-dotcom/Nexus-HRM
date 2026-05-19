package routes

import (
	"database/sql"

	"nexus-hrm/internal/config"
	"nexus-hrm/internal/handlers"
	"nexus-hrm/internal/middleware"
	"nexus-hrm/internal/repositories"
	"nexus-hrm/internal/services"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, db *sql.DB, cfg *config.Config) {
	r.GET("/health", handlers.NewHealthHandler(db).CheckHealth)

	userRepo := repositories.NewUserRepository(db)
	roleRepo := repositories.NewRoleRepository(db)
	deptRepo := repositories.NewDepartmentRepository(db)
	empRepo := repositories.NewEmployeeRepository(db)
	attRepo := repositories.NewAttendanceRepository(db)
	leaveRepo := repositories.NewLeaveRequestRepository(db)
	payrollRepo := repositories.NewPayrollRepository(db)
	docRepo := repositories.NewEmployeeDocumentRepository(db)
	notifRepo := repositories.NewNotificationRepository(db)
	loanRepo := repositories.NewLoanRepository(db)
	deductionRepo := repositories.NewDeductionRepository(db)
	requestRepo := repositories.NewRequestRepository(db)
	configRepo := repositories.NewSystemConfigRepository(db)
	branchRepo := repositories.NewBranchRepository(db)

	configSvc := services.NewSystemConfigService(configRepo, branchRepo)
	authSvc := services.NewAuthService(userRepo, roleRepo, cfg.JWTSecret, cfg.JWTExpiry)
	userSvc := services.NewUserService(userRepo)
	roleSvc := services.NewRoleService(roleRepo)
	notifSvc := services.NewNotificationService(notifRepo)
	hrSvc := services.NewHRService(deptRepo, empRepo, attRepo, leaveRepo, payrollRepo, docRepo, notifSvc, loanRepo, deductionRepo, requestRepo, configSvc)

	authHandler := handlers.NewAuthHandler(authSvc)
	userHandler := handlers.NewUserHandler(userSvc)
	roleHandler := handlers.NewRoleHandler(roleSvc)
	notifHandler := handlers.NewNotificationsHandler(notifSvc)
	hrHandler := handlers.NewHRHandler(hrSvc, db)
	configHandler := handlers.NewSystemConfigHandler(configSvc)

	auth := r.Group("/api/v1/auth")
	{
		auth.POST("/login", authHandler.Login)
		auth.POST("/register", authHandler.Register)
	}

	api := r.Group("/api/v1")
	api.Use(middleware.AuthMiddleware(cfg.JWTSecret))
	{
		authP := api.Group("/auth")
		{
			authP.GET("/me", authHandler.GetMe)
			authP.PUT("/change-password", authHandler.ChangePassword)
		}

		me := api.Group("/me")
		{
			me.GET("/employee", hrHandler.GetMyEmployee)
			me.GET("/leave-requests", hrHandler.GetMyLeaveRequests)
			me.POST("/leave-requests", hrHandler.CreateMyLeaveRequest)
			me.GET("/leave-balance", hrHandler.GetMyLeaveBalance)
			me.GET("/payroll", hrHandler.GetMyPayroll)
			me.GET("/attendance", hrHandler.GetMyAttendance)
			me.POST("/attendance/check-in", hrHandler.CheckIn)
			me.POST("/attendance/check-out", hrHandler.CheckOut)
			me.GET("/loans", hrHandler.GetMyLoans)
			me.POST("/loans", hrHandler.CreateMyLoan)
			me.GET("/requests", hrHandler.GetMyRequests)
			me.POST("/requests", hrHandler.CreateMyRequest)
			me.GET("/documents", hrHandler.GetMyDocuments)
		}

		users := api.Group("/users")
		users.Use(middleware.RequirePermission("users.view"))
		{
			users.GET("", userHandler.GetUsers)
			users.GET("/:id", userHandler.GetUser)
			users.POST("", middleware.RequirePermission("users.create"), userHandler.CreateUser)
			users.PUT("/:id", middleware.RequirePermission("users.edit"), userHandler.UpdateUser)
			users.PATCH("/:id/deactivate", middleware.RequirePermission("users.deactivate"), userHandler.DeactivateUser)
		}

		roles := api.Group("/roles")
		roles.Use(middleware.RequirePermission("users.view"))
		{
			roles.GET("", roleHandler.GetRoles)
			roles.GET("/:id", roleHandler.GetRole)
			roles.POST("", middleware.RequirePermission("users.create"), roleHandler.CreateRole)
			roles.PUT("/:id", middleware.RequirePermission("users.edit"), roleHandler.UpdateRole)
			roles.DELETE("/:id", middleware.RequirePermission("users.delete"), roleHandler.DeleteRole)
		}

		notifications := api.Group("/notifications")
		{
			notifications.GET("", notifHandler.GetNotifications)
			notifications.GET("/dashboard", notifHandler.GetDashboard)
			notifications.GET("/unread-count", notifHandler.GetUnreadCount)
			notifications.GET("/:id", notifHandler.GetNotification)
			notifications.PUT("/:id/read", notifHandler.MarkRead)
			notifications.PUT("/read-all", notifHandler.MarkAllRead)
			notifications.DELETE("/:id", notifHandler.DeleteNotification)
		}

		hr := api.Group("/hr")
		hr.Use(middleware.RequirePermission("hr.view"))
		{
			hr.GET("/dashboard", hrHandler.GetDashboard)
			hr.GET("/org/chart", hrHandler.GetOrgChart)
			hr.GET("/departments", hrHandler.GetDepartments)
			hr.GET("/departments/:id/employees", hrHandler.GetEmployeesByDepartment)
			hr.GET("/departments/:id", hrHandler.GetDepartment)
			hr.POST("/departments", middleware.RequirePermission("hr.create"), hrHandler.CreateDepartment)
			hr.PUT("/departments/:id", middleware.RequirePermission("hr.edit"), hrHandler.UpdateDepartment)
			hr.DELETE("/departments/:id", middleware.RequirePermission("hr.delete"), hrHandler.DeleteDepartment)
			hr.GET("/employees", hrHandler.GetEmployees)
			hr.GET("/employees/:id", hrHandler.GetEmployee)
			hr.POST("/employees", middleware.RequirePermission("hr.create"), hrHandler.CreateEmployee)
			hr.PUT("/employees/:id", middleware.RequirePermission("hr.edit"), hrHandler.UpdateEmployee)
			hr.GET("/attendance", hrHandler.GetAttendance)
			hr.POST("/attendance/check-in", hrHandler.CheckIn)
			hr.POST("/attendance/check-out", hrHandler.CheckOut)
			hr.GET("/leave-requests", hrHandler.GetLeaveRequests)
			hr.POST("/leave-requests", middleware.RequirePermission("hr.create"), hrHandler.CreateLeaveRequest)
			hr.PUT("/leave-requests/:id/approve", hrHandler.ApproveLeave)
			hr.PUT("/leave-requests/:id/reject", hrHandler.RejectLeave)
			hr.GET("/payroll", hrHandler.GetPayrollRecords)
			hr.GET("/payroll/:id", hrHandler.GetPayrollRecord)
			hr.POST("/payroll", middleware.RequirePermission("hr.create"), hrHandler.CreatePayrollRecord)
			hr.PUT("/payroll/:id", middleware.RequirePermission("hr.edit"), hrHandler.UpdatePayrollRecord)
			hr.GET("/documents", hrHandler.GetEmployeeDocuments)
			hr.GET("/documents/:id", hrHandler.GetEmployeeDocument)
			hr.POST("/documents", middleware.RequirePermission("hr.create"), hrHandler.CreateEmployeeDocument)
			hr.DELETE("/documents/:id", middleware.RequirePermission("hr.delete"), hrHandler.DeleteEmployeeDocument)
			hr.GET("/loans", hrHandler.GetAllLoans)
			hr.PUT("/loans/:id/approve", hrHandler.ApproveLoan)
			hr.PUT("/loans/:id/reject", hrHandler.RejectLoan)
			hr.GET("/deductions", hrHandler.GetDeductions)
			hr.POST("/deductions", middleware.RequirePermission("hr.create"), hrHandler.CreateDeduction)
			hr.PUT("/deductions/:id", middleware.RequirePermission("hr.edit"), hrHandler.UpdateDeduction)
			hr.DELETE("/deductions/:id", middleware.RequirePermission("hr.delete"), hrHandler.DeleteDeduction)
			hr.GET("/requests", hrHandler.GetRequests)
			hr.POST("/requests", middleware.RequirePermission("hr.create"), hrHandler.CreateRequest)
			hr.PUT("/requests/:id/approve", hrHandler.ApproveRequest)
			hr.PUT("/requests/:id/reject", hrHandler.RejectRequest)
			hr.GET("/managers/:id/team", hrHandler.GetEmployeesByManager)
			hr.GET("/system-config", configHandler.GetConfig)
			hr.PUT("/system-config", middleware.RequirePermission("settings.edit"), configHandler.UpdateConfig)
			hr.GET("/branches", configHandler.GetBranches)
			hr.POST("/branches", middleware.RequirePermission("settings.edit"), configHandler.CreateBranch)
			hr.PUT("/branches/:id", middleware.RequirePermission("settings.edit"), configHandler.UpdateBranch)
			hr.DELETE("/branches/:id", middleware.RequirePermission("settings.edit"), configHandler.DeleteBranch)
		}
	}
}
