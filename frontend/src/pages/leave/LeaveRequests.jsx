import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import AnimatedTable from '../../components/AnimatedTable'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import { useToast } from '../../components/feedback/Toast'
import { useI18n } from '../../i18n'
import { getLeaveRequests, createLeaveRequest, approveLeave, rejectLeave, getEmployees } from '../../api/hr'
import { useAuth } from '../../hooks/useAuth'
import { Plus, Check, X } from 'lucide-react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

const statusColors = { pending: 'amber', approved: 'emerald', rejected: 'rose' }
const typeColors = { annual: 'blue', sick: 'emerald', personal: 'purple', unpaid: 'gray' }

export default function LeaveRequests() {
  const { t } = useI18n()
  const { isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [leavesData, setLeavesData] = useState(null)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showRejectConfirm, setShowRejectConfirm] = useState(false)
  const [rejectComment, setRejectComment] = useState('')
  const [rejectId, setRejectId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { showToast } = useToast()
  const [employees, setEmployees] = useState([])
  const [thisMonth, setThisMonth] = useState(false)

  useEffect(() => {
    Promise.all([
      getLeaveRequests({ page: 1, pageSize: 100 }).then(r => { const d = r.data?.data; return d?.items || d || null }).catch(() => null),
      getEmployees({ page: 1, pageSize: 200 }).then(r => { const d = r.data?.data; return d?.items || d || [] }).catch(() => []),
    ]).then(([leaves, emps]) => {
      setLeavesData(leaves)
      setEmployees(emps)
    }).finally(() => setLoading(false))
  }, [])

  const leaves = (leavesData || []).filter(l => {
    if (!thisMonth || !l.created_at) return true
    const d = new Date(l.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const resetForm = useCallback(() => { setShowLeaveModal(false); setShowRejectConfirm(false); setRejectComment(''); setRejectId(null); setSubmitting(false) }, [])
  const formatDate = d => { if (!d) return ''; try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return d } }

  const handleApprove = async (id) => {
    try {
      await approveLeave(id)
      showToast(t('approved'), 'success')
      setLeavesData(prev => prev ? prev.map(l => l.id === id ? { ...l, status: 'approved' } : l) : prev)
    } catch (e) {
      showToast(e.response?.data?.message || 'Error', 'error')
    }
  }

  const handleReject = async () => {
    if (!rejectId) return
    try {
      await rejectLeave(rejectId, { reason: rejectComment || 'No reason provided' })
      showToast(t('rejected'), 'success')
      setLeavesData(prev => prev ? prev.map(l => l.id === rejectId ? { ...l, status: 'rejected' } : l) : prev)
      resetForm()
    } catch (e) {
      showToast(e.response?.data?.message || 'Error', 'error')
    }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('leaveRequests')}</h1><p className="mt-1 text-sm text-gray-500">{t('manageLeaves')}</p></div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant={thisMonth ? 'primary' : 'secondary'} onClick={() => setThisMonth(p => !p)}>{t('thisMonth')}</Button>
          {isAdmin && <Button size="sm" icon={Plus} onClick={() => setShowLeaveModal(true)}>{t('newLeaveRequest')}</Button>}
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <div className="card-base overflow-hidden">
          <AnimatedTable columns={[
            { key: 'employee_name', label: t('employeeName'), render: v => <span className="font-medium text-gray-900 dark:text-gray-100">{v}</span> },
            { key: 'leave_type', label: t('type'), render: v => <Badge color={typeColors[v] || 'gray'}>{v}</Badge> },
            { key: 'start_date', label: t('from'), render: v => <span className="text-gray-500 text-xs">{formatDate(v)}</span> },
            { key: 'end_date', label: t('to'), render: v => <span className="text-gray-500 text-xs">{formatDate(v)}</span> },
            { key: 'duration_days', label: t('days'), render: v => <span className="font-medium">{v}</span> },
            { key: 'reason', label: t('reason'), render: v => <span className="text-gray-500 text-xs truncate max-w-[200px] block">{v}</span> },
            { key: 'status', label: t('status'), render: (v, r) => (
              <div className="flex items-center gap-1">
                <Badge color={statusColors[v] || 'gray'}>{v}</Badge>
                {v === 'pending' && (
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); handleApprove(r.id) }} className="rounded p-0.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"><Check className="h-3.5 w-3.5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); setRejectId(r.id); setShowRejectConfirm(true) }} className="rounded p-0.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"><X className="h-3.5 w-3.5" /></button>
                  </div>
                )}
              </div>
            )},
          ]} data={leaves} pageSize={10} loading={loading} />
        </div>
      </motion.div>

      <Modal isOpen={showRejectConfirm} onClose={resetForm} title={t('rejectLeaveRequest')} size="sm" footer={
        <><Button variant="secondary" onClick={resetForm}>{t('cancel')}</Button><Button loading={submitting} className="bg-rose-600 hover:bg-rose-700" onClick={handleReject}>{t('reject')}</Button></>
      }>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('areYouSureRejectLeave')}</p>
          <Textarea value={rejectComment} onChange={e => setRejectComment(e.target.value)} placeholder={t('provideAReason')} rows={3} />
        </div>
      </Modal>

      <Modal isOpen={showLeaveModal} onClose={resetForm} title={t('newLeaveRequest')} size="md" footer={
        <><Button variant="secondary" onClick={resetForm}>{t('cancel')}</Button><Button loading={submitting} onClick={() => { const f = document.getElementById('leave-form'); if (!f) return; const data = Object.fromEntries(new FormData(f)); const start = new Date(data.start_date); const end = new Date(data.end_date); data.duration_days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1); setSubmitting(true); createLeaveRequest(data).then(() => { showToast(t('leaveRequestSubmitted'), 'success'); resetForm() }).catch(e => { showToast(e.response?.data?.message || 'Error', 'error'); setSubmitting(false) }) }}>{t('submit')}</Button></>
      }>
        <form id="leave-form" className="space-y-4">
          <Select label={t('employeeName')} name="employee_id" options={employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name}` }))} placeholder={t('selectEmployee')} required />
          <Select label={t('type')} name="leave_type" options={[{ value: 'annual', label: t('annualLeave') }, { value: 'sick', label: t('sickLeave') }, { value: 'personal', label: t('personalLeave') }, { value: 'unpaid', label: t('unpaidLeave') }]} placeholder={t('selectType')} required />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label={t('startDate')} name="start_date" type="date" required />
            <Input label={t('endDate')} name="end_date" type="date" required />
          </div>
          <Textarea label={t('reason')} name="reason" placeholder={t('reasonForLeave')} rows={3} />
        </form>
      </Modal>
    </motion.div>
  )
}
