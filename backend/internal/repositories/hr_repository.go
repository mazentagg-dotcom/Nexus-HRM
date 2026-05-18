package repositories

import (
	"database/sql"
	"fmt"
	"strings"

	"nexus-hrm/internal/models"
)

type DepartmentRepository struct {
	db *sql.DB
}

func NewDepartmentRepository(db *sql.DB) *DepartmentRepository {
	return &DepartmentRepository{db: db}
}

func (r *DepartmentRepository) FindAll(search string, page, pageSize int) ([]models.Department, int64, error) {
	var items []models.Department
	var total int64

	countQ := "SELECT COUNT(*) FROM departments"
	listQ := `SELECT id, name, code, parent_id, manager_id, description, budget, is_active, created_at, updated_at
		FROM departments`
	args := []interface{}{}

	if search != "" {
		filter := " WHERE name ILIKE '%' || $1 || '%' OR code ILIKE '%' || $1 || '%'"
		countQ += filter
		listQ += filter
		args = append(args, search)
	}

	err := r.db.QueryRow(countQ, args...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("count departments: %w", err)
	}

	listQ += " ORDER BY name"
	if search != "" {
		listQ += " LIMIT $2 OFFSET $3"
	} else {
		listQ += " LIMIT $1 OFFSET $2"
	}
	args = append(args, pageSize, (page-1)*pageSize)

	rows, err := r.db.Query(listQ, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("list departments: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var d models.Department
		var parentID, managerID sql.NullString
		var desc sql.NullString
		var budget sql.NullFloat64

		if err := rows.Scan(&d.ID, &d.Name, &d.Code, &parentID, &managerID, &desc, &budget, &d.IsActive, &d.CreatedAt, &d.UpdatedAt); err != nil {
			return nil, 0, fmt.Errorf("scan department: %w", err)
		}
		d.ParentID = toStringPtr(parentID)
		d.ManagerID = toStringPtr(managerID)
		d.Description = toStringPtr(desc)
		if budget.Valid {
			d.Budget = &budget.Float64
		}
		items = append(items, d)
	}

	return items, total, rows.Err()
}

func (r *DepartmentRepository) FindByID(id string) (*models.Department, error) {
	var d models.Department
	var parentID, managerID, desc sql.NullString
	var budget sql.NullFloat64

	q := `SELECT id, name, code, parent_id, manager_id, description, budget, is_active, created_at, updated_at
		FROM departments WHERE id = $1`

	err := r.db.QueryRow(q, id).Scan(&d.ID, &d.Name, &d.Code, &parentID, &managerID, &desc, &budget, &d.IsActive, &d.CreatedAt, &d.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("find department: %w", err)
	}

	d.ParentID = toStringPtr(parentID)
	d.ManagerID = toStringPtr(managerID)
	d.Description = toStringPtr(desc)
	if budget.Valid {
		d.Budget = &budget.Float64
	}

	return &d, nil
}

func (r *DepartmentRepository) Create(d *models.Department) error {
	q := `INSERT INTO departments (name, code, description, parent_id, manager_id, budget, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7)`

	_, err := r.db.Exec(q, d.Name, d.Code, d.Description, d.ParentID, d.ManagerID, d.Budget, d.IsActive)
	if err != nil {
		return fmt.Errorf("create department: %w", err)
	}

	return nil
}

func (r *DepartmentRepository) Update(d *models.Department) error {
	q := `UPDATE departments SET name = COALESCE($2, name), code = COALESCE($3, code),
		description = COALESCE($4, description), parent_id = $5, manager_id = $6,
		budget = COALESCE($7, budget), is_active = COALESCE($8, is_active)
		WHERE id = $1`

	_, err := r.db.Exec(q, d.ID, d.Name, d.Code, d.Description, d.ParentID, d.ManagerID, d.Budget, d.IsActive)
	if err != nil {
		return fmt.Errorf("update department: %w", err)
	}

	return nil
}

func (r *DepartmentRepository) Delete(id string) error {
	_, err := r.db.Exec("DELETE FROM departments WHERE id = $1", id)
	return err
}

func (r *DepartmentRepository) Count() (int64, error) {
	var count int64
	err := r.db.QueryRow("SELECT COUNT(*) FROM departments").Scan(&count)
	return count, err
}

type EmployeeRepository struct {
	db *sql.DB
}

func NewEmployeeRepository(db *sql.DB) *EmployeeRepository {
	return &EmployeeRepository{db: db}
}

func (r *EmployeeRepository) FindAll(search, department, status string, page, pageSize int) ([]models.Employee, int64, error) {
	var items []models.Employee
	var total int64

	baseCount := "SELECT COUNT(*) FROM employees e"
	baseList := `SELECT e.id, e.user_id, e.employee_code, e.first_name, e.last_name, e.email, e.phone,
		e.gender, e.date_of_birth, e.address, e.city, e.state, e.country, e.zip_code,
		e.department_id, e.position, e.employment_type, e.employment_status,
		e.hire_date, e.confirmation_date, e.reports_to, e.work_location,
		e.base_salary, e.salary_currency, e.pay_frequency,
		e.bank_name, e.bank_account, e.bank_routing, e.tax_id,
		e.emergency_contact_name, e.emergency_contact_phone, e.emergency_contact_relation,
		e.bio, e.notes, e.is_active, e.created_at, e.updated_at,
		d.name as department_name
		FROM employees e LEFT JOIN departments d ON e.department_id = d.id`

	var where []string
	var args []interface{}
	argN := 1

	where = append(where, "1=1")

	if search != "" {
		where = append(where, fmt.Sprintf("(e.first_name || ' ' || e.last_name) ILIKE '%%' || $%d || '%%' OR e.employee_code ILIKE '%%' || $%d || '%%' OR e.email ILIKE '%%' || $%d || '%%'", argN, argN, argN))
		args = append(args, search, search, search)
		argN++
	}

	if department != "" {
		where = append(where, fmt.Sprintf("e.department_id = $%d", argN))
		args = append(args, department)
		argN++
	}

	if status != "" {
		where = append(where, fmt.Sprintf("e.employment_status = $%d", argN))
		args = append(args, status)
		argN++
	}

	whereClause := " WHERE " + strings.Join(where, " AND ")

	err := r.db.QueryRow(baseCount+whereClause, args...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("count employees: %w", err)
	}

	listQ := baseList + whereClause + " ORDER BY e.first_name, e.last_name"
	argN2 := argN
	listQ += fmt.Sprintf(" LIMIT $%d OFFSET $%d", argN2, argN2+1)
	args = append(args, pageSize, (page-1)*pageSize)

	rows, err := r.db.Query(listQ, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("list employees: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var e models.Employee
		var userID, phone, gender, addr, city, state, country, zip sql.NullString
		var dob, confirmationDate sql.NullTime
		var deptID, position, empType, reportsTo, workLoc, salCur, payFreq sql.NullString
		var bankName, bankAcct, bankRoute, taxID, emerName, emerPhone, emerRel, bio, notes sql.NullString
		var salary sql.NullFloat64
		var deptName sql.NullString

		err := rows.Scan(&e.ID, &userID, &e.EmployeeCode, &e.FirstName, &e.LastName, &e.Email, &phone,
			&gender, &dob, &addr, &city, &state, &country, &zip,
			&deptID, &position, &empType, &e.Status,
			&e.HireDate, &confirmationDate, &reportsTo, &workLoc,
			&salary, &salCur, &payFreq,
			&bankName, &bankAcct, &bankRoute, &taxID,
			&emerName, &emerPhone, &emerRel,
			&bio, &notes, &e.IsActive, &e.CreatedAt, &e.UpdatedAt,
			&deptName)
		if err != nil {
			return nil, 0, fmt.Errorf("scan employee: %w", err)
		}

		e.UserID = toStringPtr(userID)
		e.Phone = toStringPtr(phone)
		e.Gender = toStringPtr(gender)
		e.DateOfBirth = nullTimeToTimePtr(dob)
		e.Address = toStringPtr(addr)
		e.City = toStringPtr(city)
		e.State = toStringPtr(state)
		e.Country = toStringPtr(country)
		e.ZipCode = toStringPtr(zip)
		e.DepartmentID = toStringPtr(deptID)
		e.DepartmentName = toStringPtr(deptName)
		e.Position = toStringPtr(position)
		e.EmploymentType = toStringPtr(empType)
		e.ReportsTo = toStringPtr(reportsTo)
		e.WorkLocation = toStringPtr(workLoc)
		if salary.Valid {
			e.Salary = &salary.Float64
		}
		e.SalaryCurrency = toStringPtr(salCur)
		e.PayFrequency = toStringPtr(payFreq)
		e.BankName = toStringPtr(bankName)
		e.BankAccount = toStringPtr(bankAcct)
		e.BankRouting = toStringPtr(bankRoute)
		e.TaxID = toStringPtr(taxID)
		e.EmergencyName = toStringPtr(emerName)
		e.EmergencyPhone = toStringPtr(emerPhone)
		e.EmergencyRelation = toStringPtr(emerRel)
		e.Bio = toStringPtr(bio)
		e.Notes = toStringPtr(notes)

		items = append(items, e)
	}

	return items, total, rows.Err()
}

func (r *EmployeeRepository) FindByID(id string) (*models.Employee, error) {
	var e models.Employee
	var userID, phone, gender, addr, city, state, country, zip sql.NullString
	var dob, confirmationDate sql.NullTime
	var deptID, position, empType, reportsTo, workLoc, salCur, payFreq sql.NullString
	var bankName, bankAcct, bankRoute, taxID, emerName, emerPhone, emerRel, bio, notes sql.NullString
	var salary sql.NullFloat64
	var deptName sql.NullString

	q := `SELECT e.id, e.user_id, e.employee_code, e.first_name, e.last_name, e.email, e.phone,
		e.gender, e.date_of_birth, e.address, e.city, e.state, e.country, e.zip_code,
		e.department_id, e.position, e.employment_type, e.employment_status,
		e.hire_date, e.confirmation_date, e.reports_to, e.work_location,
		e.base_salary, e.salary_currency, e.pay_frequency,
		e.bank_name, e.bank_account, e.bank_routing, e.tax_id,
		e.emergency_contact_name, e.emergency_contact_phone, e.emergency_contact_relation,
		e.bio, e.notes, e.is_active, e.created_at, e.updated_at,
		d.name as department_name
		FROM employees e LEFT JOIN departments d ON e.department_id = d.id WHERE e.id = $1`

	err := r.db.QueryRow(q, id).Scan(&e.ID, &userID, &e.EmployeeCode, &e.FirstName, &e.LastName, &e.Email, &phone,
		&gender, &dob, &addr, &city, &state, &country, &zip,
		&deptID, &position, &empType, &e.Status,
		&e.HireDate, &confirmationDate, &reportsTo, &workLoc,
		&salary, &salCur, &payFreq,
		&bankName, &bankAcct, &bankRoute, &taxID,
		&emerName, &emerPhone, &emerRel,
		&bio, &notes, &e.IsActive, &e.CreatedAt, &e.UpdatedAt,
		&deptName)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("find employee: %w", err)
	}

	e.UserID = toStringPtr(userID)
	e.Phone = toStringPtr(phone)
	e.Gender = toStringPtr(gender)
	e.DateOfBirth = nullTimeToTimePtr(dob)
	e.Address = toStringPtr(addr)
	e.City = toStringPtr(city)
	e.State = toStringPtr(state)
	e.Country = toStringPtr(country)
	e.ZipCode = toStringPtr(zip)
	e.DepartmentID = toStringPtr(deptID)
	e.DepartmentName = toStringPtr(deptName)
	e.Position = toStringPtr(position)
	e.EmploymentType = toStringPtr(empType)
	e.ConfirmationDate = nullTimeToTimePtr(confirmationDate)
	e.ReportsTo = toStringPtr(reportsTo)
	e.WorkLocation = toStringPtr(workLoc)
	if salary.Valid {
		e.Salary = &salary.Float64
	}
	e.SalaryCurrency = toStringPtr(salCur)
	e.PayFrequency = toStringPtr(payFreq)
	e.BankName = toStringPtr(bankName)
	e.BankAccount = toStringPtr(bankAcct)
	e.BankRouting = toStringPtr(bankRoute)
	e.TaxID = toStringPtr(taxID)
	e.EmergencyName = toStringPtr(emerName)
	e.EmergencyPhone = toStringPtr(emerPhone)
	e.EmergencyRelation = toStringPtr(emerRel)
	e.Bio = toStringPtr(bio)
	e.Notes = toStringPtr(notes)

	return &e, nil
}

func (r *EmployeeRepository) FindByUserID(userID string) (*models.Employee, error) {
	var e models.Employee
	var phone, gender, addr, city, state, country, zip sql.NullString
	var dob, confirmationDate sql.NullTime
	var deptID, position, empType, reportsTo, workLoc, salCur, payFreq sql.NullString
	var bankName, bankAcct, bankRoute, taxID, emerName, emerPhone, emerRel, bio, notes sql.NullString
	var salary sql.NullFloat64
	var deptName sql.NullString

	q := `SELECT e.id, e.user_id, e.employee_code, e.first_name, e.last_name, e.email, e.phone,
		e.gender, e.date_of_birth, e.address, e.city, e.state, e.country, e.zip_code,
		e.department_id, e.position, e.employment_type, e.employment_status,
		e.hire_date, e.confirmation_date, e.reports_to, e.work_location,
		e.base_salary, e.salary_currency, e.pay_frequency,
		e.bank_name, e.bank_account, e.bank_routing, e.tax_id,
		e.emergency_contact_name, e.emergency_contact_phone, e.emergency_contact_relation,
		e.bio, e.notes, e.is_active, e.created_at, e.updated_at,
		d.name as department_name
		FROM employees e LEFT JOIN departments d ON e.department_id = d.id WHERE e.user_id = $1`

	err := r.db.QueryRow(q, userID).Scan(&e.ID, &e.UserID, &e.EmployeeCode, &e.FirstName, &e.LastName, &e.Email, &phone,
		&gender, &dob, &addr, &city, &state, &country, &zip,
		&deptID, &position, &empType, &e.Status,
		&e.HireDate, &confirmationDate, &reportsTo, &workLoc,
		&salary, &salCur, &payFreq,
		&bankName, &bankAcct, &bankRoute, &taxID,
		&emerName, &emerPhone, &emerRel,
		&bio, &notes, &e.IsActive, &e.CreatedAt, &e.UpdatedAt,
		&deptName)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("find employee by user: %w", err)
	}

	e.Phone = toStringPtr(phone)
	e.Gender = toStringPtr(gender)
	e.DateOfBirth = nullTimeToTimePtr(dob)
	e.Address = toStringPtr(addr)
	e.City = toStringPtr(city)
	e.State = toStringPtr(state)
	e.Country = toStringPtr(country)
	e.ZipCode = toStringPtr(zip)
	e.DepartmentID = toStringPtr(deptID)
	e.DepartmentName = toStringPtr(deptName)
	e.Position = toStringPtr(position)
	e.EmploymentType = toStringPtr(empType)
	e.ReportsTo = toStringPtr(reportsTo)
	e.WorkLocation = toStringPtr(workLoc)
	if salary.Valid {
		e.Salary = &salary.Float64
	}
	e.SalaryCurrency = toStringPtr(salCur)
	e.PayFrequency = toStringPtr(payFreq)
	e.BankName = toStringPtr(bankName)
	e.BankAccount = toStringPtr(bankAcct)
	e.BankRouting = toStringPtr(bankRoute)
	e.TaxID = toStringPtr(taxID)
	e.EmergencyName = toStringPtr(emerName)
	e.EmergencyPhone = toStringPtr(emerPhone)
	e.EmergencyRelation = toStringPtr(emerRel)
	e.Bio = toStringPtr(bio)
	e.Notes = toStringPtr(notes)

	return &e, nil
}

