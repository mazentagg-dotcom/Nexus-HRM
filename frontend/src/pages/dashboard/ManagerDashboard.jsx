import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useI18n } from '../../i18n'
import StatsCard from '../../components/StatsCard'
import AnimatedTable from '../../components/AnimatedTable'
import Badge from '../../components/Badge'
import useTeamData from '../../hooks/useTeamData'
import { getLeaveRequests } from '../../api/hr'
import {
  Users, UserCheck, Clock, AlertCircle,
  Activity, Eye, CheckCircle, Network, ChevronRight,
} from 'lucide-react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
}
const fadeScale = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
}

const statusColors = {
  pending: 'amber', approved: 'emerald', rejected: 'rose',
  present: 'emerald', absent: 'rose', late: 'amber',
}

const quickActionGradients = {
  indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-200',
  emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-200',
  sky: 'from-sky-500 to-sky-600 shadow-sky-200',
  amber: 'from-amber-500 to-amber-600 shadow-amber-200',
  purple: 'from-purple-500 to-purple-600 shadow-purple-200',
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
      <div className="animate-pulse space-y-3">
        <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-700" />
        <div className="h-7 w-28 rounded bg-gray-100 dark:bg-gray-700" />
      </div>
    </div>
  )
}

export default function ManagerDashboard() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const {
    team, loading,
    presentCount, absentCount, notCheckedCount, onLeaveCount,
  } = useTeamData()
  const [leaves, setLeaves] = useState([])

  useEffect(() => {
    getLeaveRequests({ page: 1, pageSize: 5, status: 'pending' })
      .then(r => { const d = r.data?.data; setLeaves(d?.items || d || []) })
      .catch(() => setLeaves([]))
  }, [])

  const attendanceRate = team.length > 0
    ? Math.round((presentCount / team.length) * 100)
    : 0

  const kpis = [
    { title: 'Team Members', value: team.length || '-', icon: Users, color: 'indigo' },
    { title: 'Team Present', value: presentCount || '-', icon: UserCheck, color: 'emerald' },
    { title: 'Attendance Rate', value: attendanceRate ? attendanceRate + '%' : '-', icon: Activity, color: 'sky' },
    { title: 'On Leave', value: onLeaveCount || '-', icon: Clock, color: 'amber' },
  ]

  const quickActions = [
    { label: 'Team Attendance', desc: 'View today', icon: Activity, color: 'indigo', path: '/attendance' },
    { label: 'Team Requests', desc: 'Review', icon: Eye, color: 'emerald', path: '/requests' },
    { label: 'Leave Requests', desc: 'Approve', icon: CheckCircle, color: 'sky', path: '/leave' },
    { label: 'Team Members', desc: 'View all', icon: Users, color: 'amber', path: '/team-members' },
    { label: 'Org Chart', desc: 'Structure', icon: Network, color: 'purple', path: '/org-chart' },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('dashboard')}</h1>
          <p className="mt-1 text-sm text-gray-500">Manager Overview</p>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi, i) => (
            <StatsCard key={kpi.title} title={kpi.title} value={kpi.value} icon={kpi.icon} color={kpi.color} delay={i * 0.03} />
          ))}
        </motion.div>
      )}

      {!loading && (
        <motion.div variants={fadeScale} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Pending Team Requests</h3>
              <button onClick={() => navigate('/requests')} className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors">
                {t('viewAll')} <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            {leaves.length > 0 ? (
              <AnimatedTable
                columns={[
                  { key: 'employee_name', label: 'Employee', render: v => <span className="font-medium text-gray-900 dark:text-gray-100">{v}</span> },
                  { key: 'leave_type', label: 'Type', render: v => <Badge color={statusColors[v] || 'gray'}>{v}</Badge> },
                  { key: 'duration_days', label: 'Days', render: v => <span className="font-medium">{v}</span> },
                  { key: 'status', label: 'Status', render: v => <Badge color={statusColors[v] || 'gray'}>{v}</Badge> },
                ]}
                data={leaves}
                pageSize={5}
              />
            ) : (
              <div className="px-6 py-8 text-center text-sm text-gray-400">No pending requests</div>
            )}
          </div>

          <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
            <div className="px-6 pt-5 pb-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h3>
            </div>
            <div className="px-4 pb-4 grid grid-cols-2 gap-2">
              {quickActions.map((action, i) => (
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
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${quickActionGradients[action.color]} shadow-md`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{action.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{action.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
