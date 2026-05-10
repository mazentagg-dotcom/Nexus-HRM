import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-surface">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/25"
        >
          <Zap className="h-8 w-8 text-white" />
        </motion.div>

        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Nexus HRM</h1>
          <div className="mt-3 flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="h-2 w-2 rounded-full bg-indigo-500"
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
