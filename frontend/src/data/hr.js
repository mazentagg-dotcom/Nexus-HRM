export const kpiCards = [
  { id: 'total_employees', title: 'Total Employees', value: 89, trend: 'up', trendValue: 5.1, color: 'indigo', icon: 'Users' },
  { id: 'active_employees', title: 'Active Employees', value: 78, trend: 'up', trendValue: 3.2, color: 'emerald', icon: 'UserCheck' },
  { id: 'total_departments', title: 'Departments', value: 8, trend: 'neutral', trendValue: 0, color: 'sky', icon: 'Building2' },
  { id: 'pending_leaves', title: 'Pending Leaves', value: 6, trend: 'down', trendValue: 15, color: 'amber', icon: 'CalendarOff' },
  { id: 'monthly_payroll', title: 'Monthly Payroll', value: 485000, prefix: '$', trend: 'up', trendValue: 2.5, color: 'purple', icon: 'DollarSign' },
  { id: 'attendance_rate', title: 'Attendance Rate', value: 94.2, suffix: '%', trend: 'up', trendValue: 1.3, color: 'rose', icon: 'Activity' },
]

export const employees = [
  { id: 'emp-1', employee_code: 'EMP-001', first_name: 'Sarah', last_name: 'Johnson', email: 'sarah@nexus.com', phone: '+1-555-0401', department: 'Engineering', position: 'Senior Developer', status: 'active', salary: 95000, hire_date: '2022-03-15', employment_type: 'full_time', gender: 'female', date_of_birth: '1990-05-12' },
  { id: 'emp-2', employee_code: 'EMP-002', first_name: 'Michael', last_name: 'Chen', email: 'michael@nexus.com', phone: '+1-555-0402', department: 'Finance', position: 'Financial Analyst', status: 'active', salary: 82000, hire_date: '2021-06-01', employment_type: 'full_time', gender: 'male', date_of_birth: '1988-11-28' },
  { id: 'emp-3', employee_code: 'EMP-003', first_name: 'Emily', last_name: 'Davis', email: 'emily@nexus.com', phone: '+1-555-0403', department: 'Operations', position: 'Operations Manager', status: 'active', salary: 88000, hire_date: '2023-01-10', employment_type: 'full_time', gender: 'female', date_of_birth: '1992-02-14' },
  { id: 'emp-4', employee_code: 'EMP-004', first_name: 'James', last_name: 'Wilson', email: 'james@nexus.com', phone: '+1-555-0404', department: 'Sales', position: 'Sales Lead', status: 'on_leave', salary: 78000, hire_date: '2020-09-22', employment_type: 'full_time', gender: 'male', date_of_birth: '1985-07-30' },
  { id: 'emp-5', employee_code: 'EMP-005', first_name: 'Lisa', last_name: 'Park', email: 'lisa@nexus.com', phone: '+1-555-0405', department: 'Product', position: 'Product Manager', status: 'active', salary: 92000, hire_date: '2022-02-14', employment_type: 'full_time', gender: 'female', date_of_birth: '1991-09-05' },
  { id: 'emp-6', employee_code: 'EMP-006', first_name: 'Tom', last_name: 'Harris', email: 'tom@nexus.com', phone: '+1-555-0406', department: 'Engineering', position: 'DevOps Engineer', status: 'active', salary: 87000, hire_date: '2021-08-18', employment_type: 'full_time', gender: 'male', date_of_birth: '1989-03-22' },
  { id: 'emp-7', employee_code: 'EMP-007', first_name: 'Anna', last_name: 'Taylor', email: 'anna@nexus.com', phone: '+1-555-0407', department: 'HR', position: 'HR Specialist', status: 'active', salary: 65000, hire_date: '2023-04-01', employment_type: 'full_time', gender: 'female', date_of_birth: '1993-12-01' },
  { id: 'emp-8', employee_code: 'EMP-008', first_name: 'David', last_name: 'Brown', email: 'david@nexus.com', phone: '+1-555-0408', department: 'IT', position: 'IT Manager', status: 'active', salary: 105000, hire_date: '2020-03-15', employment_type: 'full_time', gender: 'male', date_of_birth: '1984-06-18' },
  { id: 'emp-9', employee_code: 'EMP-009', first_name: 'Rachel', last_name: 'Kim', email: 'rachel@nexus.com', phone: '+1-555-0409', department: 'Marketing', position: 'Marketing Lead', status: 'probation', salary: 72000, hire_date: '2024-11-01', employment_type: 'full_time', gender: 'female', date_of_birth: '1995-04-10' },
  { id: 'emp-10', employee_code: 'EMP-010', first_name: 'Jake', last_name: 'Cooper', email: 'jake@nexus.com', phone: '+1-555-0410', department: 'Engineering', position: 'Junior Developer', status: 'active', salary: 62000, hire_date: '2024-06-15', employment_type: 'full_time', gender: 'male', date_of_birth: '1997-08-25' },
]

