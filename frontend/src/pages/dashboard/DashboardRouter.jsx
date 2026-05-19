import { useAuth } from '../../hooks/useAuth'
import AdminDashboard from '../Dashboard'
import ManagerDashboard from './ManagerDashboard'
import EmployeeDashboard from '../employee-dashboard/EmployeeDashboard'

export default function DashboardRouter() {
  const { isAdmin, hasRole } = useAuth()

  if (isAdmin) return <AdminDashboard />
  if (hasRole('manager')) return <ManagerDashboard />
  return <EmployeeDashboard />
}
