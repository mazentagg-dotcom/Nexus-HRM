import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../../i18n'
import AnimatedTable from '../../components/AnimatedTable'
import Badge from '../../components/Badge'
import { getMyPayroll } from '../../api/hr'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

const statusColors = { paid: 'emerald', pending: 'amber', processing: 'blue', draft: 'gray' }

const fmt = n => '$' + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function MyPayslip() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState([])

  useEffect(() => {
    setLoading(true)
    getMyPayroll({ page: 1, pageSize: 100 })
      .then(r => { const d = r.data?.data; setRecords(d?.items || d || []) })
      .catch(() => setRecords([]))
      .finally(() => setLoading(false))
  }, [])

  const fmtDate = v => v ? new Date(v).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '--'

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('myPayslips')}</h1><p className="mt-1 text-sm text-gray-500">{t('payslipHistory')}</p></div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <div className="card-base overflow-hidden">
          <AnimatedTable
            columns={[
              { key: 'pay_period_start', label: 'Period', render: (_, r) => <span className="text-gray-500 text-xs">{fmtDate(r.pay_period_start)} - {fmtDate(r.pay_period_end)}</span> },
              { key: 'basic_salary', label: 'Basic Salary', render: v => <span className="font-medium">{fmt(v)}</span> },
              { key: 'gross_pay', label: 'Gross', render: v => <span className="font-medium text-blue-600">{fmt(v)}</span> },
              { key: 'total_deductions', label: 'Deductions', render: v => <span className="font-medium text-rose-600">{fmt(v)}</span> },
              { key: 'net_pay', label: 'Net Pay', render: v => <span className="font-bold text-emerald-600">{fmt(v)}</span> },
              { key: 'status', label: t('status'), render: v => <Badge color={statusColors[v] || 'gray'}>{v}</Badge> },
            ]}
            data={records}
            pageSize={10}
            loading={loading}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
