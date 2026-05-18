import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Button from '../../components/Button'
import Badge from '../../components/Badge'
import AnimatedTable from '../../components/AnimatedTable'
import { useToast } from '../../components/feedback/Toast'
import { useI18n } from '../../i18n'
import { createEmployee } from '../../api/hr'
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertTriangle, Trash2, Users, ShieldCheck, ClipboardCheck } from 'lucide-react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

const FIELD_ALIASES = {
  'Employee ID': ['employee id', 'emp id', 'employee_id', 'emp_id', 'staff id', 'staff_id', 'worker id', 'worker_id', 'id', 'code', 'employee code', 'staff code'],
  'Employee Name': ['employee name', 'employee_name', 'emp name', 'emp_name', 'staff name', 'staff_name', 'worker name', 'worker_name', 'full name', 'fullname', 'name'],
  'Email': ['email', 'email address', 'email_address', 'work email', 'work_email', 'employee email', 'staff email'],
  'Phone': ['phone', 'phone number', 'phone_number', 'mobile', 'mobile number', 'mobile_number', 'contact', 'contact number', 'telephone'],
  'Department': ['department', 'dept', 'dept.', 'section', 'team', 'unit'],
  'Designation': ['designation', 'job title', 'job_title', 'title', 'position', 'role'],
  'Branch': ['branch', 'office', 'location', 'site', 'workplace', 'work location', 'work_location'],
  'Employment Date': ['employment date', 'employment_date', 'hire date', 'hire_date', 'joining date', 'joining_date', 'date of joining', 'start date', 'start_date', 'joined on'],
  'Employment Type': ['employment type', 'employment_type', 'contract type', 'contract_type', 'type', 'work type'],
  'Basic Salary': ['basic salary', 'basic_salary', 'salary', 'base salary', 'base_salary', 'monthly salary', 'monthly_salary', 'wage', 'pay'],
  'Status': ['status', 'employee status', 'active status', 'employment status', 'state'],
  'HR Name': ['hr name', 'hr_name', 'hr', 'recruiter', 'recruiter name', 'responsible hr', 'assigned hr', 'onboarding hr'],
}

const TEMPLATE_HEADERS = ['HR Name', 'Employee ID', 'Employee Name', 'Email', 'Phone', 'Department', 'Designation', 'Branch', 'Employment Date', 'Employment Type', 'Basic Salary', 'Status']

const normalize = (s) => s.toLowerCase().replace(/[_-]/g, ' ').replace(/\s+/g, ' ').trim()

const matchField = (header) => {
  const norm = normalize(header)
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    if (normalize(field) === norm) return { field, confidence: 'high' }
    for (const alias of aliases) {
      if (normalize(alias) === norm) return { field, confidence: 'high' }
    }
  }
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    for (const alias of aliases) {
      const aliasNorm = normalize(alias)
      if (aliasNorm.length >= 3 && (norm.includes(aliasNorm) || aliasNorm.includes(norm))) return { field, confidence: 'medium' }
    }
  }
  return { field: null, confidence: 'none' }
}

const parseCSVLine = (line) => {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) { result.push(current); current = '' }
    else current += ch
  }
  result.push(current)
  return result
}

