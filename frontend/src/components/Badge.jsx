const colorMap = {
  indigo: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20',
  emerald: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
  rose: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20',
  sky: 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/20',
  purple: 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/20',
  gray: 'bg-gray-50 text-gray-700 ring-1 ring-gray-600/20',
  green: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
  red: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20',
  yellow: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
  blue: 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/20',
}

export default function Badge({ children, color = 'gray', className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorMap[color] || colorMap.gray} ${className}`}>
      {children}
    </span>
  )
}
