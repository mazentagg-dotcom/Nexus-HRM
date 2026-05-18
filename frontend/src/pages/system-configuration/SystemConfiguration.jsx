import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '../../components/Button'
import { useToast } from '../../components/feedback/Toast'
import { useSystemConfig } from '../../store/systemConfig'
import { useAuth } from '../../hooks/useAuth'
import { container, fadeUp, Toggle, NumInput, Sel, Row, SaveBar, TextInput, SectionCard, InfoBox, fmt } from './ConfigComponents'
import AttendanceConfiguration from './AttendanceConfiguration'
import {
  GitBranch, Clock, DollarSign, Building2, Heart, Banknote, Shield, Globe, Briefcase,
  Plus, Trash2, Edit3, Check, X, Info, Calculator, Save, Users, Settings,
} from 'lucide-react'

const SECTIONS = [
  { id: 'profile', label: 'Company Profile', icon: Briefcase },
  { id: 'branches', label: 'Branches', icon: GitBranch },
  { id: 'attendance', label: 'Attendance', icon: Clock },
  { id: 'payroll', label: 'Payroll Rules', icon: DollarSign },
  { id: 'company', label: 'Company Deductions', icon: Calculator },
  { id: 'medical', label: 'Medical Insurance', icon: Heart },
  { id: 'loans', label: 'Loans', icon: Banknote },
  { id: 'permissions', label: 'Permissions', icon: Shield },
  { id: 'language', label: 'Language', icon: Globe },
]

function CompanyProfileSection() {
  const { showToast } = useToast()
  const [profile, setProfile] = useState({
    company_name: 'Nexus HRM Demo Corp',
    industry: 'Technology',
    company_size: '50-200',
    country: 'Egypt',
    currency: 'EGP',
    tax_registration: 'TAX-12345-6789',
    contact_email: 'info@nexus-hrm.com',
    phone: '+20 2 1234 5678',
    website: 'https://nexus-hrm.com',
    address: 'Cairo, Egypt',
  })
  const upd = (key) => (v) => setProfile(p => ({ ...p, [key]: v }))
  const save = () => showToast('Company profile saved', 'success')

  return (
    <div className="space-y-4">
      <SectionCard title="Company Information">
        <Row label="Company Name"><TextInput value={profile.company_name} onChange={upd('company_name')} /></Row>
        <Row label="Industry"><TextInput value={profile.industry} onChange={upd('industry')} /></Row>
        <Row label="Company Size">
          <Sel value={profile.company_size} onChange={upd('company_size')}
            options={[{ value: '1-10', label: '1-10 employees' }, { value: '11-50', label: '11-50' }, { value: '50-200', label: '50-200' }, { value: '200-500', label: '200-500' }, { value: '500+', label: '500+' }]} />
        </Row>
        <Row label="Country"><TextInput value={profile.country} onChange={upd('country')} /></Row>
        <Row label="Currency">
          <Sel value={profile.currency} onChange={upd('currency')}
            options={[{ value: 'EGP', label: 'EGP - Egyptian Pound' }, { value: 'USD', label: 'USD - US Dollar' }, { value: 'EUR', label: 'EUR - Euro' }, { value: 'SAR', label: 'SAR - Saudi Riyal' }, { value: 'AED', label: 'AED - UAE Dirham' }]} />
        </Row>
      </SectionCard>
      <SectionCard title="Registration & Contact">
        <Row label="Tax Registration Number"><TextInput value={profile.tax_registration} onChange={upd('tax_registration')} /></Row>
        <Row label="Contact Email"><TextInput value={profile.contact_email} onChange={upd('contact_email')} /></Row>
        <Row label="Phone"><TextInput value={profile.phone} onChange={upd('phone')} /></Row>
        <Row label="Website"><TextInput value={profile.website} onChange={upd('website')} /></Row>
        <Row label="Address"><TextInput value={profile.address} onChange={upd('address')} /></Row>
      </SectionCard>
      <SaveBar onSave={save} />
    </div>
  )
}

