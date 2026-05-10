import { motion } from 'framer-motion'
import Button from '../ui/Button'

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 mb-4">
          <Icon className="h-8 w-8 text-gray-300" />
        </div>
      )}
      {title && (
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      )}
      {description && (
        <p className="mt-1.5 text-sm text-gray-500 max-w-sm">{description}</p>
      )}
      {(onAction || action) && (
        <div className="mt-6">
          <Button variant="primary" size="sm" onClick={onAction || action}>
            {actionLabel || 'Take action'}
          </Button>
        </div>
      )}
    </motion.div>
  )
}
