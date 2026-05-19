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

function AdminRoute() {
  const { isAdmin, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!isAdmin) return <SuspensePage><AccessDenied /></SuspensePage>
  return <Outlet />
}

function ManagerRoute() {
  const { isAdmin, hasRole, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!isAdmin && !hasRole('manager')) return <SuspensePage><AccessDenied /></SuspensePage>
  return <Outlet />
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
          {
            element: <AdminRoute />,
            children: [
              { path: 'employees', element: <SuspensePage><Employees /></SuspensePage> },
              { path: 'payslip', element: <SuspensePage><Payslip /></SuspensePage> },
              { path: 'documents', element: <SuspensePage><Documents /></SuspensePage> },
              { path: 'onboarding', element: <SuspensePage><Onboarding /></SuspensePage> },
              { path: 'system-configuration', element: <SuspensePage><SystemConfiguration /></SuspensePage> },
              { path: 'settings', element: <Navigate to="/system-configuration" replace /> },
            ],
          },
          {
            element: <ManagerRoute />,
            children: [
              { path: 'attendance', element: <SuspensePage><Attendance /></SuspensePage> },
              { path: 'leave', element: <SuspensePage><LeaveRequests /></SuspensePage> },
              { path: 'requests', element: <SuspensePage><Requests /></SuspensePage> },
            ],
          },
          { path: 'org-chart', element: <SuspensePage><OrgChart /></SuspensePage> },
          { path: 'upload', element: <Navigate to="/onboarding" replace /> },
          { path: 'performance', element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
  { path: '*', element: <SuspensePage><NotFound /></SuspensePage> },
])

export default router
