import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../api/axios'

const SystemConfigContext = createContext(null)

const defaultConfig = {
  working_hours_per_day: 8,
  working_days_per_month: 22,
  grace_period_minutes: 15,
  standard_start_time: '09:00',
  standard_end_time: '17:00',
  weekend_days: ['Saturday', 'Sunday'],
  absence_mode: 'fixed',
  fixed_absence_amount: 100,
  progressive_absence_amounts: [50, 100, 200, 400, 800],
  enable_late_deduction: true,
  late_threshold_hours: 3,
  late_deduction_type: 'fraction',
  late_deduction_fraction: 'quarter',
  late_fixed_amount: 0,
  payroll_frequency: 'monthly',
  default_payroll_day: 28,
  auto_generate_payslip: true,
  allow_negative_salary: false,
  overtime_enabled: true,
  overtime_rate_multiplier: 1.5,
  annual_tax_bulk_amount: 1000000,
  annual_insurance_bulk_amount: 600000,
  medical_insurance_enabled: true,
  medical_deduction_type: 'fixed',
  medical_fixed_monthly_amount: 300,
  medical_percentage_rate: 2,
  medical_apply_to: 'enabled_only',
  loan_enabled: true,
  loan_default_behavior: 'fixed_installment',
  loan_auto_deduct: true,
}

function mapDBToFrontend(db) {
  if (!db) return defaultConfig
  return {
    working_hours_per_day: db.working_hours_per_day ?? 8,
    working_days_per_month: db.working_days_per_month ?? 22,
    grace_period_minutes: db.grace_period_minutes ?? 15,
    standard_start_time: db.standard_start_time ?? '09:00',
    standard_end_time: db.standard_end_time ?? '17:00',
    weekend_days: db.weekend_days ?? ['Saturday', 'Sunday'],
    absence_mode: db.absence_mode ?? 'fixed',
    fixed_absence_amount: db.fixed_absence_amount ?? 100,
    progressive_absence_amounts: db.progressive_absence_amounts ?? [50, 100, 200, 400, 800],
    enable_late_deduction: db.enable_late_deduction ?? true,
    late_threshold_hours: db.late_threshold_hours ?? 3,
    late_deduction_type: db.late_deduction_type ?? 'fraction',
    late_deduction_fraction: db.late_deduction_fraction ?? 'quarter',
    late_fixed_amount: db.late_fixed_amount ?? 0,
    payroll_frequency: db.payroll_frequency ?? 'monthly',
    default_payroll_day: db.default_payroll_day ?? 28,
    auto_generate_payslip: db.auto_generate_payslip ?? true,
    allow_negative_salary: db.allow_negative_salary ?? false,
    overtime_enabled: db.overtime_enabled ?? true,
    overtime_rate_multiplier: db.overtime_rate_multiplier ?? 1.5,
    annual_tax_bulk_amount: db.annual_tax_bulk_amount ?? 1000000,
    annual_insurance_bulk_amount: db.annual_insurance_bulk_amount ?? 600000,
    medical_insurance_enabled: db.medical_insurance_enabled ?? true,
    medical_deduction_type: db.medical_deduction_type ?? 'fixed',
    medical_fixed_monthly_amount: db.medical_fixed_monthly_amount ?? 300,
    medical_percentage_rate: db.medical_percentage_rate ?? 2,
    medical_apply_to: db.medical_apply_to ?? 'enabled_only',
    loan_enabled: db.loan_enabled ?? true,
    loan_default_behavior: db.loan_default_behavior ?? 'fixed_installment',
    loan_auto_deduct: db.loan_auto_deduct ?? true,
  }
}

