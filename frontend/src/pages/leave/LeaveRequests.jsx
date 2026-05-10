import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import AnimatedTable from '../../components/AnimatedTable'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import { useToast } from '../../components/feedback/Toast'
import { getLeaveRequests, createLeaveRequest, approveLeave, rejectLeave } from '../../api/hr'
import {
  leaveRequests as mockLeaves, employees as mockEmployees,
  leaveStatusColors, leaveTypeColors,
} from '../../data/hr'
import { Plus, Check, X } from 'lucide-react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

export default function LeaveRequests() {
  const [loading, setLoading] = useState(true)
  const [leavesData, setLeavesData] = useState(null)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showRejectConfirm, setShowRejectConfirm] = useState(false)
  const [rejectComment, setRejectComment] = useState('')
  const [rejectId, setRejectId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { showToast } = useToast()
  const [employees] = useState(mockEmployees || [])

  useEffect(() => {
    getLeaveRequests({ page: 1, pageSize: 100 })
      .then(r => { const d = r.data?.data; setLeavesData(d?.items || d || null) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const leaves = leavesData || mockLeaves || []

  const resetForm = useCallback(() => { setShowLeaveModal(false); setShowRejectConfirm(false); setRejectComment(''); setRejectId(null); setSubmitting(false) }, [])
  const formatDate = d => { if (!d) return ''; try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return d } }

  const handleApprove = async (id) => {
    try {
      await approveLeave(id)
      showToast('Leave approved', 'success')
      setLeavesData(prev => prev ? prev.map(l => l.id === id ? { ...l, status: 'approved' } : l) : prev)
    } catch (e) {
      showToast(e.response?.data?.message || 'Error', 'error')
    }
  }

  const handleReject = async () => {
    if (!rejectId) return
    try {
      await rejectLeave(rejectId, { reason: rejectComment || 'No reason provided' })
      showToast('Leave rejected', 'success')
      setLeavesData(prev => prev ? prev.map(l => l.id === rejectId ? { ...l, status: 'rejected' } : l) : prev)
      resetForm()
    } catch (e) {
      showToast(e.response?.data?.message || 'Error', 'error')
    }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Leave Requests</h1><p className="mt-1 text-sm text-gray-500">Review and manage employee leave requests.</p></div>
        <Button size="sm" icon={Plus} onClick={() => setShowLeaveModal(true)}>New Leave Request</Button>
      </motion.div>

      <motion.div variants={fadeUp}>
        <AnimatedTable columns={[
          { key: 'employee_name', label: 'Employee', render: v => <span className="font-medium text-gray-900">{v}</span> },
          { key: 'type', label: 'Type', render: v => <Badge color={leaveTypeColors[v] || 'gray'}>{v}</Badge> },
          { key: 'start_date', label: 'From', render: v => <span className="text-gray-500 text-xs">{formatDate(v)}</span> },
          { key: 'end_date', label: 'To', render: v => <span className="text-gray-500 text-xs">{formatDate(v)}</span> },
          { key: 'total_days', label: 'Days', render: v => <span className="font-medium">{v}</span> },
          { key: 'reason', label: 'Reason', render: v => <span className="text-gray-500 text-xs truncate max-w-[200px] block">{v}</span> },
          { key: 'status', label: 'Status', render: (v, r) => (
            <div className="flex items-center gap-1">
              <Badge color={leaveStatusColors[v] || 'gray'}>{v}</Badge>
              {v === 'pending' && (
                <div className="flex items-center gap-1">
                  <button onClick={(e) => { e.stopPropagation(); handleApprove(r.id) }} className="rounded p-0.5 text-emerald-500 hover:bg-emerald-50"><Check className="h-3.5 w-3.5" /></button>
                  <button onClick={(e) => { e.stopPropagation(); setRejectId(r.id); setShowRejectConfirm(true) }} className="rounded p-0.5 text-rose-500 hover:bg-rose-50"><X className="h-3.5 w-3.5" /></button>
                </div>
              )}
            </div>
          )},
        ]} data={leaves} pageSize={10} />
      </motion.div>

      <Modal isOpen={showRejectConfirm} onClose={resetForm} title="Reject Leave Request" size="sm" footer={
        <><Button variant="secondary" onClick={resetForm}>Cancel</Button><Button loading={submitting} className="bg-rose-600 hover:bg-rose-700" onClick={handleReject}>Reject</Button></>
      }>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Are you sure you want to reject this leave request?</p>
          <Textarea value={rejectComment} onChange={e => setRejectComment(e.target.value)} placeholder="Provide a reason..." rows={3} />
        </div>
      </Modal>

      <Modal isOpen={showLeaveModal} onClose={resetForm} title="New Leave Request" size="md" footer={
        <><Button variant="secondary" onClick={resetForm}>Cancel</Button><Button loading={submitting} onClick={() => { const f = document.getElementById('leave-form'); if (!f) return; const data = Object.fromEntries(new FormData(f)); setSubmitting(true); createLeaveRequest(data).then(() => { showToast('Leave request submitted', 'success'); resetForm() }).catch(e => { showToast(e.response?.data?.message || 'Error', 'error'); setSubmitting(false) }) }}>Submit</Button></>
      }>
        <form id="leave-form" className="space-y-4">
          <Select label="Employee" name="employee_id" options={employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name}` }))} placeholder="Select employee" required />
          <Select label="Leave Type" name="type" options={[{ value: 'annual', label: 'Annual Leave' }, { value: 'sick', label: 'Sick Leave' }, { value: 'personal', label: 'Personal Leave' }, { value: 'unpaid', label: 'Unpaid Leave' }]} placeholder="Select type" required />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Start Date" name="start_date" type="date" required />
            <Input label="End Date" name="end_date" type="date" required />
          </div>
          <Textarea label="Reason" name="reason" placeholder="Reason for leave..." rows={3} />
        </form>
      </Modal>
    </motion.div>
  )
}
