import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'

export default function DataTable({ columns, data, loading, emptyMessage = 'No records found', onRowClick }) {
  const [sortField, setSortField] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const sorted = [...(data || [])].sort((a, b) => {
    if (!sortField) return 0
    const va = a[sortField], vb = b[sortField]
    if (va == null) return 1; if (vb == null) return -1
    const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true })
    return sortDir === 'asc' ? cmp : -cmp
  })

  return (
    <div className="card overflow-hidden flex flex-col">
      {loading ? (
        <LoadingSpinner className="py-16" size={32} />
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm min-w-[600px] sm:min-w-0">
            <thead>
              <tr style={{ background: 'var(--bg-secondary)' }}>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="text-left px-3 sm:px-4 py-3 font-medium text-[10px] sm:text-xs uppercase tracking-wide select-none"
                    style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', cursor: col.sortable ? 'pointer' : 'default' }}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      {col.sortable && sortField === col.key && (
                        sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                sorted.map((row, i) => (
                  <tr
                    key={row._id || i}
                    className="table-row group"
                    style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                        {col.render ? col.render(row[col.key], row) : (
                          col.mono ? <span className="stat-mono">{row[col.key]}</span> : row[col.key]
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