func (r *EmployeeRepository) FindByDepartmentID(deptID string) ([]models.Employee, error) {
	var items []models.Employee
	q := `SELECT id, user_id, employee_code, first_name, last_name, email FROM employees WHERE department_id = $1 AND is_active = true`
	rows, err := r.db.Query(q, deptID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var e models.Employee
		var userID, email sql.NullString
		if err := rows.Scan(&e.ID, &userID, &e.EmployeeCode, &e.FirstName, &e.LastName, &email); err != nil {
			return nil, err
		}
		e.UserID = toStringPtr(userID)
		e.Email = email.String
		items = append(items, e)
	}
	return items, rows.Err()
}

func (r *EmployeeRepository) FindByReportingTo(managerID string) ([]models.Employee, error) {
	var items []models.Employee
	q := `SELECT id, user_id, employee_code, first_name, last_name, email FROM employees WHERE reports_to = $1 AND is_active = true`
	rows, err := r.db.Query(q, managerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var e models.Employee
		var userID, email sql.NullString
		if err := rows.Scan(&e.ID, &userID, &e.EmployeeCode, &e.FirstName, &e.LastName, &email); err != nil {
			return nil, err
		}
		e.UserID = toStringPtr(userID)
		e.Email = email.String
		items = append(items, e)
	}
	return items, rows.Err()
}

