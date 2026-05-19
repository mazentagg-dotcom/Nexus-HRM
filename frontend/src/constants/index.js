export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'LayoutDashboard', permission: 'hr.view', adminOnly: true },
  { path: '/employees', label: 'Employees', icon: 'Users', permission: 'hr.view', adminOnly: true },
  { path: '/attendance', label: 'Attendance', icon: 'Activity', permission: 'hr.view', managerOnly: true },
  { path: '/leave', label: 'Leave Requests', icon: 'CalendarOff', permission: 'hr.view', managerOnly: true },
  { path: '/payslip', label: 'Payslip', icon: 'DollarSign', permission: 'hr.view', adminOnly: true },
  { path: '/requests', label: 'Requests', icon: 'ClipboardList', permission: 'hr.view', managerOnly: true },
  { path: '/documents', label: 'Documents', icon: 'Folder', permission: 'hr.view', adminOnly: true },
  { path: '/onboarding', label: 'Onboarding', icon: 'ClipboardCheck', permission: 'hr.view', adminOnly: true },
  { path: '/org-chart', label: 'Org Chart', icon: 'Network', permission: null },
  { path: '/system-configuration', label: 'System Configuration', icon: 'Settings', permission: 'settings.view', adminOnly: true },
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
