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
import { ClipboardList, Check, X, Eye, Plus } from 'lucide-react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

const statusColors = { pending: 'amber', approved: 'emerald', rejected: 'rose', cancelled: 'gray' }
const typeColors = { leave: 'blue', vacation: 'purple', loan: 'emerald', attendance_correction: 'sky', payroll_correction: 'amber', document_request: 'indigo', other: 'gray' }

let reqId = 500
const initialRequests = [
  { id: 'REQ-501', employee_name: 'James Wilson', employee_id: 'EMP-001', branch: 'Main Office', request_type: 'leave', submitted_date: '2026-05-15', status: 'pending', reason: 'Family event' },
  { id: 'REQ-502', employee_name: 'Sarah Ahmed', employee_id: 'EMP-003', branch: 'South Branch', request_type: 'loan', submitted_date: '2026-05-14', status: 'pending', reason: 'Car repair' },
  { id: 'REQ-503', employee_name: 'Mike Chen', employee_id: 'EMP-005', branch: 'West Branch', request_type: 'attendance_correction', submitted_date: '2026-05-13', status: 'approved', reason: 'System clock issue' },
  { id: 'REQ-504', employee_name: 'Emily Davis', employee_id: 'EMP-007', branch: 'Downtown Branch', request_type: 'vacation', submitted_date: '2026-05-12', status: 'approved', reason: 'Summer vacation' },
  { id: 'REQ-505', employee_name: 'Alex Turner', employee_id: 'EMP-002', branch: 'Corporate Headquarters', request_type: 'document_request', submitted_date: '2026-05-11', status: 'rejected', reason: 'Not applicable' },
]

