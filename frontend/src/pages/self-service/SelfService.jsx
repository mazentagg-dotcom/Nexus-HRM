import { useState } from 'react'
import { motion } from 'framer-motion'
import Tabs from '../../components/ui/Tabs'
import Badge from '../../components/Badge'
import { User, Calendar, DollarSign, Megaphone, Laptop } from 'lucide-react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

const leaveBalance = [
  { type: 'Annual Leave', total: 20, used: 5, remaining: 15 },
  { type: 'Sick Leave', total: 10, used: 2, remaining: 8 },
  { type: 'Personal Leave', total: 5, used: 1, remaining: 4 },
  { type: 'Unpaid Leave', total: 0, used: 0, remaining: 0 },
]

const payslips = [
  { id: 'ps-1', month: 'December 2024', period: 'Dec 1 - Dec 31', gross: 7917, deductions: 1780, net: 7087, status: 'available' },
  { id: 'ps-2', month: 'November 2024', period: 'Nov 1 - Nov 30', gross: 7917, deductions: 1780, net: 7087, status: 'available' },
  { id: 'ps-3', month: 'October 2024', period: 'Oct 1 - Oct 31', gross: 7917, deductions: 1780, net: 7087, status: 'available' },
]

const announcements = [
  { id: 'a-1', title: 'Holiday Schedule Update', date: '2024-12-20', priority: 'info' },
  { id: 'a-2', title: 'Year-End Performance Reviews', date: '2024-12-15', priority: 'warning' },
  { id: 'a-3', title: 'New Benefits Enrollment Period', date: '2024-12-10', priority: 'info' },
  { id: 'a-4', title: 'Office Closure Notice', date: '2024-12-05', priority: 'danger' },
]

const assets = [
  { id: 'ast-1', name: 'MacBook Pro 14"', category: 'Laptop', serial: 'MBP-2024-001', assigned: '2022-03-15' },
  { id: 'ast-2', name: 'Dell 27" Monitor', category: 'Monitor', serial: 'MON-2024-042', assigned: '2022-03-15' },
  { id: 'ast-3', name: 'Logitech MX Keys', category: 'Keyboard', serial: 'KB-2024-089', assigned: '2022-03-15' },
]

const fmt = n => '$' + Number(n).toLocaleString()

export default function SelfService() {
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'leave', label: 'Leave Balance', icon: Calendar },
    { id: 'payslips', label: 'Payslips', icon: DollarSign },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'assets', label: 'My Assets', icon: Laptop },
  ]

  const renderProfile = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { label: 'Full Name', value: 'Sarah Johnson' },
          { label: 'Employee ID', value: 'EMP-001' },
          { label: 'Email', value: 'sarah@nexus.com' },
          { label: 'Phone', value: '+1-555-0401' },
          { label: 'Department', value: 'Engineering' },
          { label: 'Position', value: 'Senior Developer' },
          { label: 'Hire Date', value: 'March 15, 2022' },
          { label: 'Manager', value: 'David Brown' },
        ].map(item => (
          <div key={item.label} className="rounded-lg border border-gray-100 p-3">
            <p className="text-[11px] text-gray-400">{item.label}</p>
            <p className="text-sm text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const renderLeave = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {leaveBalance.map(lb => (
          <div key={lb.type} className="rounded-xl border border-gray-100 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-900">{lb.type}</h4>
              <Badge color={lb.remaining > 0 ? 'emerald' : 'gray'}>{lb.remaining} left</Badge>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full bg-indigo-500" style={{ width: `${lb.total > 0 ? (lb.used / lb.total) * 100 : 0}%` }} />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-400">
              <span>Used: {lb.used}</span>
              <span>Total: {lb.total}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderPayslips = () => (
    <div className="space-y-3">
      {payslips.map(ps => (
        <motion.div key={ps.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 hover:shadow-card-hover transition-shadow">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{ps.month}</h4>
            <p className="text-xs text-gray-400">{ps.period}</p>
          </div>
          <div className="text-right space-y-0.5">
            <p className="text-xs text-gray-400">Gross: {fmt(ps.gross)} &middot; Deductions: {fmt(ps.deductions)}</p>
            <p className="text-sm font-bold text-gray-900">Net: {fmt(ps.net)}</p>
          </div>
          <Badge color="emerald">{ps.status}</Badge>
        </motion.div>
      ))}
    </div>
  )

  const renderAnnouncements = () => (
    <div className="space-y-3">
      {announcements.map((ann, i) => (
        <motion.div key={ann.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="flex items-start gap-3 rounded-lg border border-gray-100 p-4 hover:bg-gray-50 transition-colors">
          <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${ann.priority === 'danger' ? 'bg-rose-500' : ann.priority === 'warning' ? 'bg-amber-500' : 'bg-sky-500'}`} />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{ann.title}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{ann.date}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )

  const renderAssets = () => (
    <div className="space-y-3">
      {assets.map((asset, i) => (
        <motion.div key={asset.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-center justify-between rounded-lg border border-gray-100 p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <Laptop className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">{asset.name}</p>
              <p className="text-[11px] text-gray-400">{asset.category} &middot; {asset.serial}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">Assigned: {asset.assigned}</p>
        </motion.div>
      ))}
    </div>
  )

  const content = { profile: renderProfile, leave: renderLeave, payslips: renderPayslips, announcements: renderAnnouncements, assets: renderAssets }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-gray-900">Self-Service</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your profile, leave, and personal information.</p>
      </motion.div>

      <motion.div variants={fadeUp} className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        <div className="p-6">{(content[activeTab] || renderProfile)()}</div>
      </motion.div>
    </motion.div>
  )
}
