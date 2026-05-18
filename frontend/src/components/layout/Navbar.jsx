import { useState, useRef, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useStore } from '../../store'
import { useI18n } from '../../i18n'
import Dropdown from '../ui/Dropdown'
import { getNotifications } from '../../api/notifications'
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  Plus,
  Sun,
  Moon,
  Sparkles,
  Command,
} from 'lucide-react'

const routeLabels = {
  '/': 'Dashboard',
  '/employees': 'Employees',
  '/attendance': 'Attendance',
  '/leave': 'Leave Requests',
  '/payroll': 'Payroll',
  '/payslip': 'Payslip',
  '/requests': 'Requests',
  '/upload': 'Upload Data',
  '/documents': 'Documents',
  '/self-service': 'Self-Service',
  '/employee-dashboard': 'Dashboard',
  '/settings': 'Settings',
}

const quickActions = [
  { label: 'Add Employee', path: '/employees', icon: 'user' },
  { label: 'New Leave', path: '/leave', icon: 'calendar' },
  { label: 'Payslip', path: '/payslip', icon: 'dollar' },
  { label: 'View Attendance', path: '/attendance', icon: 'activity' },
]

const defaultNotifications = [
  { id: 'nav-1', title: 'New leave request from James Wilson', time: '2 min ago', unread: true },
  { id: 'nav-2', title: 'Payroll processed for December', time: '1 hour ago', unread: true },
  { id: 'nav-3', title: 'Onboarding completed for Jake Cooper', time: '3 hours ago', unread: false },
  { id: 'nav-4', title: 'Performance review cycle starting', time: '5 hours ago', unread: false },
]

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function Navbar({ onMenuToggle, sidebarCollapsed }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useStore()
  const { locale, toggleLocale } = useI18n()
  const [notifOpen, setNotifOpen] = useState(false)
  const [navNotifications, setNavNotifications] = useState(defaultNotifications)
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [quickOpen, setQuickOpen] = useState(false)
  const notifRef = useRef(null)
  const quickRef = useRef(null)

  const unreadCount = navNotifications.filter((n) => n.unread).length
  const pageTitle = routeLabels[location.pathname] || 'Dashboard'
  const userInitial = (user?.first_name || user?.name || 'A').charAt(0).toUpperCase()
  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.name || 'Admin'

  useEffect(() => {
    getNotifications({ page: 1, pageSize: 5, unread: 'true' })
      .then(res => {
        const items = res.data?.data?.items
        if (items?.length) {
          setNavNotifications(items.slice(0, 5).map(n => ({
            id: n.id,
            title: n.title,
            time: timeAgo(n.created_at),
            unread: !n.read,
            link: n.link,
          })))
        }
      })
      .catch(() => {})
  }, [location.pathname])

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (quickRef.current && !quickRef.current.contains(e.target)) setQuickOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSearch = useCallback((e) => {
    e.preventDefault()
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`)
      setSearchValue('')
    }
  }, [searchValue, navigate])

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const input = document.getElementById('global-search')
        if (input) input.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const profileItems = [
    { label: 'Profile', icon: User, onClick: () => navigate('/settings') },
    { label: 'Settings', icon: Settings, onClick: () => navigate('/settings') },
    { divider: true },
    { label: 'Sign out', icon: LogOut, onClick: () => { logout(); navigate('/login') }, danger: true },
  ]

  return (
    <header className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-gray-200/80 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav className="hidden sm:flex items-center gap-1.5 text-sm">
          <span className="text-gray-400 dark:text-gray-500">Home</span>
          <svg className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <motion.span
            key={pageTitle}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-semibold text-gray-800 dark:text-gray-200"
          >
            {pageTitle}
          </motion.span>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <form onSubmit={handleSearch} className="hidden md:block relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            id="global-search"
            type="text"
            placeholder="Search anything..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={`
              h-9 w-64 rounded-xl border bg-gray-50/80 dark:bg-gray-700/80 dark:text-gray-100 pl-9 pr-10 text-sm text-gray-900
              placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200
              focus:border-indigo-300 focus:bg-white dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20
              ${searchFocused ? 'border-indigo-300 ring-2 ring-indigo-500/20 bg-white dark:bg-gray-700 w-80' : 'border-gray-200 dark:border-gray-600'}
            `}
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 shadow-sm">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </form>

        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <AnimatePresence mode="wait">
            {theme === 'light' ? (
              <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Moon className="h-[18px] w-[18px]" />
              </motion.div>
            ) : (
              <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Sun className="h-[18px] w-[18px]" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        <button
          onClick={toggleLocale}
          className="rounded-lg p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200"
          title={locale === 'en' ? 'Switch to French' : 'Passer en anglais'}
        >
          <span className="text-xs font-bold tracking-tight">{locale === 'en' ? 'FR' : 'EN'}</span>
        </button>

        <div className="relative" ref={quickRef}>
          <button
            onClick={() => setQuickOpen(!quickOpen)}
            className="flex h-9 items-center gap-1.5 rounded-lg px-3 bg-indigo-600 text-white text-sm font-medium shadow-sm shadow-indigo-600/20 transition-all duration-200 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-600/25 active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Quick</span>
          </button>

          <AnimatePresence>
            {quickOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 py-1.5 shadow-xl shadow-gray-900/5 dark:shadow-gray-900/50 z-50"
              >
                <div className="px-3 py-1.5">
                  <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Quick Actions</p>
                </div>
                {quickActions.map((action) => (
                  <button
                    key={action.path}
                    onClick={() => { setQuickOpen(false); navigate(action.path) }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                    {action.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative rounded-lg p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Bell className="h-[18px] w-[18px]" />
            </motion.div>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white shadow-sm"
                style={{ width: 18, height: 18, top: -2, right: -2 }}
              >
                {unreadCount}
              </motion.span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl shadow-gray-900/5 dark:shadow-gray-900/50 z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="flex h-5 items-center rounded-full bg-indigo-100 px-1.5 text-[10px] font-bold text-indigo-700">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {navNotifications.map((n, i) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`
                        flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors duration-100
                        hover:bg-gray-50 dark:hover:bg-gray-700 ${n.unread ? 'bg-indigo-50/40 dark:bg-indigo-500/10' : ''}
                        ${i < navNotifications.length - 1 ? 'border-b border-gray-50 dark:border-gray-700' : ''}
                      `}
                      onClick={() => { setNotifOpen(false); if (n.link) navigate(n.link) }}
                    >
                      <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${n.unread ? 'bg-indigo-500' : 'bg-transparent'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${n.unread ? 'font-medium text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                          {n.title}
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{n.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block" />

        <Dropdown
          trigger={
            <button className="flex items-center gap-2.5 rounded-xl p-1 pr-2 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 group">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-[12px] font-bold text-white shadow-sm ring-2 ring-indigo-100 transition-all duration-200 group-hover:ring-indigo-200 group-hover:shadow-md">
                {userInitial}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-[13px] font-medium text-gray-700 dark:text-gray-300 leading-tight">{displayName}</p>
                <p className="text-[11px] text-gray-400 leading-tight mt-0.5">Admin</p>
              </div>
              <svg className="hidden md:block h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          }
          items={profileItems}
          align="right"
        />
      </div>
    </header>
  )
}
