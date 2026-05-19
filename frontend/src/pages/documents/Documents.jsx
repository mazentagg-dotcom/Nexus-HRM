import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../../components/Button'
import AnimatedTable from '../../components/AnimatedTable'
import Badge from '../../components/Badge'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/feedback/Toast'
import { useI18n } from '../../i18n'
import { getEmployees, getEmployeeDocuments, createEmployeeDocument, deleteEmployeeDocument } from '../../api/hr'
import { Search, Eye, Upload, Download, CheckCircle, Trash2, ShieldCheck, XCircle, FileText, AlertTriangle } from 'lucide-react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

const DOC_TYPES = [
  'resume', 'cover_letter', 'id_card', 'passport', 'driving_license',
  'degree_certificate', 'transcript', 'professional_certification',
  'offer_letter', 'employment_contract', 'nda', 'tax_form',
  'medical_record', 'visa', 'work_permit', 'reference_letter',
  'performance_review', 'other',
]

const DOC_TYPE_LABELS = {
  resume: 'Resume / CV', cover_letter: 'Cover Letter', id_card: 'National ID',
  passport: 'Passport', driving_license: 'Driving License', degree_certificate: 'Degree Certificate',
  transcript: 'Transcript', professional_certification: 'Professional Cert',
  offer_letter: 'Offer Letter', employment_contract: 'Employment Contract',
  nda: 'NDA', tax_form: 'Tax Card', medical_record: 'Medical Record',
  visa: 'Visa', work_permit: 'Work Permit', reference_letter: 'Reference Letter',
  performance_review: 'Performance Review', other: 'Other',
}

const DOC_TYPE_ICONS = {
  id_card: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
  passport: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
  employment_contract: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600',
  medical_record: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600',
  tax_form: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600',
  resume: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600',
  other: 'bg-gray-100 dark:bg-gray-700 text-gray-500',
}

const statusColors = { verified: 'emerald', uploaded: 'blue', missing: 'rose', expired: 'amber' }

function getDocStatusForType(docs, docType) {
  const match = docs.find(d => d.document_type === docType)
  if (!match) return { status: 'missing', doc: null }
  const expired = match.expires_at && new Date(match.expires_at) < new Date()
  return { status: match.is_verified ? 'verified' : expired ? 'expired' : 'uploaded', doc: match }
}

function getCompletionPct(docs) {
  if (!DOC_TYPES.length) return 0
  const present = DOC_TYPES.filter(t => docs.some(d => d.document_type === t)).length
  return Math.round((present / DOC_TYPES.length) * 100)
}

function DocumentDrawer({ employee, onClose }) {
  const { t } = useI18n()
  const { showToast } = useToast()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [verifyModal, setVerifyModal] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)

  useEffect(() => {
    setLoading(true)
    getEmployeeDocuments({ employee_id: employee.id, page: 1, pageSize: 200 })
      .then(r => {
        const items = r.data?.data?.items || r.data?.data || r.data || []
        setDocuments(Array.isArray(items) ? items : [])
      })
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false))
  }, [employee])

  const verified = documents.filter(d => d.is_verified).length
  const missing = DOC_TYPES.filter(t => !documents.some(d => d.document_type === t)).length
  const expired = documents.filter(d => d.expires_at && new Date(d.expires_at) < new Date()).length

  const handleUpload = (docType) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.jpg,.png,.doc,.docx'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      createEmployeeDocument({
        employee_id: employee.id,
        document_type: docType,
        title: DOC_TYPE_LABELS[docType] || docType,
        file_url: `uploads/${file.name}`,
        file_name: file.name,
        file_size: file.size,
      })
        .then(() => {
          setDocuments(prev => [...prev, {
            id: 'new-' + Date.now(),
            document_type: docType,
            title: DOC_TYPE_LABELS[docType] || docType,
            file_name: file.name,
            is_verified: false,
          }])
          showToast(`${DOC_TYPE_LABELS[docType] || docType} ${t('uploaded')}`, 'success')
        })
        .catch(() => showToast(t('error'), 'error'))
    }
    input.click()
  }

  const handleDelete = () => {
    if (!deleteModal) return
    const doc = documents.find(d => d.document_type === deleteModal)
    if (doc && doc.id && !doc.id.startsWith('new-')) {
      deleteEmployeeDocument(doc.id)
        .catch(() => {})
    }
    setDocuments(prev => prev.filter(d => d.document_type !== deleteModal))
    showToast(`${DOC_TYPE_LABELS[deleteModal] || deleteModal} ${t('deleted')}`, 'success')
    setDeleteModal(null)
  }

  const handleDownload = (doc) => {
    const lines = [`Document: ${DOC_TYPE_LABELS[doc.document_type] || doc.document_type}`, `Employee: ${employee.first_name} ${employee.last_name}`, `Status: ${doc.is_verified ? 'Verified' : 'Pending'}`, `File: ${doc.file_name || 'N/A'}`]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${(doc.file_name || 'document').replace(/\s+/g, '_')}.txt`; a.click()
    URL.revokeObjectURL(url)
    showToast(t('documentDownloaded'), 'success')
  }

  const docIconClass = (type) => DOC_TYPE_ICONS[type] || 'bg-gray-100 dark:bg-gray-700 text-gray-500'

  return (
    <>
      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      </AnimatePresence>
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white dark:bg-gray-800 shadow-2xl flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('employeeDocuments')}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{employee.first_name} {employee.last_name} &middot; {employee.employee_code || employee.id?.slice(0, 8)}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600"><XCircle className="h-5 w-5" /></button>
        </div>

        <div className="grid grid-cols-4 gap-3 p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="text-center"><p className="text-lg font-bold text-gray-900 dark:text-gray-100">{DOC_TYPES.length}</p><p className="text-[10px] text-gray-400">{t('totalDocs')}</p></div>
          <div className="text-center"><p className="text-lg font-bold text-emerald-600">{verified}</p><p className="text-[10px] text-gray-400">{t('verified')}</p></div>
          <div className="text-center"><p className="text-lg font-bold text-rose-600">{missing}</p><p className="text-[10px] text-gray-400">{t('missing')}</p></div>
          <div className="text-center"><p className="text-lg font-bold text-amber-600">{expired}</p><p className="text-[10px] text-gray-400">{t('expired')}</p></div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading && <p className="text-sm text-gray-400 text-center py-8">Loading...</p>}
          {!loading && DOC_TYPES.map(docType => {
            const { status, doc } = getDocStatusForType(documents, docType)
            const label = DOC_TYPE_LABELS[docType] || docType
            return (
              <div key={docType} className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${docIconClass(docType)}`}><FileText className="h-5 w-5" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{doc?.file_name || t('noFile')} &middot; {doc?.created_at?.slice(0, 10) || '—'}</p>
                </div>
                <Badge color={statusColors[status] || 'gray'}>{status}</Badge>
                <div className="flex items-center gap-1">
                  {status !== 'missing' && (
                    <button onClick={() => handleDownload(doc)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600" title={t('downloadPayslip')}><Download className="h-3.5 w-3.5" /></button>
                  )}
                  <button onClick={() => handleUpload(docType)} className="rounded-lg p-1.5 text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20" title={t('uploadFile')}><Upload className="h-3.5 w-3.5" /></button>
                  {status !== 'missing' && (
                    <button onClick={() => setDeleteModal(docType)} className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20" title={t('delete')}><Trash2 className="h-3.5 w-3.5" /></button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <Modal isOpen={deleteModal !== null} onClose={() => setDeleteModal(null)} title={t('deleteDocument')} size="sm" footer={
          <><Button variant="secondary" onClick={() => setDeleteModal(null)}>{t('cancel')}</Button><Button className="bg-rose-600 hover:bg-rose-700" onClick={handleDelete}>{t('delete')}</Button></>
        }>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
            <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
            <p className="text-sm text-rose-700 dark:text-rose-300">{t('deleteDocWarning')} <strong>{DOC_TYPE_LABELS[deleteModal] || deleteModal}</strong>?</p>
          </div>
        </Modal>
      </motion.div>
    </>
  )
}

