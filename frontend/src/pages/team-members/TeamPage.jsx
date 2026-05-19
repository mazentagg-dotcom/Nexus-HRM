import { useState } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../../i18n'
import AnimatedTable from '../../components/AnimatedTable'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import useTeamData from '../../hooks/useTeamData'
import { RefreshCw } from 'lucide-react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
}

export default function TeamPage() {
  const { t } = useI18n()
  const {
    team, loading, fetchTeamData, todayRecords,
    getAttendanceStatus, getStatusColor,
    getAvailabilityColor,
    presentCount, absentCount, notCheckedCount, onLeaveCount,
  } = useTeamData()
  const [view, setView] = useState('members')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = statusFilter === 'all'
    ? team
    : team.filter(e => {
        const s = getAttendanceStatus(e)
        if (statusFilter === 'On Leave') return s.attendance === 'On Leave'
        if (statusFilter === 'Not Checked In') return s.attendance === 'Not Checked In'
        return s.attendance === statusFilter
      })

  const attendanceRate = team.length > 0 ? Math.round((presentCount / team.length) * 100) : 0

  const summaryCards = [
    { label: 'Total', value: team.length, color: 'indigo' },
    { label: 'Present', value: presentCount, color: 'emerald' },
    { label: 'Absent', value: absentCount, color: 'rose' },
    { label: 'On Leave', value: onLeaveCount, color: 'purple' },
    { label: 'Not Checked In', value: notCheckedCount, color: 'gray' },
    { label: 'Rate', value: attendanceRate + '%', color: 'sky' },
  ]

  const cardColorMap = {
    indigo: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    rose: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300',
    purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300',
    gray: 'bg-gray-50 dark:bg-gray-500/10 text-gray-700 dark:text-gray-300',
    sky: 'bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300',
  }

  const fmtTime = (v) => v
    ? new Date(v).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '--'

  const tableData = filtered.map(e => {
    const today = new Date().toDateString()
    const todayRec = todayRecords.find(r => r.employee_id === e.id && r.date && new Date(r.date).toDateString() === today)
    const s = getAttendanceStatus(e)
    const totalHours = (todayRec?.check_in && todayRec?.check_out)
      ? ((new Date(todayRec.check_out) - new Date(todayRec.check_in)) / 3600000).toFixed(1)
      : '--'
    return { ...e, _todayRec: todayRec, _status: s, _hours: totalHours }
  })

  const viewTabs = [
    { id: 'members', label: 'Team Members' },
    { id: 'attendance', label: 'Attendance Today' },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Team</h1>
          <p className="mt-1 text-sm text-gray-500">{team.length} members &middot; {attendanceRate}% attendance</p>
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

      <motion.div variants={fadeUp} className="flex items-center gap-2">
        {viewTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${view === tab.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
          >
            {tab.label}
          </button>
        ))}
        <div className="ml-2 flex flex-wrap gap-2">
          {['all', 'Present', 'Absent', 'On Leave', 'Not Checked In'].map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${statusFilter === f ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <div className="card-base overflow-hidden">
          {view === 'members' ? (
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
                  render: (_, row) => <Badge color={getStatusColor(row._status.attendance)}>{row._status.attendance}</Badge>,
                },
                {
                  key: 'availability', label: 'Status',
                  render: (_, row) => <Badge color={getAvailabilityColor(row._status.availability)}>{row._status.availability}</Badge>,
                },
                {
                  key: 'check_in', label: 'Clock In',
                  render: (_, row) => <span className="text-xs text-gray-600 dark:text-gray-300">{row._todayRec?.check_in ? fmtTime(row._todayRec.check_in) : '--'}</span>,
                },
                {
                  key: 'check_out', label: 'Clock Out',
                  render: (_, row) => <span className="text-xs text-gray-600 dark:text-gray-300">{row._todayRec?.check_out ? fmtTime(row._todayRec.check_out) : '--'}</span>,
                },
              ]}
              data={tableData}
              pageSize={15}
              loading={loading}
            />
          ) : (
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
                        <p className="text-[10px] text-gray-400">{row.department}</p>
                      </div>
                    </div>
                  ),
                },
                { key: 'check_in', label: 'Clock In', render: (_, row) => <span className="text-xs">{row._todayRec?.check_in ? fmtTime(row._todayRec.check_in) : '--'}</span> },
                { key: 'check_out', label: 'Clock Out', render: (_, row) => <span className="text-xs">{row._todayRec?.check_out ? fmtTime(row._todayRec.check_out) : '--'}</span> },
                { key: 'hours', label: 'Total Hours', render: (_, row) => <span className="text-xs font-medium">{row._hours}</span> },
                { key: 'attendance', label: 'Status', render: (_, row) => <Badge color={getStatusColor(row._status.attendance)}>{row._status.attendance}</Badge> },
              ]}
              data={tableData}
              pageSize={15}
              loading={loading}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
