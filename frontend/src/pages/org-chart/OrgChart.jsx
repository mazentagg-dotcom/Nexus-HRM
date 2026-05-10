import { motion } from 'framer-motion'
import Badge from '../../components/Badge'
import { departments, employees } from '../../data/hr'
import { Users, ChevronRight, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

const deptColors = ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899', '#ef4444', '#14b8a6']

function DepartmentNode({ dept, index, level = 0 }) {
  const [expanded, setExpanded] = useState(true)
  const deptEmployees = (employees || []).filter(e => e.department === dept.name)
  const color = deptColors[index % deptColors.length]

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: level * 0.1 + index * 0.05 }}>
      <div
        className={`flex items-center gap-3 rounded-xl border border-gray-100 bg-white shadow-sm p-4 cursor-pointer hover:shadow-card-hover transition-all ${level > 0 ? `ml-${level * 12}` : ''}`}
        style={{ marginLeft: level * 48 }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold text-sm" style={{ backgroundColor: color }}>
          {dept.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-900">{dept.name}</h4>
            <Badge color="indigo">{dept.employee_count} people</Badge>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{dept.description}</p>
        </div>
        <motion.div animate={{ rotate: expanded ? 0 : -90 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </motion.div>
      </div>

      {expanded && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
          <div className="grid grid-cols-1 gap-2 mt-2 ml-12" style={{ marginLeft: level * 48 + 48 }}>
            {deptEmployees.slice(0, 6).map((emp, i) => (
              <motion.div key={emp.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="flex items-center gap-3 rounded-lg border border-gray-50 bg-white p-3 hover:bg-gray-50 transition-colors">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-[10px] font-semibold text-gray-600">{emp.first_name[0]}{emp.last_name[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900">{emp.first_name} {emp.last_name}</p>
                  <p className="text-[10px] text-gray-400">{emp.position}</p>
                </div>
                <Badge color={emp.status === 'active' ? 'emerald' : emp.status === 'on_leave' ? 'amber' : 'gray'}>{emp.status}</Badge>
              </motion.div>
            ))}
            {deptEmployees.length > 6 && (
              <p className="text-xs text-gray-400 pl-10">+{deptEmployees.length - 6} more employees</p>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default function OrgChart() {
  const depts = departments || []

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-gray-900">Org Chart</h1>
        <p className="mt-1 text-sm text-gray-500">Organization structure and team hierarchy.</p>
      </motion.div>

      <motion.div variants={fadeUp} className="rounded-xl border border-gray-100 bg-white shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white shadow-lg shadow-indigo-500/25">
            NX
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Nexus HRM</h3>
            <p className="text-sm text-gray-500">{(employees || []).length} employees &middot; {depts.length} departments</p>
          </div>
        </div>

        <div className="space-y-3">
          {depts.map((dept, i) => (
            <DepartmentNode key={dept.id} dept={dept} index={i} level={0} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
