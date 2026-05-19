export const ADMIN_NAV = [
  { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/employees', label: 'Employees', icon: 'Users' },
  { path: '/attendance', label: 'Attendance', icon: 'Activity' },
  { path: '/leave', label: 'Leave Requests', icon: 'CalendarOff' },
  { path: '/requests', label: 'Requests', icon: 'ClipboardList' },
  { path: '/onboarding', label: 'Onboarding', icon: 'ClipboardCheck' },
  { path: '/documents', label: 'Documents', icon: 'Folder' },
  { path: '/payslip', label: 'Payslip', icon: 'DollarSign' },
  { path: '/org-chart', label: 'Org Chart', icon: 'Network' },
  { path: '/system-configuration', label: 'System Configuration', icon: 'Settings' },
]

export const MANAGER_NAV = [
  { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/team-members', label: 'Team Members', icon: 'Users' },
  { path: '/attendance', label: 'Team Attendance', icon: 'Activity' },
  { path: '/leave', label: 'Leave Requests', icon: 'CalendarOff' },
  { path: '/requests', label: 'Requests', icon: 'ClipboardList' },
  { path: '/org-chart', label: 'Org Chart', icon: 'Network' },
]

export const EMPLOYEE_NAV = [
  { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/attendance', label: 'My Attendance', icon: 'Activity' },
  { path: '/requests', label: 'My Requests', icon: 'ClipboardList' },
  { path: '/payslip', label: 'My Payslip', icon: 'DollarSign' },
  { path: '/documents', label: 'My Documents', icon: 'Folder' },
]

export const ROLE_LABELS = {
  super_admin: 'Admin',
  admin: 'Admin',
  hr_director: 'HR Director',
  manager: 'Manager',
  employee: 'Employee',
}

export const CHART_COLORS = {
  primary: '#4f46e5',
  primaryLight: '#e0e7ff',
  success: '#10b981',
  successLight: '#d1fae5',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  danger: '#f43f5e',
  dangerLight: '#ffe4e6',
  info: '#0ea5e9',
  infoLight: '#e0f2fe',
}

export const STATUS_COLORS = {
  active: 'emerald',
  pending: 'amber',
  draft: 'gray',
  approved: 'emerald',
  confirmed: 'indigo',
  completed: 'blue',
  cancelled: 'rose',
  rejected: 'rose',
  overdue: 'red',
  in_progress: 'blue',
  shipped: 'indigo',
  delivered: 'emerald',
  processing: 'amber',
  open: 'blue',
  won: 'emerald',
  lost: 'rose',
  closed: 'gray',
  inactive: 'gray',
}

export const PAGINATION_DEFAULTS = { page: 1, pageSize: 20, maxPageSize: 100 }