export default function Documents() {
  const { t } = useI18n()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  useEffect(() => {
    Promise.all([
      getEmployees({ page: 1, pageSize: 200, status: 'active' }).then(r => r.data?.data?.items || r.data?.data || []),
      getEmployeeDocuments({ page: 1, pageSize: 500 }).then(r => r.data?.data?.items || r.data?.data || []),
    ])
      .then(([emps, docs]) => {
        const enriched = emps.map(e => {
          const empDocs = docs.filter(d => d.employee_id === e.id)
          return { ...e, _docs: empDocs, _completion: getCompletionPct(empDocs) }
        })
        setEmployees(enriched)
        setFiltered(enriched)
      })
      .catch(() => { setEmployees([]); setFiltered([]) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!search.trim()) { setFiltered(employees); return }
    const q = search.toLowerCase()
    setFiltered(employees.filter(e =>
      `${e.first_name} ${e.last_name} ${e.employee_code || ''} ${e.email || ''}`.toLowerCase().includes(q)
    ))
  }, [search, employees])

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('documents')}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('viewManageDocumentsDesc')}</p>
      </motion.div>

      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder={t('search') + '...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <AnimatedTable columns={[
          { key: 'employee_code', label: t('employeeId'), render: v => <span className="text-gray-500 dark:text-gray-400 text-xs font-mono">{v || '—'}</span> },
          { key: 'name', label: t('employeeName'), render: (_, r) => <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{r.first_name} {r.last_name}</span> },
          { key: 'department', label: t('department'), render: v => <span className="text-gray-500 dark:text-gray-400 text-xs">{v || '—'}</span> },
          { key: 'position', label: t('designation'), render: v => <span className="text-gray-500 dark:text-gray-400 text-xs">{v || '—'}</span> },
          { key: 'completion', label: t('completion'), render: (_, r) => {
            const pct = r._completion
            const color = pct === 100 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-rose-600'
            return (
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden"><div className={`h-full rounded-full ${pct === 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${pct}%` }} /></div>
                <span className={`text-xs font-medium ${color}`}>{pct}%</span>
              </div>
            )
          }},
          { key: 'missing', label: t('missing'), render: (_, r) => {
            const count = DOC_TYPES.filter(t => !r._docs.some(d => d.document_type === t)).length
            return count > 0 ? <Badge color="rose">{count}</Badge> : <span className="text-gray-300 dark:text-gray-600 text-xs">0</span>
          }},
          { key: 'actions', label: t('actions'), render: (_, r) => (
            <button onClick={() => setSelectedEmployee(r)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
              <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{t('view')}</span>
            </button>
          )},
        ]} data={filtered} pageSize={10} loading={loading} emptyMessage={t('noEmployees')} />
      </motion.div>

      <AnimatePresence>
        {selectedEmployee && (
          <DocumentDrawer employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
