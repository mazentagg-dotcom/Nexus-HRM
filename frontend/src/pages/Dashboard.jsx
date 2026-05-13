import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import StatsCard from '../components/StatsCard'
import AnimatedTable from '../components/AnimatedTable'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { getHRDashboard, getLeaveRequests } from '../api/hr'
import {
  Users, UserCheck, Building2, CalendarOff, DollarSign, Activity,
  ChevronRight, UserPlus, Calendar, Clock, DollarSign as DollarIcon, ClipboardCheck,
} from 'lucide-react'

const iconMap = { Users, UserCheck, Building2, CalendarOff, DollarSign, Activity }

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }
const fadeScale = { hidden: { opacity: 0, scale: 0.96 }, show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

const leaveStatusColors = { pending: 'amber', approved: 'emerald', rejected: 'rose' }
const leaveTypeColors = { annual: 'blue', sick: 'emerald', personal: 'purple', unpaid: 'gray' }

function SkeletonCard({ className = '' }) {
  return (
    <div className={`rounded-xl border border-gray-100 bg-white p-5 ${className}`}>
      <div className="animate-pulse space-y-3"><div className="h-3 w-20 rounded bg-gray-100" /><div className="h-7 w-28 rounded bg-gray-100" /><div className="h-3 w-16 rounded bg-gray-50" /></div>
    </div>
  )
}

const quickActionColors = {
  indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-200',
  emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-200',
  sky: 'from-sky-500 to-sky-600 shadow-sky-200',
  amber: 'from-amber-500 to-amber-600 shadow-amber-200',
  purple: 'from-purple-500 to-purple-600 shadow-purple-200',
  rose: 'from-rose-500 to-rose-600 shadow-rose-200',
}

const kpiConfig = [
  { id: 'total_employees', title: 'Total Employees', icon: 'Users', color: 'indigo' },
  { id: 'active_employees', title: 'Active Employees', icon: 'UserCheck', color: 'emerald' },
  { id: 'total_departments', title: 'Departments', icon: 'Building2', color: 'violet' },
  { id: 'pending_leaves', title: 'Pending Leaves', icon: 'CalendarOff', color: 'amber' },
  { id: 'monthly_payroll', title: 'Monthly Payroll', icon: 'DollarSign', color: 'sky', prefix: '$' },
  { id: 'attendance_rate', title: 'Attendance Rate', icon: 'Activity', color: 'rose', suffix: '%' },
]

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [apiData, setApiData] = useState(null)
  const [leaves, setLeaves] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      Promise.all([
        getHRDashboard().then((res) => res.data?.data || {}).catch(() => ({})),
        getLeaveRequests({ page: 1, pageSize: 5 }).then(r => { const d = r.data?.data; return d?.items || d || [] }).catch(() => []),
      ]).then(([dashboard, leaveData]) => {
        setApiData(dashboard)
        setLeaves(leaveData)
      }).finally(() => setLoading(false))
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  const quickActions = [
    { label: 'Add Employee', desc: 'New hire', icon: UserPlus, color: 'indigo', path: '/employees' },
    { label: 'New Leave', desc: 'Submit request', icon: Calendar, color: 'sky', path: '/leave' },
    { label: 'Run Payroll', desc: 'Process payroll', icon: DollarIcon, color: 'emerald', path: '/payroll' },
    { label: 'Attendance', desc: 'View today', icon: Clock, color: 'amber', path: '/attendance' },
    { label: 'Onboarding', desc: 'New hires', icon: ClipboardCheck, color: 'purple', path: '/onboarding' },
    { label: 'Self-Service', desc: 'Employee portal', icon: UserCheck, color: 'rose', path: '/self-service' },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Welcome back! Here's an overview of your workforce.</p>
        </div>
        <Button size="sm" variant="secondary" icon={Calendar}>This Month</Button>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {kpiConfig.map((kpi, i) => {
            const Icon = iconMap[kpi.icon] || Users
            let value = apiData?.[kpi.id]
            if (value === undefined || value === null) value = '-'
            if (kpi.prefix && value !== '-') value = kpi.prefix + Number(value).toLocaleString()
            if (kpi.suffix && value !== '-') value = value + kpi.suffix
            return <StatsCard key={kpi.id} title={kpi.title} value={value} icon={Icon} color={kpi.color} delay={i * 0.03} />
          })}
        </motion.div>
      )}

      {!loading && (
        <motion.div variants={fadeScale} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h3 className="text-sm font-semibold text-gray-900">Recent Leave Requests</h3>
              <button onClick={() => navigate('/leave')} className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                View all <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <AnimatedTable
              columns={[
                { key: 'employee_name', label: 'Employee', render: v => <span className="font-medium text-gray-900">{v}</span> },
                { key: 'leave_type', label: 'Type', render: v => <Badge color={leaveTypeColors[v] || 'gray'}>{v}</Badge> },
                { key: 'duration_days', label: 'Days', render: v => <span className="font-medium">{v}</span> },
                { key: 'start_date', label: 'From', render: v => <span className="text-gray-500 text-xs">{v}</span> },
                { key: 'status', label: 'Status', render: v => <Badge color={leaveStatusColors[v] || 'gray'}>{v}</Badge> },
              ]}
              data={leaves}
              pageSize={5}
            />
          </div>

          <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="px-6 pt-5 pb-3">
              <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="px-4 pb-4 grid grid-cols-2 gap-2">
              {quickActions.map((action, i) => {
                const gradient = quickActionColors[action.color] || quickActionColors.indigo
                return (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate(action.path)}
                    className="flex flex-col items-center gap-2.5 rounded-xl p-4 text-center transition-shadow hover:shadow-lg"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-md`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">{action.label}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{action.desc}</p>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
