import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingScreen from '../components/LoadingScreen'
import ErrorBoundary from '../components/ErrorBoundary'
import MainLayout from '../layouts/MainLayout'
import Login from '../pages/Login'

const Dashboard = lazy(() => import('../pages/Dashboard'))
const Employees = lazy(() => import('../pages/employees/Employees'))
const Attendance = lazy(() => import('../pages/attendance/Attendance'))
const LeaveRequests = lazy(() => import('../pages/leave/LeaveRequests'))
const Payroll = lazy(() => import('../pages/payroll/Payroll'))
const Documents = lazy(() => import('../pages/documents/Documents'))
const Onboarding = lazy(() => import('../pages/onboarding/Onboarding'))
const Performance = lazy(() => import('../pages/performance/Performance'))
const OrgChart = lazy(() => import('../pages/org-chart/OrgChart'))
const SelfService = lazy(() => import('../pages/self-service/SelfService'))
const EmployeeDashboard = lazy(() => import('../pages/employee-dashboard/EmployeeDashboard'))
const Settings = lazy(() => import('../pages/settings/Settings'))
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
          { index: true, element: <SuspensePage><Dashboard /></SuspensePage> },
          { path: 'employees', element: <SuspensePage><Employees /></SuspensePage> },
          { path: 'attendance', element: <SuspensePage><Attendance /></SuspensePage> },
          { path: 'leave', element: <SuspensePage><LeaveRequests /></SuspensePage> },
          { path: 'payroll', element: <SuspensePage><Payroll /></SuspensePage> },
          { path: 'documents', element: <SuspensePage><Documents /></SuspensePage> },
          { path: 'onboarding', element: <SuspensePage><Onboarding /></SuspensePage> },
          { path: 'performance', element: <SuspensePage><Performance /></SuspensePage> },
          { path: 'org-chart', element: <SuspensePage><OrgChart /></SuspensePage> },
          { path: 'self-service', element: <SuspensePage><SelfService /></SuspensePage> },
          { path: 'employee-dashboard', element: <SuspensePage><EmployeeDashboard /></SuspensePage> },
          { path: 'settings', element: <SuspensePage><Settings /></SuspensePage> },
        ],
      },
    ],
  },
  { path: '*', element: <SuspensePage><NotFound /></SuspensePage> },
])

export default router
