import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../../i18n'
import StatsCard from '../../components/StatsCard'
import AnimatedTable from '../../components/AnimatedTable'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import Input from '../../components/ui/Input'
import { useToast } from '../../components/feedback/Toast'
import { createRequest } from '../../api/hr'
import {
  getMyEmployee, getMyLeaveBalance, getMyLeaveRequests,
  getMyAttendance, getMyPayroll, getMyLoans,
} from '../../api/hr'
import {
  UserCheck, CalendarDays, Thermometer, Landmark, FileText,
  Activity, Clock, Calendar, DollarSign, ClipboardCheck, User,
  ChevronRight, AlertCircle, Send, X,
} from 'lucide-react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
}
const fadeScale = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
}

const iconMap = { UserCheck, CalendarDays, Thermometer, Landmark, FileText, Activity }

const statusColors = {
  present: 'emerald', absent: 'rose', late: 'amber',
  'on_leave': 'purple', half_day: 'blue', wfh: 'sky', approved: 'emerald',
  pending: 'amber', rejected: 'rose', cancelled: 'gray', withdrawn: 'gray',
  active: 'emerald', paid: 'emerald', draft: 'gray', processing: 'sky',
}

const quickActionGradients = {
  indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-200',
  emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-200',
  sky: 'from-sky-500 to-sky-600 shadow-sky-200',
  amber: 'from-amber-500 to-amber-600 shadow-amber-200',
  purple: 'from-purple-500 to-purple-600 shadow-purple-200',
  rose: 'from-rose-500 to-rose-600 shadow-rose-200',
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
      <div className="animate-pulse space-y-3"><div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-700" /><div className="h-7 w-28 rounded bg-gray-100 dark:bg-gray-700" /><div className="h-3 w-16 rounded bg-gray-50 dark:bg-gray-900/50" /></div>
    </div>
  )
}

function SectionCard({ title, icon: Icon, action, actionLabel, children }) {
  const { t } = useI18n()
  return (
    <motion.div variants={fadeScale} className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4.5 w-4.5 text-gray-400 dark:text-gray-500" />}
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
        {action && (
          <button onClick={action} className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
            {actionLabel || t('viewAll')} <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="px-6 pb-5">{children}</div>
    </motion.div>
  )
}

function fmtDate(d) {
  if (!d) return '-'
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return d }
}

function fmtTime(d) {
  if (!d) return '-'
  try { return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) } catch { return d }
}

