import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../../i18n'
import AnimatedTable from '../../components/AnimatedTable'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import useTeamData from '../../hooks/useTeamData'
import { Users, Eye, Activity, ClipboardList, RefreshCw } from 'lucide-react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

export default function TeamMembers() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const {
    team, loading, fetchTeamData, todayRecords,
    getAttendanceStatus, getStatusColor,
    getAvailabilityColor,
    presentCount, absentCount, notCheckedCount, onLeaveCount,
  } = useTeamData()
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = statusFilter === 'all'
    ? team
    : team.filter(e => {
        const s = getAttendanceStatus(e)
        if (statusFilter === 'On Leave') return s.attendance === 'On Leave'
        if (statusFilter === 'Not Checked In') return s.attendance === 'Not Checked In'
        return s.attendance === statusFilter
      })

  const summaryCards = [
    { label: 'Total', value: team.length, color: 'indigo' },
    { label: 'Present', value: presentCount, color: 'emerald' },
    { label: 'Absent', value: absentCount, color: 'rose' },
    { label: 'On Leave', value: onLeaveCount, color: 'purple' },
    { label: 'Not Checked In', value: notCheckedCount, color: 'gray' },
  ]

  const cardColorMap = {
    indigo: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    rose: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300',
    purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300',
    gray: 'bg-gray-50 dark:bg-gray-500/10 text-gray-700 dark:text-gray-300',
  }

  const fmtTime = (v) => v
    ? new Date(v).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '--'

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('teamMembers') || 'Team Members'}</h1>
          <p className="mt-1 text-sm text-gray-500">{team.length} members</p>
        </div>
        <Button size="sm" variant="secondary" icon={RefreshCw} onClick={fetchTeamData} loading={loading}>
          Refresh
        </Button>
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
        {summaryCards.map(c => (
          <div key={c.label} className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium ${cardColorMap[c.color]}`}>
            <span>{c.label}</span>
            <span className="text-lg font-bold">{c.value}</span>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
        {['all', 'Present', 'Absent', 'On Leave', 'Not Checked In'].map(f => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </motion.div>

      <motion.div variants={fadeUp}>
        <div className="card-base overflow-hidden">
          <AnimatedTable
            columns={[
              {
                key: 'name', label: 'Employee',
                render: (_, row) => (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-400">
                      {(row.first_name || '')[0]}{(row.last_name || '')[0]}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{row.first_name} {row.last_name}</span>
                      <p className="text-[10px] text-gray-400">{row.employee_code}</p>
                    </div>
                  </div>
                ),
              },
              { key: 'department', label: 'Department', render: v => <span className="text-xs">{v || '--'}</span> },
              { key: 'position', label: 'Position', render: v => <span className="text-xs">{v || '--'}</span> },
              { key: 'branch', label: 'Branch', render: v => <span className="text-xs">{v || '--'}</span> },
              {
                key: 'attendance', label: 'Attendance',
                render: (_, row) => {
                  const s = getAttendanceStatus(row)
                  return <Badge color={getStatusColor(s.attendance)}>{s.attendance}</Badge>
                },
              },
              {
                key: 'availability', label: 'Status',
                render: (_, row) => {
                  const s = getAttendanceStatus(row)
                  return <Badge color={getAvailabilityColor(s.availability)}>{s.availability}</Badge>
                },
              },
              {
                key: 'check_in', label: 'Clock In',
                render: (_, row) => {
                  const rec = row._todayRec
                  return <span className="text-xs text-gray-600 dark:text-gray-300">{rec?.check_in ? fmtTime(rec.check_in) : '--'}</span>
                },
              },
              {
                key: 'check_out', label: 'Clock Out',
                render: (_, row) => {
                  const rec = row._todayRec
                  return <span className="text-xs text-gray-600 dark:text-gray-300">{rec?.check_out ? fmtTime(rec.check_out) : '--'}</span>
                },
              },
              {
                key: 'actions', label: 'Actions',
                render: (_, row) => (
                  <div className="flex items-center gap-1">
                    <button onClick={() => navigate(`/employees`)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-indigo-600 transition-colors" title="View Profile">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => navigate(`/attendance`)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-emerald-600 transition-colors" title="View Attendance">
                      <Activity className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => navigate(`/requests`)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-amber-600 transition-colors" title="View Requests">
                      <ClipboardList className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ),
              },
            ]}
            data={filtered.map(e => {
              const today = new Date().toDateString()
              const todayRec = todayRecords.find(r => r.employee_id === e.id && r.date && new Date(r.date).toDateString() === today)
              return { ...e, _todayRec: todayRec }
            })}
            pageSize={15}
            loading={loading}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
