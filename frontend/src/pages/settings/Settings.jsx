import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useI18n } from '../../i18n'
import Button from '../../components/Button'
import { useToast } from '../../components/feedback/Toast'
import { User, Mail, Shield, Bell, DollarSign, Percent, Calendar, Clock } from 'lucide-react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

export default function Settings() {
  const { t } = useI18n()
  const { user, isAdmin } = useAuth()
  const { showToast } = useToast()

  const [payrollSettings, setPayrollSettings] = useState({
    socialInsurance: 10,
    socialInsuranceType: 'percentage',
    taxRate: 15,
    taxType: 'percentage',
    overtimeRate: 1.5,
    lateDeduction: 25,
    lateDeductionType: 'fixed',
    absenceDeduction: 100,
    absenceDeductionType: 'fixed',
    defaultPayrollDay: 28,
  })

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nexus_payroll_settings')
      if (saved) setPayrollSettings(prev => ({ ...prev, ...JSON.parse(saved) }))
    } catch {}
  }, [])

  const handleSave = () => {
    localStorage.setItem('nexus_payroll_settings', JSON.stringify(payrollSettings))
    showToast('Settings saved', 'success')
  }

  const profile = {
    name: [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.name || 'Admin User',
    email: user?.email || 'admin@nexus-hrm.com',
    role: user?.roles?.[0]?.name || user?.role || 'Super Admin',
  }

  const SettingRow = ({ icon: Icon, label, value, onChange, disabled, suffix }) => (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-700 p-3">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          disabled={disabled}
          className="w-20 text-right text-sm font-medium border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {suffix && <span className="text-xs text-gray-400">{suffix}</span>}
      </div>
    </div>
  )

  const ToggleRow = ({ icon: Icon, label, value, onChange, disabled }) => (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-700 p-3">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      </div>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        <option value="percentage">%</option>
        <option value="fixed">$</option>
      </select>
    </div>
  )

  const canEditPayroll = isAdmin

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('settings')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('manageSettings')}</p>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card-base p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {(profile.name || 'A')[0]}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{profile.name}</h3>
              <p className="text-sm text-gray-500">{profile.role}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-gray-100 dark:border-gray-700 p-3">
              <User className="h-4 w-4 text-gray-400" /><div><p className="text-xs text-gray-400">Full Name</p><p className="text-sm text-gray-700 dark:text-gray-300">{profile.name}</p></div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-gray-100 dark:border-gray-700 p-3">
              <Mail className="h-4 w-4 text-gray-400" /><div><p className="text-xs text-gray-400">Email</p><p className="text-sm text-gray-700 dark:text-gray-300">{profile.email}</p></div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-gray-100 dark:border-gray-700 p-3">
              <Shield className="h-4 w-4 text-gray-400" /><div><p className="text-xs text-gray-400">Role</p><p className="text-sm text-gray-700 dark:text-gray-300">{profile.role}</p></div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-gray-100 dark:border-gray-700 p-3">
              <Bell className="h-4 w-4 text-gray-400" /><div><p className="text-xs text-gray-400">Notifications</p><p className="text-sm text-gray-700 dark:text-gray-300">Email & In-app enabled</p></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card-base p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('payrollSettings')}</h3>
            {!canEditPayroll && (
              <div className="mb-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2">
                <p className="text-xs text-amber-700 dark:text-amber-400">Only Super Admin can edit these values.</p>
              </div>
            )}
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-700 p-3">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t('socialInsurance')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={payrollSettings.socialInsurance}
                    onChange={e => setPayrollSettings(p => ({ ...p, socialInsurance: Number(e.target.value) }))}
                    disabled={!canEditPayroll}
                    className="w-20 text-right text-sm font-medium border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <select
                    value={payrollSettings.socialInsuranceType}
                    onChange={e => setPayrollSettings(p => ({ ...p, socialInsuranceType: e.target.value }))}
                    disabled={!canEditPayroll}
                    className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-1 py-1 bg-white dark:bg-gray-700 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">$</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-700 p-3">
                <div className="flex items-center gap-3">
                  <Percent className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t('taxDeduction')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={payrollSettings.taxRate}
                    onChange={e => setPayrollSettings(p => ({ ...p, taxRate: Number(e.target.value) }))}
                    disabled={!canEditPayroll}
                    className="w-20 text-right text-sm font-medium border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <select
                    value={payrollSettings.taxType}
                    onChange={e => setPayrollSettings(p => ({ ...p, taxType: e.target.value }))}
                    disabled={!canEditPayroll}
                    className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-1 py-1 bg-white dark:bg-gray-700 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">$</option>
                  </select>
                </div>
              </div>

              <SettingRow icon={Clock} label={t('overtimeRate')} value={payrollSettings.overtimeRate} onChange={v => setPayrollSettings(p => ({ ...p, overtimeRate: v }))} disabled={!canEditPayroll} suffix="x" />
              <SettingRow icon={Clock} label={t('lateDeduction')} value={payrollSettings.lateDeduction} onChange={v => setPayrollSettings(p => ({ ...p, lateDeduction: v }))} disabled={!canEditPayroll} suffix={payrollSettings.lateDeductionType === 'percentage' ? '%' : '$'} />
              <SettingRow icon={Clock} label={t('absenceDeduction')} value={payrollSettings.absenceDeduction} onChange={v => setPayrollSettings(p => ({ ...p, absenceDeduction: v }))} disabled={!canEditPayroll} suffix={payrollSettings.absenceDeductionType === 'percentage' ? '%' : '$'} />
              <SettingRow icon={Calendar} label={t('defaultPayrollDay')} value={payrollSettings.defaultPayrollDay} onChange={v => setPayrollSettings(p => ({ ...p, defaultPayrollDay: v }))} disabled={!canEditPayroll} />

              {canEditPayroll && (
                <div className="flex justify-end pt-2">
                  <Button size="sm" onClick={handleSave}>{t('save')}</Button>
                </div>
              )}
            </div>
          </div>

          <div className="card-base p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Application Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center rounded-lg border border-gray-100 dark:border-gray-700 p-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">Version</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">1.0.0</span>
              </div>
              <div className="flex justify-between items-center rounded-lg border border-gray-100 dark:border-gray-700 p-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">Application</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Nexus HRM</span>
              </div>
              <div className="flex justify-between items-center rounded-lg border border-gray-100 dark:border-gray-700 p-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">Environment</span>
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-full px-2 py-0.5">Production</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