function BranchesTab() {
  const { branches, saveBranch, editBranch, removeBranch, loading } = useSystemConfig()
  const { showToast } = useToast()
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  const addBranch = async () => {
    if (!newName.trim()) return
    try { await saveBranch({ name: newName.trim(), is_active: true }); setNewName(''); showToast('Branch added', 'success') } catch { showToast('Failed to add branch', 'error') }
  }
  const handleRemove = async (id) => { try { await removeBranch(id); showToast('Branch removed', 'success') } catch { showToast('Failed to remove branch', 'error') } }
  const saveEdit = async (id) => { try { await editBranch(id, { name: editName }); setEditingId(null); showToast('Branch updated', 'success') } catch { showToast('Failed to update branch', 'error') } }
  const toggleActive = async (branch) => { try { await editBranch(branch.id, { name: branch.name, is_active: !branch.is_active }) } catch { showToast('Failed to toggle branch', 'error') } }

  if (loading) return <div className="text-sm text-gray-400 py-8 text-center">Loading...</div>

  return (
    <div className="space-y-4">
      <div className="card-base p-4">
        <div className="flex items-center gap-2 mb-4">
          <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Branch name..."
            className="input-base flex-1" onKeyDown={e => e.key === 'Enter' && addBranch()} />
          <Button size="sm" icon={Plus} onClick={addBranch}>Add</Button>
        </div>
        <div className="space-y-2">
          {branches.map(b => (
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
                    <Toggle checked={b.is_active} onChange={() => toggleActive(b)} />
                    <span className={`text-sm ${b.is_active ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 line-through'}`}>{b.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditingId(b.id); setEditName(b.name) }} className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"><Edit3 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleRemove(b.id)} className="rounded p-1 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </>
              )}
            </div>
          ))}
          {branches.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No branches configured</p>}
        </div>
      </div>
    </div>
  )
}

function PayrollRulesTab() {
  const { config, saveConfig, updateConfig } = useSystemConfig()
  const { showToast } = useToast()
  const r = config

  const save = async () => { try { await saveConfig(config); showToast('Payroll rules saved', 'success') } catch { showToast('Failed to save', 'error') } }

  return (
    <div className="space-y-4">
      <SectionCard title="Payroll Schedule" icon={DollarSign}>
        <Row label="Payroll Frequency">
          <Sel value={r.payroll_frequency} onChange={v => updateConfig({ payroll_frequency: v })} options={[{ value: 'monthly', label: 'Monthly' }, { value: 'weekly', label: 'Weekly' }]} />
        </Row>
        <Row label="Default Payroll Day"><NumInput value={r.default_payroll_day} onChange={v => updateConfig({ default_payroll_day: v })} suffix="of month" /></Row>
        <Row label="Working Days Per Month" helper="Used for daily salary calculation: Daily = Basic / Working Days"><NumInput value={r.working_days_per_month} onChange={v => updateConfig({ working_days_per_month: v })} suffix="days" /></Row>
      </SectionCard>
      <SectionCard title="Payroll Options">
        <Row label="Auto-Generate Payslip"><Toggle checked={r.auto_generate_payslip} onChange={v => updateConfig({ auto_generate_payslip: v })} /></Row>
        <Row label="Allow Negative Salary"><Toggle checked={r.allow_negative_salary} onChange={v => updateConfig({ allow_negative_salary: v })} /></Row>
        <Row label="Overtime Enabled"><Toggle checked={r.overtime_enabled} onChange={v => updateConfig({ overtime_enabled: v })} /></Row>
        {r.overtime_enabled && (
          <Row label="Overtime Rate Multiplier" helper="Overtime Pay = Hours x (Daily Salary / Hours Per Day) x Rate">
            <NumInput value={r.overtime_rate_multiplier} onChange={v => updateConfig({ overtime_rate_multiplier: v })} suffix="x" min={0.1} />
          </Row>
        )}
        <SaveBar onSave={save} />
      </SectionCard>
    </div>
  )
}

