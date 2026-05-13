import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AnimatedTable from '../../components/AnimatedTable'
import Badge from '../../components/Badge'
import { getPayrollRecords } from '../../api/hr'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

const statusColors = { paid: 'emerald', pending: 'amber', processing: 'blue' }
const fmt = n => '$' + Number(n).toLocaleString()

export default function Payroll() {
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState([])

  useEffect(() => {
    getPayrollRecords({ page: 1, pageSize: 100 })
      .then(r => { const d = r.data?.data; setRecords(d?.items || d || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalPayroll = records.reduce((s, p) => s + (p.net_pay || 0), 0)
  const paid = records.filter(p => p.status === 'paid').length

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
        <p className="mt-1 text-sm text-gray-500">Manage employee compensation and payroll processing.</p>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card-base p-5"><p className="text-sm text-gray-500">Total Payroll</p><p className="mt-1 text-2xl font-bold text-gray-900">{loading ? '-' : fmt(totalPayroll)}</p></div>
        <div className="card-base p-5"><p className="text-sm text-gray-500">Records</p><p className="mt-1 text-2xl font-bold text-gray-900">{loading ? '-' : records.length}</p></div>
        <div className="card-base p-5"><p className="text-sm text-gray-500">Paid</p><p className="mt-1 text-2xl font-bold text-gray-900">{loading ? '-' : `${paid}/${records.length}`}</p></div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <AnimatedTable columns={[
          { key: 'employee_name', label: 'Employee', render: v => <span className="font-medium text-gray-900">{v}</span> },
          { key: 'gross_pay', label: 'Gross', render: v => <span className="text-gray-500 text-xs">{fmt(v)}</span> },
          { key: 'total_deductions', label: 'Deductions', render: v => <span className="text-rose-500 text-xs">{v ? fmt(v) : '-'}</span> },
          { key: 'net_pay', label: 'Net Pay', render: v => <span className="font-bold text-gray-900">{fmt(v)}</span> },
          { key: 'pay_period_start', label: 'Period', render: v => <span className="text-gray-400 text-xs">{v}</span> },
          { key: 'status', label: 'Status', render: v => <Badge color={statusColors[v] || 'gray'}>{v}</Badge> },
        ]} data={records} pageSize={10} loading={loading} />
      </motion.div>
    </motion.div>
  )
}
