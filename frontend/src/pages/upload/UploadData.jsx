import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Button from '../../components/Button'
import { useToast } from '../../components/feedback/Toast'
import { useI18n } from '../../i18n'
import { EMPLOYEE_TEMPLATE_HEADERS } from '../../constants/hr'
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, Trash2 } from 'lucide-react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

export default function UploadData() {
  const { t } = useI18n()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState([])
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const fileRef = useRef()
  const { showToast } = useToast()

  const handleDownloadTemplate = () => {
    const csv = [EMPLOYEE_TEMPLATE_HEADERS.join(','), 'John Doe,EMP-012,john@company.com,+1234567890,Engineering,Developer,Main Office,2026-01-15,full_time,5000,active'].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'employee_template.csv'
    a.click()
    URL.revokeObjectURL(url)
    showToast('Template downloaded', 'success')
  }

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setImportResult(null)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target.result
      const lines = text.split('\n').filter(l => l.trim())
      if (lines.length < 2) { setPreview([]); return }
      const headers = lines[0].split(',').map(h => h.trim())
      const rows = lines.slice(1, 6).map((line, i) => {
        const vals = line.split(',').map(v => v.trim())
        const row = {}
        headers.forEach((h, j) => { row[h] = vals[j] || '' })
        row._idx = i + 1
        return row
      })
      setPreview(rows)
    }
    reader.readAsText(f)
  }

  const handleImport = () => {
    if (!file) { showToast('Select a file first', 'error'); return }
    setImporting(true)
    setTimeout(() => {
      setImporting(false)
      setImportResult({ success: true, count: preview.length || 1 })
      showToast(`Imported ${preview.length || 1} employees`, 'success')
    }, 1500)
  }

  const handleClear = () => {
    setFile(null)
    setPreview([])
    setImportResult(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('uploadData')}</h1>
        <p className="mt-1 text-sm text-gray-500">Import employee data using a CSV template.</p>
      </motion.div>

      <motion.div variants={fadeUp} className="card-base p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button size="sm" variant="outline" icon={Download} onClick={handleDownloadTemplate}>{t('downloadTemplate')}</Button>
          <div className="relative">
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileSelect} className="hidden" />
            <Button size="sm" icon={Upload} onClick={() => fileRef.current?.click()}>{t('uploadFile')}</Button>
          </div>
          {file && (
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-indigo-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
              <button onClick={handleClear} className="rounded p-1 text-gray-400 hover:text-rose-500"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          )}
        </div>

        {preview.length > 0 && !importResult && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('preview')} ({preview.length} rows)</h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">#</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">ID</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Email</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Department</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Branch</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map(row => (
                    <tr key={row._idx} className="border-t border-gray-100 dark:border-gray-700">
                      <td className="px-3 py-2 text-gray-400">{row._idx}</td>
                      <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{row['Employee Name'] || '--'}</td>
                      <td className="px-3 py-2 text-gray-500 font-mono">{row['Employee ID'] || '--'}</td>
                      <td className="px-3 py-2 text-gray-500">{row['Email'] || '--'}</td>
                      <td className="px-3 py-2 text-gray-500">{row['Department'] || '--'}</td>
                      <td className="px-3 py-2 text-gray-500">{row['Branch'] || '--'}</td>
                      <td className="px-3 py-2 text-gray-500">{row['Basic Salary'] || '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end">
              <Button loading={importing} onClick={handleImport}>{t('import')}</Button>
            </div>
          </div>
        )}

        {importResult && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-6 text-center">
            <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Import Successful</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{importResult.count} employee(s) imported successfully.</p>
            <Button size="sm" variant="outline" className="mt-3" onClick={handleClear}>{t('uploadFile')} (Another)</Button>
          </motion.div>
        )}

        {!file && !importResult && (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
            <Upload className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No file selected. Download the template first, fill it, then upload.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
