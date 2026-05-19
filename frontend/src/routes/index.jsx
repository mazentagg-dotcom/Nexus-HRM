import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingScreen from '../components/LoadingScreen'
import ErrorBoundary from '../components/ErrorBoundary'
import MainLayout from '../layouts/MainLayout'
import Login from '../pages/Login'

const DashboardRouter = lazy(() => import('../pages/dashboard/DashboardRouter'))
const Employees = lazy(() => import('../pages/employees/Employees'))
const Attendance = lazy(() => import('../pages/attendance/Attendance'))
const LeaveRequests = lazy(() => import('../pages/leave/LeaveRequests'))
const Payslip = lazy(() => import('../pages/payslip/Payslip'))
const Requests = lazy(() => import('../pages/requests/Requests'))
const Onboarding = lazy(() => import('../pages/onboarding/Onboarding'))
const Documents = lazy(() => import('../pages/documents/Documents'))
const OrgChart = lazy(() => import('../pages/org-chart/OrgChart'))
const SystemConfiguration = lazy(() => import('../pages/system-configuration/SystemConfiguration'))
const AccessDenied = lazy(() => import('../pages/AccessDenied'))
const NotFound = lazy(() => import('../pages/NotFound'))

const MyAttendance = lazy(() => import('../pages/self-service/MyAttendance'))
const MyRequests = lazy(() => import('../pages/self-service/MyRequests'))
const MyPayslip = lazy(() => import('../pages/self-service/MyPayslip'))
const MyDocuments = lazy(() => import('../pages/self-service/MyDocuments'))

function SuspensePage({ children }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}

function LoginRoute() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/" replace />
  return <Login />
}

function AttendancePage() {
  const { hasRole } = useAuth()
  if (hasRole('employee')) return <MyAttendance />
  return <Attendance />
}

function LeavePage() {
  const { hasRole } = useAuth()
  if (hasRole('employee')) return <MyRequests />
  return <LeaveRequests />
}

function RequestsPage() {
  const { hasRole } = useAuth()
  if (hasRole('employee')) return <MyRequests />
  return <Requests />
}

function PayslipPage() {
  const { isAdmin, hasRole } = useAuth()
  if (hasRole('employee')) return <MyPayslip />
  if (!isAdmin) return <AccessDenied />
  return <Payslip />
}

function DocumentsPage() {
  const { isAdmin, hasRole } = useAuth()
  if (hasRole('employee')) return <MyDocuments />
  if (!isAdmin) return <AccessDenied />
  return <Documents />
}

function EmployeesPage() {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <AccessDenied />
  return <Employees />
}

function OnboardingPage() {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <AccessDenied />
  return <Onboarding />
}

function SystemConfigPage() {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <AccessDenied />
  return <SystemConfiguration />
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginRoute />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          { index: true, element: <SuspensePage><DashboardRouter /></SuspensePage> },
          { path: 'dashboard', element: <Navigate to="/" replace /> },
          { path: 'self-service', element: <Navigate to="/" replace /> },
          { path: 'employee-dashboard', element: <Navigate to="/" replace /> },
          { path: 'employees', element: <SuspensePage><EmployeesPage /></SuspensePage> },
          { path: 'attendance', element: <SuspensePage><AttendancePage /></SuspensePage> },
          { path: 'leave', element: <SuspensePage><LeavePage /></SuspensePage> },
          { path: 'requests', element: <SuspensePage><RequestsPage /></SuspensePage> },
          { path: 'payslip', element: <SuspensePage><PayslipPage /></SuspensePage> },
          { path: 'documents', element: <SuspensePage><DocumentsPage /></SuspensePage> },
          { path: 'onboarding', element: <SuspensePage><OnboardingPage /></SuspensePage> },
          { path: 'system-configuration', element: <SuspensePage><SystemConfigPage /></SuspensePage> },
          { path: 'settings', element: <Navigate to="/" replace /> },
          { path: 'org-chart', element: <SuspensePage><OrgChart /></SuspensePage> },
          { path: 'upload', element: <Navigate to="/" replace /> },
          { path: 'performance', element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
  { path: '*', element: <SuspensePage><NotFound /></SuspensePage> },
])

export default router
