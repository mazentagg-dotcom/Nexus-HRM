import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../../i18n'
import AnimatedTable from '../../components/AnimatedTable'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import { useToast } from '../../components/feedback/Toast'
import { getMyAttendance, createMyRequest } from '../../api/hr'
import { Clock, AlertTriangle, X, Send } from 'lucide-react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
}

const statusColors = { present: 'emerald', absent: 'rose', late: 'amber', 'on_leave': 'purple', half_day: 'blue' }

export default function MyAttendance() {
  const { t } = useI18n()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ date: '', issue_type: '', explanation: '' })

  useEffect(() => {
    setLoading(true)
    getMyAttendance({ page: 1, pageSize: 100 })
      .then(r => { const d = r.data?.data; setRecords(d?.items || d || []) })
      .catch(() => setRecords([]))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmitCorrection = async () => {
    if (!form.date || !form.issue_type || !form.explanation) {
      showToast('Please fill all fields', 'error')
      return
    }
    setSubmitting(true)
    try {
      await createMyRequest({
        request_type: 'attendance_correction',
        title: `Attendance Correction - ${form.date}`,
        description: `Issue: ${form.issue_type}\nExplanation: ${form.explanation}`,
        priority: 'medium',
      })
      showToast('Correction request submitted', 'success')
      setShowModal(false)
      setForm({ date: '', issue_type: '', explanation: '' })
    } catch (e) {
      showToast(e.response?.data?.message || 'Error submitting request', 'error')
    }
    setSubmitting(false)
  }

  const fmtTime = (v) => v ? new Date(v).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--'
  const fmtDate = (v) => v ? new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--'

  const todayRecord = records.find(r => {
    if (!r.date) return false
    return new Date(r.date).toDateString() === new Date().toDateString()
  })

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('myAttendance')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('attendanceOverview')}</p>
        </div>
        <Button size="sm" variant="secondary" icon={AlertTriangle} onClick={() => setShowModal(true)}>
          Request Correction
        </Button>
      </motion.div>

      {!loading && todayRecord && (
        <motion.div variants={fadeUp} className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-500/10">
              <Clock className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Today&apos;s Attendance</h3>
              <p className="text-xs text-gray-500">{fmtDate(todayRecord.date)}</p>
            </div>
            <Badge color={statusColors[todayRecord.status] || 'gray'} className="ml-auto">{todayRecord.status}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3">
              <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">Check In</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">{fmtTime(todayRecord.check_in)}</p>
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3">
              <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">Check Out</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">{fmtTime(todayRecord.check_out)}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400 italic">Attendance is recorded automatically via fingerprint / CSV import.</p>
        </motion.div>
      )}

      {!loading && !todayRecord && (
        <motion.div variants={fadeUp} className="rounded-xl border border-dashed border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-6 text-center">
          <Clock className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No attendance record for today yet.</p>
          <p className="text-xs text-gray-400 mt-1">Attendance is recorded automatically via fingerprint / CSV import.</p>
        </motion.div>
      )}

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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Request Attendance Correction</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Type</label>
                <select
                  value={form.issue_type}
                  onChange={e => setForm({ ...form, issue_type: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select issue...</option>
                  <option value="missing_check_in">Missing Check In</option>
                  <option value="missing_check_out">Missing Check Out</option>
                  <option value="wrong_time">Incorrect Time</option>
                  <option value="wrong_date">Incorrect Date</option>
                  <option value="duplicate_record">Duplicate Record</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Explanation</label>
                <textarea
                  value={form.explanation}
                  onChange={e => setForm({ ...form, explanation: e.target.value })}
                  rows={3}
                  placeholder="Describe the issue..."
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button size="sm" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button size="sm" icon={Send} onClick={handleSubmitCorrection} loading={submitting}>Submit Request</Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