func (r *EmployeeRepository) Create(e *models.Employee) error {
	q := `INSERT INTO employees (user_id, employee_code, first_name, last_name, email, phone,
		gender, date_of_birth, address, department_id, position, employment_type,
		hire_date, reports_to, work_location, base_salary, salary_currency, pay_frequency,
		bank_name, bank_account, bank_routing, tax_id,
		emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
		bio, notes)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
		$20, $21, $22, $23, $24, $25, $26, $27)`

	_, err := r.db.Exec(q, e.UserID, e.EmployeeCode, e.FirstName, e.LastName, e.Email, e.Phone,
		e.Gender, e.DateOfBirth, e.Address, e.DepartmentID, e.Position, e.EmploymentType,
		e.HireDate, e.ReportsTo, e.WorkLocation, e.Salary, e.SalaryCurrency, e.PayFrequency,
		e.BankName, e.BankAccount, e.BankRouting, e.TaxID,
		e.EmergencyName, e.EmergencyPhone, e.EmergencyRelation,
		e.Bio, e.Notes)
	if err != nil {
		return fmt.Errorf("create employee: %w", err)
	}
	return nil
}

func (r *EmployeeRepository) Update(e *models.Employee) error {
	q := `UPDATE employees SET
		first_name = COALESCE($2, first_name), last_name = COALESCE($3, last_name),
		email = COALESCE($4, email), phone = COALESCE($5, phone),
		gender = COALESCE($6, gender), date_of_birth = COALESCE($7, date_of_birth),
		address = COALESCE($8, address), department_id = COALESCE($9, department_id),
		position = COALESCE($10, position), employment_type = COALESCE($11, employment_type),
		employment_status = COALESCE($12, employment_status),
		reports_to = COALESCE($13, reports_to), work_location = COALESCE($14, work_location),
		base_salary = COALESCE($15, base_salary), salary_currency = COALESCE($16, salary_currency),
		pay_frequency = COALESCE($17, pay_frequency),
		bank_name = COALESCE($18, bank_name), bank_account = COALESCE($19, bank_account),
		bank_routing = COALESCE($20, bank_routing), tax_id = COALESCE($21, tax_id),
		emergency_contact_name = COALESCE($22, emergency_contact_name),
		emergency_contact_phone = COALESCE($23, emergency_contact_phone),
		emergency_contact_relation = COALESCE($24, emergency_contact_relation),
		bio = COALESCE($25, bio), notes = COALESCE($26, notes)
		WHERE id = $1`

	_, err := r.db.Exec(q, e.ID, e.FirstName, e.LastName, e.Email, e.Phone,
		e.Gender, e.DateOfBirth, e.Address, e.DepartmentID, e.Position, e.EmploymentType,
		e.Status, e.ReportsTo, e.WorkLocation, e.Salary, e.SalaryCurrency, e.PayFrequency,
		e.BankName, e.BankAccount, e.BankRouting, e.TaxID,
		e.EmergencyName, e.EmergencyPhone, e.EmergencyRelation,
		e.Bio, e.Notes)
	return err
}