function fmtMoney(n) {
  if (n == null) return '-'
  return '$' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const contactHrCategories = [
  { value: 'payroll', label: 'Payroll' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'leave', label: 'Leave' },
  { value: 'documents', label: 'Documents' },
  { value: 'other', label: 'Other' },
]

export default function EmployeeDashboard() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [employee, setEmployee] = useState(null)
  const [leaveBalance, setLeaveBalance] = useState([])
  const [leaves, setLeaves] = useState([])
  const [attendance, setAttendance] = useState([])
  const [payroll, setPayroll] = useState([])
  const [loans, setLoans] = useState([])
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [showContactHr, setShowContactHr] = useState(false)
  const [contactForm, setContactForm] = useState({ category: '', subject: '', message: '' })
  const [contacting, setContacting] = useState(false)

  useEffect(() => {
    Promise.allSettled([
      getMyEmployee().then(r => r.data?.data || null),
      getMyLeaveBalance().then(r => r.data?.data || []),
      getMyLeaveRequests({ page: 1, pageSize: 50 }).then(r => { const d = r.data?.data; return d?.items || d || [] }),
      getMyAttendance({ page: 1, pageSize: 10 }).then(r => { const d = r.data?.data; return d?.items || d || [] }),
      getMyPayroll({ page: 1, pageSize: 20 }).then(r => { const d = r.data?.data; return d?.items || d || [] }),
      getMyLoans({ page: 1, pageSize: 20 }).then(r => { const d = r.data?.data; return d?.items || d || [] }),
    ]).then(([emp, lb, lv, att, pr, ln]) => {
      if (emp.status === 'fulfilled') setEmployee(emp.value)
      if (lb.status === 'fulfilled') setLeaveBalance(lb.value)
      if (lv.status === 'fulfilled') setLeaves(lv.value)
      if (att.status === 'fulfilled') setAttendance(att.value)
      if (pr.status === 'fulfilled') setPayroll(pr.value)
      if (ln.status === 'fulfilled') setLoans(ln.value)
    }).finally(() => setLoading(false))
  }, [])

  const todayAttendance = attendance.find(a => {
    if (!a.date) return false
    const today = new Date().toISOString().split('T')[0]
    return a.date.startsWith(today) || a.date === today
  })

  const sickLeave = leaveBalance.find(l => l.type === 'sick')
  const annualLeave = leaveBalance.find(l => l.type === 'annual')
  const pendingLoans = loans.filter(l => l.status === 'pending').length
  const activeLoans = loans.filter(l => l.status === 'approved' || l.status === 'active')
  const activeLoanTotal = activeLoans.reduce((s, l) => s + (l.amount || 0), 0)
  const monthlyDeduction = activeLoans.reduce((s, l) => s + (l.monthly_installment || 0), 0)
  const latestPayslip = payroll.length > 0 ? payroll[0] : null

  const attSummary = {
    status: todayAttendance?.status || 'not_checked_in',
    checkIn: todayAttendance?.check_in || null,
    checkOut: todayAttendance?.check_out || null,
    workHours: todayAttendance?.work_hours || 0,
  }

  const totalPresent = attendance.filter(a => a.status === 'present' || a.status === 'late').length
  const attendanceRate = attendance.length > 0 ? Math.round((totalPresent / attendance.length) * 100) : 0

  const kpiConfig = [
    {
      id: 'attendance_status', title: t('todaysStatus'), icon: 'UserCheck', color: 'emerald',
      value: attSummary.status === 'not_checked_in' ? t('notCheckedIn')
        : attSummary.status === 'present' ? t('present')
        : attSummary.status === 'late' ? t('late') : attSummary.status,
    },
    { id: 'sick_leaves', title: t('sickLeavesLeft'), icon: 'Thermometer', color: 'sky', value: sickLeave?.remaining ?? '-', suffix: sickLeave?.remaining != null ? ` ${t('days')}` : '' },
    { id: 'annual_leaves', title: t('annualLeavesLeft'), icon: 'CalendarDays', color: 'purple', value: annualLeave?.remaining ?? '-', suffix: annualLeave?.remaining != null ? ` ${t('days')}` : '' },
    { id: 'pending_loans', title: t('pendingLoans'), icon: 'Landmark', color: 'amber', value: pendingLoans, suffix: pendingLoans === 1 ? ` ${t('request')}` : ` ${t('requests')}` },
    { id: 'latest_payslip', title: t('latestPayslip'), icon: 'FileText', color: 'indigo', value: latestPayslip ? fmtDate(latestPayslip.pay_period_start) : 'N/A' },
    { id: 'attendance_rate', title: t('attendanceRate'), icon: 'Activity', color: 'rose', value: attendanceRate || '-', suffix: attendanceRate ? '%' : '' },
  ]

  const handleContactHr = async () => {
    if (!contactForm.subject || !contactForm.message) { showToast('Please fill all fields', 'error'); return }
    setContacting(true)
    try {
      await createRequest({
        request_type: contactForm.category || 'other',
        title: `[Contact HR] ${contactForm.subject}`,
        description: `Category: ${contactForm.category}\n${contactForm.message}`,
        priority: 'medium',
      })
      showToast('Message sent to HR', 'success')
      setShowContactHr(false)
      setContactForm({ category: '', subject: '', message: '' })
    } catch (e) { showToast(e.response?.data?.message || 'Error', 'error') }
    setContacting(false)
  }

  const quickActions = [
    { label: t('applyForLeave'), desc: t('submitRequest'), icon: Calendar, color: 'indigo', action: () => navigate('/requests') },
    { label: t('applySickLeave'), desc: t('medicalLeave'), icon: Thermometer, color: 'sky', action: () => navigate('/requests') },
    { label: t('requestLoan'), desc: t('applyForLoanDesc'), icon: Landmark, color: 'emerald', action: () => navigate('/requests') },
    { label: t('viewPayslips'), desc: t('payHistory'), icon: DollarSign, color: 'amber', action: () => navigate('/payslip') },
    { label: t('updateProfile'), desc: t('editInfo'), icon: User, color: 'purple', action: () => showToast('Profile update coming soon', 'info') },
    { label: t('contactHr'), desc: t('getHelp'), icon: ClipboardCheck, color: 'rose', action: () => setShowContactHr(true) },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('myDashboard')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {employee
              ? `${t('welcomeBackName')} ${employee.first_name}! ${t('heresYourPersonalOverview')}`
              : t('loadingDashboard')}
          </p>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {kpiConfig.map((kpi, i) => {
            const Icon = iconMap[kpi.icon] || UserCheck
            return (
              <StatsCard
                key={kpi.id}
                title={kpi.title}
                value={kpi.value}
                icon={Icon}
                color={kpi.color}
                suffix={kpi.suffix}
                delay={i * 0.03}
              />
            )
          })}
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard
            title={t('myAttendance')}
            icon={Activity}
            action={() => navigate('/attendance')}
            actionLabel={t('viewAll')}
          >
            {loading ? (
              <div className="flex items-center justify-center py-8"><div className="animate-pulse text-gray-400 dark:text-gray-500">{t('loadingText')}</div></div>
            ) : (
              <>
                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-3">
                    <p className="text-[11px] text-emerald-600 font-medium">{t('clockIn')}</p>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{attSummary.checkIn ? fmtTime(attSummary.checkIn) : '---'}</p>
                  </div>
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
                    <p className="text-[11px] text-blue-600 font-medium">{t('clockOut')}</p>
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">{attSummary.checkOut ? fmtTime(attSummary.checkOut) : '---'}</p>
                  </div>
                  <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 p-3">
                    <p className="text-[11px] text-purple-600 font-medium">{t('hoursToday')}</p>
                    <p className="text-sm font-semibold text-purple-700 dark:text-purple-400">{attSummary.workHours ? `${attSummary.workHours}h` : '---'}</p>
                  </div>
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3">
                    <p className="text-[11px] text-amber-600 font-medium">{t('status')}</p>
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 capitalize">{attSummary.status.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <AnimatedTable
                  columns={[
                    { key: 'date', label: t('date'), render: v => <span className="text-gray-900 dark:text-gray-100">{fmtDate(v)}</span> },
                    { key: 'check_in', label: t('clockIn'), render: v => <span className="text-gray-600 dark:text-gray-400">{v ? fmtTime(v) : '-'}</span> },
                    { key: 'check_out', label: t('clockOut'), render: v => <span className="text-gray-600 dark:text-gray-400">{v ? fmtTime(v) : '-'}</span> },
                    { key: 'work_hours', label: t('totalHours'), render: v => <span className="font-medium">{v ? `${v}h` : '-'}</span> },
                    { key: 'status', label: t('status'), render: v => <Badge color={statusColors[v] || 'gray'}>{v ? v.replace(/_/g, ' ') : '-'}</Badge> },
                  ]}
                  data={attendance || []}
                  pageSize={5}
                  emptyMessage={t('noAttendanceRecordsYet')}
                />
              </>
            )}
          </SectionCard>

          <SectionCard
            title={t('sickLeaveBalance')}
            icon={Thermometer}
            action={() => navigate('/requests')}
            actionLabel={t('viewAll')}
          >
            {loading ? (
              <div className="flex items-center justify-center py-8"><div className="animate-pulse text-gray-400 dark:text-gray-500">{t('loadingText')}</div></div>
            ) : sickLeave ? (
              <>
                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 p-3">
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{t('total')}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{sickLeave.total} {t('days')}</p>
                  </div>
                  <div className="rounded-lg bg-rose-50 dark:bg-rose-900/20 p-3">
                    <p className="text-[11px] text-rose-600 font-medium">{t('used')}</p>
                    <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">{sickLeave.used} {t('days')}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-3">
                    <p className="text-[11px] text-emerald-600 font-medium">{t('remaining') || 'Remaining'}</p>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{sickLeave.remaining} {t('days')}</p>
                  </div>
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3">
                    <p className="text-[11px] text-amber-600 font-medium">{t('pending')}</p>
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                      {leaves.filter(l => l.leave_type === 'sick' && l.status === 'pending').length} {t('pendingRequests')}
                    </p>
                  </div>
                </div>
                <AnimatedTable
                  columns={[
                    { key: 'created_at', label: t('submittedDate'), render: v => <span className="text-gray-500 dark:text-gray-400 text-xs">{fmtDate(v)}</span> },
                    { key: 'start_date', label: t('from'), render: v => <span className="text-gray-500 dark:text-gray-400 text-xs">{fmtDate(v)}</span> },
                    { key: 'end_date', label: t('to'), render: v => <span className="text-gray-500 dark:text-gray-400 text-xs">{fmtDate(v)}</span> },
                    { key: 'duration_days', label: t('days'), render: v => <span className="font-medium">{v}</span> },
                    { key: 'status', label: t('status'), render: v => <Badge color={statusColors[v] || 'gray'}>{v}</Badge> },
                  ]}
                  data={leaves.filter(l => l.leave_type === 'sick') || []}
                  pageSize={5}
                  emptyMessage={t('noSickLeaveRequests')}
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
                <Thermometer className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">{t('noLeaveBalanceData')}</p>
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title={t('quickActions')} icon={AlertCircle}>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, i) => {
                const gradient = quickActionGradients[action.color] || quickActionGradients.indigo
                return (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={action.action}
                    className="flex flex-col items-center gap-2.5 rounded-xl p-4 text-center transition-shadow hover:shadow-lg"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-md`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{action.label}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{action.desc}</p>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </SectionCard>

          <SectionCard
            title={t('myLoans')}
            icon={Landmark}
            action={() => navigate('/requests')}
            actionLabel={t('viewAll')}
          >
            {loading ? (
              <div className="flex items-center justify-center py-6"><div className="animate-pulse text-gray-400 dark:text-gray-500">{t('loadingText')}</div></div>
            ) : (
              <>
                {activeLoans.length > 0 && (
                  <div className="mb-3 grid grid-cols-1 gap-2">
                    <div className="flex items-center justify-between rounded-lg bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2">
                      <span className="text-[11px] text-indigo-600 font-medium">{t('activeLoan')}</span>
                      <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">{fmtMoney(activeLoanTotal)}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-amber-50 dark:bg-amber-900/20 px-3 py-2">
                      <span className="text-[11px] text-amber-600 font-medium">{t('monthlyDeduction')}</span>
                      <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{fmtMoney(monthlyDeduction)}</span>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  {(loans || []).slice(0, 5).map(loan => (
                    <div key={loan.id} className="flex items-center justify-between rounded-lg border border-gray-50 dark:border-gray-700 p-2.5">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{fmtMoney(loan.amount)}</p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500">{fmtDate(loan.created_at)}</p>
                      </div>
                      <Badge color={statusColors[loan.status] || 'gray'}>{loan.status}</Badge>
                    </div>
                  ))}
                  {(!loans || loans.length === 0) && (
                    <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">{t('noLoanApplications')}</p>
                  )}
                </div>
              </>
            )}
          </SectionCard>
        </div>
      </div>

      <SectionCard
        title={t('payslips')}
        icon={FileText}
        action={() => navigate('/payslip')}
        actionLabel={t('viewAll')}
      >
        {loading ? (
          <div className="flex items-center justify-center py-8"><div className="animate-pulse text-gray-400 dark:text-gray-500">{t('loadingText')}</div></div>
        ) : (
          <AnimatedTable
            columns={[
              { key: 'pay_period_start', label: t('month'), render: v => <span className="font-medium text-gray-900 dark:text-gray-100">{fmtDate(v)}</span> },
              { key: 'basic_salary', label: t('basicSalary'), render: v => <span className="text-gray-600 dark:text-gray-400">{fmtMoney(v)}</span> },
              { key: 'total_deductions', label: t('deductions'), render: v => <span className="text-rose-600">{fmtMoney(v)}</span> },
              { key: 'bonus', label: t('bonuses'), render: v => <span className="text-emerald-600">{fmtMoney(v)}</span> },
              { key: 'net_pay', label: t('netSalary'), render: v => <span className="font-bold text-gray-900 dark:text-gray-100">{fmtMoney(v)}</span> },
              {
                key: 'status', label: t('action'),
                render: (_, row) => (
                  <div className="flex items-center gap-1">
                    <button onClick={() => showToast(t('payslipViewerComingSoon'), 'info')} className="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">{t('view')}</button>
                    <button onClick={() => showToast(t('downloadComingSoon'), 'info')} className="rounded px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">{t('download')}</button>
                  </div>
                ),
              },
            ]}
            data={payroll || []}
            pageSize={5}
            emptyMessage={t('noPayslipsAvailable')}
          />
        )}
      </SectionCard>

      <Modal isOpen={showContactHr} onClose={() => { setShowContactHr(false); setContactForm({ category: '', subject: '', message: '' }) }} title="Contact HR" size="md" footer={
        <><Button variant="secondary" onClick={() => { setShowContactHr(false); setContactForm({ category: '', subject: '', message: '' }) }}>{t('cancel')}</Button><Button loading={contacting} icon={Send} onClick={handleContactHr}>{t('submit')}</Button></>
      }>
        <div className="space-y-4">
          <Select label="Category" options={contactHrCategories} value={contactForm.category} onChange={v => setContactForm(p => ({ ...p, category: v }))} />
          <Input label="Subject" value={contactForm.subject} onChange={e => setContactForm(p => ({ ...p, subject: e.target.value }))} placeholder="Brief subject..." />
          <Textarea label="Message" value={contactForm.message} onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))} placeholder="Describe your question or issue..." rows={4} />
        </div>
      </Modal>
    </motion.div>
  )
}