export function SystemConfigProvider({ children }) {
  const [config, setConfig] = useState(defaultConfig)
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeEmployeeCount, setActiveEmployeeCount] = useState(0)
  const [totalEmployeeCount, setTotalEmployeeCount] = useState(0)

  const loadConfig = useCallback(async () => {
    setLoading(true)
    try {
      const [configRes, branchRes, allEmpRes, activeEmpRes] = await Promise.all([
        api.get('/hr/system-config'),
        api.get('/hr/branches'),
        api.get('/hr/employees', { params: { page: 1, pageSize: 1 } }),
        api.get('/hr/employees', { params: { page: 1, pageSize: 1, status: 'active' } }),
      ])
      const dbConfig = configRes.data?.data
      if (dbConfig) setConfig(mapDBToFrontend(dbConfig))
      setBranches(branchRes.data?.data || [])
      setTotalEmployeeCount(allEmpRes.data?.data?.total || 0)
      setActiveEmployeeCount(activeEmpRes.data?.data?.total || 0)
    } catch (e) {
      console.error('Failed to load system config:', e)
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadConfig() }, [loadConfig])

  const updateConfig = useCallback((data) => {
    setConfig(prev => ({ ...prev, ...data }))
  }, [])

  const saveConfig = useCallback(async (data) => {
    setSaving(true)
    try {
      await api.put('/hr/system-config', data)
      setConfig(prev => ({ ...prev, ...data }))
    } catch (e) {
      console.error('Failed to save config:', e)
      throw e
    }
    setSaving(false)
  }, [])

  const saveBranch = useCallback(async (data) => {
    try {
      const res = await api.post('/hr/branches', data)
      const newBranch = res.data?.data
      if (newBranch) setBranches(prev => [...prev, newBranch])
      return newBranch
    } catch (e) {
      console.error('Failed to create branch:', e)
      throw e
    }
  }, [])

  const editBranch = useCallback(async (id, data) => {
    try {
      await api.put(`/hr/branches/${id}`, data)
      setBranches(prev => prev.map(b => b.id === id ? { ...b, ...data } : b))
    } catch (e) {
      console.error('Failed to update branch:', e)
      throw e
    }
  }, [])

  const removeBranch = useCallback(async (id) => {
    try {
      await api.delete(`/hr/branches/${id}`)
      setBranches(prev => prev.filter(b => b.id !== id))
    } catch (e) {
      console.error('Failed to delete branch:', e)
      throw e
    }
  }, [])

  const refreshEmployeeCounts = useCallback(async () => {
    try {
      const [allRes, activeRes] = await Promise.all([
        api.get('/hr/employees', { params: { page: 1, pageSize: 1 } }),
        api.get('/hr/employees', { params: { page: 1, pageSize: 1, status: 'active' } }),
      ])
      setTotalEmployeeCount(allRes.data?.data?.total || 0)
      setActiveEmployeeCount(activeRes.data?.data?.total || 0)
    } catch {}
  }, [])

  return (
    <SystemConfigContext.Provider value={{
      config, branches, loading, saving,
      saveConfig, updateConfig, saveBranch, editBranch, removeBranch,
      activeEmployeeCount, totalEmployeeCount, refreshEmployeeCounts, loadConfig,
    }}>
      {children}
    </SystemConfigContext.Provider>
  )
}

export function useSystemConfig() {
  const context = useContext(SystemConfigContext)
  if (!context) throw new Error('useSystemConfig must be used within SystemConfigProvider')
  return context
}

export function calcTaxPerEmployee(config, activeCount) {
  if (!activeCount) return 0
  const perYear = (config.annual_tax_bulk_amount || 0) / activeCount
  return config.payroll_frequency === 'monthly' ? perYear / 12 : perYear / 52
}

export function calcInsurancePerEmployee(config, activeCount) {
  if (!activeCount) return 0
  const perYear = (config.annual_insurance_bulk_amount || 0) / activeCount
  return config.payroll_frequency === 'monthly' ? perYear / 12 : perYear / 52
}

export function calcMedicalInsurance(config, employee) {
  if (!config.medical_insurance_enabled) return 0
  if (config.medical_apply_to === 'enabled_only' && !employee.medicalInsuranceEnabled) return 0
  if (config.medical_deduction_type === 'fixed') return employee.customMedicalAmount || config.medical_fixed_monthly_amount || 0
  return ((employee.baseSalary || 0) * (config.medical_percentage_rate || 0)) / 100
}

export function calcLoanDeduction(config, employee) {
  if (!config.loan_enabled || !config.loan_auto_deduct) return 0
  if (!employee.hasActiveLoan || employee.loanStatus !== 'active') return 0
  if (config.loan_default_behavior === 'remaining_divided' && employee.remainingBalance > 0 && employee.remainingMonths > 0) {
    return Math.min(employee.monthlyInstallment || 0, employee.remainingBalance / employee.remainingMonths)
  }
  return employee.monthlyInstallment || 0
}

export function calcAbsenceDeduction(config, employee) {
  const days = employee.absenceDays || 0
  if (days <= 0) return 0
  if (config.absence_mode === 'fixed') return (config.fixed_absence_amount || 0) * days
  const amounts = config.progressive_absence_amounts || [50, 100, 200, 400, 800]
  let total = 0
  for (let i = 0; i < days; i++) {
    total += amounts[Math.min(i, amounts.length - 1)] || 0
  }
  return total
}