export const departments = [
  { id: 'dept-1', name: 'Engineering', code: 'ENG', description: 'Software development team', manager_id: 'emp-1', is_active: true, employee_count: 42 },
  { id: 'dept-2', name: 'Sales', code: 'SAL', description: 'Sales and business development', manager_id: 'emp-4', is_active: true, employee_count: 28 },
  { id: 'dept-3', name: 'Marketing', code: 'MKT', description: 'Marketing and brand management', manager_id: 'emp-9', is_active: true, employee_count: 18 },
  { id: 'dept-4', name: 'Operations', code: 'OPS', description: 'Business operations', manager_id: 'emp-3', is_active: true, employee_count: 15 },
  { id: 'dept-5', name: 'Finance', code: 'FIN', description: 'Financial management', manager_id: 'emp-2', is_active: true, employee_count: 12 },
  { id: 'dept-6', name: 'HR', code: 'HR', description: 'Human resources', manager_id: 'emp-7', is_active: true, employee_count: 8 },
  { id: 'dept-7', name: 'IT', code: 'IT', description: 'IT infrastructure', manager_id: 'emp-8', is_active: true, employee_count: 10 },
  { id: 'dept-8', name: 'Product', code: 'PRD', description: 'Product management', manager_id: 'emp-5', is_active: true, employee_count: 6 },
]

export const attendanceRecords = [
  { id: 'att-1', employee_id: 'emp-1', employee_name: 'Sarah Johnson', date: '2024-12-28', check_in: '08:55', check_out: '17:32', total_hours: 8.5, status: 'present' },
  { id: 'att-2', employee_id: 'emp-2', employee_name: 'Michael Chen', date: '2024-12-28', check_in: '09:10', check_out: '18:00', total_hours: 8.8, status: 'present' },
  { id: 'att-3', employee_id: 'emp-3', employee_name: 'Emily Davis', date: '2024-12-28', check_in: '08:45', check_out: '17:15', total_hours: 8.5, status: 'present' },
  { id: 'att-4', employee_id: 'emp-4', employee_name: 'James Wilson', date: '2024-12-28', check_in: null, check_out: null, total_hours: 0, status: 'on_leave' },
  { id: 'att-5', employee_id: 'emp-5', employee_name: 'Lisa Park', date: '2024-12-28', check_in: '09:20', check_out: '17:45', total_hours: 8.4, status: 'late' },
  { id: 'att-6', employee_id: 'emp-6', employee_name: 'Tom Harris', date: '2024-12-28', check_in: '08:30', check_out: '17:00', total_hours: 8.5, status: 'present' },
  { id: 'att-7', employee_id: 'emp-7', employee_name: 'Anna Taylor', date: '2024-12-28', check_in: '08:50', check_out: '17:20', total_hours: 8.5, status: 'present' },
  { id: 'att-8', employee_id: 'emp-8', employee_name: 'David Brown', date: '2024-12-28', check_in: null, check_out: null, total_hours: 0, status: 'absent' },
  { id: 'att-9', employee_id: 'emp-9', employee_name: 'Rachel Kim', date: '2024-12-28', check_in: '10:00', check_out: '16:00', total_hours: 6.0, status: 'half_day' },
  { id: 'att-10', employee_id: 'emp-10', employee_name: 'Jake Cooper', date: '2024-12-28', check_in: '08:40', check_out: '17:30', total_hours: 8.8, status: 'present' },
  { id: 'att-11', employee_id: 'emp-1', employee_name: 'Sarah Johnson', date: '2024-12-27', check_in: '09:00', check_out: '17:45', total_hours: 8.75, status: 'present' },
  { id: 'att-12', employee_id: 'emp-2', employee_name: 'Michael Chen', date: '2024-12-27', check_in: '08:30', check_out: '17:30', total_hours: 9.0, status: 'present' },
]

