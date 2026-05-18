export const BRANCHES = [
  'Main Office',
  'South Branch',
  'West Branch',
  'Downtown Branch',
  'Customer Service Center',
  'Corporate Headquarters',
]

export const BRANCH_OPTIONS = BRANCHES.map(b => ({ value: b, label: b }))

export const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'intern', label: 'Intern' },
]

export const LEAVE_TYPES = [
  { value: 'annual', label: 'Annual Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'personal', label: 'Personal Leave' },
  { value: 'unpaid', label: 'Unpaid Leave' },
]

export const DEDUCTION_TYPES = [
  { value: 'social_insurance', label: 'Social Insurance' },
  { value: 'taxes', label: 'Taxes' },
  { value: 'loan', label: 'Loan' },
  { value: 'medical_insurance', label: 'Medical Insurance' },
  { value: 'late_attendance', label: 'Late Attendance' },
  { value: 'absence', label: 'Absence' },
  { value: 'other', label: 'Other' },
]

export const REQUEST_TYPES = [
  { value: 'leave', label: 'Leave' },
  { value: 'vacation', label: 'Vacation' },
  { value: 'loan', label: 'Loan' },
  { value: 'attendance_correction', label: 'Attendance Correction' },
  { value: 'payroll_correction', label: 'Payroll Correction' },
  { value: 'document_request', label: 'Document Request' },
  { value: 'other', label: 'Other' },
]

export const EMPLOYEE_TEMPLATE_HEADERS = [
  'Employee Name',
  'Employee ID',
  'Email',
  'Phone',
  'Department',
  'Designation',
  'Branch',
  'Employment Date',
  'Employment Type',
  'Basic Salary',
  'Status',
]