function CompanyDeductionsTab() {
  const { config, saveConfig, updateConfig, activeEmployeeCount, totalEmployeeCount, refreshEmployeeCounts } = useSystemConfig()
  const { showToast } = useToast()
  const d = config

  const save = async () => { try { await saveConfig(config); showToast('Company deductions saved', 'success'); refreshEmployeeCounts() } catch { showToast('Failed to save', 'error') } }

  const taxPerEmp = activeEmployeeCount > 0 ? (d.annual_tax_bulk_amount || 0) / activeEmployeeCount / (d.payroll_frequency === 'monthly' ? 12 : 52) : 0
  const insPerEmp = activeEmployeeCount > 0 ? (d.annual_insurance_bulk_amount || 0) / activeEmployeeCount / (d.payroll_frequency === 'monthly' ? 12 : 52) : 0
  const hasEmployees = activeEmployeeCount > 0
  const inactiveCount = totalEmployeeCount - activeEmployeeCount

  return (
    <div className="space-y-4">
      <InfoBox>Tax and Company Insurance are company-level bulk amounts distributed automatically across active employees. These are not per-employee manual deductions.</InfoBox>
      <SectionCard title="Company-Level Settings" icon={Building2}>
        <Row label="Annual Tax Bulk Amount"><NumInput value={d.annual_tax_bulk_amount} onChange={v => updateConfig({ annual_tax_bulk_amount: v })} /></Row>
        <Row label="Annual Company Insurance Bulk Amount"><NumInput value={d.annual_insurance_bulk_amount} onChange={v => updateConfig({ annual_insurance_bulk_amount: v })} /></Row>
        <Row label="Payroll Frequency">
          <Sel value={d.payroll_frequency} onChange={v => updateConfig({ payroll_frequency: v })} options={[{ value: 'monthly', label: 'Monthly (/12)' }, { value: 'weekly', label: 'Weekly (/52)' }]} />
        </Row>
      </SectionCard>
      <SectionCard title="Employee Distribution" icon={Users}>
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
      </SectionCard>
      <SectionCard title="Calculation Preview" icon={Calculator}>
        {!hasEmployees ? (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
            <p className="text-xs text-amber-700 dark:text-amber-400">No active employees found. Bulk deductions cannot be distributed.</p>
          </div>
        ) : (
          <>
            <Row label="Tax Per Employee Per Year"><span className="text-sm font-medium text-gray-900 dark:text-gray-100">{fmt(d.annual_tax_bulk_amount / activeEmployeeCount)}</span></Row>
            <Row label={`Tax Per Employee Per ${d.payroll_frequency === 'monthly' ? 'Month' : 'Week'}`}><span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{fmt(taxPerEmp)}</span></Row>
            <div className="border-t border-gray-100 dark:border-gray-700 my-2" />
            <Row label="Insurance Per Employee Per Year"><span className="text-sm font-medium text-gray-900 dark:text-gray-100">{fmt(d.annual_insurance_bulk_amount / activeEmployeeCount)}</span></Row>
            <Row label={`Insurance Per Employee Per ${d.payroll_frequency === 'monthly' ? 'Month' : 'Week'}`}><span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{fmt(insPerEmp)}</span></Row>
            <div className="border-t border-gray-100 dark:border-gray-700 my-2" />
            <Row label="Total Per Employee Per Period"><span className="text-lg font-bold text-gray-900 dark:text-gray-100">{fmt(taxPerEmp + insPerEmp)}</span></Row>
          </>
        )}
        <SaveBar onSave={save} />
      </SectionCard>
    </div>
  )
}

