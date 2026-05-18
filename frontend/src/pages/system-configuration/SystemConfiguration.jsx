import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Tabs from '../../components/ui/Tabs'
import Button from '../../components/Button'
import { useToast } from '../../components/feedback/Toast'
import { useSystemConfig, calcTaxPerEmployee, calcInsurancePerEmployee } from '../../store/systemConfig'
import { useI18n } from '../../i18n'
import { useAuth } from '../../hooks/useAuth'
import {
  GitBranch, Clock, DollarSign, Building2, Heart, Banknote, Shield, Lock,
  Plus, Trash2, Edit3, Check, X, Info, Calculator, Save, RotateCcw,
} from 'lucide-react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

const fmt = n => Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function Toggle({ checked, onChange, disabled }) {
  return (
    <button type="button" role="switch" aria-checked={checked} disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${checked ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

function NumInput({ value, onChange, disabled, suffix, min }) {
  return (
    <div className="flex items-center gap-1.5">
      <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} disabled={disabled} min={min ?? 0}
        className="w-24 text-right text-sm font-medium border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
      {suffix && <span className="text-xs text-gray-400 whitespace-nowrap">{suffix}</span>}
    </div>
  )
}

function Sel({ value, onChange, options, disabled }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
      className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-indigo-500">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

function Row({ label, helper, children }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-700 p-3 gap-4">
      <div className="min-w-0 flex-1">
        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
        {helper && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{helper}</p>}
      </div>
      {children}
    </div>
  )
}

function SaveBar({ onSave }) {
  return (
    <div className="flex justify-end pt-4">
      <Button size="sm" onClick={onSave}><Save className="h-4 w-4 mr-1.5" />Save</Button>
    </div>
  )
}

function BranchesTab() {
  const { config, updateConfig } = useSystemConfig()
  const { showToast } = useToast()
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  const save = () => showToast('Branches saved', 'success')

  const addBranch = () => {
    if (!newName.trim()) return
    const id = Math.max(0, ...config.branches.map(b => b.id)) + 1
    updateConfig('branches', { branches: [...config.branches, { id, name: newName.trim(), active: true }] })
    setNewName('')
    showToast('Branch added', 'success')
  }

  const removeBranch = (id) => {
    updateConfig('branches', { branches: config.branches.filter(b => b.id !== id) })
    showToast('Branch removed', 'success')
  }

  const saveEdit = (id) => {
    updateConfig('branches', { branches: config.branches.map(b => b.id === id ? { ...b, name: editName } : b) })
    setEditingId(null)
    showToast('Branch updated', 'success')
  }

  const toggleActive = (id) => {
    updateConfig('branches', { branches: config.branches.map(b => b.id === id ? { ...b, active: !b.active } : b) })
  }

  return (
    <div className="space-y-4">
      <div className="card-base p-4">
        <div className="flex items-center gap-2 mb-4">
          <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Branch name..."
            className="input-base flex-1" onKeyDown={e => e.key === 'Enter' && addBranch()} />
          <Button size="sm" icon={Plus} onClick={addBranch}>Add</Button>
        </div>
        <div className="space-y-2">
          {config.branches.map(b => (
            <div key={b.id} className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-700 p-3">
              {editingId === b.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="input-base flex-1"
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(b.id); if (e.key === 'Escape') setEditingId(null) }} autoFocus />
                  <button onClick={() => saveEdit(b.id)} className="text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded p-1"><Check className="h-4 w-4" /></button>
                  <button onClick={() => setEditingId(null)} className="text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1"><X className="h-4 w-4" /></button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <Toggle checked={b.active} onChange={() => toggleActive(b.id)} />
                    <span className={`text-sm ${b.active ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 line-through'}`}>{b.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditingId(b.id); setEditName(b.name) }} className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"><Edit3 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => removeBranch(b.id)} className="rounded p-1 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </>
              )}
            </div>
          ))}
          {config.branches.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No branches configured</p>}
        </div>
        <SaveBar onSave={save} />
      </div>
    </div>
  )
}

