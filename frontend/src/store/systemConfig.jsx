import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const SystemConfigContext = createContext(null)

const STORAGE_KEY = 'nexus_system_config'

const defaultConfig = {
  branches: [
    { id: 1, name: 'Main Office', active: true },
    { id: 2, name: 'South Branch', active: true },
    { id: 3, name: 'West Branch', active: true },
    { id: 4, name: 'Downtown Branch', active: true },
    { id: 5, name: 'Customer Service Center', active: true },
    { id: 6, name: 'Corporate Headquarters', active: true },
  ],
  attendancePolicy: {
    workingHoursPerDay: 8,
    workingDaysPerMonth: 22,
    gracePeriodMinutes: 15,
    standardStartTime: '09:00',
    standardEndTime: '17:00',
    weekendDays: ['Saturday', 'Sunday'],
    absenceMode: 'fixed',
    fixedAbsenceAmount: 100,
    progressiveAbsenceAmounts: [50, 100, 200, 400, 800],
    enableLateDeduction: true,
    lateThresholdHours: 3,
    lateDeductionType: 'fraction',
    lateDeductionFraction: 'quarter',
    lateFixedAmount: 0,
  },
  payrollRules: {
    frequency: 'monthly',
    defaultPayrollDay: 28,
    workingDaysPerMonth: 22,
    autoGeneratePayslip: true,
    allowNegativeSalary: false,
    overtimeEnabled: true,
    overtimeRateMultiplier: 1.5,
  },
  companyLevelDeductions: {
    annualTaxBulkAmount: 1000000,
    annualInsuranceBulkAmount: 600000,
    frequency: 'monthly',
  },
  medicalInsuranceRules: {
    enabled: true,
    deductionType: 'fixed',
    fixedMonthlyAmount: 300,
    percentageRate: 2,
    applyTo: 'enabled_only',
  },
  loanRules: {
    enabled: true,
    defaultBehavior: 'fixed_installment',
    autoDeductFromPayroll: true,
  },
}

function loadConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      const merged = { ...defaultConfig }
      for (const key of Object.keys(defaultConfig)) {
        if (parsed[key]) merged[key] = { ...defaultConfig[key], ...parsed[key] }
      }
      return merged
    }
  } catch {}
  return { ...defaultConfig }
}

export function SystemConfigProvider({ children }) {
  const [config, setConfig] = useState(loadConfig)
  const [activeEmployeeCount, setActiveEmployeeCount] = useState(0)
  const [totalEmployeeCount, setTotalEmployeeCount] = useState(0)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  }, [config])

  const updateConfig = useCallback((section, data) => {
    setConfig(prev => {
      if (section === 'branches') return { ...prev, branches: data.branches || prev.branches }
      return { ...prev, [section]: typeof data === 'object' && !Array.isArray(data) && section !== 'branches' ? { ...prev[section], ...data } : data }
    })
  }, [])

  const resetConfig = useCallback(() => {
    setConfig({ ...defaultConfig })
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const refreshEmployeeCounts = useCallback(async () => {
    try {
      const { default: api } = await import('../api/axios')
      const allRes = await api.get('/hr/employees', { params: { page: 1, pageSize: 1 } })
      const activeRes = await api.get('/hr/employees', { params: { page: 1, pageSize: 1, status: 'active' } })
      setTotalEmployeeCount(allRes.data?.data?.total || 0)
      setActiveEmployeeCount(activeRes.data?.data?.total || 0)
    } catch {}
  }, [])

  useEffect(() => {
    refreshEmployeeCounts()
  }, [refreshEmployeeCounts])

  return (
    <SystemConfigContext.Provider value={{ config, updateConfig, resetConfig, activeEmployeeCount, totalEmployeeCount, refreshEmployeeCounts }}>
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
  const { annualTaxBulkAmount, frequency } = config.companyLevelDeductions
  if (!activeCount) return 0
  const perYear = annualTaxBulkAmount / activeCount
  return frequency === 'monthly' ? perYear / 12 : perYear / 52
}

export function calcInsurancePerEmployee(config, activeCount) {
  const { annualInsuranceBulkAmount, frequency } = config.companyLevelDeductions
  if (!activeCount) return 0
  const perYear = annualInsuranceBulkAmount / activeCount
  return frequency === 'monthly' ? perYear / 12 : perYear / 52
}

export function calcMedicalInsurance(config, employee) {
  const rules = config.medicalInsuranceRules
  if (!rules.enabled) return 0
  if (rules.applyTo === 'enabled_only' && !employee.medicalInsuranceEnabled) return 0
  if (rules.deductionType === 'fixed') return employee.customMedicalAmount || rules.fixedMonthlyAmount
  return ((employee.baseSalary || 0) * rules.percentageRate) / 100
}

export function calcLoanDeduction(config, employee) {
  const rules = config.loanRules
  if (!rules.enabled || !rules.autoDeductFromPayroll) return 0
  if (!employee.hasActiveLoan || employee.loanStatus !== 'active') return 0
  if (rules.defaultBehavior === 'remaining_divided' && employee.remainingBalance > 0 && employee.remainingMonths > 0) {
    return Math.min(employee.monthlyInstallment || 0, employee.remainingBalance / employee.remainingMonths)
  }
  return employee.monthlyInstallment || 0
}

export function calcAbsenceDeduction(config, employee) {
  const policy = config.attendancePolicy
  const days = employee.absenceDays || 0
  if (days <= 0) return 0
  if (policy.absenceMode === 'fixed') return policy.fixedAbsenceAmount * days
  let total = 0
  for (let i = 0; i < days; i++) {
    total += policy.progressiveAbsenceAmounts[Math.min(i, policy.progressiveAbsenceAmounts.length - 1)]
  }
  return total
}

export function calcLateDeduction(config, employee) {
  const policy = config.attendancePolicy
  const rules = config.payrollRules
  if (!policy.enableLateDeduction) return 0
  const occurrences = employee.lateOccurrences || 0
  if (occurrences <= 0) return 0
  if (policy.lateDeductionType === 'fixed') return policy.lateFixedAmount * occurrences
  const workingDays = rules.workingDaysPerMonth || 22
  const dailySalary = (employee.baseSalary || 0) / workingDays
  const fraction = policy.lateDeductionFraction === 'quarter' ? 0.25 : policy.lateDeductionFraction === 'half' ? 0.5 : 1
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
  if (med > 0) results.push({ employee_name: name, employee_id: eid, deduction_type: 'Medical Insurance', amount: med, month, source: 'Employee Rule Auto', reason: `Medical ${config.medicalInsuranceRules.deductionType} deduction`, status: 'active', isAuto: true })

  const loan = calcLoanDeduction(config, employee)
  if (loan > 0) results.push({ employee_name: name, employee_id: eid, deduction_type: 'Loan', amount: loan, month, source: 'Employee Rule Auto', reason: `Loan installment: ${employee.monthlyInstallment}`, status: 'active', isAuto: true })

  const abs = calcAbsenceDeduction(config, employee)
  if (abs > 0) results.push({ employee_name: name, employee_id: eid, deduction_type: 'Absence', amount: abs, month, source: 'Attendance Rule Auto', reason: `${employee.absenceDays} day(s) absent`, status: 'active', isAuto: true })

  const late = calcLateDeduction(config, employee)
  if (late > 0) results.push({ employee_name: name, employee_id: eid, deduction_type: 'Late Attendance', amount: late, month, source: 'Attendance Rule Auto', reason: `${employee.lateOccurrences} late occurrence(s)`, status: 'active', isAuto: true })

  return results
}
