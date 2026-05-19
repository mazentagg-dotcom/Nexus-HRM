import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { ADMIN_NAV, MANAGER_NAV, EMPLOYEE_NAV, ROLE_LABELS } from '../../constants/index'
import {
  LayoutDashboard,
  Users,
  Activity,
  CalendarOff,
  DollarSign,
  ClipboardList,
  Upload,
  Folder,
  ClipboardCheck,
  Target,
  Network,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
} from 'lucide-react'

const iconMap = {
  LayoutDashboard,
  Users,
  Activity,
  CalendarOff,
  DollarSign,
  ClipboardList,
  Upload,
  Folder,
  ClipboardCheck,
  Target,
  Network,
  Settings,
}

function NavItem({ item, collapsed, isMobile, onClose }) {
  const location = useLocation()
  const isActive = item.path === '/'
    ? location.pathname === '/'
    : location.pathname.startsWith(item.path)
  const Icon = iconMap[item.icon] || LayoutDashboard

  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      onClick={() => isMobile && onClose?.()}
      title={collapsed && !isMobile ? item.label : undefined}
    >
      {() => (
        <motion.div
          className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors duration-150"
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            className={`
              absolute inset-0 rounded-xl transition-colors duration-200
              ${isActive
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-lg shadow-indigo-600/20'
                : 'hover:bg-white/[0.06]'
              }
            `}
            layoutId="activeNavBg"
            style={isActive ? {} : { opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          />

          {isActive && (
            <motion.div
              layoutId="activeNavIndicator"
              className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-white"
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
          )}

          <Icon className={`relative z-10 h-[18px] w-[18px] shrink-0 transition-colors duration-150 ${
            isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
          }`} />

          <AnimatePresence mode="wait">
            {(!collapsed || isMobile) && (
              <motion.span
                initial={{ opacity: 0, width: 0, marginLeft: -12 }}
                animate={{ opacity: 1, width: 'auto', marginLeft: 0 }}
                exit={{ opacity: 0, width: 0, marginLeft: -12 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className={`relative z-10 whitespace-nowrap overflow-hidden ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>

          {item.badge && (!collapsed || isMobile) && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="relative z-10 ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white shadow-sm"
            >
              {item.badge}
            </motion.span>
          )}

          {item.badge && collapsed && !isMobile && (
            <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5 z-20">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-slate-900" />
            </span>
          )}
        </motion.div>
      )}
    </NavLink>
  )
}

function SidebarContent({ collapsed, isMobile, onToggle, onClose, user, logout }) {
  const navigate = useNavigate()
  const { isAdmin, hasRole, roles } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isManager = hasRole('manager')

  const visibleItems = isAdmin
    ? ADMIN_NAV
    : isManager
      ? MANAGER_NAV
      : EMPLOYEE_NAV

  const userInitials = user
    ? `${(user.first_name || '').charAt(0)}${(user.last_name || '').charAt(0)}`.toUpperCase() ||
      (user.name || 'A').charAt(0).toUpperCase()
    : 'A'

  const displayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || user.name || 'Admin User'
    : 'Admin User'

  const displayRole = ROLE_LABELS[roles?.[0]] || 'User'

  return (
    <div className="flex h-full flex-col bg-[#0f172a]">
      <div className="flex h-[60px] items-center justify-between px-3 border-b border-white/[0.06]">
        <AnimatePresence mode="wait">
          {(!collapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2.5"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-600/30">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-[15px] font-bold text-white tracking-tight">Nexus</span>
              <span className="text-[15px] font-light text-slate-400 tracking-tight">HRM</span>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && !isMobile && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-600/30 mx-auto"
          >
            <Zap className="h-4 w-4 text-white" />
          </motion.div>
        )}
        {isMobile && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <PanelLeftClose className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-0.5 scrollbar-thin">
        {visibleItems.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            collapsed={collapsed}
            isMobile={isMobile}
            onClose={onClose}
          />
        ))}
      </nav>

      <div className="border-t border-white/[0.06] p-3 space-y-1">
        <AnimatePresence mode="wait">
          {!collapsed || isMobile ? (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/[0.04] transition-colors duration-150"
            >
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-xs font-bold text-white ring-2 ring-indigo-400/20">
                {userInitials}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0f172a]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-[13px] font-medium text-white leading-tight">{displayName}</p>
                <p className="truncate text-[11px] text-slate-500 leading-tight mt-0.5">{displayRole}</p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg p-1.5 text-slate-500 transition-all duration-150 hover:bg-rose-500/10 hover:text-rose-400"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleLogout}
              className="flex w-full items-center justify-center rounded-xl py-2.5 text-slate-500 transition-all duration-150 hover:bg-rose-500/10 hover:text-rose-400"
              title="Sign out"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {!isMobile && (
        <div className="border-t border-white/[0.06] p-2.5">
          <button
            onClick={onToggle}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-2 py-1.5 text-slate-500 transition-all duration-200 hover:bg-white/[0.06] hover:text-slate-300"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4" />
                <span className="text-[11px] font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth()

  const sidebarWidth = collapsed ? 72 : 260

  return (
    <>
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="relative hidden lg:flex flex-shrink-0 z-30"
      >
        <SidebarContent
          collapsed={collapsed}
          isMobile={false}
          onToggle={onToggleCollapse}
          user={user}
          logout={logout}
        />
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.aside
              initial={{ x: -260, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -260, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex w-[260px] lg:hidden"
            >
              <SidebarContent
                collapsed={false}
                isMobile={true}
                onClose={onMobileClose}
                user={user}
                logout={logout}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
