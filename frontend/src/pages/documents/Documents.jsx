import { useState } from 'react'
import { motion } from 'framer-motion'
import AnimatedTable from '../../components/AnimatedTable'
import Badge from '../../components/Badge'
import { employeeDocuments as mockDocuments, employees as mockEmployees, documentTypeColors } from '../../data/hr'
import { FileText } from 'lucide-react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

const fmtBytes = b => b >= 1000000 ? (b / 1000000).toFixed(1) + ' MB' : (b / 1000).toFixed(0) + ' KB'
const formatDate = d => { if (!d) return ''; try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return d } }

export default function Documents() {
  const documents = mockDocuments || []
  const employees = mockEmployees || []

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="mt-1 text-sm text-gray-500">Manage employee documents and compliance records.</p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <AnimatedTable columns={[
          { key: 'document_name', label: 'Document', render: (v, r) => (
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${r.file_type?.includes('pdf') ? 'bg-rose-100 text-rose-600' : 'bg-sky-100 text-sky-600'}`}><FileText className="h-4 w-4" /></div>
              <div><p className="text-sm font-medium text-gray-900">{v}</p><p className="text-[11px] text-gray-400">{r.file_type}</p></div>
            </div>
          )},
          { key: 'document_type', label: 'Type', render: v => <Badge color={documentTypeColors[v] || 'gray'}>{v.replace(/_/g, ' ')}</Badge> },
          { key: 'employee_id', label: 'Employee', render: v => { const emp = employees.find(e => e.id === v); return emp ? <span className="text-gray-700 text-xs">{emp.first_name} {emp.last_name}</span> : <span className="text-gray-400 text-xs">{v}</span> }},
          { key: 'file_size', label: 'Size', render: v => <span className="text-gray-500 text-xs">{fmtBytes(v)}</span> },
          { key: 'expiry_date', label: 'Expires', render: v => v ? <span className="text-gray-400 text-xs">{formatDate(v)}</span> : <span className="text-gray-300 text-xs">-</span> },
          { key: 'created_at', label: 'Uploaded', render: v => <span className="text-gray-400 text-xs">{formatDate(v)}</span> },
        ]} data={documents} pageSize={10} />
      </motion.div>
    </motion.div>
  )
}
