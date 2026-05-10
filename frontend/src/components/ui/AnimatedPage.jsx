import { motion } from 'framer-motion'

export default function AnimatedPage({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 ${className}`}
    >
      {children}
    </motion.div>
  )
}