func (r *EmployeeRepository) Delete(id string) error {
	_, err := r.db.Exec("UPDATE employees SET is_active = false WHERE id = $1", id)
	return err
}

func (r *EmployeeRepository) Count(status string) (int64, error) {
	var count int64
	if status != "" {
		err := r.db.QueryRow("SELECT COUNT(*) FROM employees WHERE is_active = true AND employment_status = $1", status).Scan(&count)
		return count, err
	}
	err := r.db.QueryRow("SELECT COUNT(*) FROM employees WHERE is_active = true").Scan(&count)
	return count, err
}

type AttendanceRepository struct {
	db *sql.DB
}

func NewAttendanceRepository(db *sql.DB) *AttendanceRepository {
	return &AttendanceRepository{db: db}
}

func (r *AttendanceRepository) FindAll(employeeID, dateFrom, dateTo, status string, page, pageSize int) ([]models.Attendance, int64, error) {
	var items []models.Attendance
	var total int64

	baseCount := "SELECT COUNT(*) FROM attendance_records a"
	baseList := `SELECT a.id, a.employee_id, a.date, a.check_in, a.check_out, a.status,
		a.work_hours, a.overtime_hours, a.break_minutes, a.location, a.notes,
		a.created_at, a.updated_at, e.first_name || ' ' || e.last_name as employee_name
		FROM attendance_records a LEFT JOIN employees e ON a.employee_id = e.id`

	var where []string
	var args []interface{}
	argN := 1

	where = append(where, "1=1")

	if employeeID != "" {
		where = append(where, fmt.Sprintf("a.employee_id = $%d", argN))
		args = append(args, employeeID)
		argN++
	}
	if dateFrom != "" {
		where = append(where, fmt.Sprintf("a.date >= $%d", argN))
		args = append(args, dateFrom)
		argN++
	}
	if dateTo != "" {
		where = append(where, fmt.Sprintf("a.date <= $%d", argN))
		args = append(args, dateTo)
		argN++
	}
	if status != "" {
		where = append(where, fmt.Sprintf("a.status = $%d", argN))
		args = append(args, status)
		argN++
	}

	whereClause := " WHERE " + strings.Join(where, " AND ")

	r.db.QueryRow(baseCount+whereClause, args...).Scan(&total)

	listQ := baseList + whereClause + " ORDER BY a.date DESC, a.created_at DESC"
	listQ += fmt.Sprintf(" LIMIT $%d OFFSET $%d", argN, argN+1)
	args = append(args, pageSize, (page-1)*pageSize)

	rows, err := r.db.Query(listQ, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	for rows.Next() {
		var a models.Attendance
		var clockIn, clockOut sql.NullTime
		var workHrs, otHrs sql.NullFloat64
		var breakMin sql.NullInt64
		var location, notes, empName sql.NullString

		if err := rows.Scan(&a.ID, &a.EmployeeID, &a.Date, &clockIn, &clockOut, &a.Status,
			&workHrs, &otHrs, &breakMin, &location, &notes, &a.CreatedAt, &a.UpdatedAt, &empName); err != nil {
			return nil, 0, err
		}

		a.ClockIn = nullTimeToTimePtr(clockIn)
		a.ClockOut = nullTimeToTimePtr(clockOut)
		if workHrs.Valid {
			a.WorkHours = &workHrs.Float64
		}
		if otHrs.Valid {
			a.OvertimeHours = &otHrs.Float64
		}
		if breakMin.Valid {
			bm := int(breakMin.Int64)
			a.BreakMinutes = &bm
		}
		a.Location = toStringPtr(location)
		a.Notes = toStringPtr(notes)
		a.EmployeeName = empName.String
		items = append(items, a)
	}

	return items, total, rows.Err()
}

func (r *AttendanceRepository) CheckIn(employeeID string) (*models.Attendance, error) {
	var a models.Attendance
	q := `INSERT INTO attendance_records (employee_id, date, check_in, status, work_hours)
		VALUES ($1, CURRENT_DATE, NOW(), 'present', 0)
		ON CONFLICT (employee_id, date) DO UPDATE SET check_in = NOW(), status = 'present'
		RETURNING id, employee_id, date, check_in, check_out, status, work_hours, overtime_hours, break_minutes, location, notes, created_at, updated_at`

	var clockIn, clockOut sql.NullTime
	var workHrs, otHrs sql.NullFloat64
	var breakMin sql.NullInt64
	var location, notes sql.NullString

	err := r.db.QueryRow(q, employeeID).Scan(&a.ID, &a.EmployeeID, &a.Date, &clockIn, &clockOut, &a.Status,
		&workHrs, &otHrs, &breakMin, &location, &notes, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("check in: %w", err)
	}

	a.ClockIn = nullTimeToTimePtr(clockIn)
	a.ClockOut = nullTimeToTimePtr(clockOut)
	if workHrs.Valid {
		a.WorkHours = &workHrs.Float64
	}
	if otHrs.Valid {
		a.OvertimeHours = &otHrs.Float64
	}
	if breakMin.Valid {
		bm := int(breakMin.Int64)
		a.BreakMinutes = &bm
	}
	a.Location = toStringPtr(location)
	a.Notes = toStringPtr(notes)

	return &a, nil
}

func (r *AttendanceRepository) CheckOut(employeeID string) (*models.Attendance, error) {
	var a models.Attendance
	q := `UPDATE attendance_records SET check_out = NOW(), work_hours = ROUND(EXTRACT(EPOCH FROM (NOW() - check_in)) / 3600.0, 2)
		WHERE employee_id = $1 AND date = CURRENT_DATE AND check_in IS NOT NULL AND check_out IS NULL
		RETURNING id, employee_id, date, check_in, check_out, status, work_hours, overtime_hours, break_minutes, location, notes, created_at, updated_at`

	var clockIn, clockOut sql.NullTime
	var workHrs, otHrs sql.NullFloat64
	var breakMin sql.NullInt64
	var location, notes sql.NullString

	err := r.db.QueryRow(q, employeeID).Scan(&a.ID, &a.EmployeeID, &a.Date, &clockIn, &clockOut, &a.Status,
		&workHrs, &otHrs, &breakMin, &location, &notes, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("check out: %w", err)
	}

	a.ClockIn = nullTimeToTimePtr(clockIn)
	a.ClockOut = nullTimeToTimePtr(clockOut)
	if workHrs.Valid {
		a.WorkHours = &workHrs.Float64
	}
	if otHrs.Valid {
		a.OvertimeHours = &otHrs.Float64
	}
	if breakMin.Valid {
		bm := int(breakMin.Int64)
		a.BreakMinutes = &bm
	}
	a.Location = toStringPtr(location)
	a.Notes = toStringPtr(notes)

	return &a, nil
}

type LeaveRequestRepository struct {
	db *sql.DB
}

func NewLeaveRequestRepository(db *sql.DB) *LeaveRequestRepository {
	return &LeaveRequestRepository{db: db}
}

func (r *LeaveRequestRepository) FindAll(employeeID, status, leaveType string, page, pageSize int) ([]models.LeaveRequest, int64, error) {
	var items []models.LeaveRequest
	var total int64

	baseCount := "SELECT COUNT(*) FROM leave_requests"
	baseList := `SELECT lr.id, lr.employee_id, e.first_name || ' ' || e.last_name as employee_name,
		lr.leave_type, lr.start_date, lr.end_date, lr.duration_days, lr.reason, lr.status,
		lr.approver_id, lr.approved_at, lr.rejection_reason, lr.created_at, lr.updated_at
		FROM leave_requests lr LEFT JOIN employees e ON lr.employee_id = e.id`

	var where []string
	var args []interface{}
	argN := 1

	where = append(where, "1=1")

	if employeeID != "" {
		where = append(where, fmt.Sprintf("lr.employee_id = $%d", argN))
		args = append(args, employeeID)
		argN++
	}
	if status != "" {
		where = append(where, fmt.Sprintf("lr.status = $%d", argN))
		args = append(args, status)
		argN++
	}
	if leaveType != "" {
		where = append(where, fmt.Sprintf("lr.leave_type = $%d", argN))
		args = append(args, leaveType)
		argN++
	}

	whereClause := " WHERE " + strings.Join(where, " AND ")

	r.db.QueryRow(baseCount+whereClause, args...).Scan(&total)

	listQ := baseList + whereClause + " ORDER BY lr.created_at DESC"
	listQ += fmt.Sprintf(" LIMIT $%d OFFSET $%d", argN, argN+1)
	args = append(args, pageSize, (page-1)*pageSize)

	rows, err := r.db.Query(listQ, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	for rows.Next() {
		var lr models.LeaveRequest
		var approverID, rejectionReason sql.NullString
		var approvedAt sql.NullTime

		if err := rows.Scan(&lr.ID, &lr.EmployeeID, &lr.EmployeeName, &lr.LeaveType,
			&lr.StartDate, &lr.EndDate, &lr.DurationDays, &lr.Reason, &lr.Status,
			&approverID, &approvedAt, &rejectionReason, &lr.CreatedAt, &lr.UpdatedAt); err != nil {
			return nil, 0, err
		}

		lr.ApproverID = toStringPtr(approverID)
		lr.ApprovedAt = nullTimeToTimePtr(approvedAt)
		lr.RejectionReason = toStringPtr(rejectionReason)
		items = append(items, lr)
	}

	return items, total, rows.Err()
}

func (r *LeaveRequestRepository) FindByID(id string) (*models.LeaveRequest, error) {
	var lr models.LeaveRequest
	var approverID, rejectionReason sql.NullString
	var approvedAt sql.NullTime

	q := `SELECT id, employee_id, leave_type, start_date, end_date, duration_days, reason, status,
		approver_id, approved_at, rejection_reason, created_at, updated_at
		FROM leave_requests WHERE id = $1`

	err := r.db.QueryRow(q, id).Scan(&lr.ID, &lr.EmployeeID, &lr.LeaveType,
		&lr.StartDate, &lr.EndDate, &lr.DurationDays, &lr.Reason, &lr.Status,
		&approverID, &approvedAt, &rejectionReason, &lr.CreatedAt, &lr.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("find leave request: %w", err)
	}

	lr.ApproverID = toStringPtr(approverID)
	lr.ApprovedAt = nullTimeToTimePtr(approvedAt)
	lr.RejectionReason = toStringPtr(rejectionReason)

	return &lr, nil
}

func (r *LeaveRequestRepository) Create(lr *models.LeaveRequest) error {
	q := `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, duration_days, reason, status)
		VALUES ($1, $2, $3, $4, $5, $6, 'pending')`

	_, err := r.db.Exec(q, lr.EmployeeID, lr.LeaveType, lr.StartDate, lr.EndDate, lr.DurationDays, lr.Reason)
	return err
}

func (r *LeaveRequestRepository) UpdateStatus(id, status, approverID string) error {
	q := `UPDATE leave_requests SET status = $2, approver_id = $3, approved_at = NOW() WHERE id = $1`
	_, err := r.db.Exec(q, id, status, approverID)
	return err
}

func (r *LeaveRequestRepository) CountByStatus(status string) (int64, error) {
	var count int64
	err := r.db.QueryRow("SELECT COUNT(*) FROM leave_requests WHERE status = $1", status).Scan(&count)
	return count, err
}

type PayrollRepository struct {
	db *sql.DB
}

func NewPayrollRepository(db *sql.DB) *PayrollRepository {
	return &PayrollRepository{db: db}
}

func (r *PayrollRepository) FindAll(employeeID, status string, page, pageSize int) ([]models.PayrollRecord, int64, error) {
	var items []models.PayrollRecord
	var total int64

	baseCount := "SELECT COUNT(*) FROM payroll_records"
	baseList := `SELECT pr.id, pr.employee_id, e.first_name || ' ' || e.last_name as employee_name,
		pr.pay_period_start, pr.pay_period_end, pr.basic_salary,
		pr.housing_allowance, pr.transport_allowance, pr.medical_allowance, pr.food_allowance,
		pr.bonus, pr.commission, pr.overtime_pay, pr.other_earnings,
		pr.gross_pay, pr.tax_deduction, pr.social_security, pr.health_insurance, pr.retirement_fund,
		pr.loan_deduction, pr.other_deductions, pr.total_deductions, pr.net_pay,
		pr.pay_date, pr.payment_method, pr.status, pr.notes, pr.created_at, pr.updated_at
		FROM payroll_records pr LEFT JOIN employees e ON pr.employee_id = e.id`

	var where []string
	var args []interface{}
	argN := 1

	where = append(where, "1=1")

	if employeeID != "" {
		where = append(where, fmt.Sprintf("pr.employee_id = $%d", argN))
		args = append(args, employeeID)
		argN++
	}
	if status != "" {
		where = append(where, fmt.Sprintf("pr.status = $%d", argN))
		args = append(args, status)
		argN++
	}

	whereClause := " WHERE " + strings.Join(where, " AND ")

	r.db.QueryRow(baseCount+whereClause, args...).Scan(&total)

	listQ := baseList + whereClause + " ORDER BY pr.pay_period_start DESC, pr.created_at DESC"
	listQ += fmt.Sprintf(" LIMIT $%d OFFSET $%d", argN, argN+1)
	args = append(args, pageSize, (page-1)*pageSize)

	rows, err := r.db.Query(listQ, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	for rows.Next() {
		var pr models.PayrollRecord
		var empName, payDate, payMethod, notes sql.NullString

		if err := rows.Scan(&pr.ID, &pr.EmployeeID, &empName, &pr.PayPeriodStart, &pr.PayPeriodEnd,
			&pr.BasicSalary, &pr.HousingAllowance, &pr.TransportAllowance, &pr.MedicalAllowance, &pr.FoodAllowance,
			&pr.Bonus, &pr.Commission, &pr.OvertimePay, &pr.OtherEarnings,
			&pr.GrossPay, &pr.TaxDeduction, &pr.SocialSecurity, &pr.HealthInsurance, &pr.RetirementFund,
			&pr.LoanDeduction, &pr.OtherDeductions, &pr.TotalDeductions, &pr.NetPay,
			&payDate, &payMethod, &pr.Status, &notes, &pr.CreatedAt, &pr.UpdatedAt); err != nil {
			return nil, 0, err
		}

		pr.EmployeeName = empName.String
		pr.PayDate = toStringPtr(payDate)
		pr.PaymentMethod = toStringPtr(payMethod)
		pr.Notes = toStringPtr(notes)
		items = append(items, pr)
	}

	return items, total, rows.Err()
}

func (r *PayrollRepository) FindByID(id string) (*models.PayrollRecord, error) {
	var pr models.PayrollRecord
	var empName, payDate, payMethod, notes sql.NullString

	q := `SELECT pr.id, pr.employee_id, e.first_name || ' ' || e.last_name as employee_name,
		pr.pay_period_start, pr.pay_period_end, pr.basic_salary,
		pr.housing_allowance, pr.transport_allowance, pr.medical_allowance, pr.food_allowance,
		pr.bonus, pr.commission, pr.overtime_pay, pr.other_earnings,
		pr.gross_pay, pr.tax_deduction, pr.social_security, pr.health_insurance, pr.retirement_fund,
		pr.loan_deduction, pr.other_deductions, pr.total_deductions, pr.net_pay,
		pr.pay_date, pr.payment_method, pr.status, pr.notes, pr.created_at, pr.updated_at
		FROM payroll_records pr LEFT JOIN employees e ON pr.employee_id = e.id WHERE pr.id = $1`

	err := r.db.QueryRow(q, id).Scan(&pr.ID, &pr.EmployeeID, &empName, &pr.PayPeriodStart, &pr.PayPeriodEnd,
		&pr.BasicSalary, &pr.HousingAllowance, &pr.TransportAllowance, &pr.MedicalAllowance, &pr.FoodAllowance,
		&pr.Bonus, &pr.Commission, &pr.OvertimePay, &pr.OtherEarnings,
		&pr.GrossPay, &pr.TaxDeduction, &pr.SocialSecurity, &pr.HealthInsurance, &pr.RetirementFund,
		&pr.LoanDeduction, &pr.OtherDeductions, &pr.TotalDeductions, &pr.NetPay,
		&payDate, &payMethod, &pr.Status, &notes, &pr.CreatedAt, &pr.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("find payroll: %w", err)
	}

	pr.EmployeeName = empName.String
	pr.PayDate = toStringPtr(payDate)
	pr.PaymentMethod = toStringPtr(payMethod)
	pr.Notes = toStringPtr(notes)

	return &pr, nil
}

func (r *PayrollRepository) Create(pr *models.CreatePayrollRequest) error {
	q := `INSERT INTO payroll_records (employee_id, pay_period_start, pay_period_end,
		basic_salary, housing_allowance, transport_allowance, medical_allowance, food_allowance,
		bonus, commission, overtime_pay, other_earnings,
		tax_deduction, social_security, health_insurance, retirement_fund,
		loan_deduction, other_deductions, payment_method, notes, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`
	_, err := r.db.Exec(q, pr.EmployeeID, pr.PayPeriodStart, pr.PayPeriodEnd,
		pr.BasicSalary, pr.HousingAllowance, pr.TransportAllowance, pr.MedicalAllowance, pr.FoodAllowance,
		pr.Bonus, pr.Commission, pr.OvertimePay, pr.OtherEarnings,
		pr.TaxDeduction, pr.SocialSecurity, pr.HealthInsurance, pr.RetirementFund,
		pr.LoanDeduction, pr.OtherDeductions, pr.PaymentMethod, pr.Notes, "draft")
	return err
}

func (r *PayrollRepository) Update(pr *models.UpdatePayrollRequest, id string) error {
	q := `UPDATE payroll_records SET
		basic_salary = COALESCE($2, basic_salary),
		housing_allowance = COALESCE($3, housing_allowance),
		transport_allowance = COALESCE($4, transport_allowance),
		medical_allowance = COALESCE($5, medical_allowance),
		food_allowance = COALESCE($6, food_allowance),
		bonus = COALESCE($7, bonus),
		commission = COALESCE($8, commission),
		overtime_pay = COALESCE($9, overtime_pay),
		other_earnings = COALESCE($10, other_earnings),
		tax_deduction = COALESCE($11, tax_deduction),
		social_security = COALESCE($12, social_security),
		health_insurance = COALESCE($13, health_insurance),
		retirement_fund = COALESCE($14, retirement_fund),
		loan_deduction = COALESCE($15, loan_deduction),
		other_deductions = COALESCE($16, other_deductions),
		pay_date = COALESCE($17, pay_date),
		payment_method = COALESCE($18, payment_method),
		status = COALESCE($19, status),
		notes = COALESCE($20, notes)
		WHERE id = $1`
	_, err := r.db.Exec(q, id, pr.BasicSalary, pr.HousingAllowance, pr.TransportAllowance, pr.MedicalAllowance,
		pr.FoodAllowance, pr.Bonus, pr.Commission, pr.OvertimePay, pr.OtherEarnings,
		pr.TaxDeduction, pr.SocialSecurity, pr.HealthInsurance, pr.RetirementFund,
		pr.LoanDeduction, pr.OtherDeductions, pr.PayDate, pr.PaymentMethod, pr.Status, pr.Notes)
	return err
}

type EmployeeDocumentRepository struct {
	db *sql.DB
}

func NewEmployeeDocumentRepository(db *sql.DB) *EmployeeDocumentRepository {
	return &EmployeeDocumentRepository{db: db}
}

func (r *EmployeeDocumentRepository) FindByEmployeeID(employeeID string) ([]models.EmployeeDocument, error) {
	q := `SELECT id, employee_id, document_type, title, description, file_name, file_url, file_size, file_type, mime_type,
		is_verified, expires_at, created_by, created_at, updated_at
		FROM employee_documents WHERE employee_id = $1 ORDER BY created_at DESC`
	rows, err := r.db.Query(q, employeeID)
	if err != nil {
		return nil, fmt.Errorf("list docs by employee: %w", err)
	}
	defer rows.Close()

	var items []models.EmployeeDocument
	for rows.Next() {
		var d models.EmployeeDocument
		var desc, fileType, mimeType, createdBy sql.NullString
		var expiresAt sql.NullTime

		err := rows.Scan(&d.ID, &d.EmployeeID, &d.DocumentType, &d.Title, &desc, &d.FileName, &d.FileURL,
			&d.FileSize, &fileType, &mimeType, &d.IsVerified, &expiresAt, &createdBy, &d.CreatedAt, &d.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("scan doc: %w", err)
		}
		d.Description = toStringPtr(desc)
		d.FileType = toStringPtr(fileType)
		d.MimeType = toStringPtr(mimeType)
		d.CreatedBy = toStringPtr(createdBy)
		d.ExpiresAt = nullTimeToTimePtr(expiresAt)
		items = append(items, d)
	}
	return items, rows.Err()
}

func (r *EmployeeDocumentRepository) FindAll(employeeID, docType string, page, pageSize int) ([]models.EmployeeDocument, int64, error) {
	var items []models.EmployeeDocument
	var total int64

	baseCount := "SELECT COUNT(*) FROM employee_documents"
	baseList := `SELECT id, employee_id, document_type, title, description, file_name, file_url,
		file_size, file_type, mime_type, is_verified, expires_at, created_by, created_at, updated_at
		FROM employee_documents`

	var where []string
	var args []interface{}
	argN := 1

	where = append(where, "1=1")

	if employeeID != "" {
		where = append(where, fmt.Sprintf("employee_id = $%d", argN))
		args = append(args, employeeID)
		argN++
	}
	if docType != "" {
		where = append(where, fmt.Sprintf("document_type = $%d", argN))
		args = append(args, docType)
		argN++
	}

	whereClause := " WHERE " + strings.Join(where, " AND ")

	r.db.QueryRow(baseCount+whereClause, args...).Scan(&total)

	listQ := baseList + whereClause + " ORDER BY created_at DESC"
	listQ += fmt.Sprintf(" LIMIT $%d OFFSET $%d", argN, argN+1)
	args = append(args, pageSize, (page-1)*pageSize)

	rows, err := r.db.Query(listQ, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	for rows.Next() {
		var d models.EmployeeDocument
		var desc, fileType, mimeType, createdBy sql.NullString
		var expiresAt sql.NullTime

		if err := rows.Scan(&d.ID, &d.EmployeeID, &d.DocumentType, &d.Title, &desc, &d.FileName,
			&d.FileURL, &d.FileSize, &fileType, &mimeType, &d.IsVerified, &expiresAt, &createdBy,
			&d.CreatedAt, &d.UpdatedAt); err != nil {
			return nil, 0, err
		}

		d.Description = toStringPtr(desc)
		d.FileType = toStringPtr(fileType)
		d.MimeType = toStringPtr(mimeType)
		d.CreatedBy = toStringPtr(createdBy)
		d.ExpiresAt = nullTimeToTimePtr(expiresAt)
		items = append(items, d)
	}

	return items, total, rows.Err()
}

func (r *EmployeeDocumentRepository) FindByID(id string) (*models.EmployeeDocument, error) {
	var d models.EmployeeDocument
	var desc, fileType, mimeType, createdBy sql.NullString
	var expiresAt sql.NullTime

	q := `SELECT id, employee_id, document_type, title, description, file_name, file_url,
		file_size, file_type, mime_type, is_verified, expires_at, created_by, created_at, updated_at
		FROM employee_documents WHERE id = $1`

	err := r.db.QueryRow(q, id).Scan(&d.ID, &d.EmployeeID, &d.DocumentType, &d.Title, &desc, &d.FileName,
		&d.FileURL, &d.FileSize, &fileType, &mimeType, &d.IsVerified, &expiresAt, &createdBy,
		&d.CreatedAt, &d.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("find document: %w", err)
	}

	d.Description = toStringPtr(desc)
	d.FileType = toStringPtr(fileType)
	d.MimeType = toStringPtr(mimeType)
	d.CreatedBy = toStringPtr(createdBy)
	d.ExpiresAt = nullTimeToTimePtr(expiresAt)

	return &d, nil
}

func (r *EmployeeDocumentRepository) Create(doc *models.CreateEmployeeDocumentRequest, employeeID string) error {
	q := `INSERT INTO employee_documents (employee_id, document_type, title, description, file_name, file_url, file_size, file_type, mime_type, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`

	_, err := r.db.Exec(q, employeeID, doc.DocumentType, doc.Title, doc.Description, doc.FileName, doc.FileURL, doc.FileSize, doc.FileType, doc.MimeType, doc.ExpiresAt)
	return err
}

func (r *EmployeeDocumentRepository) Delete(id string) error {
	_, err := r.db.Exec("DELETE FROM employee_documents WHERE id = $1", id)
	return err
}

type LoanRepository struct {
	db *sql.DB
}

func NewLoanRepository(db *sql.DB) *LoanRepository {
	return &LoanRepository{db: db}
}

func (r *LoanRepository) FindByEmployeeID(employeeID string, page, pageSize int) ([]models.LoanRequest, int64, error) {
	var total int64
	if err := r.db.QueryRow(`SELECT COUNT(*) FROM loan_requests WHERE employee_id = $1`, employeeID).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("count loans: %w", err)
	}

	offset := (page - 1) * pageSize
	q := `SELECT l.id, l.employee_id, COALESCE(e.first_name || ' ' || e.last_name, ''), l.amount, l.purpose,
		l.monthly_installment, l.repayment_months, l.status, l.approved_by, l.rejection_reason,
		l.created_at, l.updated_at
		FROM loan_requests l LEFT JOIN employees e ON l.employee_id = e.id
		WHERE l.employee_id = $1 ORDER BY l.created_at DESC LIMIT $2 OFFSET $3`
	rows, err := r.db.Query(q, employeeID, pageSize, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list loans: %w", err)
	}
	defer rows.Close()

	return scanLoans(rows, total)
}

func (r *LoanRepository) FindAll(status string, page, pageSize int) ([]models.LoanRequest, int64, error) {
	var where string
	var args []interface{}
	if status != "" {
		where = " WHERE l.status = $1"
		args = append(args, status)
	}

	var total int64
	countQ := "SELECT COUNT(*) FROM loan_requests l" + where
	if err := r.db.QueryRow(countQ, args...).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("count loans: %w", err)
	}

	offset := (page - 1) * pageSize
	args = append(args, pageSize, offset)
	argIdx := len(args)

	q := fmt.Sprintf(`SELECT l.id, l.employee_id, COALESCE(e.first_name || ' ' || e.last_name, ''), l.amount, l.purpose,
		l.monthly_installment, l.repayment_months, l.status, l.approved_by, l.rejection_reason,
		l.created_at, l.updated_at
		FROM loan_requests l LEFT JOIN employees e ON l.employee_id = e.id%s
		ORDER BY l.created_at DESC LIMIT $%d OFFSET $%d`, where, argIdx-1, argIdx)
	rows, err := r.db.Query(q, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("list all loans: %w", err)
	}
	defer rows.Close()

	return scanLoans(rows, total)
}

func (r *LoanRepository) FindByID(id string) (*models.LoanRequest, error) {
	q := `SELECT l.id, l.employee_id, COALESCE(e.first_name || ' ' || e.last_name, ''), l.amount, l.purpose,
		l.monthly_installment, l.repayment_months, l.status, l.approved_by, l.rejection_reason,
		l.created_at, l.updated_at
		FROM loan_requests l LEFT JOIN employees e ON l.employee_id = e.id WHERE l.id = $1`
	var loan models.LoanRequest
	var empName, approvedBy, rejectionReason sql.NullString
	var monthlyInst sql.NullFloat64
	err := r.db.QueryRow(q, id).Scan(&loan.ID, &loan.EmployeeID, &empName, &loan.Amount, &loan.Purpose,
		&monthlyInst, &loan.RepaymentMonths, &loan.Status, &approvedBy, &rejectionReason,
		&loan.CreatedAt, &loan.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("find loan: %w", err)
	}
	loan.EmployeeName = empName.String
	if monthlyInst.Valid {
		loan.MonthlyInstallment = monthlyInst.Float64
	}
	loan.ApprovedBy = toStringPtr(approvedBy)
	loan.RejectionReason = toStringPtr(rejectionReason)
	return &loan, nil
}

func (r *LoanRepository) Create(employeeID string, req *models.CreateLoanRequest) (*models.LoanRequest, error) {
	q := `INSERT INTO loan_requests (employee_id, amount, purpose, repayment_months)
		VALUES ($1, $2, $3, $4)
		RETURNING id, monthly_installment, status, created_at, updated_at`
	var loan models.LoanRequest
	err := r.db.QueryRow(q, employeeID, req.Amount, req.Purpose, req.RepaymentMonths).
		Scan(&loan.ID, &loan.MonthlyInstallment, &loan.Status, &loan.CreatedAt, &loan.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("create loan: %w", err)
	}
	loan.EmployeeID = employeeID
	loan.Amount = req.Amount
	loan.Purpose = req.Purpose
	loan.RepaymentMonths = req.RepaymentMonths
	return &loan, nil
}

func (r *LoanRepository) UpdateStatus(id, status, approvedBy string) error {
	if status == "rejected" {
		_, err := r.db.Exec(`UPDATE loan_requests SET status = $1, approved_by = $2, updated_at = NOW() WHERE id = $3`, status, approvedBy, id)
		return err
	}
	_, err := r.db.Exec(`UPDATE loan_requests SET status = $1, approved_by = $2, updated_at = NOW() WHERE id = $3`, status, approvedBy, id)
	return err
}

func scanLoans(rows *sql.Rows, total int64) ([]models.LoanRequest, int64, error) {
	var items []models.LoanRequest
	for rows.Next() {
		var loan models.LoanRequest
		var empName, approvedBy, rejectionReason sql.NullString
		var monthlyInst sql.NullFloat64
		if err := rows.Scan(&loan.ID, &loan.EmployeeID, &empName, &loan.Amount, &loan.Purpose,
			&monthlyInst, &loan.RepaymentMonths, &loan.Status, &approvedBy, &rejectionReason,
			&loan.CreatedAt, &loan.UpdatedAt); err != nil {
			return nil, 0, fmt.Errorf("scan loan: %w", err)
		}
		loan.EmployeeName = empName.String
		if monthlyInst.Valid {
			loan.MonthlyInstallment = monthlyInst.Float64
		}
		loan.ApprovedBy = toStringPtr(approvedBy)
		loan.RejectionReason = toStringPtr(rejectionReason)
		items = append(items, loan)
	}
	return items, total, rows.Err()
}
