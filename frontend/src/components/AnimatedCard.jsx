import { motion } from 'framer-motion'

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function AnimatedCard({
  title,
  subtitle,
  icon: Icon,
  value,
  trend,
  trendValue,
  color = 'indigo',
  children,
  delay = 0,
  className = '',
  onClick,
}) {
  const colorMap = {
    indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', ring: 'ring-indigo-100' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'ring-emerald-100' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', ring: 'ring-amber-100' },
    rose: { bg: 'bg-rose-50', icon: 'text-rose-600', ring: 'ring-rose-100' },
    sky: { bg: 'bg-sky-50', icon: 'text-sky-600', ring: 'ring-sky-100' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', ring: 'ring-purple-100' },
  }

  const colors = colorMap[color] || colorMap.indigo
  const trendColor = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-gray-500'
  const trendIcon = trend === 'up' ? '\u2191' : trend === 'down' ? '\u2193' : '\u2192'
  const cardClassName = 'card-base p-6 ' + (onClick ? 'cursor-pointer ' : '') + className

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={cardClassName}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {title && (
            <p className="text-sm font-medium text-gray-500">{title}</p>
          )}
          {value && (
            <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          )}
          {trendValue && (
            <p className={trendColor + ' mt-1 text-sm font-medium'}>
              {trendIcon} {trendValue}
              {subtitle && <span className="ml-1 text-gray-400">{subtitle}</span>}
            </p>
          )}
        </div>
        {Icon && (
          <div className={'flex h-12 w-12 items-center justify-center rounded-xl ring-1 ' + colors.bg + ' ' + colors.ring}>
            <Icon className={'h-6 w-6 ' + colors.icon} />
          </div>
        )}
      </div>
      {children}
    </motion.div>
  )
}