function MedicalInsuranceTab() {
  const { config, saveConfig, updateConfig } = useSystemConfig()
  const { showToast } = useToast()
  const r = config

  const save = async () => { try { await saveConfig(config); showToast('Medical insurance rules saved', 'success') } catch { showToast('Failed to save', 'error') } }

  return (
    <div className="space-y-4">
      <SectionCard title="Medical Insurance" icon={Heart}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-300">Enabled</span>
          <Toggle checked={r.medical_insurance_enabled} onChange={v => updateConfig({ medical_insurance_enabled: v })} />
        </div>
        {!r.medical_insurance_enabled && <p className="text-xs text-gray-400">Medical insurance deduction is disabled.</p>}
        {r.medical_insurance_enabled && (
          <>
            <Row label="Deduction Type">
              <Sel value={r.medical_deduction_type} onChange={v => updateConfig({ medical_deduction_type: v })} options={[{ value: 'fixed', label: 'Fixed Amount' }, { value: 'percentage', label: 'Percentage of Base Salary' }]} />
            </Row>
            {r.medical_deduction_type === 'fixed' ? (
              <Row label="Fixed Monthly Amount"><NumInput value={r.medical_fixed_monthly_amount} onChange={v => updateConfig({ medical_fixed_monthly_amount: v })} /></Row>
            ) : (
              <Row label="Percentage Rate"><NumInput value={r.medical_percentage_rate} onChange={v => updateConfig({ medical_percentage_rate: v })} suffix="%" /></Row>
            )}
            <Row label="Apply To">
              <Sel value={r.medical_apply_to} onChange={v => updateConfig({ medical_apply_to: v })} options={[{ value: 'enabled_only', label: 'Employees with medical insurance enabled' }, { value: 'all_active', label: 'All active employees' }]} />
            </Row>
            <InfoBox>
              {r.medical_deduction_type === 'fixed'
                ? `Each eligible employee will have ${r.medical_fixed_monthly_amount} deducted monthly.`
                : `Each eligible employee will have ${r.medical_percentage_rate}% of their base salary deducted.`}
              Employees without medical insurance enabled will not be affected (unless &quot;All active&quot; is selected).
            </InfoBox>
          </>
        )}
        <SaveBar onSave={save} />
      </SectionCard>
    </div>
  )
}

