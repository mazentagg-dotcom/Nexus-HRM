import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import StatsCard from '../../components/StatsCard'
import AnimatedTable from '../../components/AnimatedTable'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import { useToast } from '../../components/feedback/Toast'
import {
  getMyEmployee, getMyLeaveBalance, getMyLeaveRequests,
  getMyAttendance, getMyPayroll, getMyLoans, checkIn, checkOut,
} from '../../api/hr'
import {
  UserCheck, CalendarDays, Thermometer, Landmark, FileText,
  Activity, Clock, Calendar, DollarSign, ClipboardCheck, User,
  ChevronRight, AlertCircle, ArrowRight,
} from 'lucide-react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }
const fadeScale = { hidden: { opacity: 0, scale: 0.96 }, show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

const iconMap = { UserCheck, CalendarDays, Thermometer, Landmark, FileText, Activity }

const statusColors = {
  present: 'emerald', absent: 'rose', late: 'amber',
  'on_leave': 'purple', half_day: 'blue', wfh: 'sky', approved: 'emerald',
  pending: 'amber', rejected: 'rose', cancelled: 'gray', withdrawn: 'gray',
  active: 'emerald', paid: 'emerald', draft: 'gray', processing: 'sky',
}

const leaveTypeColors = { annual: 'blue', sick: 'emerald', personal: 'purple', maternity: 'pink', unpaid: 'gray' }

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
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <div className="animate-pulse space-y-3"><div className="h-3 w-20 rounded bg-gray-100" /><div className="h-7 w-28 rounded bg-gray-100" /><div className="h-3 w-16 rounded bg-gray-50" /></div>
    </div>
  )
}

