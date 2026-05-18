import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
}) {
  const tabRefs = useRef([])
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  const updateIndicator = (tabId) => {
    const idx = tabs.findIndex((t) => t.id === tabId)
    const el = tabRefs.current[idx]
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth })
    }
  }

  useEffect(() => {
    updateIndicator(activeTab)
  }, [activeTab, tabs])

  return (
    <div className="relative border-b border-gray-200 dark:border-gray-700">
      <nav className="flex gap-0 -mb-px">
        {tabs.map((tab, i) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              ref={(el) => (tabRefs.current[i] = el)}
              onClick={() => onChange(tab.id)}
              className={`
                relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                transition-colors duration-200 whitespace-nowrap
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
                ${isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }
              `}
            >
              {tab.icon && <tab.icon className="h-4 w-4" />}
              {tab.label}
              {tab.count != null && (
                <span className={`
                  rounded-full px-1.5 py-0.5 text-[10px] font-semibold
                  ${isActive ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                `}>
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </nav>
      <motion.div
        className="absolute bottom-0 h-0.5 bg-indigo-600"
        animate={{ left: indicator.left, width: indicator.width }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
    </div>
  )
}
