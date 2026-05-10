import { forwardRef, useState, useRef, useEffect } from 'react'

const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    rows = 4,
    className = '',
    disabled = false,
    autoResize = false,
    id,
    ...rest
  },
  ref
) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')
  const internalRef = useRef(null)
  const activeRef = ref || internalRef

  useEffect(() => {
    if (autoResize && activeRef?.current) {
      activeRef.current.style.height = 'auto'
      activeRef.current.style.height = activeRef.current.scrollHeight + 'px'
    }
  }, [autoResize, activeRef, rest.value])

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <textarea
        ref={activeRef}
        id={textareaId}
        rows={rows}
        disabled={disabled}
        className={`
          block w-full rounded-lg border border-gray-300 bg-white
          text-sm text-gray-900 placeholder-gray-400
          transition-all duration-200 resize-none
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
          pl-3 pr-3 py-2.5
          ${error ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}
          ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}
          ${autoResize ? 'overflow-hidden' : ''}
        `}
        {...rest}
      />
      {error && (
        <p className="mt-1.5 text-xs text-rose-600">{error}</p>
      )}
    </div>
  )
})

export default Textarea
