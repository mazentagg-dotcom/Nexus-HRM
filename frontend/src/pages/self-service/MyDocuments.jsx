import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../../i18n'
import Badge from '../../components/Badge'
import { getMyEmployee, getEmployeeDocuments } from '../../api/hr'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
}

const docStatusColors = {
  uploaded: 'emerald', verified: 'blue', pending: 'amber',
  missing: 'rose', expired: 'gray',
}

const DOC_TYPES = [
  'National ID', 'Passport', 'CV', 'Medical Certificate', 'Employment Contract',
  'Education Certificate', 'Bank Statement', 'Reference Letter', 'Photo ID',
  'Tax Card', 'Social Insurance', 'Residence Permit', 'Other',
]

export default function MyDocuments() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [employee, setEmployee] = useState(null)
  const [docs, setDocs] = useState([])

  useEffect(() => {
    setLoading(true)
    getMyEmployee()
      .then(r => {
        const emp = r.data?.data || null
        setEmployee(emp)
        if (emp?.id) {
          getEmployeeDocuments({ page: 1, pageSize: 100, employee_id: emp.id })
            .then(r => {
              const d = r.data?.data
              setDocs(d?.items || d || [])
            })
            .catch(() => setDocs([]))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const docMap = {}
  for (const d of docs) {
    const key = d.doc_type || d.type || 'Unknown'
    docMap[key] = d
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('myDocuments')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('documentStatus')}</p>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card-base p-4 animate-pulse">
              <div className="h-4 w-24 rounded bg-gray-100 dark:bg-gray-700" />
              <div className="mt-3 h-3 w-16 rounded bg-gray-50 dark:bg-gray-700/50" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div variants={fadeUp} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DOC_TYPES.map(type => {
            const doc = docMap[type]
            const status = doc?.status || 'missing'
            return (
              <div key={type} className="card-base p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{type}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {doc?.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Not uploaded'}
                  </p>
                </div>
                <Badge color={docStatusColors[status] || 'gray'}>{status}</Badge>
              </div>
            )
          })}
        </motion.div>
      )}
    </motion.div>
  )
}
