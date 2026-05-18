import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AnimatedTable from '../../components/AnimatedTable'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import { getPayrollRecords } from '../../api/hr'
import { useI18n } from '../../i18n'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

const statusColors = { paid: 'emerald', pending: 'amber', processing: 'blue' }
const fmt = n => '$' + Number(n).toLocaleString()

export default function Payroll() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState([])
  const [thisMonth, setThisMonth] = useState(false)

  useEffect(() => {
    setLoading(true)
    getPayrollRecords({ page: 1, pageSize: 100 })
      .then(r => {
        let data = r.data?.data?.items || r.data?.data || []
        if (thisMonth) {
          const now = new Date()
          const m = now.getMonth()
          const y = now.getFullYear()
          data = data.filter(d => {
            if (!d.pay_period_start) return false
            const pd = new Date(d.pay_period_start)
            return pd.getMonth() === m && pd.getFullYear() === y
          })
        }
        setRecords(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [thisMonth])

  const totalPayroll = records.reduce((s, p) => s + (p.net_pay || 0), 0)
  const paid = records.filter(p => p.status === 'paid').length

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('payroll')}</h1><p className="mt-1 text-sm text-gray-500">{t('managePayroll')}</p></div>
        <Button size="sm" variant={thisMonth ? 'primary' : 'secondary'} onClick={() => setThisMonth(p => !p)}>{t('thisMonth')}</Button>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card-base p-5"><p className="text-sm text-gray-500 dark:text-gray-400">Total Payroll</p><p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{loading ? '-' : fmt(totalPayroll)}</p></div>
        <div className="card-base p-5"><p className="text-sm text-gray-500 dark:text-gray-400">Records</p><p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{loading ? '-' : records.length}</p></div>
        <div className="card-base p-5"><p className="text-sm text-gray-500 dark:text-gray-400">Paid</p><p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{loading ? '-' : `${paid}/${records.length}`}</p></div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <div className="card-base overflow-hidden">
          <AnimatedTable columns={[
            { key: 'employee_name', label: t('employeeName'), render: v => <span className="font-medium text-gray-900 dark:text-gray-100">{v || '--'}</span> },
            { key: 'gross_pay', label: t('grossSalary'), render: v => <span className="text-gray-500 text-xs">{fmt(v)}</span> },
            { key: 'total_deductions', label: t('totalDeductions'), render: v => <span className="text-rose-500 text-xs">{v ? fmt(v) : '-'}</span> },
            { key: 'net_pay', label: t('netSalary'), render: v => <span className="font-bold text-gray-900 dark:text-gray-100">{fmt(v)}</span> },
            { key: 'pay_period_start', label: 'Period', render: v => <span className="text-gray-400 text-xs">{v}</span> },
            { key: 'status', label: t('status'), render: v => <Badge color={statusColors[v] || 'gray'}>{v}</Badge> },
          ]} data={records} pageSize={10} loading={loading} />
        </div>
      </motion.div>
    </motion.div>
  )
}