export const leaveRequests = [
  { id: 'lr-1', employee_id: 'emp-4', employee_name: 'James Wilson', type: 'annual', start_date: '2025-01-05', end_date: '2025-01-09', total_days: 5, reason: 'Family vacation', status: 'pending', created_at: '2024-12-28T09:00:00Z' },
  { id: 'lr-2', employee_id: 'emp-1', employee_name: 'Sarah Johnson', type: 'personal', start_date: '2024-12-30', end_date: '2025-01-01', total_days: 3, reason: 'Personal matters', status: 'pending', created_at: '2024-12-27T14:00:00Z' },
  { id: 'lr-3', employee_id: 'emp-5', employee_name: 'Lisa Park', type: 'sick', start_date: '2024-12-26', end_date: '2024-12-27', total_days: 2, reason: 'Feeling unwell', status: 'approved', created_at: '2024-12-25T10:00:00Z' },
  { id: 'lr-4', employee_id: 'emp-9', employee_name: 'Rachel Kim', type: 'annual', start_date: '2025-01-20', end_date: '2025-01-21', total_days: 2, reason: 'Doctor appointment', status: 'pending', created_at: '2024-12-28T11:00:00Z' },
  { id: 'lr-5', employee_id: 'emp-6', employee_name: 'Tom Harris', type: 'unpaid', start_date: '2025-02-10', end_date: '2025-02-14', total_days: 5, reason: 'Extended travel', status: 'pending', created_at: '2024-12-26T15:00:00Z' },
  { id: 'lr-6', employee_id: 'emp-7', employee_name: 'Anna Taylor', type: 'sick', start_date: '2024-12-20', end_date: '2024-12-21', total_days: 2, reason: 'Flu', status: 'rejected', created_at: '2024-12-19T08:00:00Z' },
  { id: 'lr-7', employee_id: 'emp-3', employee_name: 'Emily Davis', type: 'annual', start_date: '2024-12-23', end_date: '2024-12-24', total_days: 2, reason: 'Holiday break', status: 'approved', created_at: '2024-12-20T12:00:00Z' },
  { id: 'lr-8', employee_id: 'emp-8', employee_name: 'David Brown', type: 'personal', start_date: '2025-01-15', end_date: '2025-01-16', total_days: 2, reason: 'Home repair', status: 'pending', created_at: '2024-12-28T16:00:00Z' },
]

export const payrollRecords = [
  { id: 'pr-1', employee_id: 'emp-1', employee_name: 'Sarah Johnson', payroll_number: 'PAY-2024-012', period_start: '2024-12-01', period_end: '2024-12-31', basic_salary: 7917, overtime_pay: 450, bonus: 500, deductions: 200, tax_amount: 1580, net_pay: 7087, status: 'paid', pay_date: '2024-12-28' },
  { id: 'pr-2', employee_id: 'emp-2', employee_name: 'Michael Chen', payroll_number: 'PAY-2024-011', period_start: '2024-12-01', period_end: '2024-12-31', basic_salary: 6833, overtime_pay: 0, bonus: 300, deductions: 180, tax_amount: 1298, net_pay: 5655, status: 'paid', pay_date: '2024-12-28' },
  { id: 'pr-3', employee_id: 'emp-3', employee_name: 'Emily Davis', payroll_number: 'PAY-2024-010', period_start: '2024-12-01', period_end: '2024-12-31', basic_salary: 7333, overtime_pay: 200, bonus: 0, deductions: 150, tax_amount: 1397, net_pay: 5986, status: 'paid', pay_date: '2024-12-28' },
  { id: 'pr-4', employee_id: 'emp-4', employee_name: 'James Wilson', payroll_number: 'PAY-2024-009', period_start: '2024-12-01', period_end: '2024-12-31', basic_salary: 6500, overtime_pay: 0, bonus: 0, deductions: 120, tax_amount: 1176, net_pay: 5204, status: 'processed', pay_date: null },
  { id: 'pr-5', employee_id: 'emp-5', employee_name: 'Lisa Park', payroll_number: 'PAY-2024-008', period_start: '2024-12-01', period_end: '2024-12-31', basic_salary: 7667, overtime_pay: 380, bonus: 750, deductions: 200, tax_amount: 1554, net_pay: 7043, status: 'paid', pay_date: '2024-12-28' },
  { id: 'pr-6', employee_id: 'emp-6', employee_name: 'Tom Harris', payroll_number: 'PAY-2024-007', period_start: '2024-12-01', period_end: '2024-12-31', basic_salary: 7250, overtime_pay: 600, bonus: 0, deductions: 160, tax_amount: 1338, net_pay: 6352, status: 'paid', pay_date: '2024-12-28' },
  { id: 'pr-7', employee_id: 'emp-7', employee_name: 'Anna Taylor', payroll_number: 'PAY-2024-006', period_start: '2024-12-01', period_end: '2024-12-31', basic_salary: 5417, overtime_pay: 0, bonus: 0, deductions: 100, tax_amount: 963, net_pay: 4354, status: 'pending', pay_date: null },
  { id: 'pr-8', employee_id: 'emp-8', employee_name: 'David Brown', payroll_number: 'PAY-2024-005', period_start: '2024-12-01', period_end: '2024-12-31', basic_salary: 8750, overtime_pay: 250, bonus: 1000, deductions: 220, tax_amount: 1856, net_pay: 7924, status: 'paid', pay_date: '2024-12-28' },
]