function AttendancePolicyTab() {
  const { config, updateConfig } = useSystemConfig()
  const { showToast } = useToast()
  const p = config.attendancePolicy

  const save = () => { showToast('Attendance policy saved', 'success') }

  const upd = (data) => updateConfig('attendancePolicy', data)

  return (
    <div className="space-y-4">
      <div className="card-base p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Basic Settings</h3>
        <Row label="Working Hours Per Day"><NumInput value={p.workingHoursPerDay} onChange={v => upd({ workingHoursPerDay: v })} suffix="hours" /></Row>
        <Row label="Working Days Per Month" helper="Used for salary fraction calculations"><NumInput value={p.workingDaysPerMonth} onChange={v => upd({ workingDaysPerMonth: v })} suffix="days" /></Row>
        <Row label="Grace Period" helper="Minutes after start time before marked late"><NumInput value={p.gracePeriodMinutes} onChange={v => upd({ gracePeriodMinutes: v })} suffix="min" /></Row>
        <Row label="Standard Start Time">
          <input type="time" value={p.standardStartTime} onChange={e => upd({ standardStartTime: e.target.value })}
            className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </Row>
        <Row label="Standard End Time">
          <input type="time" value={p.standardEndTime} onChange={e => upd({ standardEndTime: e.target.value })}
            className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </Row>
        <Row label="Weekend Days">
          <div className="flex gap-1">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
              <button key={d} onClick={() => {
                const days = p.weekendDays.includes(d) ? p.weekendDays.filter(x => x !== d) : [...p.weekendDays, d]
                upd({ weekendDays: days })
              }} className={`px-2 py-1 text-xs rounded-lg border transition-colors ${p.weekendDays.includes(d) ? 'bg-indigo-100 dark:bg-indigo-500/20 border-indigo-300 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'}`}>{d.slice(0, 3)}</button>
            ))}
          </div>
        </Row>
        <SaveBar onSave={save} />
      </div>

      <div className="card-base p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Absence Deduction</h3>
        <Row label="Absence Mode">
          <Sel value={p.absenceMode} onChange={v => upd({ absenceMode: v })} options={[{ value: 'fixed', label: 'Fixed Amount' }, { value: 'progressive', label: 'Progressive' }]} />
        </Row>
        {p.absenceMode === 'fixed' ? (
          <Row label="Fixed Absence Amount" helper="Deducted per absence day"><NumInput value={p.fixedAbsenceAmount} onChange={v => upd({ fixedAbsenceAmount: v })} suffix="per day" /></Row>
        ) : (
          <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Progressive amounts per day:</p>
            <div className="flex flex-wrap gap-2">
              {p.progressiveAbsenceAmounts.map((amt, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="text-xs text-gray-400 w-6">D{i + 1}</span>
                  <input type="number" value={amt} onChange={e => {
                    const arr = [...p.progressiveAbsenceAmounts]; arr[i] = Number(e.target.value); upd({ progressiveAbsenceAmounts: arr })
                  }} className="w-20 text-right text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-2">Additional days use the last configured amount</p>
          </div>
        )}
        <SaveBar onSave={save} />
      </div>

      <div className="card-base p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Late Deduction</h3>
          <Toggle checked={p.enableLateDeduction} onChange={v => upd({ enableLateDeduction: v })} />
        </div>
        {p.enableLateDeduction && (
          <>
            <Row label="Late Threshold" helper="Hours after which deduction applies"><NumInput value={p.lateThresholdHours} onChange={v => upd({ lateThresholdHours: v })} suffix="hours" /></Row>
            <Row label="Deduction Type">
              <Sel value={p.lateDeductionType} onChange={v => upd({ lateDeductionType: v })} options={[{ value: 'fraction', label: 'Salary Fraction' }, { value: 'fixed', label: 'Fixed Amount' }]} />
            </Row>
            {p.lateDeductionType === 'fraction' ? (
              <Row label="Salary Fraction">
                <Sel value={p.lateDeductionFraction} onChange={v => upd({ lateDeductionFraction: v })} options={[{ value: 'quarter', label: 'Quarter Day' }, { value: 'half', label: 'Half Day' }, { value: 'full', label: 'Full Day' }]} />
              </Row>
            ) : (
              <Row label="Fixed Late Amount"><NumInput value={p.lateFixedAmount} onChange={v => upd({ lateFixedAmount: v })} suffix="per occurrence" /></Row>
            )}
          </>
        )}
        <SaveBar onSave={save} />
      </div>
    </div>
  )
}

function PayrollRulesTab() {
  const { config, updateConfig } = useSystemConfig()
  const { showToast } = useToast()
  const r = config.payrollRules

  const save = () => showToast('Payroll rules saved', 'success')
  const upd = (data) => updateConfig('payrollRules', data)

  return (
    <div className="space-y-4">
      <div className="card-base p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Payroll Schedule</h3>
        <Row label="Payroll Frequency">
          <Sel value={r.frequency} onChange={v => upd({ frequency: v })} options={[{ value: 'monthly', label: 'Monthly' }, { value: 'weekly', label: 'Weekly' }]} />
        </Row>
        <Row label="Default Payroll Day"><NumInput value={r.defaultPayrollDay} onChange={v => upd({ defaultPayrollDay: v })} suffix={`of month`} /></Row>
        <Row label="Working Days Per Month" helper="Used for daily salary calculation: Daily = Basic / Working Days"><NumInput value={r.workingDaysPerMonth} onChange={v => upd({ workingDaysPerMonth: v })} suffix="days" /></Row>
      </div>

      <div className="card-base p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Payroll Options</h3>
        <Row label="Auto-Generate Payslip"><Toggle checked={r.autoGeneratePayslip} onChange={v => upd({ autoGeneratePayslip: v })} /></Row>
        <Row label="Allow Negative Salary"><Toggle checked={r.allowNegativeSalary} onChange={v => upd({ allowNegativeSalary: v })} /></Row>
        <Row label="Overtime Enabled"><Toggle checked={r.overtimeEnabled} onChange={v => upd({ overtimeEnabled: v })} /></Row>
        {r.overtimeEnabled && (
          <Row label="Overtime Rate Multiplier" helper="Overtime Pay = Hours x (Daily Salary / Hours Per Day) x Rate">
            <NumInput value={r.overtimeRateMultiplier} onChange={v => upd({ overtimeRateMultiplier: v })} suffix="x" min={0.1} />
          </Row>
        )}
        <SaveBar onSave={save} />
      </div>
    </div>
  )
}

function CompanyDeductionsTab() {
  const { config, updateConfig, activeEmployeeCount, totalEmployeeCount, refreshEmployeeCounts } = useSystemConfig()
  const { showToast } = useToast()
  const d = config.companyLevelDeductions

  const save = () => { showToast('Company deductions saved', 'success'); refreshEmployeeCounts() }
  const upd = (data) => updateConfig('companyLevelDeductions', data)

  const taxPerEmp = calcTaxPerEmployee(config, activeEmployeeCount)
  const insPerEmp = calcInsurancePerEmployee(config, activeEmployeeCount)
  const hasEmployees = activeEmployeeCount > 0
  const inactiveCount = totalEmployeeCount - activeEmployeeCount

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-900/20 p-3">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
          <p className="text-xs text-indigo-700 dark:text-indigo-300">Tax and Company Insurance are company-level bulk amounts distributed automatically across active employees. These are not per-employee manual deductions.</p>
        </div>
      </div>

      <div className="card-base p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Company-Level Settings</h3>
        <Row label="Annual Tax Bulk Amount"><NumInput value={d.annualTaxBulkAmount} onChange={v => upd({ annualTaxBulkAmount: v })} /></Row>
        <Row label="Annual Company Insurance Bulk Amount"><NumInput value={d.annualInsuranceBulkAmount} onChange={v => upd({ annualInsuranceBulkAmount: v })} /></Row>
        <Row label="Payroll Frequency">
          <Sel value={d.frequency} onChange={v => upd({ frequency: v })} options={[{ value: 'monthly', label: 'Monthly (/12)' }, { value: 'weekly', label: 'Weekly (/52)' }]} />
        </Row>
      </div>

      <div className="card-base p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-indigo-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Employee Distribution</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-3 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalEmployeeCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Employees</p>
          </div>
          <div className="rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/20 p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600">{activeEmployeeCount}</p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">Active Employees</p>
          </div>
          <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-3 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{inactiveCount > 0 ? inactiveCount : 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Inactive (Excluded)</p>
          </div>
        </div>
        <p className="text-[11px] text-gray-400 dark:text-gray-500">Calculated automatically from active employees across all branches. This value updates automatically when employees are added, removed, activated, or deactivated.</p>
      </div>

      <div className="card-base p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-indigo-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Calculation Preview</h3>
        </div>
        {!hasEmployees ? (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
            <p className="text-xs text-amber-700 dark:text-amber-400">No active employees found. Bulk deductions cannot be distributed.</p>
          </div>
        ) : (
          <>
            <Row label="Tax Per Employee Per Year"><span className="text-sm font-medium text-gray-900 dark:text-gray-100">{fmt(d.annualTaxBulkAmount / activeEmployeeCount)}</span></Row>
            <Row label={`Tax Per Employee Per ${d.frequency === 'monthly' ? 'Month' : 'Week'}`}><span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{fmt(taxPerEmp)}</span></Row>
            <div className="border-t border-gray-100 dark:border-gray-700 my-2" />
            <Row label="Insurance Per Employee Per Year"><span className="text-sm font-medium text-gray-900 dark:text-gray-100">{fmt(d.annualInsuranceBulkAmount / activeEmployeeCount)}</span></Row>
            <Row label={`Insurance Per Employee Per ${d.frequency === 'monthly' ? 'Month' : 'Week'}`}><span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{fmt(insPerEmp)}</span></Row>
            <div className="border-t border-gray-100 dark:border-gray-700 my-2" />
            <Row label="Total Per Employee Per Period"><span className="text-lg font-bold text-gray-900 dark:text-gray-100">{fmt(taxPerEmp + insPerEmp)}</span></Row>
          </>
        )}
        <SaveBar onSave={save} />
      </div>
    </div>
  )
}

function MedicalInsuranceTab() {
  const { config, updateConfig } = useSystemConfig()
  const { showToast } = useToast()
  const r = config.medicalInsuranceRules

  const save = () => showToast('Medical insurance rules saved', 'success')
  const upd = (data) => updateConfig('medicalInsuranceRules', data)

  return (
    <div className="space-y-4">
      <div className="card-base p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Medical Insurance</h3>
          <Toggle checked={r.enabled} onChange={v => upd({ enabled: v })} />
        </div>
        {!r.enabled && <p className="text-xs text-gray-400">Medical insurance deduction is disabled.</p>}
        {r.enabled && (
          <>
            <Row label="Deduction Type">
              <Sel value={r.deductionType} onChange={v => upd({ deductionType: v })} options={[{ value: 'fixed', label: 'Fixed Amount' }, { value: 'percentage', label: 'Percentage of Base Salary' }]} />
            </Row>
            {r.deductionType === 'fixed' ? (
              <Row label="Fixed Monthly Amount"><NumInput value={r.fixedMonthlyAmount} onChange={v => upd({ fixedMonthlyAmount: v })} /></Row>
            ) : (
              <Row label="Percentage Rate"><NumInput value={r.percentageRate} onChange={v => upd({ percentageRate: v })} suffix="%" /></Row>
            )}
            <Row label="Apply To">
              <Sel value={r.applyTo} onChange={v => upd({ applyTo: v })} options={[{ value: 'enabled_only', label: 'Employees with medical insurance enabled' }, { value: 'all_active', label: 'All active employees' }]} />
            </Row>
            <div className="rounded-lg border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-900/20 p-3">
              <p className="text-xs text-indigo-700 dark:text-indigo-300">
                {r.deductionType === 'fixed'
                  ? `Each eligible employee will have ${r.fixedMonthlyAmount} deducted monthly.`
                  : `Each eligible employee will have ${r.percentageRate}% of their base salary deducted.`}
                Employees without medical insurance enabled will not be affected (unless "All active" is selected).
              </p>
            </div>
          </>
        )}
        <SaveBar onSave={save} />
      </div>
    </div>
  )
}

function LoansTab() {
  const { config, updateConfig } = useSystemConfig()
  const { showToast } = useToast()
  const r = config.loanRules

  const save = () => showToast('Loan rules saved', 'success')
  const upd = (data) => updateConfig('loanRules', data)

  return (
    <div className="space-y-4">
      <div className="card-base p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Loan Deduction</h3>
          <Toggle checked={r.enabled} onChange={v => upd({ enabled: v })} />
        </div>
        {!r.enabled && <p className="text-xs text-gray-400">Loan deduction is disabled.</p>}
        {r.enabled && (
          <>
            <Row label="Default Deduction Behavior">
              <Sel value={r.defaultBehavior} onChange={v => upd({ defaultBehavior: v })} options={[{ value: 'fixed_installment', label: 'Fixed Monthly Installment' }, { value: 'remaining_divided', label: 'Remaining Balance / Remaining Months' }]} />
            </Row>
            <Row label="Auto-Deduct from Payroll" helper="Automatically deduct loan installments when processing payroll">
              <Toggle checked={r.autoDeductFromPayroll} onChange={v => upd({ autoDeductFromPayroll: v })} />
            </Row>
            <div className="rounded-lg border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-900/20 p-3">
              <p className="text-xs text-indigo-700 dark:text-indigo-300">
                Only employees with active loans will have deductions applied. Completed or paused loans will not generate deductions.
              </p>
            </div>
          </>
        )}
        <SaveBar onSave={save} />
      </div>
    </div>
  )
}

function DeductionRulesTab() {
  const { config } = useSystemConfig()

  const rules = [
    { source: 'Company-Level Auto', types: ['Tax', 'Company Insurance'], desc: 'Distributed from annual bulk amounts across active employees', icon: Building2, color: 'indigo' },
    { source: 'Employee Rule Auto', types: ['Medical Insurance', 'Loan'], desc: 'Based on employee flags and configured rules', icon: Heart, color: 'purple' },
    { source: 'Attendance Rule Auto', types: ['Absence', 'Late Attendance'], desc: 'Calculated from attendance records and policy', icon: Clock, color: 'amber' },
  ]

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-900/20 p-3">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
          <p className="text-xs text-indigo-700 dark:text-indigo-300">All deductions are calculated automatically from company configuration and employee records. HR does not need to calculate them manually.</p>
        </div>
      </div>

      {rules.map(r => (
        <div key={r.source} className="card-base p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-${r.color}-100 dark:bg-${r.color}-500/20`}>
              <r.icon className={`h-4 w-4 text-${r.color}-600 dark:text-${r.color}-400`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{r.source}</h3>
              <p className="text-[11px] text-gray-400">{r.desc}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {r.types.map(t => (
              <span key={t} className="rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">{t}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function PermissionsTab() {
  const { user, isAdmin } = useAuth()

  const isSuperAdmin = user?.roles?.[0]?.slug === 'super_admin'

  const perms = [
    { action: 'Access System Configuration', superAdmin: true, hrAdmin: true, manager: false, employee: false },
    { action: 'Edit Tax & Insurance Bulk Amounts', superAdmin: true, hrAdmin: false, manager: false, employee: false },
    { action: 'Edit Medical Insurance Rules', superAdmin: true, hrAdmin: false, manager: false, employee: false },
    { action: 'Edit Loan Rules', superAdmin: true, hrAdmin: false, manager: false, employee: false },
    { action: 'Edit Attendance Policy', superAdmin: true, hrAdmin: false, manager: false, employee: false },
    { action: 'Edit Payroll Rules', superAdmin: true, hrAdmin: false, manager: false, employee: false },
    { action: 'Manage Branches', superAdmin: true, hrAdmin: true, manager: false, employee: false },
    { action: 'View System Configuration', superAdmin: true, hrAdmin: true, manager: false, employee: false },
  ]

  const roles = ['superAdmin', 'hrAdmin', 'manager', 'employee']
  const roleLabels = { superAdmin: 'Super Admin', hrAdmin: 'HR Admin', manager: 'Manager', employee: 'Employee' }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-900/20 p-3">
        <div className="flex items-start gap-2">
          <Shield className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
          <p className="text-xs text-indigo-700 dark:text-indigo-300">
            Your role: <strong>{isSuperAdmin ? 'Super Admin' : isAdmin ? 'HR Admin' : 'N/A'}</strong>.
            Super Admin has full access. HR Admin can view but cannot edit critical financial rules.
          </p>
        </div>
      </div>

      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Action</th>
                {roles.map(r => (
                  <th key={r} className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">{roleLabels[r]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {perms.map((p, i) => (
                <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                  <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{p.action}</td>
                  {roles.map(r => (
                    <td key={r} className="text-center px-4 py-2.5">
                      {p[r] ? (
                        <Check className="h-4 w-4 text-emerald-500 inline" />
                      ) : (
                        <X className="h-4 w-4 text-gray-300 dark:text-gray-600 inline" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function SystemConfiguration() {
  const { t } = useI18n()
  const { isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState('branches')
  const { config, resetConfig } = useSystemConfig()
  const { showToast } = useToast()

  const canEdit = isAdmin

  const tabs = [
    { id: 'branches', label: 'Branches', icon: GitBranch },
    { id: 'attendance', label: 'Attendance Policy', icon: Clock },
    { id: 'payroll', label: 'Payroll Rules', icon: DollarSign },
    { id: 'company', label: 'Company Deductions', icon: Building2 },
    { id: 'medical', label: 'Medical Insurance', icon: Heart },
    { id: 'loans', label: 'Loans', icon: Banknote },
    { id: 'rules', label: 'Deduction Rules', icon: Shield },
    { id: 'permissions', label: 'Permissions', icon: Lock },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">System Configuration</h1>
            <p className="mt-1 text-sm text-gray-500">Configure automated HR and payroll rules for your company</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { resetConfig(); showToast('Configuration reset to defaults', 'success') }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <RotateCcw className="h-3.5 w-3.5" />Reset Defaults
            </button>
          </div>
        </div>
      </motion.div>

      {!canEdit && (
        <motion.div variants={fadeUp} className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3">
          <p className="text-xs text-amber-700 dark:text-amber-400">Only Super Admin can edit System Configuration. You have view access only.</p>
        </motion.div>
      )}

      <motion.div variants={fadeUp}>
        <div className="card-base">
          <div className="overflow-x-auto border-b border-gray-200 dark:border-gray-700 px-4 pt-2">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          </div>
          <div className="p-4">
            {activeTab === 'branches' && <BranchesTab />}
            {activeTab === 'attendance' && <AttendancePolicyTab />}
            {activeTab === 'payroll' && <PayrollRulesTab />}
            {activeTab === 'company' && <CompanyDeductionsTab />}
            {activeTab === 'medical' && <MedicalInsuranceTab />}
            {activeTab === 'loans' && <LoansTab />}
            {activeTab === 'rules' && <DeductionRulesTab />}
            {activeTab === 'permissions' && <PermissionsTab />}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
