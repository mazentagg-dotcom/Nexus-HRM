import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../../i18n'
import AnimatedTable from '../../components/AnimatedTable'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import Input from '../../components/ui/Input'
import { useToast } from '../../components/feedback/Toast'
import {
  getMyLeaveRequests, getMyLeaveBalance, createMyLeaveRequest,
  getMyLoans, createMyLoan, createRequest, getRequests,
} from '../../api/hr'
import {
  CalendarDays, Thermometer, Landmark, AlertTriangle,
  ClipboardList, Plus, Clock, FileText, Send, X,
} from 'lucide-react'

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

const leaveTypeOptions = [
  { value: 'annual', label: 'Annual Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'personal', label: 'Personal Leave' },
  { value: 'unpaid', label: 'Unpaid Leave' },
]

const issueTypes = [
  { value: 'missing_check_in', label: 'Missing Check In' },
  { value: 'missing_check_out', label: 'Missing Check Out' },
  { value: 'wrong_time', label: 'Incorrect Time' },
  { value: 'wrong_date', label: 'Incorrect Date' },
  { value: 'marked_absent', label: 'Marked Absent Incorrectly' },
  { value: 'other', label: 'Other' },
]

const generalCategories = [
  { value: 'payroll', label: 'Payroll' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'leave', label: 'Leave' },
  { value: 'documents', label: 'Documents' },
  { value: 'medical', label: 'Medical Insurance' },
  { value: 'other', label: 'Other' },
]

function fmtDate(d) {
  if (!d) return '--'
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
  catch { return d }
}

export default function MyRequests() {
  const { t } = useI18n()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [leaves, setLeaves] = useState([])
  const [balance, setBalance] = useState(null)
  const [loans, setLoans] = useState([])
  const [allRequests, setAllRequests] = useState([])
  const [activeModal, setActiveModal] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [leaveForm, setLeaveForm] = useState({ leave_type: 'annual', start_date: '', end_date: '', reason: '' })
  const [loanForm, setLoanForm] = useState({ amount: '', monthly_installment: '', purpose: '' })
  const [correctionForm, setCorrectionForm] = useState({ date: '', issue_type: '', explanation: '' })
  const [generalForm, setGeneralForm] = useState({ category: '', title: '', description: '' })

  const fetchData = async () => {
    setLoading(true)
    const [lvRes, balRes, loanRes, reqRes] = await Promise.allSettled([
      getMyLeaveRequests({ page: 1, pageSize: 100 }),
      getMyLeaveBalance(),
      getMyLoans({ page: 1, pageSize: 50 }),
      getRequests({ page: 1, pageSize: 100 }),
    ])
    if (lvRes.status === 'fulfilled') {
      const d = lvRes.value.data?.data
      setLeaves(d?.items || d || [])
    }
    if (balRes.status === 'fulfilled') setBalance(balRes.value.data?.data || null)
    if (loanRes.status === 'fulfilled') {
      const d = loanRes.value.data?.data
      setLoans(d?.items || d || [])
    }
    if (reqRes.status === 'fulfilled') {
      const d = reqRes.value.data?.data
      setAllRequests(d?.items || d || [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const annualBal = balance?.find?.(b => b.type === 'annual')
  const sickBal = balance?.find?.(b => b.type === 'sick')
  const pendingLoans = loans.filter(l => l.status === 'pending').length
  const activeLoans = loans.filter(l => l.status === 'approved' || l.status === 'active')
  const monthlyDed = activeLoans.reduce((s, l) => s + (l.monthly_installment || 0), 0)
  const pendingCorrections = allRequests.filter(r => r.request_type === 'attendance_correction' && r.status === 'pending').length
  const pendingOther = allRequests.filter(r => r.status === 'pending' && !['leave', 'vacation', 'loan', 'attendance_correction'].includes(r.request_type)).length

  const mergedRequests = [
    ...leaves.map(l => ({
      id: l.id, type: l.leave_type, date_submitted: l.created_at,
      details: `${fmtDate(l.start_date)} - ${fmtDate(l.end_date)}`,
      status: l.status, reason: l.reason,
    })),
    ...loans.map(l => ({
      id: l.id, type: 'loan', date_submitted: l.created_at,
      details: `$${Number(l.amount || 0).toLocaleString()}`,
      status: l.status, reason: l.purpose,
    })),
    ...allRequests.filter(r => !leaves.find(l => l.id === r.id)).map(r => ({
      id: r.id, type: r.request_type || 'other', date_submitted: r.created_at,
      details: r.title || '', status: r.status, reason: r.reason || r.description,
    })),
  ].sort((a, b) => new Date(b.date_submitted || 0) - new Date(a.date_submitted || 0))

  const resetForm = (type) => {
    setActiveModal(null)
    setSubmitting(false)
    if (type === 'leave') setLeaveForm({ leave_type: 'annual', start_date: '', end_date: '', reason: '' })
    if (type === 'loan') setLoanForm({ amount: '', monthly_installment: '', purpose: '' })
    if (type === 'correction') setCorrectionForm({ date: '', issue_type: '', explanation: '' })
    if (type === 'general') setGeneralForm({ category: '', title: '', description: '' })
  }

  const handleSubmitLeave = async () => {
    if (!leaveForm.start_date || !leaveForm.end_date) { showToast('Please fill all fields', 'error'); return }
    const start = new Date(leaveForm.start_date)
    const end = new Date(leaveForm.end_date)
    setSubmitting(true)
    try {
      await createMyLeaveRequest({ ...leaveForm, duration_days: Math.max(1, Math.round((end - start) / 86400000) + 1) })
      showToast(t('leaveRequestSubmitted'), 'success')
      resetForm('leave')
      fetchData()
    } catch (e) { showToast(e.response?.data?.message || 'Error', 'error') }
    setSubmitting(false)
  }

  const handleSubmitLoan = async () => {
    if (!loanForm.amount || !loanForm.purpose) { showToast('Please fill all fields', 'error'); return }
    setSubmitting(true)
    try {
      await createMyLoan({ amount: Number(loanForm.amount), monthly_installment: Number(loanForm.monthly_installment || 0), purpose: loanForm.purpose })
      showToast(t('loanApplicationSubmitted'), 'success')
      resetForm('loan')
      fetchData()
    } catch (e) { showToast(e.response?.data?.message || 'Error', 'error') }
    setSubmitting(false)
  }

  const handleSubmitCorrection = async () => {
    if (!correctionForm.date || !correctionForm.issue_type || !correctionForm.explanation) { showToast('Please fill all fields', 'error'); return }
    setSubmitting(true)
    try {
      await createRequest({
        request_type: 'attendance_correction',
        title: `Correction - ${correctionForm.date}`,
        description: `Issue: ${correctionForm.issue_type}\n${correctionForm.explanation}`,
        priority: 'medium',
      })
      showToast('Correction request submitted', 'success')
      resetForm('correction')
      fetchData()
    } catch (e) { showToast(e.response?.data?.message || 'Error', 'error') }
    setSubmitting(false)
  }

  const handleSubmitGeneral = async () => {
    if (!generalForm.title || !generalForm.description) { showToast('Please fill all fields', 'error'); return }
    setSubmitting(true)
    try {
      await createRequest({
        request_type: generalForm.category === 'other' ? 'other' : generalForm.category,
        title: generalForm.title,
        description: `[${generalForm.category}] ${generalForm.description}`,
        priority: 'medium',
      })
      showToast('Request submitted', 'success')
      resetForm('general')
      fetchData()
    } catch (e) { showToast(e.response?.data?.message || 'Error', 'error') }
    setSubmitting(false)
  }

  const balanceCards = [
    { icon: CalendarDays, title: 'Annual Leave', value: annualBal ? `${annualBal.remaining} days left` : '--', pending: leaves.filter(l => l.leave_type === 'annual' && l.status === 'pending').length, action: () => setActiveModal('leave'), btn: 'Request Leave', gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { icon: Thermometer, title: 'Sick Leave', value: sickBal ? `${sickBal.remaining} days left` : '--', pending: leaves.filter(l => l.leave_type === 'sick' && l.status === 'pending').length, action: () => { setLeaveForm(p => ({ ...p, leave_type: 'sick' })); setActiveModal('leave') }, btn: 'Request Sick Leave', gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { icon: Landmark, title: 'Loan', value: activeLoans.length > 0 ? `$${Number(monthlyDed).toLocaleString()}/mo` : pendingLoans > 0 ? `${pendingLoans} pending` : 'No active loan', pending: pendingLoans, action: () => setActiveModal('loan'), btn: 'Request Loan', gradient: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { icon: AlertTriangle, title: 'Attendance Correction', value: `${pendingCorrections} pending`, pending: pendingCorrections, action: () => setActiveModal('correction'), btn: 'Request Correction', gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { icon: ClipboardList, title: 'Other Requests', value: `${pendingOther} pending`, pending: pendingOther, action: () => setActiveModal('general'), btn: 'New Request', gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 dark:bg-purple-500/10' },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('myRequests') || 'My Requests'}</h1>
        <p className="mt-1 text-sm text-gray-500">Track and submit all your requests</p>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {balanceCards.map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${card.gradient} shadow-sm`}>
                <card.icon className="h-4.5 w-4.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{card.value}</p>
              </div>
            </div>
            <Button size="sm" variant="secondary" onClick={card.action} className="w-full">{card.btn}</Button>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp}>
        <div className="card-base overflow-hidden">
          <div className="px-6 pt-4 pb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">My Submitted Requests</h3>
          </div>
          <AnimatedTable
            columns={[
              { key: 'id', label: 'ID', render: v => <span className="font-mono text-xs text-gray-400">{v?.slice(0, 8) || '--'}</span> },
              { key: 'type', label: 'Type', render: v => <Badge color={typeColors[v] || 'gray'}>{v?.replace(/_/g, ' ')}</Badge> },
              { key: 'date_submitted', label: 'Submitted', render: v => <span className="text-xs text-gray-500">{fmtDate(v)}</span> },
              { key: 'details', label: 'Details', render: v => <span className="text-xs text-gray-600 dark:text-gray-300">{v || '--'}</span> },
              { key: 'reason', label: 'Reason', render: v => <span className="text-xs text-gray-400 truncate max-w-[150px] block">{v || '--'}</span> },
              { key: 'status', label: 'Status', render: v => <Badge color={statusColors[v] || 'gray'}>{v}</Badge> },
            ]}
            data={mergedRequests}
            pageSize={10}
            loading={loading}
          />
        </div>
      </motion.div>

      <Modal isOpen={activeModal === 'leave'} onClose={() => resetForm('leave')} title={leaveForm.leave_type === 'sick' ? 'Request Sick Leave' : 'Request Leave'} size="sm" footer={
        <><Button variant="secondary" onClick={() => resetForm('leave')}>{t('cancel')}</Button><Button loading={submitting} onClick={handleSubmitLeave}>{t('submit')}</Button></>
      }>
        <div className="space-y-4">
          <Select label="Leave Type" options={leaveTypeOptions} value={leaveForm.leave_type} onChange={v => setLeaveForm(p => ({ ...p, leave_type: v }))} />
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('from')}</label><input type="date" className="input-base" value={leaveForm.start_date} onChange={e => setLeaveForm(p => ({ ...p, start_date: e.target.value }))} /></div>
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('to')}</label><input type="date" className="input-base" value={leaveForm.end_date} onChange={e => setLeaveForm(p => ({ ...p, end_date: e.target.value }))} /></div>
          </div>
          <Textarea label={t('reason')} value={leaveForm.reason} onChange={e => setLeaveForm(p => ({ ...p, reason: e.target.value }))} placeholder={t('reasonForLeave')} rows={3} />
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'loan'} onClose={() => resetForm('loan')} title="Request Loan" size="sm" footer={
        <><Button variant="secondary" onClick={() => resetForm('loan')}>{t('cancel')}</Button><Button loading={submitting} onClick={handleSubmitLoan}>{t('submit')}</Button></>
      }>
        <div className="space-y-4">
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Amount ($)</label><input type="number" className="input-base" value={loanForm.amount} onChange={e => setLoanForm(p => ({ ...p, amount: e.target.value }))} placeholder="5000" /></div>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Installment ($)</label><input type="number" className="input-base" value={loanForm.monthly_installment} onChange={e => setLoanForm(p => ({ ...p, monthly_installment: e.target.value }))} placeholder="500" /></div>
          <Textarea label={t('purpose')} value={loanForm.purpose} onChange={e => setLoanForm(p => ({ ...p, purpose: e.target.value }))} placeholder={t('purposeOfLoan')} rows={3} />
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'correction'} onClose={() => resetForm('correction')} title="Request Attendance Correction" size="sm" footer={
        <><Button variant="secondary" onClick={() => resetForm('correction')}>{t('cancel')}</Button><Button loading={submitting} onClick={handleSubmitCorrection}>{t('submit')}</Button></>
      }>
        <div className="space-y-4">
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label><input type="date" className="input-base" value={correctionForm.date} onChange={e => setCorrectionForm(p => ({ ...p, date: e.target.value }))} /></div>
          <Select label="Issue Type" options={issueTypes} value={correctionForm.issue_type} onChange={v => setCorrectionForm(p => ({ ...p, issue_type: v }))} />
          <Textarea label="Explanation" value={correctionForm.explanation} onChange={e => setCorrectionForm(p => ({ ...p, explanation: e.target.value }))} placeholder="Describe the issue..." rows={3} />
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'general'} onClose={() => resetForm('general')} title="New Request" size="sm" footer={
        <><Button variant="secondary" onClick={() => resetForm('general')}>{t('cancel')}</Button><Button loading={submitting} onClick={handleSubmitGeneral}>{t('submit')}</Button></>
      }>
        <div className="space-y-4">
          <Select label="Category" options={generalCategories} value={generalForm.category} onChange={v => setGeneralForm(p => ({ ...p, category: v }))} />
          <Input label="Title" value={generalForm.title} onChange={e => setGeneralForm(p => ({ ...p, title: e.target.value }))} placeholder="Request title..." />
          <Textarea label="Description" value={generalForm.description} onChange={e => setGeneralForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe your request..." rows={3} />
        </div>
      </Modal>
    </motion.div>
  )
}
