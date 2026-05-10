import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { User, Mail, Shield, Bell } from 'lucide-react'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

export default function Settings() {
  const { user } = useAuth()

  const profile = {
    name: [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.name || 'Admin User',
    email: user?.email || 'admin@nexus-hrm.com',
    role: user?.roles?.[0]?.name || user?.role || 'Super Admin',
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account and application preferences.</p>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-lg font-bold text-indigo-600">
              {(profile.name || 'A')[0]}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{profile.name}</h3>
              <p className="text-sm text-gray-500">{profile.role}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
              <User className="h-4 w-4 text-gray-400" />
              <div><p className="text-xs text-gray-400">Full Name</p><p className="text-sm text-gray-700">{profile.name}</p></div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <div><p className="text-xs text-gray-400">Email</p><p className="text-sm text-gray-700">{profile.email}</p></div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
              <Shield className="h-4 w-4 text-gray-400" />
              <div><p className="text-xs text-gray-400">Role</p><p className="text-sm text-gray-700">{profile.role}</p></div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
              <Bell className="h-4 w-4 text-gray-400" />
              <div><p className="text-xs text-gray-400">Notifications</p><p className="text-sm text-gray-700">Email & In-app enabled</p></div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Application Info</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center rounded-lg border border-gray-100 p-3">
              <span className="text-sm text-gray-500">Version</span>
              <span className="text-sm font-medium text-gray-900">1.0.0</span>
            </div>
            <div className="flex justify-between items-center rounded-lg border border-gray-100 p-3">
              <span className="text-sm text-gray-500">Application</span>
              <span className="text-sm font-medium text-gray-900">Nexus HRM</span>
            </div>
            <div className="flex justify-between items-center rounded-lg border border-gray-100 p-3">
              <span className="text-sm text-gray-500">Environment</span>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">Production</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
