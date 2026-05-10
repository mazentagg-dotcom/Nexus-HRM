export function formatCurrency(amount, currency = 'USD') {
  if (amount == null) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date, format = 'MMM dd, yyyy') {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const pad = (n) => String(n).padStart(2, '0')

  const tokens = {
    'MMM': months[d.getMonth()],
    'MM': pad(d.getMonth() + 1),
    'dd': pad(d.getDate()),
    'yyyy': d.getFullYear(),
    'HH': pad(d.getHours()),
    'mm': pad(d.getMinutes()),
    'ss': pad(d.getSeconds()),
  }

  let result = format
  for (const [token, value] of Object.entries(tokens)) {
    result = result.replace(token, value)
  }
  return result
}

export function formatNumber(num) {
  if (num == null) return '-'
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatPercentage(value) {
  if (value == null) return '-'
  return `${Number(value).toFixed(1)}%`
}

export function truncate(str, length = 50) {
  if (!str) return ''
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9)
}
