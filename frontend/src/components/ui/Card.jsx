import { motion } from 'framer-motion'

export default function Card({
  children,
  className = '',
  padding = 'p-6',
  hover = false,
  as: Element = 'div',
  ...rest
}) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' } : {}}
      transition={{ duration: 0.2 }}
    >
      <Element
        className={`
          bg-white rounded-xl border border-gray-100 shadow-sm
          transition-shadow duration-200
          ${padding}
          ${className}
        `}
        {...rest}
      >
        {children}
      </Element>
    </motion.div>
  )
}
