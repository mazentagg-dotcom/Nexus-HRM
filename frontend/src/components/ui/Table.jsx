import { useState } from 'react'
import { motion } from 'framer-motion'
import { Inbox } from 'lucide-react'

export default function Table({
  columns = [],
  data = [],
  onRowClick,
  className = '',
  emptyMessage = 'No data available',
  striped = true,
}) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-gray-100 shadow-sm ${className}`}>
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center"
              >
                <div className="flex flex-col items-center gap-2">
                  <Inbox className="h-10 w-10 text-gray-300" />
                  <p className="text-sm text-gray-500">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <motion.tr
                key={row.id || i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => onRowClick?.(row)}
                className={`
                  text-sm text-gray-900 transition-colors duration-150
                  ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : 'hover:bg-gray-50'}
                  ${striped && i % 2 === 1 ? 'bg-gray-50/50' : ''}
                `}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
