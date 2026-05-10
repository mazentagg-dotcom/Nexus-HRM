import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import StatsCard from '../components/StatsCard'
import AnimatedTable from '../components/AnimatedTable'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { getHRDashboard } from '../api/hr'
import {
  kpiCards, employees as mockEmployees, leaveRequests as mockLeaves,
  departments, headcountTrend, deptChartData,
  leaveStatusColors, leaveTypeColors,
} from '../data/hr'
import {
  Users, UserCheck, Building2, CalendarOff, DollarSign, Activity,
  ChevronRight, UserPlus, Calendar, Clock, DollarSign as DollarIcon, ClipboardCheck,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'

const iconMap = { Users, UserCheck, Building2, CalendarOff, DollarSign, Activity }

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }
const fadeScale = { hidden: { opacity: 0, scale: 0.96 }, show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

const tooltipStyle = { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.08)', fontSize: '13px' }
const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899', '#ef4444', '#14b8a6']

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

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [apiData, setApiData] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      getHRDashboard()
        .then((res) => setApiData(res.data?.data))
        .catch(() => {})
        .finally(() => setLoading(false))
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  const kpis = kpiCards.map(kpi => {
    if (!apiData) return kpi
    const m = { total_employees: apiData.total_employees, active_employees: apiData.active_employees, total_departments: apiData.total_departments, pending_leaves: apiData.pending_leaves, monthly_payroll: apiData.monthly_payroll, attendance_rate: apiData.attendance_rate }
    return m[kpi.id] !== undefined ? { ...kpi, value: m[kpi.id] } : kpi
  })

  const leaves = mockLeaves || []
  const pendingLeaves = leaves.filter(l => l.status === 'pending')

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
          {kpis.map((kpi, i) => {
            const Icon = iconMap[kpi.icon] || Users
            return <StatsCard key={kpi.id} title={kpi.title} value={kpi.value} prefix={kpi.prefix} suffix={kpi.suffix} icon={Icon} trend={kpi.trend} trendValue={kpi.trendValue} color={kpi.color} delay={i * 0.03} />
          })}
        </motion.div>
      )}

      {loading ? null : (
        <motion.div variants={fadeScale} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="lg:col-span-1 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="px-6 pt-5 pb-3">
              <h3 className="text-sm font-semibold text-gray-900">Headcount Trend</h3>
              <p className="text-xs text-gray-400 mt-0.5">Monthly employee count</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={headcountTrend || []}>
                <defs><linearGradient id="hcGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} fill="url(#hcGrad)" name="Employees" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-1 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="px-6 pt-5 pb-3">
              <h3 className="text-sm font-semibold text-gray-900">Department Distribution</h3>
              <p className="text-xs text-gray-400 mt-0.5">Employees per department</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deptChartData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={28}>
                  {(deptChartData || []).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {loading ? null : (
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
                { key: 'type', label: 'Type', render: v => <Badge color={leaveTypeColors[v] || 'gray'}>{v}</Badge> },
                { key: 'total_days', label: 'Days', render: v => <span className="font-medium">{v}</span> },
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