export function calcLateDeduction(config, employee) {
  if (!config.enable_late_deduction) return 0
  const occurrences = employee.lateOccurrences || 0
  if (occurrences <= 0) return 0
  if (config.late_deduction_type === 'fixed') return (config.late_fixed_amount || 0) * occurrences
  const workingDays = config.working_days_per_month || 22
  const dailySalary = (employee.baseSalary || 0) / workingDays
  const fraction = config.late_deduction_fraction === 'quarter' ? 0.25 : config.late_deduction_fraction === 'half' ? 0.5 : 1
  return dailySalary * fraction * occurrences
}

export function calcFullPayslip(config, employee, activeCount) {
  const basicSalary = employee.baseSalary || 0
  const allowances = employee.allowances || 0
  const overtime = employee.overtime || 0
  const grossSalary = basicSalary + allowances + overtime
  const taxDeduction = calcTaxPerEmployee(config, activeCount)
  const companyInsurance = calcInsurancePerEmployee(config, activeCount)
  const medicalInsurance = calcMedicalInsurance(config, employee)
  const loanDeduction = calcLoanDeduction(config, employee)
  const absenceDeduction = calcAbsenceDeduction(config, employee)
  const lateDeduction = calcLateDeduction(config, employee)
  const totalDeductions = taxDeduction + companyInsurance + medicalInsurance + loanDeduction + absenceDeduction + lateDeduction
  const netSalary = grossSalary - totalDeductions
  return {
    earnings: { basicSalary, allowances, overtime, grossSalary },
    companyLevel: { taxDeduction, companyInsurance },
    employeeRule: { medicalInsurance, loanDeduction },
    attendanceRule: { absenceDeduction, lateDeduction },
    totals: { totalDeductions, netSalary },
  }
}

export function generateMockEmployeeFlags(name) {
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0
  }
  const idx = Math.abs(hash) % 10
  return {
    medicalInsuranceEnabled: idx % 2 === 0,
    customMedicalAmount: null,
    hasActiveLoan: idx % 3 === 0,
    loanAmount: idx % 3 === 0 ? 50000 : 0,
    remainingBalance: idx % 3 === 0 ? 30000 : 0,
    remainingMonths: idx % 3 === 0 ? 20 : 0,
    monthlyInstallment: idx % 3 === 0 ? 1500 : 0,
    loanStatus: idx % 3 === 0 ? 'active' : 'none',
    absenceDays: idx > 6 ? idx - 5 : 0,
    lateOccurrences: idx > 7 ? 2 : idx > 4 ? 1 : 0,
    overtime: idx > 3 ? 500 + (idx * 100) : 0,
    allowances: 1000 + (idx * 200),
  }
}

export function buildAutoDeductions(config, employee, month, activeCount) {
  const results = []
  const name = employee.employee_name || employee.name || ''
  const eid = employee.employee_id || employee.employee_code || '--'

  const tax = calcTaxPerEmployee(config, activeCount)
  if (tax > 0) results.push({ employee_name: name, employee_id: eid, deduction_type: 'Tax', amount: tax, month, source: 'Company-Level Auto', reason: 'Auto from annual tax bulk', status: 'active', isAuto: true })

  const ins = calcInsurancePerEmployee(config, activeCount)
  if (ins > 0) results.push({ employee_name: name, employee_id: eid, deduction_type: 'Company Insurance', amount: ins, month, source: 'Company-Level Auto', reason: 'Auto from annual insurance bulk', status: 'active', isAuto: true })

  const med = calcMedicalInsurance(config, employee)
  if (med > 0) results.push({ employee_name: name, employee_id: eid, deduction_type: 'Medical Insurance', amount: med, month, source: 'Employee Rule Auto', reason: `Medical ${config.medical_deduction_type} deduction`, status: 'active', isAuto: true })

  const loan = calcLoanDeduction(config, employee)
  if (loan > 0) results.push({ employee_name: name, employee_id: eid, deduction_type: 'Loan', amount: loan, month, source: 'Employee Rule Auto', reason: `Loan installment: ${employee.monthlyInstallment}`, status: 'active', isAuto: true })

  const abs = calcAbsenceDeduction(config, employee)
  if (abs > 0) results.push({ employee_name: name, employee_id: eid, deduction_type: 'Absence', amount: abs, month, source: 'Attendance Rule Auto', reason: `${employee.absenceDays} day(s) absent`, status: 'active', isAuto: true })

  const late = calcLateDeduction(config, employee)
  if (late > 0) results.push({ employee_name: name, employee_id: eid, deduction_type: 'Late Attendance', amount: late, month, source: 'Attendance Rule Auto', reason: `${employee.lateOccurrences} late occurrence(s)`, status: 'active', isAuto: true })

  return results
}
