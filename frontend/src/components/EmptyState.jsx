import { motion } from 'framer-motion'
import Button from './Button'

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16"
    >
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 mb-4">
          <Icon className="h-7 w-7 text-gray-300" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-400 text-center max-w-sm">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          icon={ActionIcon}
          className="mt-4"
          size="sm"
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  )
}
