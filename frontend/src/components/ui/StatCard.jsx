import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const trendColors = {
  up: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    change: 'text-emerald-600',
    Arrow: TrendingUp,
  },
  down: {
    bg: 'bg-rose-50',
    icon: 'text-rose-600',
    change: 'text-rose-600',
    Arrow: TrendingDown,
  },
  neutral: {
    bg: 'bg-gray-50',
    icon: 'text-gray-500',
    change: 'text-gray-500',
    Arrow: Minus,
  },
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  change,
  changeLabel,
  trend = 'neutral',
}) {
  const t = trendColors[trend] || trendColors.neutral
  const Arrow = t.Arrow

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1.5">
              <Arrow className="h-4 w-4" />
              <span className={`text-sm font-medium ${t.change}`}>
                {change > 0 ? '+' : ''}{change}%
              </span>
              {changeLabel && (
                <span className="text-xs text-gray-400">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${t.bg}`}>
            <Icon className={`h-6 w-6 ${t.icon}`} />
          </div>
        )}
      </div>
    </motion.div>
  )
}
