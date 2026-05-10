import { motion } from 'framer-motion'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import { Target, Star, Calendar, CheckCircle, Clock } from 'lucide-react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

const cycles = [
  { id: 'rc-1', name: 'Q4 2024 Review', period: 'Oct - Dec 2024', status: 'active', startDate: '2024-12-15', endDate: '2024-12-31', totalEmployees: 89, completed: 32, averageRating: 4.2 },
  { id: 'rc-2', name: 'Q3 2024 Review', period: 'Jul - Sep 2024', status: 'completed', startDate: '2024-09-15', endDate: '2024-09-30', totalEmployees: 85, completed: 85, averageRating: 4.0 },
  { id: 'rc-3', name: 'Mid-Year 2024 Review', period: 'Jan - Jun 2024', status: 'completed', startDate: '2024-06-15', endDate: '2024-06-30', totalEmployees: 82, completed: 82, averageRating: 3.9 },
  { id: 'rc-4', name: 'Q1 2024 Review', period: 'Jan - Mar 2024', status: 'completed', startDate: '2024-03-15', endDate: '2024-03-31', totalEmployees: 78, completed: 78, averageRating: 3.8 },
]

const reviews = [
  { id: 'r-1', employee: 'Sarah Johnson', reviewer: 'David Brown', cycle: 'Q4 2024 Review', rating: 4.5, status: 'completed', strengths: 'Leadership, Technical skills', areas: 'Delegation' },
  { id: 'r-2', employee: 'Michael Chen', reviewer: 'David Brown', cycle: 'Q4 2024 Review', rating: 4.0, status: 'completed', strengths: 'Analytical skills, Teamwork', areas: 'Communication' },
  { id: 'r-3', employee: 'Emily Davis', reviewer: 'David Brown', cycle: 'Q4 2024 Review', rating: 3.5, status: 'pending', strengths: 'Operations management', areas: 'Strategic thinking' },
  { id: 'r-4', employee: 'Tom Harris', reviewer: 'Sarah Johnson', cycle: 'Q4 2024 Review', rating: 4.8, status: 'in_progress', strengths: 'DevOps, Automation', areas: 'Documentation' },
]

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`h-4 w-4 ${s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
      ))}
      <span className="ml-1 text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
    </div>
  )
}

export default function Performance() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Performance</h1><p className="mt-1 text-sm text-gray-500">Manage performance reviews and evaluations.</p></div>
        <Button size="sm" icon={Target}>New Review Cycle</Button>
      </motion.div>

      <motion.div variants={fadeUp}>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Review Cycles</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cycles.map((cycle, i) => (
            <motion.div key={cycle.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-gray-100 bg-white shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge color={cycle.status === 'active' ? 'emerald' : 'gray'}>{cycle.status}</Badge>
                <span className="text-[11px] text-gray-400">{cycle.period}</span>
              </div>
              <h4 className="text-sm font-semibold text-gray-900">{cycle.name}</h4>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-xs"><span className="text-gray-500">Progress</span><span className="font-medium">{cycle.completed}/{cycle.totalEmployees}</span></div>
                <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full rounded-full ${cycle.status === 'active' ? 'bg-indigo-500' : 'bg-emerald-500'}`} style={{ width: `${(cycle.completed / cycle.totalEmployees) * 100}%` }} />
                </div>
                <div className="flex justify-between text-xs"><span className="text-gray-500">Avg Rating</span><span className="font-medium text-amber-600"><Star className="h-3 w-3 inline text-amber-400 fill-amber-400" /> {cycle.averageRating}</span></div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Reviews</h3>
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {reviews.map((review, i) => (
              <motion.div key={review.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">{review.employee.split(' ').map(n => n[0]).join('')}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{review.employee}</p>
                    <p className="text-[11px] text-gray-400">Reviewer: {review.reviewer} &middot; {review.cycle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StarRating rating={review.rating} />
                  <Badge color={review.status === 'completed' ? 'emerald' : review.status === 'in_progress' ? 'sky' : 'amber'}>{review.status}</Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
