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
    indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', ring: 'ring-indigo-100' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'ring-emerald-100' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', ring: 'ring-amber-100' },
    rose: { bg: 'bg-rose-50', icon: 'text-rose-600', ring: 'ring-rose-100' },
    sky: { bg: 'bg-sky-50', icon: 'text-sky-600', ring: 'ring-sky-100' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', ring: 'ring-purple-100' },
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
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            {prefix}{formatNumber(count)}{suffix}
          </p>
          {trendValue && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold">
              <span className={trendColor}>{trendIcon} {trendValue}%</span>
              <span className="text-gray-400 text-xs ml-1">vs last month</span>
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