export const employeeDocuments = [
  { id: 'doc-1', employee_id: 'emp-1', document_type: 'contract', document_name: 'Employment Contract 2022', file_type: 'application/pdf', file_size: 245000, expiry_date: '2025-03-15', created_at: '2022-03-15' },
  { id: 'doc-2', employee_id: 'emp-1', document_type: 'id_card', document_name: 'National ID Card', file_type: 'image/jpeg', file_size: 850000, expiry_date: null, created_at: '2022-03-15' },
  { id: 'doc-3', employee_id: 'emp-2', document_type: 'tax_form', document_name: 'W-4 Tax Form 2024', file_type: 'application/pdf', file_size: 120000, expiry_date: null, created_at: '2024-01-05' },
  { id: 'doc-4', employee_id: 'emp-3', document_type: 'education_certificate', document_name: 'MBA Certificate', file_type: 'application/pdf', file_size: 540000, expiry_date: null, created_at: '2023-01-10' },
  { id: 'doc-5', employee_id: 'emp-5', document_type: 'passport', document_name: 'US Passport', file_type: 'image/jpeg', file_size: 1200000, expiry_date: '2028-09-05', created_at: '2022-02-14' },
  { id: 'doc-6', employee_id: 'emp-8', document_type: 'experience_letter', document_name: 'Previous Employment Letter', file_type: 'application/pdf', file_size: 180000, expiry_date: null, created_at: '2020-03-15' },
]

export const employeeStatusColors = {
  active: 'emerald',
  on_leave: 'amber',
  probation: 'sky',
  terminated: 'rose',
  resigned: 'gray',
}

export const leaveStatusColors = {
  pending: 'amber',
  approved: 'emerald',
  rejected: 'rose',
  cancelled: 'gray',
}

export const leaveTypeColors = {
  annual: 'sky',
  sick: 'rose',
  personal: 'purple',
  maternity: 'pink',
  paternity: 'indigo',
  unpaid: 'gray',
  bereavement: 'rose',
  compensatory: 'emerald',
}

export const payrollStatusColors = {
  pending: 'amber',
  processed: 'sky',
  paid: 'emerald',
  cancelled: 'rose',
}

export const attendanceStatusColors = {
  present: 'emerald',
  absent: 'rose',
  late: 'amber',
  half_day: 'sky',
  on_leave: 'purple',
  holiday: 'indigo',
  work_from_home: 'emerald',
}

export const documentTypeColors = {
  id_card: 'indigo',
  passport: 'sky',
  driving_license: 'purple',
  education_certificate: 'emerald',
  experience_letter: 'amber',
  offer_letter: 'rose',
  contract: 'indigo',
  tax_form: 'rose',
  other: 'gray',
}

export const deptChartData = [
  { name: 'Engineering', value: 42 },
  { name: 'Sales', value: 28 },
  { name: 'Marketing', value: 18 },
  { name: 'Operations', value: 15 },
  { name: 'Finance', value: 12 },
  { name: 'IT', value: 10 },
  { name: 'HR', value: 8 },
  { name: 'Product', value: 6 },
]

export const headcountTrend = [
  { month: 'Jan', count: 72 },
  { month: 'Feb', count: 74 },
  { month: 'Mar', count: 76 },
  { month: 'Apr', count: 78 },
  { month: 'May', count: 79 },
  { month: 'Jun', count: 81 },
  { month: 'Jul', count: 82 },
  { month: 'Aug', count: 83 },
  { month: 'Sep', count: 85 },
  { month: 'Oct', count: 86 },
  { month: 'Nov', count: 88 },
  { month: 'Dec', count: 89 },
]
