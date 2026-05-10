import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import StatsCard from '../../components/StatsCard'
import AnimatedTable from '../../components/AnimatedTable'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import { useToast } from '../../components/feedback/Toast'
import { getEmployees, createEmployee } from '../../api/hr'
import {
  employees as mockEmployees, attendanceRecords as mockAttendance,
  leaveRequests as mockLeaves, payrollRecords as mockPayroll, employeeDocuments as mockDocuments,
  departments, employeeStatusColors, leaveStatusColors, attendanceStatusColors,
  documentTypeColors, payrollStatusColors,
} from '../../data/hr'
import {
  Users, Search, Plus, X, Check, FileText, Clock, Mail, Phone, MapPin, Calendar,
  Briefcase, CheckCircle, XCircle,
} from 'lucide-react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }
const fadeScale = { hidden: { opacity: 0, scale: 0.96 }, show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

const fmt = n => '$' + Number(n).toLocaleString()
const fmtBytes = b => b >= 1000000 ? (b / 1000000).toFixed(1) + ' MB' : (b / 1000).toFixed(0) + ' KB'

export default function Employees() {
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { showToast } = useToast()

  const [employeesData, setEmployeesData] = useState(null)

  useEffect(() => {
    getEmployees({ page: 1, pageSize: 100 })
      .then(r => { const d = r.data?.data; setEmployeesData(d?.items || d || null) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const employees = employeesData || mockEmployees || []
  const leaves = mockLeaves || []

  const filteredEmployees = employees.filter(e => {
    const name = `${e.first_name || ''} ${e.last_name || ''}`.toLowerCase()
    const ms = !search || name.includes(search.toLowerCase()) || (e.employee_code || '').toLowerCase().includes(search.toLowerCase()) || (e.department || '').toLowerCase().includes(search.toLowerCase()) || (e.email || '').toLowerCase().includes(search.toLowerCase())
    const mf = !statusFilter || (e.status || 'active') === statusFilter
    return ms && mf
  })

  const resetForm = useCallback(() => { setShowEmployeeModal(false); setSubmitting(false) }, [])
  const handleSubmit = useCallback(async (fn, data, msg) => { setSubmitting(true); try { await fn(data); showToast(msg, 'success'); resetForm() } catch (e) { showToast(e.response?.data?.message || 'Error', 'error') } finally { setSubmitting(false) } }, [showToast, resetForm])

  const formatDate = d => { if (!d) return ''; try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return d } }

  const openEmployeeDrawer = (emp) => {
    const full = { ...emp, attendance: (mockAttendance || []).filter(a => a.employee_id === emp.id), leaves: leaves.filter(l => l.employee_id === emp.id), payroll: (mockPayroll || []).filter(p => p.employee_id === emp.id), docs: (mockDocuments || []).filter(d => d.employee_id === emp.id) }
    setSelectedEmployee(full)
    setDrawerOpen(true)
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Employees</h1><p className="mt-1 text-sm text-gray-500">Manage your organization's workforce.</p></div>
        <Button size="sm" icon={Plus} onClick={() => setShowEmployeeModal(true)}>Add Employee</Button>
      </motion.div>

      <motion.div variants={fadeUp} className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees..." className="h-9 w-56 pl-9 pr-3 rounded-lg border border-gray-200 bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-0.5">
            {['', 'active', 'on_leave', 'probation'].map(s => (
              <button key={s || 'all'} onClick={() => setStatusFilter(s)} className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors capitalize ${statusFilter === s ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}>{s || 'All'}</button>
            ))}
          </div>
        </div>
        <AnimatedTable columns={[
          { key: 'employee_code', label: 'ID', render: v => <span className="font-mono text-xs text-gray-500">{v}</span> },
          { key: 'first_name', label: 'Name', render: (_, r) => (
            <button onClick={() => openEmployeeDrawer(r)} className="flex items-center gap-3 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">{(r.first_name || '')[0]}{(r.last_name || '')[0]}</div>
              <div className="text-left"><span className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">{r.first_name} {r.last_name}</span><p className="text-[11px] text-gray-400">{r.email}</p></div>
            </button>
          )},
          { key: 'department', label: 'Department' },
          { key: 'position', label: 'Role', render: v => <span className="text-gray-500 text-xs">{v}</span> },
          { key: 'status', label: 'Status', render: v => <Badge color={employeeStatusColors[v] || 'gray'}>{v}</Badge> },
          { key: 'hire_date', label: 'Hire Date', render: v => <span className="text-gray-400 text-xs">{formatDate(v)}</span> },
        ]} data={filteredEmployees} pageSize={10} />
      </motion.div>

      <AnimatePresence>
        {drawerOpen && selectedEmployee && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex justify-end" onClick={() => setDrawerOpen(false)}>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="relative w-full max-w-lg bg-white shadow-2xl h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">{(selectedEmployee.first_name || '')[0]}{(selectedEmployee.last_name || '')[0]}</div>
                    <div><h2 className="text-lg font-semibold text-gray-900">{selectedEmployee.first_name} {selectedEmployee.last_name}</h2><p className="text-sm text-gray-500">{selectedEmployee.position}</p></div>
                  </div>
                  <button onClick={() => setDrawerOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><X className="h-5 w-5" /></button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge color={employeeStatusColors[selectedEmployee.status] || 'gray'}>{selectedEmployee.status}</Badge>
                  <Badge color="indigo">{selectedEmployee.employment_type}</Badge>
                  <span className="text-xs text-gray-400">{selectedEmployee.employee_code}</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Personal Info</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-gray-100 p-3"><p className="text-[11px] text-gray-400">Email</p><p className="text-sm text-gray-700 truncate">{selectedEmployee.email}</p></div>
                    <div className="rounded-lg border border-gray-100 p-3"><p className="text-[11px] text-gray-400">Phone</p><p className="text-sm text-gray-700">{selectedEmployee.phone}</p></div>
                    <div className="rounded-lg border border-gray-100 p-3"><p className="text-[11px] text-gray-400">Department</p><p className="text-sm text-gray-700">{selectedEmployee.department}</p></div>
                    <div className="rounded-lg border border-gray-100 p-3"><p className="text-[11px] text-gray-400">Hire Date</p><p className="text-sm text-gray-700">{formatDate(selectedEmployee.hire_date)}</p></div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Salary</h4>
                  <div className="rounded-lg border border-gray-100 p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <p className="text-2xl font-bold text-gray-900">{fmt(selectedEmployee.salary)}</p>
                    <p className="text-xs text-gray-500 mt-1">Annual salary &middot; {fmt(Math.round(selectedEmployee.salary / 12))}/month</p>
                  </div>
                </div>
                {selectedEmployee.attendance && selectedEmployee.attendance.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Attendance ({selectedEmployee.attendance.length})</h4>
                    <div className="space-y-2">
                      {selectedEmployee.attendance.slice(0, 5).map(a => (
                        <div key={a.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                          <div className="flex items-center gap-2"><span className="text-sm text-gray-900">{a.date}</span></div>
                          <div className="flex items-center gap-2"><span className="text-xs text-gray-500">{a.check_in || '--'} - {a.check_out || '--'}</span><Badge color={attendanceStatusColors[a.status] || 'gray'}>{a.status}</Badge></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedEmployee.leaves && selectedEmployee.leaves.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Leave History ({selectedEmployee.leaves.length})</h4>
                    <div className="space-y-2">
                      {selectedEmployee.leaves.map(l => (
                        <div key={l.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                          <div>
                            <p className="text-sm text-gray-900">{l.type} - {l.total_days} day{l.total_days > 1 ? 's' : ''}</p>
                            <p className="text-[11px] text-gray-400">{formatDate(l.start_date)} - {formatDate(l.end_date)}</p>
                          </div>
                          <Badge color={leaveStatusColors[l.status] || 'gray'}>{l.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedEmployee.docs && selectedEmployee.docs.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Documents ({selectedEmployee.docs.length})</h4>
                    <div className="space-y-2">
                      {selectedEmployee.docs.map(d => (
                        <div key={d.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                          <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-gray-400" /><div><p className="text-sm text-gray-900">{d.document_name}</p><p className="text-[11px] text-gray-400">{fmtBytes(d.file_size)}</p></div></div>
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

      <Modal isOpen={showEmployeeModal} onClose={resetForm} title="Add Employee" size="lg" footer={
        <><Button variant="secondary" onClick={resetForm}>Cancel</Button><Button loading={submitting} onClick={() => { const f = document.getElementById('employee-form'); if (!f) return; handleSubmit(createEmployee, Object.fromEntries(new FormData(f)), 'Employee created') }}>Add Employee</Button></>
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
            <Select label="Department" name="department_id" options={(departments || []).map(d => ({ value: d.id, label: d.name }))} placeholder="Select department" required />
            <Input label="Position" name="position" placeholder="Job title" required />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Salary" name="salary" type="number" placeholder="0.00" required />
            <Input label="Hire Date" name="hire_date" type="date" required />
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}
