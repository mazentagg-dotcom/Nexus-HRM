import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AnimatedTable from '../../components/AnimatedTable'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import { getAttendance } from '../../api/hr'
import { useI18n } from '../../i18n'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

const statusColors = { present: 'emerald', absent: 'rose', late: 'amber', half_day: 'blue', on_leave: 'purple' }

export default function Attendance() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState([])
  const [thisMonth, setThisMonth] = useState(false)

  useEffect(() => {
    getAttendance({ page: 1, pageSize: 100 })
      .then(r => { const d = r.data?.data; setRecords(d?.items || d || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = thisMonth
    ? records.filter(r => {
        if (!r.date) return false
        const d = new Date(r.date)
        if (isNaN(d.getTime())) return false
        const now = new Date()
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
    : records

  const today = new Date().toISOString().slice(0, 10)
  const present = filtered.filter(a => a.status === 'present').length
  const late = filtered.filter(a => a.status === 'late').length
  const absent = filtered.filter(a => a.status === 'absent').length

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('attendance')}</h1><p className="mt-1 text-sm text-gray-500">{t('trackAttendance')}</p></div>
        <Button size="sm" variant={thisMonth ? 'primary' : 'secondary'} onClick={() => setThisMonth(p => !p)}>{t('thisMonth')}</Button>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card-base p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-100 dark:ring-emerald-800"><CheckCircle className="h-6 w-6 text-emerald-600" /></div>
          <div><p className="text-sm text-gray-500 dark:text-gray-400">Present</p><p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{loading ? '-' : present}</p></div>
        </div>
        <div className="card-base p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20 ring-1 ring-amber-100 dark:ring-amber-800"><Clock className="h-6 w-6 text-amber-600" /></div>
          <div><p className="text-sm text-gray-500 dark:text-gray-400">Late</p><p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{loading ? '-' : late}</p></div>
        </div>
        <div className="card-base p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-900/20 ring-1 ring-rose-100 dark:ring-rose-800"><XCircle className="h-6 w-6 text-rose-600" /></div>
          <div><p className="text-sm text-gray-500 dark:text-gray-400">Absent</p><p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{loading ? '-' : absent}</p></div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <div className="card-base overflow-hidden">
          <AnimatedTable columns={[
            { key: 'employee_name', label: t('employeeName'), render: v => <span className="font-medium text-gray-900 dark:text-gray-100">{v || '--'}</span> },
            { key: 'employee_id', label: t('employeeId'), render: (_, r) => <span className="text-gray-500 text-xs font-mono">{r.employee_id || '--'}</span> },
            { key: 'date', label: t('date') },
            { key: 'check_in', label: t('clockIn'), render: v => <span className="text-gray-500 text-xs">{v || '--'}</span> },
            { key: 'check_out', label: t('clockOut'), render: v => <span className="text-gray-500 text-xs">{v || '--'}</span> },
            { key: 'work_hours', label: t('totalHours'), render: v => <span className="text-gray-500 text-xs">{v || '--'}</span> },
            { key: 'status', label: t('status'), render: v => <Badge color={statusColors[v] || 'gray'}>{v}</Badge> },
          ]} data={filtered} pageSize={10} loading={loading} />
        </div>
      </motion.div>
    </motion.div>
  )
}
