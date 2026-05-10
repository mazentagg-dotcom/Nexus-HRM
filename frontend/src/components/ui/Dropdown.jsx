import { Menu } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Fragment } from 'react'

export default function Dropdown({
  trigger,
  items = [],
  align = 'right',
  className = '',
}) {
  return (
    <Menu as="div" className={`relative inline-block ${className}`}>
      <Menu.Button as={Fragment}>{trigger}</Menu.Button>

      <AnimatePresence>
        <Menu.Items
          as={motion.div}
          initial={{ opacity: 0, y: 4, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className={`
            absolute z-50 mt-2 min-w-[180px] origin-top-right
            rounded-xl border border-gray-100 bg-white py-1 shadow-lg
            focus:outline-none
            ${align === 'left' ? 'left-0' : 'right-0'}
          `}
        >
          {items.map((item, i) => {
            if (item.divider) {
              return <div key={i} className="my-1 border-t border-gray-100" />
            }
            return (
              <Menu.Item key={i}>
                {({ active }) => (
                  <button
                    onClick={item.onClick}
                    className={`
                      flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors duration-150
                      ${item.danger
                        ? active ? 'bg-rose-50 text-rose-700' : 'text-rose-600'
                        : active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                      }
                    `}
                  >
                    {item.icon && (
                      <item.icon className={`h-4 w-4 shrink-0 ${item.danger ? 'text-rose-500' : 'text-gray-400'}`} />
                    )}
                    {item.label}
                  </button>
                )}
              </Menu.Item>
            )
          })}
        </Menu.Items>
      </AnimatePresence>
    </Menu>
  )
}
