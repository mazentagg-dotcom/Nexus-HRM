import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../../i18n'
import AnimatedTable from '../../components/AnimatedTable'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import { useToast } from '../../components/feedback/Toast'
import { getMyLeaveRequests, getMyLeaveBalance, createMyLeaveRequest } from '../../api/hr'
import { Plus } from 'lucide-react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

const statusColors = { pending: 'amber', approved: 'emerald', rejected: 'rose', cancelled: 'gray' }
const typeColors = { annual: 'blue', sick: 'emerald', personal: 'purple', maternity: 'pink', unpaid: 'gray' }

export default function MyRequests() {
  const { t } = useI18n()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState([])
  const [balance, setBalance] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ leave_type: 'annual', start_date: '', end_date: '', reason: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getMyLeaveRequests({ page: 1, pageSize: 100 }).then(r => { const d = r.data?.data; return d?.items || d || [] }).catch(() => []),
      getMyLeaveBalance().then(r => r.data?.data || null).catch(() => null),
    ]).then(([leaves, bal]) => {
      setRecords(leaves)
      setBalance(bal)
    }).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async () => {
    if (!form.start_date || !form.end_date) { showToast(t('fillRequiredFields'), 'error'); return }
    const start = new Date(form.start_date)
    const end = new Date(form.end_date)
    const data = {
      ...form,
      duration_days: Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1),
    }
    setSubmitting(true)
    try {
      await createMyLeaveRequest(data)
      showToast(t('leaveRequestSubmitted'), 'success')
      setShowModal(false)
      setForm({ leave_type: 'annual', start_date: '', end_date: '', reason: '' })
      const r = await getMyLeaveRequests({ page: 1, pageSize: 100 })
      const d = r.data?.data
      setRecords(d?.items || d || [])
    } catch (e) { showToast(e.response?.data?.message || 'Error', 'error') }
    setSubmitting(false)
  }

  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--'

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('myRequests')}</h1><p className="mt-1 text-sm text-gray-500">{t('manageLeaves')}</p></div>
        <Button size="sm" icon={Plus} onClick={() => setShowModal(true)}>{t('newLeaveRequest')}</Button>
      </motion.div>

      {balance && (
        <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card-base p-4"><p className="text-xs text-gray-500 dark:text-gray-400">Annual Leave</p><p className="mt-1 text-lg font-bold text-blue-600">{balance.annual || 0}</p></div>
          <div className="card-base p-4"><p className="text-xs text-gray-500 dark:text-gray-400">Sick Leave</p><p className="mt-1 text-lg font-bold text-emerald-600">{balance.sick || 0}</p></div>
          <div className="card-base p-4"><p className="text-xs text-gray-500 dark:text-gray-400">Personal Leave</p><p className="mt-1 text-lg font-bold text-purple-600">{balance.personal || 0}</p></div>
        </motion.div>
      )}

      <motion.div variants={fadeUp}>
        <div className="card-base overflow-hidden">
          <AnimatedTable
            columns={[
              { key: 'leave_type', label: t('type'), render: v => <Badge color={typeColors[v] || 'gray'}>{v}</Badge> },
              { key: 'start_date', label: t('from'), render: v => <span className="text-gray-500 text-xs">{fmtDate(v)}</span> },
              { key: 'end_date', label: t('to'), render: v => <span className="text-gray-500 text-xs">{fmtDate(v)}</span> },
              { key: 'duration_days', label: t('days'), render: v => <span className="font-medium">{v}</span> },
              { key: 'status', label: t('status'), render: v => <Badge color={statusColors[v] || 'gray'}>{v}</Badge> },
            ]}
            data={records}
            pageSize={10}
            loading={loading}
          />
        </div>
      </motion.div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={t('newLeaveRequest')} size="sm" footer={
        <><Button variant="secondary" onClick={() => setShowModal(false)}>{t('cancel')}</Button><Button loading={submitting} onClick={handleSubmit}>{t('submit')}</Button></>
      }>
        <div className="space-y-4">
          <Select label={t('type')} options={[{ value: 'annual', label: t('annualLeave') }, { value: 'sick', label: t('sickLeave') }, { value: 'personal', label: t('personalLeave') }]} value={form.leave_type} onChange={v => setForm(p => ({ ...p, leave_type: v }))} />
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('from')}</label><input type="date" className="input-base" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} /></div>
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('to')}</label><input type="date" className="input-base" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} /></div>
          </div>
          <Textarea label={t('reason')} value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder={t('reasonPlaceholder')} rows={3} />
        </div>
      </Modal>
    </motion.div>
  )
}
