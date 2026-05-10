import { useState } from 'react'
import { motion } from 'framer-motion'
import Badge from '../../components/Badge'
import { attendanceRecords as mockAttendance, attendanceStatusColors, headcountTrend } from '../../data/hr'
import { CheckCircle, XCircle, Clock, Briefcase } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }
const fadeScale = { hidden: { opacity: 0, scale: 0.96 }, show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

const tooltipStyle = { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.08)', fontSize: '13px' }

export default function Attendance() {
  const attendance = mockAttendance || []
  const todayRecords = attendance.filter(a => a.date === '2024-12-28')
  const present = todayRecords.filter(a => a.status === 'present').length
  const late = todayRecords.filter(a => a.status === 'late').length
  const absent = todayRecords.filter(a => a.status === 'absent').length

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="mt-1 text-sm text-gray-500">Track daily employee attendance and work hours.</p>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card-base p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100"><CheckCircle className="h-6 w-6 text-emerald-600" /></div>
          <div><p className="text-sm text-gray-500">Present</p><p className="text-2xl font-bold text-gray-900">{present}</p></div>
        </div>
        <div className="card-base p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100"><Clock className="h-6 w-6 text-amber-600" /></div>
          <div><p className="text-sm text-gray-500">Late</p><p className="text-2xl font-bold text-gray-900">{late}</p></div>
        </div>
        <div className="card-base p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 ring-1 ring-rose-100"><XCircle className="h-6 w-6 text-rose-600" /></div>
          <div><p className="text-sm text-gray-500">Absent</p><p className="text-2xl font-bold text-gray-900">{absent}</p></div>
        </div>
      </motion.div>

      <motion.div variants={fadeScale} className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="px-6 pt-5 pb-3"><h3 className="text-sm font-semibold text-gray-900">Today's Attendance</h3><p className="text-xs text-gray-400 mt-0.5">Real-time attendance overview</p></div>
          <div className="px-6 pb-6 space-y-2">
            {todayRecords.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ x: 2 }} className="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${a.status === 'present' ? 'bg-emerald-100 text-emerald-600' : a.status === 'late' ? 'bg-amber-100 text-amber-600' : a.status === 'absent' ? 'bg-rose-100 text-rose-600' : 'bg-purple-100 text-purple-600'}`}>
                    {a.status === 'present' ? <CheckCircle className="h-4 w-4" /> : a.status === 'absent' ? <XCircle className="h-4 w-4" /> : a.status === 'late' ? <Clock className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                  </div>
                  <div><p className="text-sm font-medium text-gray-900">{a.employee_name}</p><p className="text-[11px] text-gray-400">{a.check_in || '--'} - {a.check_out || '--'}</p></div>
                </div>
                <div className="text-right"><Badge color={attendanceStatusColors[a.status] || 'gray'}>{a.status}</Badge><p className="text-[11px] text-gray-400 mt-1">{a.total_hours}h</p></div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="px-6 pt-5 pb-3"><h3 className="text-sm font-semibold text-gray-900">Headcount Trend</h3><p className="text-xs text-gray-400 mt-0.5">Monthly employee count</p></div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={headcountTrend || []}>
              <defs><linearGradient id="hcGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} fill="url(#hcGrad2)" name="Employees" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.div>
  )
}
