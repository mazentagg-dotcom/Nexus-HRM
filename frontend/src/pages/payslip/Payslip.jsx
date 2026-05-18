import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Tabs from '../../components/ui/Tabs'
import AnimatedTable from '../../components/AnimatedTable'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/feedback/Toast'
import { getPayrollRecords, getEmployees } from '../../api/hr'
import { useI18n } from '../../i18n'
import { BRANCHES, DEDUCTION_TYPES } from '../../constants/hr'
import { DollarSign, FileText, Eye, Download, Check, Plus, Edit, Trash2 } from 'lucide-react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

const payStatusColors = { paid: 'emerald', pending: 'amber', processing: 'blue', draft: 'gray' }
const dedStatusColors = { active: 'emerald', pending: 'amber', cancelled: 'rose' }
const fmt = n => '$' + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function PayrollTab({ thisMonth }) {
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState([])
  const [viewModal, setViewModal] = useState(null)
  const { showToast } = useToast()

  useEffect(() => {
    setLoading(true)
    getPayrollRecords({ page: 1, pageSize: 100 })
      .then(r => {
        let data = r.data?.data?.items || r.data?.data || []
        if (thisMonth) {
          const now = new Date()
          const m = now.getMonth()
          const y = now.getFullYear()
          data = data.filter(d => {
            if (!d.pay_period_start) return false
            const pd = new Date(d.pay_period_start)
            return pd.getMonth() === m && pd.getFullYear() === y
          })
        }
        setRecords(data)
      })
      .catch(() => setRecords([]))
      .finally(() => setLoading(false))
  }, [thisMonth])

  const totalGross = records.reduce((s, r) => s + (r.gross_pay || 0), 0)
  const totalDed = records.reduce((s, r) => s + (r.total_deductions || 0), 0)
  const totalNet = records.reduce((s, r) => s + (r.net_pay || 0), 0)
  const paid = records.filter(r => r.status === 'paid').length

  const handleMarkPaid = (id) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'paid' } : r))
    showToast('Marked as paid', 'success')
  }

  const handleDownload = (record) => {
    showToast('Payslip downloaded', 'success')
  }

  return (
    <motion.div variants={fadeUp} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="card-base p-4"><p className="text-xs text-gray-500 dark:text-gray-400">Total Gross</p><p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">{loading ? '-' : fmt(totalGross)}</p></div>
        <div className="card-base p-4"><p className="text-xs text-gray-500 dark:text-gray-400">Total Deductions</p><p className="mt-1 text-lg font-bold text-rose-600">{loading ? '-' : fmt(totalDed)}</p></div>
        <div className="card-base p-4"><p className="text-xs text-gray-500 dark:text-gray-400">Total Net</p><p className="mt-1 text-lg font-bold text-emerald-600">{loading ? '-' : fmt(totalNet)}</p></div>
        <div className="card-base p-4"><p className="text-xs text-gray-500 dark:text-gray-400">Paid</p><p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">{loading ? '-' : `${paid}/${records.length}`}</p></div>
      </div>

      <div className="card-base overflow-hidden">
        <AnimatedTable columns={[
          { key: 'employee_name', label: t('employeeName'), render: v => <span className="font-medium text-gray-900 dark:text-gray-100">{v || '--'}</span> },
          { key: 'employee_id', label: t('employeeId'), render: (_, r) => <span className="text-gray-500 text-xs font-mono">{r.employee_id || '--'}</span> },
          { key: 'department', label: t('department'), render: v => <span className="text-gray-500 text-xs">{v || '--'}</span> },
          { key: 'pay_period_start', label: t('month'), render: v => <span className="text-gray-500 text-xs">{v || '--'}</span> },
          { key: 'gross_pay', label: t('grossSalary'), render: v => <span className="text-gray-700 dark:text-gray-300">{fmt(v)}</span> },
          { key: 'total_deductions', label: t('totalDeductions'), render: v => <span className="text-rose-500">{fmt(v)}</span> },
          { key: 'net_pay', label: t('netSalary'), render: v => <span className="font-bold text-gray-900 dark:text-gray-100">{fmt(v)}</span> },
          { key: 'status', label: t('paymentStatus'), render: (v, r) => (
            <div className="flex items-center gap-1">
              <Badge color={payStatusColors[v] || 'gray'}>{v}</Badge>
              {v !== 'paid' && (
                <button onClick={(e) => { e.stopPropagation(); handleMarkPaid(r.id) }} className="rounded p-0.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" title="Mark as Paid"><Check className="h-3.5 w-3.5" /></button>
              )}
            </div>
          )},
          { key: 'actions', label: t('actions'), render: (_, r) => (
            <div className="flex items-center gap-1">
              <button onClick={(e) => { e.stopPropagation(); setViewModal(r) }} className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300" title={t('view')}><Eye className="h-3.5 w-3.5" /></button>
              <button onClick={(e) => { e.stopPropagation(); handleDownload(r) }} className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300" title={t('downloadPayslip')}><Download className="h-3.5 w-3.5" /></button>
            </div>
          )},
        ]} data={records} pageSize={10} loading={loading} />
      </div>

      {viewModal && (
        <Modal isOpen={true} onClose={() => setViewModal(null)} title="Payslip Details" size="lg" footer={
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => { handleDownload(viewModal); setViewModal(null) }}>Download</Button>
            <Button onClick={() => setViewModal(null)}>Close</Button>
          </div>
        }>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="card-base p-3"><p className="text-[11px] text-gray-400">{t('employeeName')}</p><p className="text-sm font-medium text-gray-900 dark:text-gray-100">{viewModal.employee_name || '--'}</p></div>
              <div className="card-base p-3"><p className="text-[11px] text-gray-400">{t('employeeId')}</p><p className="text-sm font-mono text-gray-700 dark:text-gray-300">{viewModal.employee_id || '--'}</p></div>
              <div className="card-base p-3"><p className="text-[11px] text-gray-400">{t('department')}</p><p className="text-sm text-gray-700 dark:text-gray-300">{viewModal.department || '--'}</p></div>
              <div className="card-base p-3"><p className="text-[11px] text-gray-400">{t('month')}</p><p className="text-sm text-gray-700 dark:text-gray-300">{viewModal.pay_period_start || '--'}</p></div>
            </div>
            <div className="card-base p-4 space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Earnings</h4>
              <div className="flex justify-between text-sm"><span className="text-gray-500">{t('basicSalary')}</span><span className="text-gray-900 dark:text-gray-100">{fmt(viewModal.basic_salary)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">{t('allowances')}</span><span className="text-gray-900 dark:text-gray-100">{fmt(viewModal.housing_allowance + viewModal.transport_allowance + viewModal.medical_allowance + viewModal.food_allowance)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">{t('overtime')}</span><span className="text-gray-900 dark:text-gray-100">{fmt(viewModal.overtime_pay)}</span></div>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-2 flex justify-between font-semibold text-sm"><span className="text-gray-900 dark:text-gray-100">{t('grossSalary')}</span><span className="text-emerald-600">{fmt(viewModal.gross_pay)}</span></div>
            </div>
            <div className="card-base p-4 space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Deductions</h4>
              <div className="flex justify-between text-sm"><span className="text-gray-500">{t('socialInsurance')}</span><span className="text-rose-500">{fmt(viewModal.social_security)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">{t('taxDeduction')}</span><span className="text-rose-500">{fmt(viewModal.tax_deduction)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">{t('loanDeduction')}</span><span className="text-rose-500">{fmt(viewModal.loan_deduction)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">{t('medicalInsurance')}</span><span className="text-rose-500">{fmt(viewModal.health_insurance)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">{t('otherDeductions')}</span><span className="text-rose-500">{fmt(viewModal.other_deductions)}</span></div>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-2 flex justify-between font-semibold text-sm"><span className="text-gray-900 dark:text-gray-100">{t('totalDeductions')}</span><span className="text-rose-600">{fmt(viewModal.total_deductions)}</span></div>
            </div>
            <div className="card-base p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{t('netSalary')}</span>
                <span className="text-2xl font-bold text-indigo-600">{fmt(viewModal.net_pay)}</span>
              </div>
              <div className="mt-1 flex justify-end"><Badge color={payStatusColors[viewModal.status]}>{viewModal.status}</Badge></div>
            </div>
          </div>
        </Modal>
      )}
    </motion.div>
  )
}

let deductionId = 100
function DeductionsTab({ thisMonth }) {
  const { t } = useI18n()
  const [deductions, setDeductions] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ employee_id: '', employee_name: '', branch: '', department: '', deduction_type: 'social_insurance', amount: '', month: new Date().toISOString().slice(0, 7), reason: '', status: 'pending' })
  const { showToast } = useToast()

  const handleSave = () => {
    if (!form.deduction_type || !form.amount) { showToast('Fill required fields', 'error'); return }
    if (editItem) {
      setDeductions(prev => prev.map(d => d.id === editItem.id ? { ...d, ...form, amount: Number(form.amount) } : d))
      showToast('Deduction updated', 'success')
    } else {
      const newDed = { id: String(++deductionId), ...form, amount: Number(form.amount), submitted_date: new Date().toISOString().slice(0, 10) }
      setDeductions(prev => [newDed, ...prev])
      showToast('Deduction added', 'success')
    }
    setShowModal(false)
    setEditItem(null)
    setForm({ employee_id: '', employee_name: '', branch: '', department: '', deduction_type: 'social_insurance', amount: '', month: new Date().toISOString().slice(0, 7), reason: '', status: 'pending' })
  }

  const handleDelete = (id) => {
    setDeductions(prev => prev.filter(d => d.id !== id))
    showToast('Deduction deleted', 'success')
  }

  const openEdit = (d) => {
    setEditItem(d)
    setForm({ employee_id: d.employee_id || '', employee_name: d.employee_name || '', branch: d.branch || '', department: d.department || '', deduction_type: d.deduction_type, amount: String(d.amount || ''), month: d.month || '', reason: d.reason || '', status: d.status || 'pending' })
    setShowModal(true)
  }

  const filtered = thisMonth
    ? deductions.filter(d => {
        if (!d.month) return false
        const m = d.month.slice(0, 7)
        return m === new Date().toISOString().slice(0, 7)
      })
    : deductions

  return (
    <motion.div variants={fadeUp} className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" icon={Plus} onClick={() => { setEditItem(null); setForm({ employee_id: '', employee_name: '', branch: '', department: '', deduction_type: 'social_insurance', amount: '', month: new Date().toISOString().slice(0, 7), reason: '', status: 'pending' }); setShowModal(true) }}>Add Deduction</Button>
      </div>
      <div className="card-base overflow-hidden">
        <AnimatedTable columns={[
          { key: 'employee_name', label: t('employeeName'), render: v => <span className="font-medium text-gray-900 dark:text-gray-100">{v || '--'}</span> },
          { key: 'branch', label: t('branch'), render: v => <span className="text-gray-500 text-xs">{v || '--'}</span> },
          { key: 'deduction_type', label: t('deductionType'), render: v => <Badge color="purple">{v}</Badge> },
          { key: 'amount', label: t('amount'), render: v => <span className="font-medium text-rose-600">{fmt(v)}</span> },
          { key: 'month', label: t('month'), render: v => <span className="text-gray-500 text-xs">{v || '--'}</span> },
          { key: 'reason', label: t('reason'), render: v => <span className="text-gray-500 text-xs truncate max-w-[150px] block">{v || '--'}</span> },
          { key: 'status', label: t('status'), render: v => <Badge color={dedStatusColors[v] || 'gray'}>{v}</Badge> },
          { key: 'actions', label: t('actions'), render: (_, r) => (
            <div className="flex items-center gap-1">
              <button onClick={(e) => { e.stopPropagation(); openEdit(r) }} className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300"><Edit className="h-3.5 w-3.5" /></button>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(r.id) }} className="rounded p-1 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          )},
        ]} data={filtered} pageSize={10} />
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null) }} title={editItem ? 'Edit Deduction' : 'Add Deduction'} size="md" footer={
        <><Button variant="secondary" onClick={() => { setShowModal(false); setEditItem(null) }}>Cancel</Button><Button onClick={handleSave}>{editItem ? 'Save' : 'Add'}</Button></>
      }>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Employee Name</label><input className="input-base" placeholder="Employee name" value={form.employee_name} onChange={e => setForm(p => ({ ...p, employee_name: e.target.value }))} /></div>
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('branch')}</label><select className="input-base" value={form.branch} onChange={e => setForm(p => ({ ...p, branch: e.target.value }))}><option value="">Select branch</option>{BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('deductionType')}</label><select className="input-base" value={form.deduction_type} onChange={e => setForm(p => ({ ...p, deduction_type: e.target.value }))}>{DEDUCTION_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}</select></div>
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('amount')}</label><input type="number" className="input-base" placeholder="0.00" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} /></div>
          </div>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('month')}</label><input type="month" className="input-base" value={form.month} onChange={e => setForm(p => ({ ...p, month: e.target.value }))} /></div>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('reason')}</label><textarea className="input-base" rows={2} placeholder="Reason..." value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} /></div>
        </div>
      </Modal>
    </motion.div>
  )
}

export default function Payslip() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState('payroll')
  const [thisMonth, setThisMonth] = useState(false)

  const tabs = [
    { id: 'payroll', label: t('payroll'), icon: DollarSign },
    { id: 'deductions', label: t('deductions'), icon: FileText },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('payslip')}</h1><p className="mt-1 text-sm text-gray-500">Generate, manage, and track employee payslips and deductions.</p></div>
        <Button size="sm" variant={thisMonth ? 'primary' : 'secondary'} onClick={() => setThisMonth(p => !p)}>{t('thisMonth')}</Button>
      </motion.div>

      <motion.div variants={fadeUp}>
        <div className="card-base">
          <div className="px-4 pt-2">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          </div>
          <div className="p-4">
            {activeTab === 'payroll' && <PayrollTab thisMonth={thisMonth} />}
            {activeTab === 'deductions' && <DeductionsTab thisMonth={thisMonth} />}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
