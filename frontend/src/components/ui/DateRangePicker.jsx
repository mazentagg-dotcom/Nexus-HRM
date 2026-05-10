export default function DateRangePicker({
  startDate,
  endDate,
  onChange,
}) {
  const handleChange = (field) => (e) => {
    onChange({ ...{ startDate, endDate }, [field]: e.target.value })
  }

  const inputClass = `
    block w-full rounded-lg border border-gray-300 bg-white
    text-sm text-gray-900 placeholder-gray-400
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
    focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
    pl-3 pr-3 py-2.5
  `

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[140px]">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          From
        </label>
        <input
          type="date"
          value={startDate || ''}
          onChange={handleChange('startDate')}
          className={inputClass}
        />
      </div>
      <div className="flex-1 min-w-[140px]">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          To
        </label>
        <input
          type="date"
          value={endDate || ''}
          onChange={handleChange('endDate')}
          className={inputClass}
        />
      </div>
    </div>
  )
}
