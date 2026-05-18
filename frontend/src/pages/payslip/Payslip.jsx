import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Tabs from '../../components/ui/Tabs'
import AnimatedTable from '../../components/AnimatedTable'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/feedback/Toast'
import { getPayrollRecords, getEmployees, getDeductions, createDeduction, updateDeduction, deleteDeduction, updatePayrollRecord } from '../../api/hr'
import { useSystemConfig, calcFullPayslip, generateMockEmployeeFlags, buildAutoDeductions } from '../../store/systemConfig'
import { useI18n } from '../../i18n'
import { DEDUCTION_TYPES } from '../../constants/hr'
import { DollarSign, FileText, Eye, Download, Check, Plus, Edit, Trash2, Lock, Info } from 'lucide-react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

const payStatusColors = { paid: 'emerald', pending: 'amber', processing: 'blue', draft: 'gray' }
const dedStatusColors = { active: 'emerald', pending: 'amber', cancelled: 'rose' }
const sourceColors = { 'Company-Level Auto': 'indigo', 'Employee Rule Auto': 'purple', 'Attendance Rule Auto': 'amber', 'Manual': 'gray' }
const fmt = n => '$' + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function PayrollTab({ thisMonth }) {
  const { t } = useI18n()
  const { config, activeEmployeeCount } = useSystemConfig()
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

  const handleMarkPaid = async (id) => {
    try {
      await updatePayrollRecord(id, { status: 'paid' })
      setRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'paid' } : r))
      showToast(t('markedAsPaid'), 'success')
    } catch { showToast(t('failedToUpdate'), 'error') }
  }

  const handleDownload = (record) => {
    const name = record.employee_name || '--'
    const flags = generateMockEmployeeFlags(name)
    const empData = { ...flags, baseSalary: record.basic_salary || 0 }
    const calc = calcFullPayslip(config, empData, activeEmployeeCount)

    const lines = [
      'NEXUS HRM - PAYSLIP',
      '=====================',
      `Employee: ${name}`,
      `Period: ${record.pay_period_start || '--'} to ${record.pay_period_end || '--'}`,
      '',
      'A) EARNINGS',
      `  Basic Salary: ${fmt(calc.earnings.basicSalary)}`,
      `  Allowances: ${fmt(calc.earnings.allowances)}`,
      `  Overtime: ${fmt(calc.earnings.overtime)}`,
      `  Gross Salary: ${fmt(calc.earnings.grossSalary)}`,
      '',
      'B) COMPANY-LEVEL AUTO DEDUCTIONS',
      `  Tax Deduction: ${fmt(calc.companyLevel.taxDeduction)} (Company-Level Auto)`,
      `  Company Insurance: ${fmt(calc.companyLevel.companyInsurance)} (Company-Level Auto)`,
      '',
      'C) EMPLOYEE RULE AUTO DEDUCTIONS',
      `  Medical Insurance: ${fmt(calc.employeeRule.medicalInsurance)} (Employee Rule Auto)`,
      `  Loan Deduction: ${fmt(calc.employeeRule.loanDeduction)} (Employee Rule Auto)`,
      '',
      'D) ATTENDANCE RULE AUTO DEDUCTIONS',
      `  Absence Deduction: ${fmt(calc.attendanceRule.absenceDeduction)} (Attendance Rule Auto)`,
      `  Late Attendance Deduction: ${fmt(calc.attendanceRule.lateDeduction)} (Attendance Rule Auto)`,
      '',
      'E) TOTALS',
      `  Total Deductions: ${fmt(calc.totals.totalDeductions)}`,
      `  Net Salary: ${fmt(calc.totals.netSalary)}`,
      '',
      `Status: ${record.status}`,
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payslip_${name}_${record.pay_period_start || 'unknown'}.txt`
    a.click()
    URL.revokeObjectURL(url)
    showToast(t('payslipDownloaded'), 'success')
  }

  return (
    <motion.div variants={fadeUp} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="card-base p-4"><p className="text-xs text-gray-500 dark:text-gray-400">{t('totalGross')}</p><p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">{loading ? '-' : fmt(totalGross)}</p></div>
        <div className="card-base p-4"><p className="text-xs text-gray-500 dark:text-gray-400">{t('totalDeductions')}</p><p className="mt-1 text-lg font-bold text-rose-600">{loading ? '-' : fmt(totalDed)}</p></div>
        <div className="card-base p-4"><p className="text-xs text-gray-500 dark:text-gray-400">{t('totalNet')}</p><p className="mt-1 text-lg font-bold text-emerald-600">{loading ? '-' : fmt(totalNet)}</p></div>
        <div className="card-base p-4"><p className="text-xs text-gray-500 dark:text-gray-400">{t('paid')}</p><p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">{loading ? '-' : `${paid}/${records.length}`}</p></div>
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
                <button onClick={(e) => { e.stopPropagation(); handleMarkPaid(r.id) }} className="rounded p-0.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" title={t('markAsPaid')}><Check className="h-3.5 w-3.5" /></button>
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

      {viewModal && (() => {
        const name = viewModal.employee_name || '--'
        const flags = generateMockEmployeeFlags(name)
        const empData = { ...flags, baseSalary: viewModal.basic_salary || 0 }
        const calc = calcFullPayslip(config, empData, activeEmployeeCount)

        return (
          <Modal isOpen={true} onClose={() => setViewModal(null)} title={t('payslipDetails')} size="lg" footer={
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => { handleDownload(viewModal); setViewModal(null) }}>{t('download')}</Button>
              <Button onClick={() => setViewModal(null)}>{t('close')}</Button>
            </div>
          }>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="card-base p-3"><p className="text-[11px] text-gray-400">{t('employeeName')}</p><p className="text-sm font-medium text-gray-900 dark:text-gray-100">{name}</p></div>
                <div className="card-base p-3"><p className="text-[11px] text-gray-400">{t('employeeId')}</p><p className="text-sm font-mono text-gray-700 dark:text-gray-300">{viewModal.employee_id || '--'}</p></div>
                <div className="card-base p-3"><p className="text-[11px] text-gray-400">{t('department')}</p><p className="text-sm text-gray-700 dark:text-gray-300">{viewModal.department || '--'}</p></div>
                <div className="card-base p-3"><p className="text-[11px] text-gray-400">{t('month')}</p><p className="text-sm text-gray-700 dark:text-gray-300">{viewModal.pay_period_start || '--'}</p></div>
              </div>

              <div className="card-base p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">A) {t('earnings')}</h4>
                <div className="flex justify-between text-sm"><span className="text-gray-500">{t('basicSalary')}</span><span className="text-gray-900 dark:text-gray-100">{fmt(calc.earnings.basicSalary)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">{t('allowances')}</span><span className="text-gray-900 dark:text-gray-100">{fmt(calc.earnings.allowances)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">{t('overtime')}</span><span className="text-gray-900 dark:text-gray-100">{fmt(calc.earnings.overtime)}</span></div>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-2 flex justify-between font-semibold text-sm"><span className="text-gray-900 dark:text-gray-100">{t('grossSalary')}</span><span className="text-emerald-600">{fmt(calc.earnings.grossSalary)}</span></div>
              </div>

              <div className="card-base p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">B) Company-Level Auto Deductions</h4>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Tax Deduction</span><div className="text-right"><span className="text-rose-500">{fmt(calc.companyLevel.taxDeduction)}</span><span className="ml-2 text-[10px] text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded">Auto</span></div></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Company Insurance</span><div className="text-right"><span className="text-rose-500">{fmt(calc.companyLevel.companyInsurance)}</span><span className="ml-2 text-[10px] text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded">Auto</span></div></div>
              </div>

              <div className="card-base p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">C) Employee Rule Auto Deductions</h4>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Medical Insurance</span><div className="text-right"><span className="text-rose-500">{fmt(calc.employeeRule.medicalInsurance)}</span><span className="ml-2 text-[10px] text-purple-500 bg-purple-50 dark:bg-purple-500/10 px-1.5 py-0.5 rounded">Auto</span></div></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Loan Deduction</span><div className="text-right"><span className="text-rose-500">{fmt(calc.employeeRule.loanDeduction)}</span><span className="ml-2 text-[10px] text-purple-500 bg-purple-50 dark:bg-purple-500/10 px-1.5 py-0.5 rounded">Auto</span></div></div>
              </div>

              <div className="card-base p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">D) Attendance Rule Auto Deductions</h4>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Absence Deduction</span><div className="text-right"><span className="text-rose-500">{fmt(calc.attendanceRule.absenceDeduction)}</span><span className="ml-2 text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded">Auto</span></div></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Late Attendance</span><div className="text-right"><span className="text-rose-500">{fmt(calc.attendanceRule.lateDeduction)}</span><span className="ml-2 text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded">Auto</span></div></div>
              </div>

              <div className="card-base p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">E) Totals</h4>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-2 flex justify-between font-semibold text-sm"><span className="text-gray-900 dark:text-gray-100">{t('totalDeductions')}</span><span className="text-rose-600">{fmt(calc.totals.totalDeductions)}</span></div>
              </div>

              <div className="card-base p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{t('netSalary')}</span>
                  <span className="text-2xl font-bold text-indigo-600">{fmt(calc.totals.netSalary)}</span>
                </div>
                <div className="mt-1 flex justify-end"><Badge color={payStatusColors[viewModal.status]}>{viewModal.status}</Badge></div>
              </div>
            </div>
          </Modal>
        )
      })()}
    </motion.div>
  )
}

function DeductionsTab({ thisMonth }) {
  const { t } = useI18n()
  const { config, activeEmployeeCount } = useSystemConfig()
  const [loading, setLoading] = useState(true)
  const [deductions, setDeductions] = useState([])
  const [employees, setEmployees] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ employee_id: '', deduction_type: 'other', amount: '', month: new Date().toISOString().slice(0, 7), reason: '', status: 'active' })
  const { showToast } = useToast()

  const month = new Date().toISOString().slice(0, 7)

  useEffect(() => {
    setLoading(true)
    const params = { page: 1, pageSize: 100 }
    if (thisMonth) params.month = month

    Promise.all([
      getDeductions(params).then(r => r.data?.data?.items || r.data?.data || []).catch(() => []),
      getEmployees({ page: 1, pageSize: 100, status: 'active' }).then(r => r.data?.data?.items || r.data?.data || []).catch(() => []),
    ]).then(([apiDeds, emps]) => {
      setEmployees(emps)
      const autoDeds = []
      for (const emp of emps) {
        const flags = generateMockEmployeeFlags(emp.first_name + ' ' + emp.last_name)
        const enriched = { ...flags, baseSalary: emp.base_salary || 0, employee_name: emp.first_name + ' ' + emp.last_name, employee_id: emp.employee_code || emp.id, employee_code: emp.employee_code, department: emp.department }
        const auto = buildAutoDeductions(config, enriched, month, activeEmployeeCount)
        autoDeds.push(...auto)
      }
      const manualDeds = apiDeds.map(d => ({ ...d, source: 'Manual', isAuto: false }))
      setDeductions([...autoDeds, ...manualDeds])
    }).finally(() => setLoading(false))
  }, [thisMonth])

  const handleSave = async () => {
    if (!form.employee_id || !form.deduction_type || !form.amount) { showToast(t('fillRequiredFields'), 'error'); return }
    try {
      if (editItem) {
        await updateDeduction(editItem.id, { ...form, amount: Number(form.amount) })
        showToast(t('deductionUpdated'), 'success')
      } else {
        await createDeduction({ ...form, amount: Number(form.amount) })
        showToast(t('deductionAdded'), 'success')
      }
      setShowModal(false)
      setEditItem(null)
      setForm({ employee_id: '', deduction_type: 'other', amount: '', month: new Date().toISOString().slice(0, 7), reason: '', status: 'active' })
    } catch { showToast(t('operationFailed'), 'error') }
  }

  const handleDelete = async (item) => {
    if (item.isAuto) {
      showToast('Auto-generated deductions cannot be deleted', 'error')
      return
    }
    try {
      await deleteDeduction(item.id)
      showToast(t('deductionDeleted'), 'success')
      setDeductions(prev => prev.filter(d => d.id !== item.id))
    } catch { showToast(t('deleteFailed'), 'error') }
  }

  const openEdit = (d) => {
    if (d.isAuto) {
      showToast('Auto-generated deductions cannot be edited', 'error')
      return
    }
    setEditItem(d)
    setForm({ employee_id: d.employee_id || '', deduction_type: d.deduction_type, amount: String(d.amount || ''), month: d.month || '', reason: d.reason || '', status: d.status || 'active' })
    setShowModal(true)
  }

  const totalAuto = deductions.filter(d => d.isAuto).reduce((s, d) => s + (d.amount || 0), 0)
  const totalManual = deductions.filter(d => !d.isAuto).reduce((s, d) => s + (d.amount || 0), 0)

  return (
    <motion.div variants={fadeUp} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card-base p-4"><p className="text-xs text-gray-500 dark:text-gray-400">Auto Deductions</p><p className="mt-1 text-lg font-bold text-rose-600">{fmt(totalAuto)}</p><p className="text-[11px] text-gray-400">{deductions.filter(d => d.isAuto).length} records</p></div>
        <div className="card-base p-4"><p className="text-xs text-gray-500 dark:text-gray-400">Manual Adjustments</p><p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">{fmt(totalManual)}</p><p className="text-[11px] text-gray-400">{deductions.filter(d => !d.isAuto).length} records</p></div>
        <div className="card-base p-4"><p className="text-xs text-gray-500 dark:text-gray-400">Total Deductions</p><p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">{fmt(totalAuto + totalManual)}</p><p className="text-[11px] text-gray-400">{deductions.length} records</p></div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Lock className="h-3.5 w-3.5" />
          <span>Auto-generated deductions are protected and cannot be edited or deleted</span>
        </div>
        <Button size="sm" icon={Plus} onClick={() => { setEditItem(null); setForm({ employee_id: '', deduction_type: 'other', amount: '', month: new Date().toISOString().slice(0, 7), reason: '', status: 'active' }); setShowModal(true) }}>Manual Adjustment</Button>
      </div>

      <div className="card-base overflow-hidden">
        <AnimatedTable columns={[
          { key: 'employee_name', label: t('employeeName'), render: v => <span className="font-medium text-gray-900 dark:text-gray-100">{v || '--'}</span> },
          { key: 'employee_id', label: t('employeeId'), render: v => <span className="text-gray-500 text-xs font-mono">{v || '--'}</span> },
          { key: 'deduction_type', label: t('deductionType'), render: (v, r) => <div className="flex items-center gap-1"><Badge color={dedStatusColors[r.status] || 'gray'}>{v?.replace(/_/g, ' ')}</Badge></div> },
          { key: 'amount', label: t('amount'), render: v => <span className="font-medium text-rose-600">{fmt(v)}</span> },
          { key: 'month', label: t('month'), render: v => <span className="text-gray-500 text-xs">{v || '--'}</span> },
          { key: 'source', label: 'Source', render: v => <Badge color={sourceColors[v] || 'gray'}>{v || 'Manual'}</Badge> },
          { key: 'reason', label: t('reason'), render: v => <span className="text-gray-500 text-xs truncate max-w-[120px] block">{v || '--'}</span> },
          { key: 'status', label: t('status'), render: v => <Badge color={dedStatusColors[v] || 'gray'}>{v}</Badge> },
          { key: 'actions', label: t('actions'), render: (_, r) => (
            <div className="flex items-center gap-1">
              {r.isAuto ? (
                <Lock className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" title="Auto-generated: protected" />
              ) : (
                <>
                  <button onClick={(e) => { e.stopPropagation(); openEdit(r) }} className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300"><Edit className="h-3.5 w-3.5" /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(r) }} className="rounded p-1 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"><Trash2 className="h-3.5 w-3.5" /></button>
                </>
              )}
            </div>
          )},
        ]} data={deductions} pageSize={10} loading={loading} />
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null) }} title={editItem ? 'Edit Manual Adjustment' : 'Add Manual Adjustment'} size="md" footer={
        <><Button variant="secondary" onClick={() => { setShowModal(false); setEditItem(null) }}>{t('cancel')}</Button><Button onClick={handleSave}>{editItem ? t('save') : t('add')}</Button></>
      }>
        <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3 mb-4">
          <p className="text-xs text-amber-700 dark:text-amber-400">Manual adjustments are for exceptional one-time corrections. Regular deductions (Tax, Insurance, Medical, Loan, Attendance) are calculated automatically from System Configuration.</p>
        </div>
        <div className="space-y-4">
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('employeeName')}</label><select className="input-base" value={form.employee_id} onChange={e => setForm(p => ({ ...p, employee_id: e.target.value }))}><option value="">{t('selectEmployee')}</option>{employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('amount')}</label><input type="number" className="input-base" placeholder="0.00" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} /></div>
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('month')}</label><input type="month" className="input-base" value={form.month} onChange={e => setForm(p => ({ ...p, month: e.target.value }))} /></div>
          </div>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('reason')}</label><textarea className="input-base" rows={2} placeholder="Reason for manual adjustment..." value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} /></div>
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
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('payslip')}</h1><p className="mt-1 text-sm text-gray-500">{t('managePayslipsDesc')}</p></div>
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
