import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AnimatedTable from '../../components/AnimatedTable'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Modal from '../../components/ui/Modal'
import Textarea from '../../components/ui/Textarea'
import { useToast } from '../../components/feedback/Toast'
import { useI18n } from '../../i18n'
import { REQUEST_TYPES } from '../../constants/hr'
import { getRequests, createRequest, approveRequest, rejectRequest, getEmployees } from '../../api/hr'
import { useAuth } from '../../hooks/useAuth'
import { ClipboardList, Check, X, Eye, Plus } from 'lucide-react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

const statusColors = { pending: 'amber', approved: 'emerald', rejected: 'rose', cancelled: 'gray' }
const typeColors = { leave: 'blue', vacation: 'purple', loan: 'emerald', attendance_correction: 'sky', payroll_correction: 'amber', document_request: 'indigo', other: 'gray' }

export default function Requests() {
  const { t } = useI18n()
  const { isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState([])
  const [employees, setEmployees] = useState([])
  const [thisMonth, setThisMonth] = useState(false)
  const [showNewModal, setShowNewModal] = useState(false)
  const [rejectId, setRejectId] = useState(null)
  const [rejectComment, setRejectComment] = useState('')
  const [viewItem, setViewItem] = useState(null)
  const [form, setForm] = useState({ employee_id: '', request_type: 'leave', reason: '' })
  const { showToast } = useToast()

  const fetchRequests = () => {
    setLoading(true)
    getRequests({ page: 1, pageSize: 100 })
      .then(r => { setRequests(r.data?.data?.items || r.data?.data || []) })
      .catch(() => setRequests([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchRequests() }, [])

  useEffect(() => {
    if (showNewModal) {
      getEmployees({ page: 1, pageSize: 100, status: 'active' })
        .then(r => { setEmployees(r.data?.data?.items || r.data?.data || []) })
        .catch(() => setEmployees([]))
    }
  }, [showNewModal])

  const filtered = thisMonth
    ? requests.filter(r => {
        if (!r.created_at) return false
        const d = new Date(r.created_at)
        const now = new Date()
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
    : requests

  const handleApprove = async (id) => {
    try {
      await approveRequest(id)
      showToast(t('requestApproved'), 'success')
      fetchRequests()
    } catch { showToast(t('approveFailed'), 'error') }
  }

  const handleReject = async () => {
    if (!rejectId) return
    try {
      await rejectRequest(rejectId, { reason: rejectComment })
      showToast(t('requestRejected'), 'success')
      setRejectId(null)
      setRejectComment('')
      fetchRequests()
    } catch { showToast(t('rejectFailed'), 'error') }
  }

  const handleNew = async () => {
    if (!form.employee_id || !form.request_type || !form.reason) { showToast(t('fillRequiredFields'), 'error'); return }
    try {
      await createRequest(form)
      showToast(t('requestSubmitted'), 'success')
      setShowNewModal(false)
      setForm({ employee_id: '', request_type: 'leave', reason: '' })
      fetchRequests()
    } catch { showToast(t('submitFailed'), 'error') }
  }

  const pendingCount = filtered.filter(r => r.status === 'pending').length
  const approvedCount = filtered.filter(r => r.status === 'approved').length

  const submittedDate = (r) => {
    if (r.created_at) {
      const d = new Date(r.created_at)
      return d.toISOString().slice(0, 10)
    }
    return '--'
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('requests')} & {t('approvals')}</h1><p className="mt-1 text-sm text-gray-500">{t('reviewRequestsDesc')}</p></div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant={thisMonth ? 'primary' : 'secondary'} onClick={() => setThisMonth(p => !p)}>{t('thisMonth')}</Button>
          {isAdmin && <Button size="sm" icon={Plus} onClick={() => { setForm({ employee_id: '', request_type: 'leave', reason: '' }); setShowNewModal(true) }}>{t('newRequest')}</Button>}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card-base p-4"><p className="text-xs text-gray-500 dark:text-gray-400">{t('totalRequests')}</p><p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">{filtered.length}</p></div>
        <div className="card-base p-4"><p className="text-xs text-gray-500 dark:text-gray-400">{t('pending')}</p><p className="mt-1 text-lg font-bold text-amber-600">{pendingCount}</p></div>
        <div className="card-base p-4"><p className="text-xs text-gray-500 dark:text-gray-400">{t('approved')}</p><p className="mt-1 text-lg font-bold text-emerald-600">{approvedCount}</p></div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <div className="card-base overflow-hidden">
          <AnimatedTable columns={[
            { key: 'id', label: t('requestId'), render: v => <span className="font-mono text-xs text-gray-500">{v?.slice(0, 8) || '--'}</span> },
            { key: 'employee_name', label: t('employeeName'), render: v => <span className="font-medium text-gray-900 dark:text-gray-100">{v || '--'}</span> },
            { key: 'request_type', label: t('type'), render: v => <Badge color={typeColors[v] || 'gray'}>{v?.replace(/_/g, ' ')}</Badge> },
            { key: 'created_at', label: t('submittedDate'), render: (_, r) => <span className="text-gray-500 text-xs">{submittedDate(r)}</span> },
            { key: 'status', label: t('status'), render: (v, r) => (
              <div className="flex items-center gap-1">
                <Badge color={statusColors[v] || 'gray'}>{v}</Badge>
                {v === 'pending' && (
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); handleApprove(r.id) }} className="rounded p-0.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" title={t('approve')}><Check className="h-3.5 w-3.5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); setRejectId(r.id) }} className="rounded p-0.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20" title={t('reject')}><X className="h-3.5 w-3.5" /></button>
                  </div>
                )}
              </div>
            )},
            { key: 'actions', label: t('actions'), render: (_, r) => (
              <button onClick={(e) => { e.stopPropagation(); setViewItem(r) }} className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300"><Eye className="h-3.5 w-3.5" /></button>
            )},
          ]} data={filtered} pageSize={10} loading={loading} />
        </div>
      </motion.div>

      <Modal isOpen={rejectId !== null} onClose={() => { setRejectId(null); setRejectComment('') }} title={t('rejectRequest')} size="sm" footer={
        <><Button variant="secondary" onClick={() => { setRejectId(null); setRejectComment('') }}>{t('cancel')}</Button><Button className="bg-rose-600 hover:bg-rose-700" onClick={handleReject}>{t('reject')}</Button></>
      }>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('areYouSureRejectRequest')}</p>
          <Textarea value={rejectComment} onChange={e => setRejectComment(e.target.value)} placeholder={t('provideAReason')} rows={3} />
        </div>
      </Modal>

      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title={t('newRequest')} size="md" footer={
        <><Button variant="secondary" onClick={() => setShowNewModal(false)}>{t('cancel')}</Button><Button onClick={handleNew}>{t('submit')}</Button></>
      }>
        <div className="space-y-4">
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employeeName')}</label><select className="input-base" value={form.employee_id} onChange={e => setForm(p => ({ ...p, employee_id: e.target.value }))}><option value="">{t('selectEmployee')}</option>{employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}</select></div>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('type')}</label><select className="input-base" value={form.request_type} onChange={e => setForm(p => ({ ...p, request_type: e.target.value }))}>{REQUEST_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}</select></div>
          <Textarea value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder={t('reasonPlaceholder')} rows={3} />
        </div>
      </Modal>

      {viewItem && (
        <Modal isOpen={true} onClose={() => setViewItem(null)} title={t('requestDetails')} size="md" footer={<Button onClick={() => setViewItem(null)}>{t('close')}</Button>}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="card-base p-3"><p className="text-[11px] text-gray-400">{t('requestId')}</p><p className="text-sm font-mono">{viewItem.id?.slice(0, 8)}</p></div>
              <div className="card-base p-3"><p className="text-[11px] text-gray-400">{t('status')}</p><Badge color={statusColors[viewItem.status]}>{viewItem.status}</Badge></div>
              <div className="card-base p-3"><p className="text-[11px] text-gray-400">{t('employeeName')}</p><p className="text-sm">{viewItem.employee_name || '--'}</p></div>
              <div className="card-base p-3"><p className="text-[11px] text-gray-400">{t('submittedDate')}</p><p className="text-sm">{submittedDate(viewItem)}</p></div>
              <div className="card-base p-3"><p className="text-[11px] text-gray-400">{t('type')}</p><Badge color={typeColors[viewItem.request_type]}>{viewItem.request_type?.replace(/_/g, ' ')}</Badge></div>
              {viewItem.rejection_reason && <div className="card-base p-3"><p className="text-[11px] text-gray-400">{t('rejectionReason')}</p><p className="text-sm text-rose-600">{viewItem.rejection_reason}</p></div>}
            </div>
            <div className="card-base p-3"><p className="text-[11px] text-gray-400">{t('reason')}</p><p className="text-sm text-gray-700 dark:text-gray-300">{viewItem.reason}</p></div>
          </div>
        </Modal>
      )}
    </motion.div>
  )
}
