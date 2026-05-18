import { Save } from 'lucide-react'
import Button from '../../components/Button'

export const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
export const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

export const fmt = n => Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function Toggle({ checked, onChange, disabled }) {
  return (
    <button type="button" role="switch" aria-checked={checked} disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${checked ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

export function NumInput({ value, onChange, disabled, suffix, min, className }) {
  return (
    <div className="flex items-center gap-1.5">
      <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} disabled={disabled} min={min ?? 0}
        className={`w-24 text-right text-sm font-medium border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${className || ''}`} />
      {suffix && <span className="text-xs text-gray-400 whitespace-nowrap">{suffix}</span>}
    </div>
  )
}

export function TextInput({ value, onChange, disabled, placeholder, className }) {
  return (
    <input type="text" value={value ?? ''} onChange={e => onChange(e.target.value)} disabled={disabled} placeholder={placeholder}
      className={`text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${className || 'w-full max-w-xs'}`} />
  )
}

export function Sel({ value, onChange, options, disabled }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
      className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-indigo-500">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

export function Row({ label, helper, children }) {
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

export function SaveBar({ onSave }) {
  return (
    <div className="flex justify-end pt-4">
      <Button size="sm" onClick={onSave}><Save className="h-4 w-4 mr-1.5" />Save</Button>
    </div>
  )
}

export function SectionCard({ title, children, icon: Icon }) {
  return (
    <div className="card-base p-4 space-y-3">
      {title && (
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-indigo-500" />}
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
      )}
      {children}
    </div>
  )
}

export function InfoBox({ children }) {
  return (
    <div className="rounded-lg border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-900/20 p-3">
      <div className="flex items-start gap-2">
        <span className="text-xs text-indigo-700 dark:text-indigo-300">{children}</span>
      </div>
    </div>
  )
}
