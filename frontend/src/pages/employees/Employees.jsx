import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedTable from '../../components/AnimatedTable'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import { useToast } from '../../components/feedback/Toast'
import { useI18n } from '../../i18n'
import { getEmployees, createEmployee, getDepartments, getLeaveRequests, getAttendance, getPayrollRecords, getEmployeeDocuments } from '../../api/hr'
import { BRANCH_OPTIONS } from '../../constants/hr'
import {
  Users, Search, Plus, X, Check, FileText, Clock,
} from 'lucide-react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

const employeeStatusColors = { active: 'emerald', on_leave: 'amber', probation: 'sky', terminated: 'rose' }
const leaveStatusColors = { pending: 'amber', approved: 'emerald', rejected: 'rose' }
const attendanceStatusColors = { present: 'emerald', absent: 'rose', late: 'amber', half_day: 'blue', on_leave: 'purple' }
const documentTypeColors = { contract: 'blue', id_card: 'emerald', passport: 'purple', tax_form: 'amber', certificate: 'sky', other: 'gray' }

const fmt = n => '$' + Number(n).toLocaleString()
const fmtBytes = b => b >= 1000000 ? (b / 1000000).toFixed(1) + ' MB' : (b / 1000).toFixed(0) + ' KB'

export default function Employees() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [branchFilter, setBranchFilter] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { showToast } = useToast()

  const [employeesData, setEmployeesData] = useState([])
  const [departments, setDepartments] = useState([])

  useEffect(() => {
    Promise.all([
      getEmployees({ page: 1, pageSize: 100 }).then(r => { const d = r.data?.data; return d?.items || d || [] }).catch(() => []),
      getDepartments({ page: 1, pageSize: 100 }).then(r => { const d = r.data?.data; return d?.items || d || [] }).catch(() => []),
    ]).then(([emps, depts]) => {
      setEmployeesData(emps)
      setDepartments(depts)
    }).finally(() => setLoading(false))
  }, [])

  const employees = employeesData

  const filteredEmployees = employees.filter(e => {
    const name = `${e.first_name || ''} ${e.last_name || ''}`.toLowerCase()
    const ms = !search || name.includes(search.toLowerCase()) || (e.employee_code || '').toLowerCase().includes(search.toLowerCase()) || (e.department_name || '').toLowerCase().includes(search.toLowerCase()) || (e.email || '').toLowerCase().includes(search.toLowerCase())
    const mf = !statusFilter || (e.status || 'active') === statusFilter
    const mb = !branchFilter || (e.branch || '') === branchFilter
    return ms && mf && mb
  })

  const resetForm = useCallback(() => { setShowEmployeeModal(false); setSubmitting(false) }, [])
  const handleSubmit = useCallback(async (fn, data, msg) => { setSubmitting(true); try { await fn(data); showToast(msg, 'success'); resetForm() } catch (e) { showToast(e.response?.data?.message || 'Error', 'error') } finally { setSubmitting(false) } }, [showToast, resetForm])

  const formatDate = d => { if (!d) return ''; try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return d } }

  const openEmployeeDrawer = (emp) => {
    const full = { ...emp, attendance: [], leaves: [], payroll: [], docs: [] }
    setSelectedEmployee(full)
    setDrawerOpen(true)

    Promise.all([
      getAttendance({ employee_id: emp.id, page: 1, pageSize: 10 }).then(r => { const d = r.data?.data; return d?.items || d || [] }).catch(() => []),
      getLeaveRequests({ employee_id: emp.id, page: 1, pageSize: 10 }).then(r => { const d = r.data?.data; return d?.items || d || [] }).catch(() => []),
      getPayrollRecords({ employee_id: emp.id, page: 1, pageSize: 10 }).then(r => { const d = r.data?.data; return d?.items || d || [] }).catch(() => []),
      getEmployeeDocuments({ employee_id: emp.id, page: 1, pageSize: 10 }).then(r => { const d = r.data?.data; return d?.items || d || [] }).catch(() => []),
    ]).then(([attendance, leaves, payroll, docs]) => {
      setSelectedEmployee(prev => prev ? { ...prev, attendance, leaves, payroll, docs } : prev)
    })
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('employees')}</h1><p className="mt-1 text-sm text-gray-500">{t('manageEmployees')}</p></div>
        <Button size="sm" icon={Plus} onClick={() => setShowEmployeeModal(true)}>{t('addEmployee')}</Button>
      </motion.div>

      <motion.div variants={fadeUp} className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search') + '...'} className="input-base h-9 w-56 pl-9" />
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-0.5">
            {['', 'active', 'on_leave', 'probation'].map(s => (
              <button key={s || 'all'} onClick={() => setStatusFilter(s)} className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors capitalize ${statusFilter === s ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>{s || 'All'}</button>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-0.5">
            <button onClick={() => setBranchFilter('')} className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${!branchFilter ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>All Branches</button>
            {BRANCH_OPTIONS.slice(0, 3).map(b => (
              <button key={b.value} onClick={() => setBranchFilter(branchFilter === b.value ? '' : b.value)} className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${branchFilter === b.value ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>{b.label}</button>
            ))}
          </div>
        </div>
        <div className="card-base overflow-hidden">
          <AnimatedTable columns={[
            { key: 'employee_code', label: 'ID', render: v => <span className="font-mono text-xs text-gray-500">{v}</span> },
            { key: 'first_name', label: t('name'), render: (_, r) => (
              <button onClick={() => openEmployeeDrawer(r)} className="flex items-center gap-3 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-xs font-semibold text-indigo-600 dark:text-indigo-400">{(r.first_name || '')[0]}{(r.last_name || '')[0]}</div>
                <div className="text-left"><span className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 transition-colors">{r.first_name} {r.last_name}</span><p className="text-[11px] text-gray-400">{r.email}</p></div>
              </button>
            )},
            { key: 'department_name', label: t('department') },
            { key: 'position', label: t('designation'), render: v => <span className="text-gray-500 text-xs">{v}</span> },
            { key: 'branch', label: t('branch'), render: v => v ? <Badge color="purple">{v}</Badge> : <span className="text-gray-400 text-xs">--</span> },
            { key: 'status', label: t('status'), render: v => <Badge color={employeeStatusColors[v] || 'gray'}>{v}</Badge> },
            { key: 'hire_date', label: t('employmentDate'), render: v => <span className="text-gray-400 text-xs">{formatDate(v)}</span> },
          ]} data={filteredEmployees} pageSize={10} loading={loading} />
        </div>
      </motion.div>

      <AnimatePresence>
        {drawerOpen && selectedEmployee && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex justify-end" onClick={() => setDrawerOpen(false)}>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="relative w-full max-w-lg bg-white dark:bg-gray-800 shadow-2xl h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-sm font-bold text-indigo-600 dark:text-indigo-400">{(selectedEmployee.first_name || '')[0]}{(selectedEmployee.last_name || '')[0]}</div>
                    <div><h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedEmployee.first_name} {selectedEmployee.last_name}</h2><p className="text-sm text-gray-500">{selectedEmployee.position}</p></div>
                  </div>
                  <button onClick={() => setDrawerOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300"><X className="h-5 w-5" /></button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge color={employeeStatusColors[selectedEmployee.status] || 'gray'}>{selectedEmployee.status}</Badge>
                  <Badge color="indigo">{selectedEmployee.employment_type}</Badge>
                  {selectedEmployee.branch && <Badge color="purple">{selectedEmployee.branch}</Badge>}
                  <span className="text-xs text-gray-400">{selectedEmployee.employee_code}</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Personal Info</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-3"><p className="text-[11px] text-gray-400">Email</p><p className="text-sm text-gray-700 dark:text-gray-300 truncate">{selectedEmployee.email}</p></div>
                    <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-3"><p className="text-[11px] text-gray-400">Phone</p><p className="text-sm text-gray-700 dark:text-gray-300">{selectedEmployee.phone}</p></div>
                    <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-3"><p className="text-[11px] text-gray-400">{t('department')}</p><p className="text-sm text-gray-700 dark:text-gray-300">{selectedEmployee.department_name}</p></div>
                    <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-3"><p className="text-[11px] text-gray-400">{t('branch')}</p><p className="text-sm text-gray-700 dark:text-gray-300">{selectedEmployee.branch || '--'}</p></div>
                    <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-3"><p className="text-[11px] text-gray-400">{t('employmentDate')}</p><p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(selectedEmployee.hire_date)}</p></div>
                    <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-3"><p className="text-[11px] text-gray-400">{t('employmentType')}</p><p className="text-sm text-gray-700 dark:text-gray-300">{selectedEmployee.employment_type}</p></div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('basicSalary')}</h4>
                  <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{fmt(selectedEmployee.salary)}</p>
                    <p className="text-xs text-gray-500 mt-1">Annual salary &middot; {fmt(Math.round((selectedEmployee.salary || 0) / 12))}/month</p>
                  </div>
                </div>
                {selectedEmployee.attendance && selectedEmployee.attendance.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Recent Attendance ({selectedEmployee.attendance.length})</h4>
                    <div className="space-y-2">
                      {selectedEmployee.attendance.slice(0, 5).map(a => (
                        <div key={a.id} className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-700 p-3">
                          <div className="flex items-center gap-2"><span className="text-sm text-gray-900 dark:text-gray-100">{a.date}</span></div>
                          <div className="flex items-center gap-2"><span className="text-xs text-gray-500">{a.check_in || '--'} - {a.check_out || '--'}</span><Badge color={attendanceStatusColors[a.status] || 'gray'}>{a.status}</Badge></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedEmployee.leaves && selectedEmployee.leaves.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Leave History ({selectedEmployee.leaves.length})</h4>
                    <div className="space-y-2">
                      {selectedEmployee.leaves.map(l => (
                        <div key={l.id} className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-700 p-3">
                          <div>
                            <p className="text-sm text-gray-900 dark:text-gray-100">{l.leave_type} - {l.duration_days} day{l.duration_days > 1 ? 's' : ''}</p>
                            <p className="text-[11px] text-gray-400">{formatDate(l.start_date)} - {formatDate(l.end_date)}</p>
                          </div>
                          <Badge color={leaveStatusColors[l.status] || 'gray'}>{l.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedEmployee.payroll && selectedEmployee.payroll.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Payroll Records ({selectedEmployee.payroll.length})</h4>
                    <div className="space-y-2">
                      {selectedEmployee.payroll.map(p => (
                        <div key={p.id} className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-700 p-3">
                          <div><p className="text-sm text-gray-900 dark:text-gray-100">{p.pay_period_start || 'N/A'}</p><p className="text-[11px] text-gray-400">{p.status}</p></div>
                          <div className="text-right"><p className="text-sm font-bold text-gray-900 dark:text-gray-100">{fmt(p.net_pay)}</p></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedEmployee.docs && selectedEmployee.docs.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Documents ({selectedEmployee.docs.length})</h4>
                    <div className="space-y-2">
                      {selectedEmployee.docs.map(d => (
                        <div key={d.id} className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-700 p-3">
                          <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-gray-400" /><div><p className="text-sm text-gray-900 dark:text-gray-100">{d.title}</p><p className="text-[11px] text-gray-400">{fmtBytes(d.file_size)}</p></div></div>
                          <Badge color={documentTypeColors[d.document_type] || 'gray'}>{d.document_type}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal isOpen={showEmployeeModal} onClose={resetForm} title={t('addEmployee')} size="lg" footer={
        <><Button variant="secondary" onClick={resetForm}>{t('cancel')}</Button><Button loading={submitting} onClick={() => { const f = document.getElementById('employee-form'); if (!f) return; handleSubmit(createEmployee, Object.fromEntries(new FormData(f)), 'Employee created') }}>{t('addEmployee')}</Button></>
      }>
        <form id="employee-form" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="First Name" name="first_name" placeholder="First name" required />
            <Input label="Last Name" name="last_name" placeholder="Last name" required />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Email" name="email" type="email" placeholder="email@company.com" required />
            <Input label="Phone" name="phone" placeholder="+1-555-0000" />
          </div>
          <Input label="Employee Code" name="employee_code" placeholder="EMP-XXX" required />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label={t('department')} name="department_id" options={departments.map(d => ({ value: d.id, label: d.name }))} placeholder="Select department" required />
            <Select label={t('branch')} name="branch" options={BRANCH_OPTIONS} placeholder="Select branch" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label={t('designation')} name="position" placeholder="Job title" required />
            <Input label={t('employmentType')} name="employment_type" placeholder="full_time" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label={t('basicSalary')} name="salary" type="number" placeholder="0.00" required />
            <Input label={t('employmentDate')} name="hire_date" type="date" required />
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}
