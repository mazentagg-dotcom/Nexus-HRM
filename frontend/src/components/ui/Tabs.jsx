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
    <div className="relative border-b border-gray-200">
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
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {tab.icon && <tab.icon className="h-4 w-4" />}
              {tab.label}
              {tab.count != null && (
                <span className={`
                  rounded-full px-1.5 py-0.5 text-[10px] font-semibold
                  ${isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}
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
