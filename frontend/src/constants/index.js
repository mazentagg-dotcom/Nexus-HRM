export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'LayoutDashboard', permission: 'hr.view', adminOnly: true },
  { path: '/employee-dashboard', label: 'Dashboard', icon: 'LayoutDashboard', permission: null, employeeOnly: true },
  { path: '/employees', label: 'Employees', icon: 'Users', permission: 'hr.view' },
  { path: '/attendance', label: 'Attendance', icon: 'Activity', permission: 'hr.view' },
  { path: '/leave', label: 'Leave Requests', icon: 'CalendarOff', permission: 'hr.view' },
  { path: '/payslip', label: 'Payslip', icon: 'DollarSign', permission: 'hr.view' },
  { path: '/requests', label: 'Requests', icon: 'ClipboardList', permission: 'hr.view' },
  { path: '/upload', label: 'Upload Data', icon: 'Upload', permission: 'hr.view' },
  { path: '/documents', label: 'Documents', icon: 'Folder', permission: 'hr.view' },
  { path: '/onboarding', label: 'Onboarding', icon: 'ClipboardCheck', permission: 'hr.view' },
  { path: '/performance', label: 'Performance', icon: 'Target', permission: 'hr.view' },
  { path: '/org-chart', label: 'Org Chart', icon: 'Network', permission: 'hr.view' },
  { path: '/settings', label: 'Settings', icon: 'Settings', permission: 'settings.view' },
]

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
