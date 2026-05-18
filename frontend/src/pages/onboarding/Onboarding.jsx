import { motion } from 'framer-motion'
import Button from '../../components/Button'
import { useI18n } from '../../i18n'
import { UserPlus } from 'lucide-react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

export default function Onboarding() {
  const { t } = useI18n()
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('onboarding')}</h1><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('manageOnboardingDesc')}</p></div>
        <Button size="sm" icon={UserPlus}>{t('newTemplate')}</Button>
      </motion.div>

      <motion.div variants={fadeUp} className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-12">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-900/50">
            <UserPlus className="h-8 w-8 text-gray-300 dark:text-gray-600" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-gray-100">{t('onboardingComingSoon')}</h3>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{t('featureUnderDevelopment')}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}
