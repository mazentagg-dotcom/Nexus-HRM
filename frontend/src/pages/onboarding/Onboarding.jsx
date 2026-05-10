import { motion } from 'framer-motion'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import { ClipboardCheck, UserPlus, CheckCircle, Clock, AlertCircle } from 'lucide-react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

const templates = [
  { id: 't-1', name: 'Standard Employee', department: 'Engineering', steps: 8, estimatedDays: 5, isActive: true },
  { id: 't-2', name: 'Remote Worker', department: 'All Departments', steps: 10, estimatedDays: 7, isActive: true },
  { id: 't-3', name: 'Executive Hire', department: 'Management', steps: 12, estimatedDays: 10, isActive: true },
  { id: 't-4', name: 'Intern', department: 'All Departments', steps: 6, estimatedDays: 3, isActive: false },
]

const inProgress = [
  { id: 'onb-1', employee: 'Jake Cooper', position: 'Junior Developer', department: 'Engineering', template: 'Standard Employee', progress: 75, startDate: '2024-06-15', dueDate: '2024-06-20', status: 'in_progress' },
  { id: 'onb-2', employee: 'Rachel Kim', position: 'Marketing Lead', department: 'Marketing', template: 'Standard Employee', progress: 100, startDate: '2024-11-01', dueDate: '2024-11-06', status: 'completed' },
  { id: 'onb-3', employee: 'Sam Taylor', position: 'Sales Rep', department: 'Sales', template: 'Remote Worker', progress: 40, startDate: '2024-12-20', dueDate: '2024-12-27', status: 'in_progress' },
]

const statusConfig = {
  in_progress: { color: 'sky', icon: Clock },
  completed: { color: 'emerald', icon: CheckCircle },
  overdue: { color: 'rose', icon: AlertCircle },
}

export default function Onboarding() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Onboarding</h1><p className="mt-1 text-sm text-gray-500">Manage new hire onboarding workflows and templates.</p></div>
        <Button size="sm" icon={UserPlus}>New Template</Button>
      </motion.div>

      <motion.div variants={fadeUp}>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">In Progress ({inProgress.filter(o => o.status === 'in_progress').length})</h3>
        <div className="space-y-3">
          {inProgress.map((item, i) => {
            const cfg = statusConfig[item.status] || statusConfig.in_progress
            const StatusIcon = cfg.icon
            return (
              <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-gray-100 bg-white shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">{item.employee.split(' ').map(n => n[0]).join('')}</div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.employee}</p>
                      <p className="text-xs text-gray-500">{item.position} &middot; {item.department}</p>
                    </div>
                  </div>
                  <Badge color={cfg.color}>{item.status.replace('_', ' ')}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>Template: {item.template}</span>
                  <span>Due: {item.dueDate}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${item.progress}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} className={`h-full rounded-full ${item.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">{item.progress}% complete</p>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Templates ({templates.length})</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-gray-100 bg-white shadow-sm p-4 hover:shadow-card-hover transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <ClipboardCheck className="h-4 w-4 text-indigo-500" />
                <h4 className="text-sm font-semibold text-gray-900">{t.name}</h4>
              </div>
              <div className="space-y-1 text-xs text-gray-500">
                <p>Department: {t.department}</p>
                <p>Steps: {t.steps} &middot; ~{t.estimatedDays} days</p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Badge color={t.isActive ? 'emerald' : 'gray'}>{t.isActive ? 'Active' : 'Inactive'}</Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