function SectionCard({ title, icon: Icon, action, actionLabel, children }) {
  return (
    <motion.div variants={fadeScale} className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4.5 w-4.5 text-gray-400" />}
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        </div>
        {action && (
          <button onClick={action} className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
            {actionLabel || 'View all'} <ChevronRight className="h-3 w-3" />
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

export default function EmployeeDashboard() {
  const [loading, setLoading] = useState(true)
  const [employee, setEmployee] = useState(null)
  const [leaveBalance, setLeaveBalance] = useState([])
  const [leaves, setLeaves] = useState([])
  const [attendance, setAttendance] = useState([])
  const [payroll, setPayroll] = useState([])
  const [loans, setLoans] = useState([])
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const { showToast } = useToast()
  const navigate = useNavigate()

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

  const handleCheckIn = async () => {
    setCheckingIn(true)
    try {
      await checkIn()
      showToast('Checked in successfully', 'success')
      const res = await getMyAttendance({ page: 1, pageSize: 10 })
      const d = res.data?.data
      setAttendance(d?.items || d || [])
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to check in', 'error')
    } finally { setCheckingIn(false) }
  }

  const handleCheckOut = async () => {
    setCheckingOut(true)
    try {
      await checkOut()
      showToast('Checked out successfully', 'success')
      const res = await getMyAttendance({ page: 1, pageSize: 10 })
      const d = res.data?.data
      setAttendance(d?.items || d || [])
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to check out', 'error')
    } finally { setCheckingOut(false) }
  }

  const kpiConfig = [
    {
      id: 'attendance_status', title: 'Today\'s Status', icon: 'UserCheck', color: 'emerald',
      value: attSummary.status === 'not_checked_in' ? 'Not Checked In'
        : attSummary.status === 'present' ? 'Present'
        : attSummary.status === 'late' ? 'Late' : attSummary.status,
    },
    { id: 'sick_leaves', title: 'Sick Leaves Left', icon: 'Thermometer', color: 'sky', value: sickLeave?.remaining ?? '-', suffix: sickLeave?.remaining != null ? ' days' : '' },
    { id: 'annual_leaves', title: 'Annual Leaves Left', icon: 'CalendarDays', color: 'purple', value: annualLeave?.remaining ?? '-', suffix: annualLeave?.remaining != null ? ' days' : '' },
    { id: 'pending_loans', title: 'Pending Loans', icon: 'Landmark', color: 'amber', value: pendingLoans, suffix: pendingLoans === 1 ? ' request' : ' requests' },
    { id: 'latest_payslip', title: 'Latest Payslip', icon: 'FileText', color: 'indigo', value: latestPayslip ? fmtDate(latestPayslip.pay_period_start) : 'N/A' },
    { id: 'attendance_rate', title: 'Attendance Rate', icon: 'Activity', color: 'rose', value: attendanceRate || '-', suffix: attendanceRate ? '%' : '' },
  ]

  const quickActions = [
    { label: 'Apply for Leave', desc: 'Submit request', icon: Calendar, color: 'indigo', path: '/self-service', tab: 'leave' },
    { label: 'Apply Sick Leave', desc: 'Medical leave', icon: Thermometer, color: 'sky', path: '/self-service', tab: 'leave' },
    { label: 'Request Loan', desc: 'Apply for loan', icon: Landmark, color: 'emerald', path: '/self-service', tab: 'loans' },
    { label: 'View Payslips', desc: 'Pay history', icon: DollarSign, color: 'amber', path: '/self-service', tab: 'payslips' },
    { label: 'Update Profile', desc: 'Edit info', icon: User, color: 'purple', path: '/self-service', tab: 'profile' },
    { label: 'Contact HR', desc: 'Get help', icon: ClipboardCheck, color: 'rose', path: '/self-service' },
  ]

  const handleQuickAction = (action) => {
    if (action.tab) {
      navigate(action.path, { state: { tab: action.tab } })
    } else {
      navigate(action.path)
    }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            {employee
              ? `Welcome back, ${employee.first_name}! Here's your personal overview.`
              : 'Loading your dashboard...'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!attSummary.checkIn ? (
            <Button size="sm" icon={Clock} loading={checkingIn} onClick={handleCheckIn} variant="primary">Check In</Button>
          ) : !attSummary.checkOut ? (
            <Button size="sm" icon={Clock} loading={checkingOut} onClick={handleCheckOut} variant="secondary">Check Out</Button>
          ) : (
            <Badge color="emerald">Checked out for today</Badge>
          )}
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
            title="My Attendance"
            icon={Activity}
            action={() => navigate('/self-service', { state: { tab: 'attendance' } })}
            actionLabel="View all"
          >
            {loading ? (
              <div className="flex items-center justify-center py-8"><div className="animate-pulse text-gray-400">Loading...</div></div>
            ) : (
              <>
                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg bg-emerald-50 p-3">
                    <p className="text-[11px] text-emerald-600 font-medium">Check In</p>
                    <p className="text-sm font-semibold text-emerald-700">{attSummary.checkIn ? fmtTime(attSummary.checkIn) : '---'}</p>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-3">
                    <p className="text-[11px] text-blue-600 font-medium">Check Out</p>
                    <p className="text-sm font-semibold text-blue-700">{attSummary.checkOut ? fmtTime(attSummary.checkOut) : '---'}</p>
                  </div>
                  <div className="rounded-lg bg-purple-50 p-3">
                    <p className="text-[11px] text-purple-600 font-medium">Hours Today</p>
                    <p className="text-sm font-semibold text-purple-700">{attSummary.workHours ? `${attSummary.workHours}h` : '---'}</p>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-3">
                    <p className="text-[11px] text-amber-600 font-medium">Status</p>
                    <p className="text-sm font-semibold text-amber-700 capitalize">{attSummary.status.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <AnimatedTable
                  columns={[
                    { key: 'date', label: 'Date', render: v => <span className="text-gray-900">{fmtDate(v)}</span> },
                    { key: 'check_in', label: 'Check In', render: v => <span className="text-gray-600">{v ? fmtTime(v) : '-'}</span> },
                    { key: 'check_out', label: 'Check Out', render: v => <span className="text-gray-600">{v ? fmtTime(v) : '-'}</span> },
                    { key: 'work_hours', label: 'Hours', render: v => <span className="font-medium">{v ? `${v}h` : '-'}</span> },
                    { key: 'status', label: 'Status', render: v => <Badge color={statusColors[v] || 'gray'}>{v ? v.replace(/_/g, ' ') : '-'}</Badge> },
                  ]}
                  data={attendance || []}
                  pageSize={5}
                  emptyMessage="No attendance records yet"
                />
              </>
            )}
          </SectionCard>

          <SectionCard
            title="Sick Leave Balance"
            icon={Thermometer}
            action={() => navigate('/self-service', { state: { tab: 'leave' } })}
            actionLabel="View all"
          >
            {loading ? (
              <div className="flex items-center justify-center py-8"><div className="animate-pulse text-gray-400">Loading...</div></div>
            ) : sickLeave ? (
              <>
                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-[11px] text-gray-500 font-medium">Total</p>
                    <p className="text-sm font-semibold text-gray-900">{sickLeave.total} days</p>
                  </div>
                  <div className="rounded-lg bg-rose-50 p-3">
                    <p className="text-[11px] text-rose-600 font-medium">Used</p>
                    <p className="text-sm font-semibold text-rose-700">{sickLeave.used} days</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-3">
                    <p className="text-[11px] text-emerald-600 font-medium">Remaining</p>
                    <p className="text-sm font-semibold text-emerald-700">{sickLeave.remaining} days</p>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-3">
                    <p className="text-[11px] text-amber-600 font-medium">Pending</p>
                    <p className="text-sm font-semibold text-amber-700">
                      {leaves.filter(l => l.leave_type === 'sick' && l.status === 'pending').length} requests
                    </p>
                  </div>
                </div>
                <AnimatedTable
                  columns={[
                    { key: 'created_at', label: 'Request Date', render: v => <span className="text-gray-500 text-xs">{fmtDate(v)}</span> },
                    { key: 'start_date', label: 'From', render: v => <span className="text-gray-500 text-xs">{fmtDate(v)}</span> },
                    { key: 'end_date', label: 'To', render: v => <span className="text-gray-500 text-xs">{fmtDate(v)}</span> },
                    { key: 'duration_days', label: 'Days', render: v => <span className="font-medium">{v}</span> },
                    { key: 'status', label: 'Status', render: v => <Badge color={statusColors[v] || 'gray'}>{v}</Badge> },
                  ]}
                  data={leaves.filter(l => l.leave_type === 'sick') || []}
                  pageSize={5}
                  emptyMessage="No sick leave requests"
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <Thermometer className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No leave balance data available</p>
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Quick Actions" icon={AlertCircle}>
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
                    onClick={() => handleQuickAction(action)}
                    className="flex flex-col items-center gap-2.5 rounded-xl p-4 text-center transition-shadow hover:shadow-lg"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-md`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">{action.label}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{action.desc}</p>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </SectionCard>

          <SectionCard
            title="My Loans"
            icon={Landmark}
            action={() => navigate('/self-service', { state: { tab: 'loans' } })}
            actionLabel="View all"
          >
            {loading ? (
              <div className="flex items-center justify-center py-6"><div className="animate-pulse text-gray-400">Loading...</div></div>
            ) : (
              <>
                {activeLoans.length > 0 && (
                  <div className="mb-3 grid grid-cols-1 gap-2">
                    <div className="flex items-center justify-between rounded-lg bg-indigo-50 px-3 py-2">
                      <span className="text-[11px] text-indigo-600 font-medium">Active Loan</span>
                      <span className="text-sm font-bold text-indigo-700">{fmtMoney(activeLoanTotal)}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2">
                      <span className="text-[11px] text-amber-600 font-medium">Monthly Deduction</span>
                      <span className="text-sm font-bold text-amber-700">{fmtMoney(monthlyDeduction)}</span>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  {(loans || []).slice(0, 5).map(loan => (
                    <div key={loan.id} className="flex items-center justify-between rounded-lg border border-gray-50 p-2.5">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{fmtMoney(loan.amount)}</p>
                        <p className="text-[11px] text-gray-400">{fmtDate(loan.created_at)}</p>
                      </div>
                      <Badge color={statusColors[loan.status] || 'gray'}>{loan.status}</Badge>
                    </div>
                  ))}
                  {(!loans || loans.length === 0) && (
                    <p className="text-center text-sm text-gray-400 py-4">No loan applications</p>
                  )}
                </div>
              </>
            )}
          </SectionCard>
        </div>
      </div>

      <SectionCard
        title="Payslips"
        icon={FileText}
        action={() => navigate('/self-service', { state: { tab: 'payslips' } })}
        actionLabel="View all"
      >
        {loading ? (
          <div className="flex items-center justify-center py-8"><div className="animate-pulse text-gray-400">Loading...</div></div>
        ) : (
          <AnimatedTable
            columns={[
              { key: 'pay_period_start', label: 'Month', render: v => <span className="font-medium text-gray-900">{fmtDate(v)}</span> },
              { key: 'basic_salary', label: 'Basic Salary', render: v => <span className="text-gray-600">{fmtMoney(v)}</span> },
              { key: 'total_deductions', label: 'Deductions', render: v => <span className="text-rose-600">{fmtMoney(v)}</span> },
              { key: 'bonus', label: 'Bonuses', render: v => <span className="text-emerald-600">{fmtMoney(v)}</span> },
              { key: 'net_pay', label: 'Net Salary', render: v => <span className="font-bold text-gray-900">{fmtMoney(v)}</span> },
              {
                key: 'status', label: 'Action',
                render: (_, row) => (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => showToast('Payslip viewer coming soon', 'info')}
                      className="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => showToast('Download coming soon', 'info')}
                      className="rounded px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      Download
                    </button>
                  </div>
                ),
              },
            ]}
            data={payroll || []}
            pageSize={5}
            emptyMessage="No payslips available"
          />
        )}
      </SectionCard>
    </motion.div>
  )
}
