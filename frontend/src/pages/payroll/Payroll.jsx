import { useState } from 'react'
import { motion } from 'framer-motion'
import Badge from '../../components/Badge'
import { payrollRecords as mockPayroll, payrollStatusColors, deptChartData } from '../../data/hr'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }
const fadeScale = { hidden: { opacity: 0, scale: 0.96 }, show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

const tooltipStyle = { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.08)', fontSize: '13px' }
const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899', '#ef4444', '#14b8a6']
const fmt = n => '$' + Number(n).toLocaleString()

export default function Payroll() {
  const payroll = mockPayroll || []
  const totalPayroll = payroll.reduce((s, p) => s + (p.net_pay || 0), 0)
  const paid = payroll.filter(p => p.status === 'paid').length

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
        <p className="mt-1 text-sm text-gray-500">Manage employee compensation and payroll processing.</p>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card-base p-5"><p className="text-sm text-gray-500">Total Payroll</p><p className="mt-1 text-2xl font-bold text-gray-900">{fmt(totalPayroll)}</p></div>
        <div className="card-base p-5"><p className="text-sm text-gray-500">Records</p><p className="mt-1 text-2xl font-bold text-gray-900">{payroll.length}</p></div>
        <div className="card-base p-5"><p className="text-sm text-gray-500">Paid</p><p className="mt-1 text-2xl font-bold text-gray-900">{paid}/{payroll.length}</p></div>
      </motion.div>

      <motion.div variants={fadeScale} className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="px-6 pt-5 pb-3"><h3 className="text-sm font-semibold text-gray-900">Department Distribution</h3><p className="text-xs text-gray-400 mt-0.5">Employees per department</p></div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={deptChartData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={28}>
                {(deptChartData || []).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="px-6 pt-5 pb-3"><h3 className="text-sm font-semibold text-gray-900">Payroll Summary</h3><p className="text-xs text-gray-400 mt-0.5">December 2024 payroll records</p></div>
          <div className="px-6 pb-6 space-y-2">
            {payroll.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ x: 2 }} className="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-600">{(p.employee_name || '')[0]}</div>
                  <div><p className="text-sm font-medium text-gray-900">{p.employee_name}</p><p className="text-[11px] text-gray-400">{p.payroll_number}</p></div>
                </div>
                <div className="text-right"><p className="text-sm font-bold text-gray-900">{fmt(p.net_pay)}</p><Badge color={payrollStatusColors[p.status] || 'gray'}>{p.status}</Badge></div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
