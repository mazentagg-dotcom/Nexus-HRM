import { motion } from 'framer-motion'
import { ShieldX, Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'

export default function AccessDenied() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-500/10"
        >
          <ShieldX className="h-10 w-10 text-rose-500" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-2xl font-bold text-gray-900 dark:text-gray-100"
        >
          Access Denied
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-2 text-sm text-gray-500 max-w-sm mx-auto"
        >
          You do not have permission to view this page. Contact your administrator if you believe this is an error.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Button
            onClick={() => navigate('/')}
            icon={Home}
            size="sm"
          >
            Return to Dashboard
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
