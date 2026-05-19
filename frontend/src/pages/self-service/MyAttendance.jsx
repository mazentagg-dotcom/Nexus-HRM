import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../../i18n'
import AnimatedTable from '../../components/AnimatedTable'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import { useToast } from '../../components/feedback/Toast'
import { useAuth } from '../../hooks/useAuth'
import { getMyAttendance, checkIn, checkOut } from '../../api/hr'
import { Clock, LogIn, LogOut } from 'lucide-react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

const statusColors = { present: 'emerald', absent: 'rose', late: 'amber', 'on_leave': 'purple', half_day: 'blue' }

export default function MyAttendance() {
  const { t } = useI18n()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState([])
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    setLoading(true)
    getMyAttendance({ page: 1, pageSize: 100 })
      .then(r => { const d = r.data?.data; setRecords(d?.items || d || []) })
      .catch(() => setRecords([]))
      .finally(() => setLoading(false))
  }, [])

  const handleCheckIn = async () => {
    setChecking(true)
    try {
      await checkIn()
      showToast(t('checkedIn'), 'success')
      const r = await getMyAttendance({ page: 1, pageSize: 100 })
      const d = r.data?.data
      setRecords(d?.items || d || [])
    } catch (e) { showToast(e.response?.data?.message || 'Error', 'error') }
    setChecking(false)
  }

  const handleCheckOut = async () => {
    setChecking(true)
    try {
      await checkOut()
      showToast(t('checkedOut'), 'success')
      const r = await getMyAttendance({ page: 1, pageSize: 100 })
      const d = r.data?.data
      setRecords(d?.items || d || [])
    } catch (e) { showToast(e.response?.data?.message || 'Error', 'error') }
    setChecking(false)
  }

  const fmtTime = (v) => v ? new Date(v).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--'
  const fmtDate = (v) => v ? new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--'

  const todayRecord = records.find(r => {
    if (!r.date) return false
    return new Date(r.date).toDateString() === new Date().toDateString()
  })
  const checkedIn = !!todayRecord?.check_in && !todayRecord?.check_out

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('myAttendance')}</h1><p className="mt-1 text-sm text-gray-500">{t('attendanceOverview')}</p></div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" icon={LogIn} onClick={handleCheckIn} loading={checking} disabled={checkedIn}>{t('checkIn')}</Button>
          <Button size="sm" variant="secondary" icon={LogOut} onClick={handleCheckOut} loading={checking} disabled={!checkedIn}>{t('checkOut')}</Button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <div className="card-base overflow-hidden">
          <AnimatedTable
            columns={[
              { key: 'date', label: 'Date', render: v => <span className="font-medium text-gray-900 dark:text-gray-100">{fmtDate(v)}</span> },
              { key: 'check_in', label: 'Check In', render: v => <span className="text-gray-600 dark:text-gray-300">{fmtTime(v)}</span> },
              { key: 'check_out', label: 'Check Out', render: v => <span className="text-gray-600 dark:text-gray-300">{fmtTime(v)}</span> },
              { key: 'status', label: 'Status', render: v => <Badge color={statusColors[v] || 'gray'}>{v || '--'}</Badge> },
            ]}
            data={records}
            pageSize={10}
            loading={loading}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
