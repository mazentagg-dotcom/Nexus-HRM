import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../../i18n'
import AnimatedTable from '../../components/AnimatedTable'
import Badge from '../../components/Badge'
import { getEmployeeDocuments, getEmployees } from '../../api/hr'
import { FileText } from 'lucide-react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

const typeColors = { contract: 'blue', id_card: 'emerald', passport: 'purple', tax_form: 'amber', certificate: 'sky', other: 'gray' }
const fmtBytes = b => b >= 1000000 ? (b / 1000000).toFixed(1) + ' MB' : (b / 1000).toFixed(0) + ' KB'
const formatDate = d => { if (!d) return ''; try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return d } }

export default function Documents() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState([])
  const [employees, setEmployees] = useState([])

  useEffect(() => {
    Promise.all([
      getEmployeeDocuments({ page: 1, pageSize: 100 }).then(r => { const d = r.data?.data; return d?.items || d || [] }).catch(() => []),
      getEmployees({ page: 1, pageSize: 100 }).then(r => { const d = r.data?.data; return d?.items || d || [] }).catch(() => []),
    ]).then(([docs, emps]) => {
      setDocuments(docs)
      setEmployees(emps)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('documents')}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('manageDocumentsDesc')}</p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <AnimatedTable columns={[
          { key: 'document_name', label: t('document'), render: (v, r) => (
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${r.file_type?.includes('pdf') ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600' : 'bg-sky-100 dark:bg-sky-900/30 text-sky-600'}`}><FileText className="h-4 w-4" /></div>
              <div><p className="text-sm font-medium text-gray-900 dark:text-gray-100">{v}</p><p className="text-[11px] text-gray-400 dark:text-gray-500">{r.file_type}</p></div>
            </div>
          )},
          { key: 'document_type', label: t('type'), render: v => <Badge color={typeColors[v] || 'gray'}>{v ? v.replace(/_/g, ' ') : v}</Badge> },
          { key: 'employee_id', label: t('employee'), render: v => { const emp = employees.find(e => e.id === v); return emp ? <span className="text-gray-700 dark:text-gray-300 text-xs">{emp.first_name} {emp.last_name}</span> : <span className="text-gray-400 dark:text-gray-500 text-xs">{v}</span> }},
          { key: 'file_size', label: t('size'), render: v => <span className="text-gray-500 dark:text-gray-400 text-xs">{v ? fmtBytes(v) : '-'}</span> },
          { key: 'expiry_date', label: t('expires'), render: v => v ? <span className="text-gray-400 dark:text-gray-500 text-xs">{formatDate(v)}</span> : <span className="text-gray-300 dark:text-gray-600 text-xs">-</span> },
          { key: 'created_at', label: t('uploaded'), render: v => <span className="text-gray-400 dark:text-gray-500 text-xs">{formatDate(v)}</span> },
        ]} data={documents} pageSize={10} loading={loading} />
      </motion.div>
    </motion.div>
  )
}