const parseSalary = (v) => { if (!v) return 0; const n = String(v).replace(/[^0-9.\-]/g, ''); return parseFloat(n) || 0 }
const parseDateFlexible = (v) => { if (!v) return null; const s = String(v).trim(); const m = s.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/); if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`; const m2 = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/); if (m2) return `${m2[3]}-${m2[1].padStart(2, '0')}-${m2[2].padStart(2, '0')}`; return null }

const validateRow = (mapped) => {
  const name = mapped['Employee Name']?.trim()
  const id = mapped['Employee ID']?.trim()
  const email = mapped['Email']?.trim()
  if (!name) return 'error'
  if (!id && !email) return 'error'
  const warnings = []
  if (!id && email) warnings.push('id_generated')
  if (!email && id) warnings.push('email_missing')
  const date = parseDateFlexible(mapped['Employment Date'])
  if (!date && mapped['Employment Date']?.trim()) warnings.push('date_uncertain')
  const sal = parseSalary(mapped['Basic Salary'])
  if (sal === 0 && mapped['Basic Salary']?.trim()) warnings.push('salary_uncertain')
  if (warnings.length > 0) return 'review'
  return 'ready'
}

export default function Onboarding() {
  const { t } = useI18n()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState([])
  const [columnMap, setColumnMap] = useState([])
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const fileRef = useRef()
  const { showToast } = useToast()

  const stats = {
    total: preview.length,
    ready: preview.filter(r => r._status === 'ready').length,
    review: preview.filter(r => r._status === 'review').length,
    error: preview.filter(r => r._status === 'error').length,
  }

  const handleDownloadTemplate = () => {
    const exampleRow = [
      'John Smith', 'EMP-001', 'john.smith@company.com', '+1234567890',
      'Engineering', 'Software Engineer', 'Main Office', '2026-01-15', 'full_time', '5000', 'active',
    ].join(',')
    const csv = [TEMPLATE_HEADERS.join(','), exampleRow].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'employee_template.csv'
    a.click()
    URL.revokeObjectURL(url)
    showToast(t('templateDownloaded'), 'success')
  }

  const processFile = (text) => {
    const lines = text.split('\n').filter(l => l.trim())
    if (lines.length < 2) { setPreview([]); setColumnMap([]); return }
    const headers = parseCSVLine(lines[0])
    const mapping = headers.map(h => ({ header: h, ...matchField(h) }))
    setColumnMap(mapping)
    const rows = lines.slice(1).map((line, i) => {
      const vals = parseCSVLine(line)
      const mapped = {}
      mapping.forEach((m, j) => { mapped[m.field] = m.field ? (vals[j] || '') : '' })
      mapped._idx = i + 1
      mapped._status = validateRow(mapped)
      return mapped
    })
    setPreview(rows)
  }

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setImportResult(null)
    const reader = new FileReader()
    reader.onload = (ev) => processFile(ev.target.result)
    reader.readAsText(f)
  }

  const handleImport = async () => {
    if (!file) { showToast(t('selectAFileFirst'), 'error'); return }
    setImporting(true)
    let imported = 0, review = 0, errors = 0
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(l => l.trim())
      if (lines.length < 2) { setImporting(false); return }
      const headers = parseCSVLine(lines[0])
      const mapping = headers.map(h => matchField(h))
      for (let i = 1; i < lines.length; i++) {
        const vals = parseCSVLine(lines[i])
        const mapped = {}
        mapping.forEach((m, j) => { mapped[m.field] = m.field ? (vals[j] || '') : '' })
        const name = mapped['Employee Name']?.trim()
        if (!name) { errors++; continue }
        const id = mapped['Employee ID']?.trim() || ''
        const email = mapped['Email']?.trim() || ''
        if (!id && !email) { errors++; continue }
        try {
          await createEmployee({
            first_name: name.split(' ')[0] || name,
            last_name: name.split(' ').slice(1).join(' ') || '',
            email: email || undefined,
            phone: mapped['Phone']?.trim() || undefined,
            employee_code: id || undefined,
            department_id: undefined,
            position: mapped['Designation']?.trim() || undefined,
            employment_type: mapped['Employment Type']?.trim() || 'full_time',
            hire_date: parseDateFlexible(mapped['Employment Date']) || new Date().toISOString().slice(0, 10),
            salary: parseSalary(mapped['Basic Salary']) || undefined,
          })
          imported++
        } catch { errors++ }
      }
      setImportResult({ imported, errors })
      showToast(`${t('imported')} ${imported}${errors ? `, ${errors} ${t('failed')}` : ''}`, imported > 0 ? 'success' : 'warning')
    } catch {
      showToast(t('importFailed'), 'error')
    } finally {
      setImporting(false)
    }
  }

  const handleClear = () => {
    setFile(null)
    setPreview([])
    setColumnMap([])
    setImportResult(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const statusConfig = {
    ready: { color: 'emerald', label: t('ready') },
    review: { color: 'amber', label: t('needsReview') },
    error: { color: 'rose', label: t('error') },
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('onboarding')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('importOnboardDesc')}</p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card-base p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-100 dark:ring-emerald-800"><Users className="h-6 w-6 text-emerald-600" /></div>
          <div><p className="text-sm text-gray-500 dark:text-gray-400">{t('employeesImported')}</p><p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{importResult ? importResult.imported : stats.total}</p></div>
        </div>
        <div className="card-base p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20 ring-1 ring-amber-100 dark:ring-amber-800"><AlertTriangle className="h-6 w-6 text-amber-600" /></div>
          <div><p className="text-sm text-gray-500 dark:text-gray-400">{t('pendingValidation')}</p><p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.review}</p></div>
        </div>
        <div className="card-base p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-100 dark:ring-indigo-800"><ShieldCheck className="h-6 w-6 text-indigo-600" /></div>
          <div><p className="text-sm text-gray-500 dark:text-gray-400">{t('readyToOnboard')}</p><p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.ready}</p></div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="card-base p-6 space-y-6">
        <div className="flex items-center gap-4 flex-wrap">
          <Button size="sm" variant="outline" icon={Download} onClick={handleDownloadTemplate}>{t('downloadTemplate')}</Button>
          <div className="relative">
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileSelect} className="hidden" />
            <Button size="sm" icon={Upload} onClick={() => fileRef.current?.click()}>{t('uploadFile')}</Button>
          </div>
          {file && (
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-indigo-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
              <button onClick={handleClear} className="rounded p-1 text-gray-400 hover:text-rose-500" title={t('clear')}><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          )}
        </div>

        {columnMap.length > 0 && !importResult && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('columnMapping')}</h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{t('uploadedColumn')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{t('detectedField')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{t('confidence')}</th>
                  </tr>
                </thead>
                <tbody>
                  {columnMap.map((m, i) => (
                    <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                      <td className="px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 font-mono">{m.header}</td>
                      <td className="px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-gray-100">{m.field || <span className="text-gray-400">—</span>}</td>
                      <td className="px-3 py-1.5"><Badge color={m.confidence === 'high' ? 'emerald' : m.confidence === 'medium' ? 'amber' : 'gray'}>{m.confidence}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {preview.length > 0 && !importResult && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('preview')} ({preview.length} {t('rows')})</h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">#</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{t('employeeId')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{t('employeeName')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{t('email')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{t('department')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{t('designation')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{t('branch')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{t('employmentDate')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{t('status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 20).map(row => (
                    <tr key={row._idx} className="border-t border-gray-100 dark:border-gray-700">
                      <td className="px-3 py-2 text-gray-400 dark:text-gray-500 text-xs">{row._idx}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400 text-xs font-mono">{row['Employee ID'] || '—'}</td>
                      <td className="px-3 py-2 text-gray-900 dark:text-gray-100 text-xs font-medium">{row['Employee Name'] || '—'}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400 text-xs">{row['Email'] || '—'}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400 text-xs">{row['Department'] || '—'}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400 text-xs">{row['Designation'] || '—'}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400 text-xs">{row['Branch'] || '—'}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400 text-xs">{row['Employment Date'] || '—'}</td>
                      <td className="px-3 py-2 text-xs"><Badge color={statusConfig[row._status]?.color || 'gray'}>{statusConfig[row._status]?.label || row._status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 20 && <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">... {preview.length - 20} more rows</p>}
            </div>
            <div className="flex justify-end">
              <Button loading={importing} onClick={handleImport}>{t('import')} ({preview.length})</Button>
            </div>
          </div>
        )}

        {importResult && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-6 text-center">
            <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">{t('importSuccessful')}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{t('imported')} {importResult.imported} {t('employeesImported')}{importResult.errors ? `, ${importResult.errors} ${t('failed')}` : ''}</p>
            <Button size="sm" variant="outline" className="mt-3" icon={ClipboardCheck} onClick={handleClear}>{t('importAnother')}</Button>
          </motion.div>
        )}

        {!file && !importResult && (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
            <Upload className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('noFileSelectedDesc')}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