export default function Requests() {
  const { t } = useI18n()
  const [requests, setRequests] = useState(initialRequests)
  const [thisMonth, setThisMonth] = useState(false)
  const [showNewModal, setShowNewModal] = useState(false)
  const [rejectId, setRejectId] = useState(null)
  const [rejectComment, setRejectComment] = useState('')
  const [viewItem, setViewItem] = useState(null)
  const [form, setForm] = useState({ employee_name: '', employee_id: '', branch: '', request_type: 'leave', reason: '' })
  const { showToast } = useToast()

  const filtered = thisMonth
    ? requests.filter(r => {
        const d = new Date(r.submitted_date)
        const now = new Date()
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
    : requests

  const handleApprove = (id) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r))
    showToast('Request approved', 'success')
  }

  const handleReject = () => {
    if (!rejectId) return
    setRequests(prev => prev.map(r => r.id === rejectId ? { ...r, status: 'rejected' } : r))
    showToast('Request rejected', 'success')
    setRejectId(null)
    setRejectComment('')
  }

  const handleNew = () => {
    if (!form.request_type || !form.reason) { showToast('Fill required fields', 'error'); return }
    const newReq = { id: `REQ-${++reqId}`, ...form, submitted_date: new Date().toISOString().slice(0, 10), status: 'pending' }
    setRequests(prev => [newReq, ...prev])
    showToast('Request submitted', 'success')
    setShowNewModal(false)
    setForm({ employee_name: '', employee_id: '', branch: '', request_type: 'leave', reason: '' })
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length
  const approvedCount = requests.filter(r => r.status === 'approved').length

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('requests')} & {t('approvals')}</h1><p className="mt-1 text-sm text-gray-500">Review and manage employee requests and approvals.</p></div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant={thisMonth ? 'primary' : 'secondary'} onClick={() => setThisMonth(p => !p)}>{t('thisMonth')}</Button>
          <Button size="sm" icon={Plus} onClick={() => setShowNewModal(true)}>New Request</Button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card-base p-4"><p className="text-xs text-gray-500 dark:text-gray-400">Total Requests</p><p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">{requests.length}</p></div>
        <div className="card-base p-4"><p className="text-xs text-gray-500 dark:text-gray-400">Pending</p><p className="mt-1 text-lg font-bold text-amber-600">{pendingCount}</p></div>
        <div className="card-base p-4"><p className="text-xs text-gray-500 dark:text-gray-400">Approved</p><p className="mt-1 text-lg font-bold text-emerald-600">{approvedCount}</p></div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <div className="card-base overflow-hidden">
          <AnimatedTable columns={[
            { key: 'id', label: 'Request ID', render: v => <span className="font-mono text-xs text-gray-500">{v}</span> },
            { key: 'employee_name', label: t('employeeName'), render: v => <span className="font-medium text-gray-900 dark:text-gray-100">{v}</span> },
            { key: 'branch', label: t('branch'), render: v => <span className="text-gray-500 text-xs">{v || '--'}</span> },
            { key: 'request_type', label: t('type'), render: v => <Badge color={typeColors[v] || 'gray'}>{v?.replace(/_/g, ' ')}</Badge> },
            { key: 'submitted_date', label: t('submittedDate'), render: v => <span className="text-gray-500 text-xs">{v}</span> },
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
          ]} data={filtered} pageSize={10} />
        </div>
      </motion.div>

      <Modal isOpen={rejectId !== null} onClose={() => { setRejectId(null); setRejectComment('') }} title="Reject Request" size="sm" footer={
        <><Button variant="secondary" onClick={() => { setRejectId(null); setRejectComment('') }}>Cancel</Button><Button className="bg-rose-600 hover:bg-rose-700" onClick={handleReject}>Reject</Button></>
      }>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Are you sure you want to reject this request?</p>
          <Textarea value={rejectComment} onChange={e => setRejectComment(e.target.value)} placeholder="Provide a reason..." rows={3} />
        </div>
      </Modal>

      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title="New Request" size="md" footer={
        <><Button variant="secondary" onClick={() => setShowNewModal(false)}>Cancel</Button><Button onClick={handleNew}>{t('submit')}</Button></>
      }>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employeeName')}</label><input className="input-base" placeholder="Name" value={form.employee_name} onChange={e => setForm(p => ({ ...p, employee_name: e.target.value }))} /></div>
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('request_type')}</label><select className="input-base" value={form.request_type} onChange={e => setForm(p => ({ ...p, request_type: e.target.value }))}>{REQUEST_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}</select></div>
          </div>
          <Textarea value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Reason..." rows={3} />
        </div>
      </Modal>

      {viewItem && (
        <Modal isOpen={true} onClose={() => setViewItem(null)} title="Request Details" size="md" footer={<Button onClick={() => setViewItem(null)}>Close</Button>}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="card-base p-3"><p className="text-[11px] text-gray-400">Request ID</p><p className="text-sm font-mono">{viewItem.id}</p></div>
              <div className="card-base p-3"><p className="text-[11px] text-gray-400">{t('status')}</p><Badge color={statusColors[viewItem.status]}>{viewItem.status}</Badge></div>
              <div className="card-base p-3"><p className="text-[11px] text-gray-400">{t('employeeName')}</p><p className="text-sm">{viewItem.employee_name}</p></div>
              <div className="card-base p-3"><p className="text-[11px] text-gray-400">{t('branch')}</p><p className="text-sm">{viewItem.branch}</p></div>
              <div className="card-base p-3"><p className="text-[11px] text-gray-400">{t('type')}</p><Badge color={typeColors[viewItem.request_type]}>{viewItem.request_type?.replace(/_/g, ' ')}</Badge></div>
              <div className="card-base p-3"><p className="text-[11px] text-gray-400">{t('submittedDate')}</p><p className="text-sm">{viewItem.submitted_date}</p></div>
            </div>
            <div className="card-base p-3"><p className="text-[11px] text-gray-400">{t('reason')}</p><p className="text-sm text-gray-700 dark:text-gray-300">{viewItem.reason}</p></div>
          </div>
        </Modal>
      )}
    </motion.div>
  )
}
