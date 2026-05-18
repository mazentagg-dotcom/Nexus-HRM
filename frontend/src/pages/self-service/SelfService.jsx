import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useI18n } from '../../i18n'
import Tabs from '../../components/ui/Tabs'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import { useToast } from '../../components/feedback/Toast'
import { useAuth } from '../../hooks/useAuth'
import { getMyEmployee, getMyLeaveBalance, getMyLeaveRequests, createMyLeaveRequest, getMyPayroll, getMyAttendance, checkIn, checkOut, getMyLoans, createMyLoan } from '../../api/hr'
import { User, Calendar, DollarSign, Clock, Landmark } from 'lucide-react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

const fmt = n => n != null ? '$' + Number(n).toLocaleString() : '-'
const fmtDate = d => { if (!d) return ''; try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return d } }

export default function SelfService() {
  const { t } = useI18n()
  const { user } = useAuth()
  const { showToast } = useToast()
  const location = useLocation()
  const initialTab = location.state?.tab || 'profile'
  const [activeTab, setActiveTab] = useState(initialTab)
  const [employee, setEmployee] = useState(null)
  const [leaveBalance, setLeaveBalance] = useState([])
  const [myLeaves, setMyLeaves] = useState([])
  const [payslips, setPayslips] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showLoanModal, setShowLoanModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, balRes, leavesRes, payRes, attRes, loansRes] = await Promise.allSettled([
          getMyEmployee(), getMyLeaveBalance(), getMyLeaveRequests({ page: 1, pageSize: 100 }),
          getMyPayroll({ page: 1, pageSize: 50 }), getMyAttendance({ page: 1, pageSize: 50 }),
          getMyLoans({ page: 1, pageSize: 50 }),
        ])
        if (empRes.status === 'fulfilled') setEmployee(empRes.value.data?.data || null)
        if (balRes.status === 'fulfilled') setLeaveBalance(balRes.value.data?.data || [])
        if (leavesRes.status === 'fulfilled') setMyLeaves(leavesRes.value.data?.data?.items || leavesRes.value.data?.data || [])
        if (payRes.status === 'fulfilled') setPayslips(payRes.value.data?.data?.items || payRes.value.data?.data || [])
        if (attRes.status === 'fulfilled') setAttendance(attRes.value.data?.data?.items || attRes.value.data?.data || [])
        if (loansRes.status === 'fulfilled') setLoans(loansRes.value.data?.data?.items || loansRes.value.data?.data || [])
      } catch {}
      setLoading(false)
    }
    fetchData()
  }, [])

  const resetLeaveModal = useCallback(() => { setShowLeaveModal(false); setSubmitting(false) }, [])
  const resetLoanModal = useCallback(() => { setShowLoanModal(false); setSubmitting(false) }, [])

  const handleApplyLeave = async () => {
    const f = document.getElementById('leave-form')
    if (!f) return
    const data = Object.fromEntries(new FormData(f))
    if (!data.leave_type || !data.start_date || !data.end_date) { showToast(t('pleaseFillAllRequiredFields'), 'error'); return }
    setSubmitting(true)
    try {
      const d1 = new Date(data.start_date), d2 = new Date(data.end_date)
      const days = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1)
      await createMyLeaveRequest({ ...data, duration_days: days })
      showToast(t('leaveRequestSubmitted'), 'success')
      resetLeaveModal()
      const res = await getMyLeaveRequests({ page: 1, pageSize: 100 })
      setMyLeaves(res.data?.data?.items || res.data?.data || [])
    } catch (e) { showToast(e.response?.data?.message || t('failedToSubmit'), 'error'); setSubmitting(false) }
  }

  const handleApplyLoan = async () => {
    const f = document.getElementById('loan-form')
    if (!f) return
    const data = Object.fromEntries(new FormData(f))
    if (!data.amount || !data.purpose || !data.repayment_months) { showToast(t('pleaseFillAllRequiredFields'), 'error'); return }
    setSubmitting(true)
    try {
      await createMyLoan({ amount: Number(data.amount), purpose: data.purpose, repayment_months: Number(data.repayment_months) })
      showToast(t('loanApplicationSubmitted'), 'success')
      resetLoanModal()
      const res = await getMyLoans({ page: 1, pageSize: 50 })
      setLoans(res.data?.data?.items || res.data?.data || [])
    } catch (e) { showToast(e.response?.data?.message || t('failedToSubmit'), 'error'); setSubmitting(false) }
  }

  const handleCheckIn = async () => {
    try { await checkIn(); showToast(t('checkedInSuccessfully'), 'success'); setTimeout(() => getMyAttendance({ page: 1, pageSize: 50 }).then(r => setAttendance(r.data?.data?.items || r.data?.data || [])), 500) } catch (e) { showToast(e.response?.data?.message || t('checkInFailed'), 'error') }
  }
  const handleCheckOut = async () => {
    try { await checkOut(); showToast(t('checkedOutSuccessfully'), 'success'); setTimeout(() => getMyAttendance({ page: 1, pageSize: 50 }).then(r => setAttendance(r.data?.data?.items || r.data?.data || [])), 500) } catch (e) { showToast(e.response?.data?.message || t('checkOutFailed'), 'error') }
  }

  const leaveStatusColors = { pending: 'amber', approved: 'emerald', rejected: 'rose' }
  const loanStatusColors = { pending: 'amber', approved: 'emerald', rejected: 'rose', paid: 'sky' }
  const attStatusColors = { present: 'emerald', absent: 'rose', late: 'amber', half_day: 'blue', on_leave: 'purple' }

  const tabs = [
    { id: 'profile', label: t('profile'), icon: User },
    { id: 'leave', label: t('leave'), icon: Calendar },
    { id: 'attendance', label: t('attendance'), icon: Clock },
    { id: 'payslips', label: t('payslips'), icon: DollarSign },
    { id: 'loans', label: t('loans'), icon: Landmark },
  ]

  const renderProfile = () => {
    const name = employee ? `${employee.first_name} ${employee.last_name}` : (user ? `${user.first_name || ''} ${user.last_name || ''}` : '')
    const items = [
      { label: t('fullName'), value: name },
      { label: t('employeeCode'), value: employee?.employee_code || '-' },
      { label: t('email'), value: employee?.email || user?.email || '-' },
      { label: t('phone'), value: employee?.phone || '-' },
      { label: t('department'), value: employee?.department_name || '-' },
      { label: t('position'), value: employee?.position || '-' },
      { label: t('hireDate'), value: fmtDate(employee?.hire_date) },
      { label: t('status'), value: employee?.status || '-' },
    ]
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map(item => (
            <div key={item.label} className="rounded-lg border border-gray-100 dark:border-gray-700 p-3">
              <p className="text-[11px] text-gray-400 dark:text-gray-500">{item.label}</p>
              <p className="text-sm text-gray-900 dark:text-gray-100">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderLeave = () => (
    <div className="space-y-6">
      <div className="flex justify-end"><Button size="sm" onClick={() => setShowLeaveModal(true)}>{t('applyForLeave')}</Button></div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(leaveBalance || []).map(lb => (
          <div key={lb.type} className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{lb.label}</h4>
              <Badge color={lb.remaining > 0 ? 'emerald' : 'gray'}>{lb.remaining} {t('left')}</Badge>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
              <div className="h-full rounded-full bg-indigo-500" style={{ width: `${lb.total > 0 ? (lb.used / lb.total) * 100 : 0}%` }} />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-400 dark:text-gray-500">
              <span>{t('used')}: {lb.used}</span><span>{t('total')}: {lb.total}</span>
            </div>
          </div>
        ))}
      </div>
      {(myLeaves || []).length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('myLeaveHistory')}</h3>
          {(myLeaves || []).map(lr => (
            <div key={lr.id} className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-700 p-3">
              <div><p className="text-sm font-medium text-gray-900 dark:text-gray-100">{lr.leave_type}</p><p className="text-xs text-gray-400 dark:text-gray-500">{fmtDate(lr.start_date)} - {fmtDate(lr.end_date)} ({lr.duration_days}d)</p></div>
              <Badge color={leaveStatusColors[lr.status] || 'gray'}>{lr.status}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderAttendance = () => (
    <div className="space-y-4">
      <div className="flex gap-2 justify-end">
        <Button size="sm" onClick={handleCheckIn}>{t('checkIn')}</Button>
        <Button size="sm" variant="secondary" onClick={handleCheckOut}>{t('checkOut')}</Button>
      </div>
      <div className="space-y-2">
        {(attendance || []).map(a => (
          <div key={a.id} className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-700 p-3">
            <div><p className="text-sm font-medium text-gray-900 dark:text-gray-100">{a.date}</p><p className="text-xs text-gray-400 dark:text-gray-500">{a.check_in ? `In: ${new Date(a.check_in).toLocaleTimeString()}` : ''} {a.check_out ? `Out: ${new Date(a.check_out).toLocaleTimeString()}` : ''}</p></div>
            <div className="flex items-center gap-3"><Badge color={attStatusColors[a.status] || 'gray'}>{a.status}</Badge>{a.work_hours != null && <span className="text-xs text-gray-500 dark:text-gray-400">{a.work_hours}h</span>}</div>
          </div>
        ))}
        {(!attendance || attendance.length === 0) && <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">{t('noAttendanceRecords')}</p>}
      </div>
    </div>
  )

  const renderPayslips = () => (
    <div className="space-y-3">
      {(payslips || []).map(ps => (
        <div key={ps.id} className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow-sm transition-shadow">
          <div><h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{ps.pay_period_start} {t('to')} {ps.pay_period_end}</h4><p className="text-xs text-gray-400 dark:text-gray-500">{t('gross')}: {fmt(ps.gross_pay)} | {t('deductions')}: {fmt(ps.total_deductions)}</p></div>
          <div className="text-right"><p className="text-sm font-bold text-gray-900 dark:text-gray-100">{t('net')}: {fmt(ps.net_pay)}</p><Badge color={ps.status === 'paid' ? 'emerald' : 'amber'}>{ps.status}</Badge></div>
        </div>
      ))}
      {(!payslips || payslips.length === 0) && <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">{t('noPayslipsAvailable')}</p>}
    </div>
  )

  const renderLoans = () => (
    <div className="space-y-4">
      <div className="flex justify-end"><Button size="sm" onClick={() => setShowLoanModal(true)}>{t('applyForLoan')}</Button></div>
      <div className="space-y-2">
        {(loans || []).map(loan => (
          <div key={loan.id} className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-700 p-4">
            <div><p className="text-sm font-medium text-gray-900 dark:text-gray-100">{fmt(loan.amount)}</p><p className="text-xs text-gray-400 dark:text-gray-500">{loan.purpose} | {loan.repayment_months} {t('months')} | {fmt(loan.monthly_installment)}/mo</p><p className="text-[11px] text-gray-300 dark:text-gray-600">{fmtDate(loan.created_at)}</p></div>
            <Badge color={loanStatusColors[loan.status] || 'gray'}>{loan.status}</Badge>
          </div>
        ))}
        {(!loans || loans.length === 0) && <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">{t('noLoanApplications')}</p>}
      </div>
    </div>
  )

  const content = { profile: renderProfile, leave: renderLeave, attendance: renderAttendance, payslips: renderPayslips, loans: renderLoans }

  if (loading) return <div className="flex items-center justify-center py-20"><p className="text-sm text-gray-400 dark:text-gray-500">{t('loadingText')}</p></div>

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('selfService')}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('manageSelfServiceDesc')}</p>
      </motion.div>
      <motion.div variants={fadeUp} className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        <div className="p-6">{(content[activeTab] || renderProfile)()}</div>
      </motion.div>

      <Modal isOpen={showLeaveModal} onClose={resetLeaveModal} title={t('applyForLeave')} size="md" footer={
        <><Button variant="secondary" onClick={resetLeaveModal}>{t('cancel')}</Button><Button loading={submitting} onClick={handleApplyLeave}>{t('submit')}</Button></>
      }>
        <form id="leave-form" className="space-y-4">
          <Select label={t('leaveType')} name="leave_type" options={[{ value: 'annual', label: t('annualLeave') }, { value: 'sick', label: t('sickLeave') }, { value: 'personal', label: t('personalLeave') }, { value: 'unpaid', label: t('unpaidLeave') }]} required />
          <div className="grid grid-cols-2 gap-4"><Input label={t('startDate')} name="start_date" type="date" required /><Input label={t('endDate')} name="end_date" type="date" required /></div>
          <Textarea label={t('reason')} name="reason" placeholder={t('reasonForLeave')} rows={3} />
        </form>
      </Modal>

      <Modal isOpen={showLoanModal} onClose={resetLoanModal} title={t('applyForLoan')} size="md" footer={
        <><Button variant="secondary" onClick={resetLoanModal}>{t('cancel')}</Button><Button loading={submitting} onClick={handleApplyLoan}>{t('submit')}</Button></>
      }>
        <form id="loan-form" className="space-y-4">
          <Input label={t('amount')} name="amount" type="number" placeholder="e.g. 5000" required />
          <Textarea label={t('purpose')} name="purpose" placeholder={t('purposeOfLoan')} rows={3} required />
          <Input label={t('repaymentMonths')} name="repayment_months" type="number" placeholder="e.g. 12" required />
        </form>
      </Modal>
    </motion.div>
  )
}
