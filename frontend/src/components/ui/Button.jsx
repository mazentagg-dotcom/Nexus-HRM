import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

const variantStyles = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm focus-visible:ring-indigo-500',
  secondary:
    'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus-visible:ring-indigo-500',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 shadow-sm focus-visible:ring-rose-500',
  ghost:
    'text-gray-600 hover:bg-gray-100 focus-visible:ring-gray-400',
  outline:
    'border border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus-visible:ring-indigo-500',
}

const sizeStyles = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  disabled = false,
  icon: Icon,
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...rest
}) {
  const isDisabled = disabled || loading

  return (
    <motion.button
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg
        transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        ${variantStyles[variant] || variantStyles.primary}
        ${sizeStyles[size] || sizeStyles.md}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
        ${className}
      `}
      {...rest}
    >
      {loading ? (
        <Loader2 className="animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="shrink-0" />
      ) : null}
      {children}
    </motion.button>
  )
}
