import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AnimatedTable from '../../components/AnimatedTable'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Modal from '../../components/ui/Modal'
import Textarea from '../../components/ui/Textarea'
import { useToast } from '../../components/feedback/Toast'
import { useI18n } from '../../i18n'
import { getRequests, approveRequest, rejectRequest, getLeaveRequests, approveLeave, rejectLeave } from '../../api/hr'
import { useAuth } from '../../hooks/useAuth'
import { ClipboardList, Check, X, Eye } from 'lucide-react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
}

const statusColors = { pending: 'amber', approved: 'emerald', rejected: 'rose', cancelled: 'gray' }
const typeColors = {
  annual: 'blue', sick: 'emerald', personal: 'purple', unpaid: 'gray',
  leave: 'blue', vacation: 'purple', loan: 'emerald',
  attendance_correction: 'sky', payroll_correction: 'amber',
  document_request: 'indigo', general: 'gray', other: 'gray',
}

export default function TeamRequestsPage() {
  const { t } = useI18n()
  const { isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [leaves, setLeaves] = useState([])
  const [requests, setRequests] = useState([])
  const [thisMonth, setThisMonth] = useState(false)
  const [typeFilter, setTypeFilter] = useState('all')
  const [showNewModal, setShowNewModal] = useState(false)
  const [rejectId, setRejectId] = useState(null)
  const [rejectComment, setRejectComment] = useState('')
  const [viewItem, setViewItem] = useState(null)
  const [form, setForm] = useState({ employee_id: '', request_type: 'leave', reason: '' })
  const { showToast } = useToast()

  const fetchData = () => {
    setLoading(true)
    Promise.allSettled([
      getLeaveRequests({ page: 1, pageSize: 200 }),
      getRequests({ page: 1, pageSize: 200 }),
    ]).then(([lvRes, reqRes]) => {
      if (lvRes.status === 'fulfilled') {
        const d = lvRes.value.data?.data
        setLeaves(d?.items || d || [])
      }
      if (reqRes.status === 'fulfilled') {
        const d = reqRes.value.data?.data
        setRequests(d?.items || d || [])
      }
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const allItems = [
    ...leaves.map(l => ({
      id: l.id,
      employee_name: l.employee_name,
      type: l.leave_type,
      source: 'leave',
      date_submitted: l.created_at,
      details: `${l.start_date || '--'} to ${l.end_date || '--'} (${l.duration_days || 0}d)`,
      status: l.status,
      reason: l.reason,
    })),
    ...requests.map(r => ({
      id: r.id,
      employee_name: r.employee_name,
      type: r.request_type,
      source: 'request',
      date_submitted: r.created_at,
      details: r.title || '',
      status: r.status,
      reason: r.reason || r.description,
    })),
  ].sort((a, b) => new Date(b.date_submitted || 0) - new Date(a.date_submitted || 0))

  const filtered = allItems.filter(item => {
    if (typeFilter !== 'all') {
      if (typeFilter === 'leave' && !['annual', 'sick', 'personal', 'unpaid', 'leave'].includes(item.type)) return false
      if (typeFilter !== 'leave' && item.type !== typeFilter) return false
    }
    if (thisMonth && item.date_submitted) {
      const d = new Date(item.date_submitted)
      const now = new Date()
      if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false
    }
    return true
  })

  const pendingCount = filtered.filter(r => r.status === 'pending').length
  const approvedCount = filtered.filter(r => r.status === 'approved').length
  const rejectedCount = filtered.filter(r => r.status === 'rejected').length

  const handleApprove = async (item) => {
    try {
      if (item.source === 'leave') {
        await approveLeave(item.id)
      } else {
        await approveRequest(item.id)
      }
      showToast(t('approved'), 'success')
      fetchData()
    } catch { showToast(t('approveFailed'), 'error') }
  }

  const handleReject = async () => {
    if (!rejectId) return
    const item = allItems.find(i => i.id === rejectId)
    try {
      if (item?.source === 'leave') {
        await rejectLeave(rejectId, { reason: rejectComment || 'No reason provided' })
      } else {
        await rejectRequest(rejectId, { reason: rejectComment })
      }
      showToast(t('rejected'), 'success')
      setRejectId(null)
      setRejectComment('')
      fetchData()
    } catch { showToast(t('rejectFailed'), 'error') }
  }

  const handleNew = async () => {
    if (!form.employee_id || !form.request_type || !form.reason) { showToast(t('fillRequiredFields'), 'error'); return }
    try {
      await createRequest(form)
      showToast(t('requestSubmitted'), 'success')
      setShowNewModal(false)
      setForm({ employee_id: '', request_type: 'leave', reason: '' })
      fetchData()
    } catch { showToast(t('submitFailed'), 'error') }
  }

  const fmtDate = (d) => {
    if (!d) return '--'
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return d }
  }

  const summaryCards = [
    { label: 'Total', value: filtered.length, color: 'indigo' },
    { label: 'Pending', value: pendingCount, color: 'amber' },
    { label: 'Approved', value: approvedCount, color: 'emerald' },
    { label: 'Rejected', value: rejectedCount, color: 'rose' },
  ]

  const cardColorMap = {
    indigo: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
    amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    rose: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300',
  }

  const typeFilters = [
    { value: 'all', label: 'All' },
    { value: 'leave', label: 'Leave' },
    { value: 'loan', label: 'Loan' },
    { value: 'attendance_correction', label: 'Attendance' },
    { value: 'payroll_correction', label: 'Payroll' },
    { value: 'document_request', label: 'Document' },
    { value: 'other', label: 'Other' },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Team Requests</h1><p className="mt-1 text-sm text-gray-500">Review and manage all team requests</p></div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant={thisMonth ? 'primary' : 'secondary'} onClick={() => setThisMonth(p => !p)}>{t('thisMonth')}</Button>
        </div>
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
        {typeFilters.map(f => (
          <button
            key={f.value}
            onClick={() => setTypeFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${typeFilter === f.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
          >
            {f.label}
          </button>
        ))}
      </motion.div>

      <motion.div variants={fadeUp}>
        <div className="card-base overflow-hidden">
          <AnimatedTable
            columns={[
              { key: 'id', label: 'ID', render: v => <span className="font-mono text-xs text-gray-400">{v?.slice(0, 8) || '--'}</span> },
              { key: 'employee_name', label: 'Employee', render: v => <span className="font-medium text-gray-900 dark:text-gray-100">{v || '--'}</span> },
              { key: 'type', label: 'Type', render: v => <Badge color={typeColors[v] || 'gray'}>{v?.replace(/_/g, ' ')}</Badge> },
              { key: 'date_submitted', label: 'Submitted', render: v => <span className="text-xs text-gray-500">{fmtDate(v)}</span> },
              { key: 'details', label: 'Details', render: v => <span className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[180px] block">{v || '--'}</span> },
              {
                key: 'status', label: 'Status', render: (v, row) => (
                  <div className="flex items-center gap-1">
                    <Badge color={statusColors[v] || 'gray'}>{v}</Badge>
                    {v === 'pending' && (
                      <div className="flex items-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); handleApprove(row) }} className="rounded p-0.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" title={t('approve')}><Check className="h-3.5 w-3.5" /></button>
                        <button onClick={(e) => { e.stopPropagation(); setRejectId(row.id) }} className="rounded p-0.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20" title={t('reject')}><X className="h-3.5 w-3.5" /></button>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: 'actions', label: '',
                render: (_, row) => (
                  <button onClick={(e) => { e.stopPropagation(); setViewItem(row) }} className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300"><Eye className="h-3.5 w-3.5" /></button>
                ),
              },
            ]}
            data={filtered}
            pageSize={15}
            loading={loading}
          />
        </div>
      </motion.div>

      <Modal isOpen={rejectId !== null} onClose={() => { setRejectId(null); setRejectComment('') }} title={t('rejectRequest')} size="sm" footer={
        <><Button variant="secondary" onClick={() => { setRejectId(null); setRejectComment('') }}>{t('cancel')}</Button><Button className="bg-rose-600 hover:bg-rose-700" onClick={handleReject}>{t('reject')}</Button></>
      }>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('areYouSureRejectRequest')}</p>
          <Textarea value={rejectComment} onChange={e => setRejectComment(e.target.value)} placeholder={t('reasonPlaceholder')} rows={3} />
        </div>
      </Modal>

      {viewItem && (
        <Modal isOpen={true} onClose={() => setViewItem(null)} title={t('requestDetails')} size="md" footer={<Button onClick={() => setViewItem(null)}>{t('close')}</Button>}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="card-base p-3"><p className="text-[11px] text-gray-400">{t('requestId')}</p><p className="text-sm font-mono">{viewItem.id?.slice(0, 8)}</p></div>
              <div className="card-base p-3"><p className="text-[11px] text-gray-400">{t('status')}</p><Badge color={statusColors[viewItem.status]}>{viewItem.status}</Badge></div>
              <div className="card-base p-3"><p className="text-[11px] text-gray-400">{t('employeeName')}</p><p className="text-sm">{viewItem.employee_name || '--'}</p></div>
              <div className="card-base p-3"><p className="text-[11px] text-gray-400">Submitted</p><p className="text-sm">{fmtDate(viewItem.date_submitted)}</p></div>
              <div className="card-base p-3"><p className="text-[11px] text-gray-400">{t('type')}</p><Badge color={typeColors[viewItem.type]}>{viewItem.type?.replace(/_/g, ' ')}</Badge></div>
              <div className="card-base p-3"><p className="text-[11px] text-gray-400">Details</p><p className="text-sm">{viewItem.details}</p></div>
            </div>
            <div className="card-base p-3"><p className="text-[11px] text-gray-400">{t('reason')}</p><p className="text-sm text-gray-700 dark:text-gray-300">{viewItem.reason}</p></div>
          </div>
        </Modal>
      )}
    </motion.div>
  )
}