function LoansTab() {
  const { config, saveConfig, updateConfig } = useSystemConfig()
  const { showToast } = useToast()
  const r = config

  const save = async () => { try { await saveConfig(config); showToast('Loan rules saved', 'success') } catch { showToast('Failed to save', 'error') } }

  return (
    <div className="space-y-4">
      <SectionCard title="Loan Deduction" icon={Banknote}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-300">Enabled</span>
          <Toggle checked={r.loan_enabled} onChange={v => updateConfig({ loan_enabled: v })} />
        </div>
        {!r.loan_enabled && <p className="text-xs text-gray-400">Loan deduction is disabled.</p>}
        {r.loan_enabled && (
          <>
            <Row label="Default Deduction Behavior">
              <Sel value={r.loan_default_behavior} onChange={v => updateConfig({ loan_default_behavior: v })} options={[{ value: 'fixed_installment', label: 'Fixed Monthly Installment' }, { value: 'remaining_divided', label: 'Remaining Balance / Remaining Months' }]} />
            </Row>
            <Row label="Auto-Deduct from Payroll" helper="Automatically deduct loan installments when processing payroll">
              <Toggle checked={r.loan_auto_deduct} onChange={v => updateConfig({ loan_auto_deduct: v })} />
            </Row>
            <InfoBox>Only employees with active loans will have deductions applied. Completed or paused loans will not generate deductions.</InfoBox>
          </>
        )}
        <SaveBar onSave={save} />
      </SectionCard>
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
    { action: 'Edit Attendance Configuration', superAdmin: true, hrAdmin: false, manager: false, employee: false },
    { action: 'Edit Payroll Rules', superAdmin: true, hrAdmin: false, manager: false, employee: false },
    { action: 'Manage Branches', superAdmin: true, hrAdmin: true, manager: false, employee: false },
    { action: 'View System Configuration', superAdmin: true, hrAdmin: true, manager: false, employee: false },
  ]

  const roles = ['superAdmin', 'hrAdmin', 'manager', 'employee']
  const roleLabels = { superAdmin: 'Super Admin', hrAdmin: 'HR Admin', manager: 'Manager', employee: 'Employee' }

  return (
    <div className="space-y-4">
      <InfoBox>
        Your role: <strong>{isSuperAdmin ? 'Super Admin' : isAdmin ? 'HR Admin' : 'N/A'}</strong>.
        Super Admin has full access. HR Admin can view but cannot edit critical financial rules.
      </InfoBox>
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
                      {p[r] ? <Check className="h-4 w-4 text-emerald-500 inline" /> : <X className="h-4 w-4 text-gray-300 dark:text-gray-600 inline" />}
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

function LanguageSection() {
  const { showToast } = useToast()
  const [lang, setLang] = useState({
    display_language: 'en',
    date_format: 'dd/mm/yyyy',
    time_format: '24h',
    currency_symbol: 'EGP',
    first_day_of_week: 'monday',
  })
  const upd = (key) => (v) => setLang(p => ({ ...p, [key]: v }))
  const save = () => {
    showToast('Language preferences saved', 'success')
    if (lang.display_language === 'fr') showToast('Display language set to French (requires page reload)', 'info')
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Display Settings" icon={Globe}>
        <Row label="Display Language">
          <Sel value={lang.display_language} onChange={upd('display_language')}
            options={[{ value: 'en', label: 'English' }, { value: 'fr', label: 'French' }]} />
        </Row>
        <Row label="Date Format">
          <Sel value={lang.date_format} onChange={upd('date_format')}
            options={[{ value: 'dd/mm/yyyy', label: 'DD/MM/YYYY' }, { value: 'mm/dd/yyyy', label: 'MM/DD/YYYY' }, { value: 'yyyy-mm-dd', label: 'YYYY-MM-DD' }]} />
        </Row>
        <Row label="Time Format">
          <Sel value={lang.time_format} onChange={upd('time_format')}
            options={[{ value: '12h', label: '12 Hour' }, { value: '24h', label: '24 Hour' }]} />
        </Row>
        <Row label="Currency Symbol">
          <Sel value={lang.currency_symbol} onChange={upd('currency_symbol')}
            options={[{ value: 'EGP', label: 'EGP (E£)' }, { value: 'USD', label: 'USD ($)' }, { value: 'EUR', label: 'EUR (€)' }, { value: 'SAR', label: 'SAR (﷼)' }, { value: 'AED', label: 'AED (د.إ)' }]} />
        </Row>
        <Row label="First Day of Week">
          <Sel value={lang.first_day_of_week} onChange={upd('first_day_of_week')}
            options={[{ value: 'monday', label: 'Monday' }, { value: 'sunday', label: 'Sunday' }, { value: 'saturday', label: 'Saturday' }]} />
        </Row>
        <SaveBar onSave={save} />
      </SectionCard>
    </div>
  )
}

export default function SystemConfiguration() {
  const { loading: configLoading } = useSystemConfig()
  const { isAdmin } = useAuth()
  const [activeSection, setActiveSection] = useState('profile')

  if (configLoading) {
    return <div className="flex items-center justify-center h-64"><p className="text-sm text-gray-400">Loading configuration...</p></div>
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">System Configuration</h1>
        <p className="mt-1 text-sm text-gray-500">Configure automated HR and payroll rules for your company</p>
      </motion.div>

      {!isAdmin && (
        <motion.div variants={fadeUp} className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3">
          <p className="text-xs text-amber-700 dark:text-amber-400">Only Super Admin can edit System Configuration. You have view access only.</p>
        </motion.div>
      )}

      <motion.div variants={fadeUp}>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-60 shrink-0">
            <nav className="card-base p-2 space-y-0.5 lg:sticky lg:top-4">
              {SECTIONS.map(section => {
                const Icon = section.icon
                const active = activeSection === section.id
                return (
                  <button key={section.id} onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 text-left ${active ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'}`}>
                    <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`} />
                    {section.label}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="flex-1 min-w-0">
            {activeSection === 'profile' && <CompanyProfileSection />}
            {activeSection === 'branches' && <BranchesTab />}
            {activeSection === 'attendance' && <AttendanceConfiguration />}
            {activeSection === 'payroll' && <PayrollRulesTab />}
            {activeSection === 'company' && <CompanyDeductionsTab />}
            {activeSection === 'medical' && <MedicalInsuranceTab />}
            {activeSection === 'loans' && <LoansTab />}
            {activeSection === 'permissions' && <PermissionsTab />}
            {activeSection === 'language' && <LanguageSection />}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
