import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'indigo',
  delay = 0,
  prefix = '',
  suffix = '',
}) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, '')) || 0
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true
    const duration = 1500
    const startTime = Date.now()
    const startValue = 0

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(startValue + (numericValue - startValue) * eased)
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [numericValue])

  const colorMap = {
    indigo: { bg: 'bg-indigo-50 dark:bg-indigo-500/15', icon: 'text-indigo-600 dark:text-indigo-400', ring: 'ring-indigo-100 dark:ring-indigo-500/30' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-500/15', icon: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-100 dark:ring-emerald-500/30' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-500/15', icon: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-100 dark:ring-amber-500/30' },
    rose: { bg: 'bg-rose-50 dark:bg-rose-500/15', icon: 'text-rose-600 dark:text-rose-400', ring: 'ring-rose-100 dark:ring-rose-500/30' },
    sky: { bg: 'bg-sky-50 dark:bg-sky-500/15', icon: 'text-sky-600 dark:text-sky-400', ring: 'ring-sky-100 dark:ring-sky-500/30' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-500/15', icon: 'text-purple-600 dark:text-purple-400', ring: 'ring-purple-100 dark:ring-purple-500/30' },
  }

  const colors = colorMap[color] || colorMap.indigo
  const trendColor = trend === 'up' ? 'text-emerald-600 bg-emerald-50' : trend === 'down' ? 'text-rose-600 bg-rose-50' : 'text-gray-500 bg-gray-50'
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'

  const formatNumber = (num) => {
    if (Number.isInteger(numericValue)) return Math.round(num).toLocaleString()
    return num.toFixed(numericValue < 100 ? 2 : 1).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="card-base p-6 cursor-default"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {prefix}{formatNumber(count)}{suffix}
          </p>
          {trendValue && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold">
              <span className={trendColor}>{trendIcon} {trendValue}%</span>
              <span className="text-gray-400 dark:text-gray-500 text-xs ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ring-1 ${colors.bg} ${colors.ring}`}>
          {Icon && <Icon className={`h-6 w-6 ${colors.icon}`} />}
        </div>
      </div>
    </motion.div>
  )
}
