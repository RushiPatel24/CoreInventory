import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getHistory } from '../api/history'
import { getProducts } from '../api/products'
import { getWarehouses } from '../api/warehouses'
import DataTable from '../components/DataTable'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function HistoryPage() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [filters, setFilters] = useState({ productId: '', warehouseId: '', type: '', startDate: '', endDate: '', search: '' })
  const [viewMode, setViewMode] = useState('list')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  const load = async () => {
    try {
      setLoading(true)
      const [hRes, pRes, wRes] = await Promise.all([
        getHistory({ ...filters, page, limit }),
        products.length ? Promise.resolve({ data: products }) : getProducts({}),
        warehouses.length ? Promise.resolve({ data: warehouses }) : getWarehouses(),
      ])
      setEntries(hRes.data.entries); setTotal(hRes.data.total)
      setProducts(pRes.data); setWarehouses(wRes.data)
    } catch { toast.error('Failed to load history') } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filters, page])

  const types = ['receipt', 'delivery', 'transfer_out', 'transfer_in', 'adjustment']

  const columns = [
    { key: '_id', label: 'Reference', render: (v, row) => <span className="stat-mono">{row.refDoc?.refNo || `WH/${row.type === 'receipt' ? 'IN' : row.type === 'delivery' ? 'OUT' : 'MV'}/${v.slice(-4).toUpperCase()}`}</span> },
    { key: 'timestamp', label: 'Date', render: v => <span className="stat-mono text-xs">{new Date(v).toLocaleDateString()}</span> },
    { key: 'contact', label: 'Contact', render: (v, row) => row.refDoc?.customer || row.refDoc?.supplier || row.doneBy?.name || '—' },
    { key: 'warehouseId', label: 'From', render: (v, row) => {
      if (row.type === 'receipt') return 'vendor'
      return v?.name || '—'
    }},
    { key: 'locationId', label: 'To', render: (v, row) => {
      if (row.type === 'delivery') return 'vendor'
      if (row.type === 'transfer_out') return row.refDoc?.toWarehouseId?.name || '—'
      if (row.type === 'transfer_in') return v?.name || '—'
      return v?.name || row.warehouseId?.name || '—'
    }},
    { key: 'delta', label: 'Quantity', render: v => <span className={`stat-mono font-semibold ${v > 0 ? 'text-green-400' : 'text-red-400'}`}>{v > 0 ? '+' : ''}{v}</span> },
    { key: 'type', label: 'Status', render: v => <span className="text-xs font-medium text-green-400 flex items-center gap-1">Ready</span> },
  ]

  const pages = Math.ceil(total / limit)

  return (
    <div>
      <PageHeader title="Move History" subtitle="Full stock movement ledger" />

      <div className="flex flex-wrap items-center justify-between mb-4">
        <div className="flex flex-wrap gap-3 flex-1">
          <input className="input w-48" placeholder="Search reference or contact…" value={filters.search} onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1) }} />
          <select className="input w-40" value={filters.productId} onChange={e => { setFilters(f => ({ ...f, productId: e.target.value })); setPage(1) }}>
            <option value="">All Products</option>
            {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <select className="input w-40" value={filters.warehouseId} onChange={e => { setFilters(f => ({ ...f, warehouseId: e.target.value })); setPage(1) }}>
            <option value="">All Warehouses</option>
            {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
          </select>
        <select className="input w-40" value={filters.type} onChange={e => { setFilters(f => ({ ...f, type: e.target.value })); setPage(1) }}>
          <option value="">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input className="input w-36" type="date" value={filters.startDate} onChange={e => { setFilters(f => ({ ...f, startDate: e.target.value })); setPage(1) }} />
        <input className="input w-36" type="date" value={filters.endDate} onChange={e => { setFilters(f => ({ ...f, endDate: e.target.value })); setPage(1) }} />
          <button className="btn-secondary text-sm" onClick={() => { setFilters({ productId: '', warehouseId: '', type: '', startDate: '', endDate: '', search: '' }); setPage(1) }}>Clear</button>
        </div>
        <div className="flex items-center gap-1 border rounded-lg overflow-hidden ml-4" style={{ borderColor: 'var(--border)' }}>
          <button className={`px-3 py-1.5 ${viewMode === 'list' ? 'bg-blue-500 text-white' : ''}`} onClick={() => setViewMode('list')}>List</button>
          <button className={`px-3 py-1.5 ${viewMode === 'kanban' ? 'bg-blue-500 text-white' : ''}`} onClick={() => setViewMode('kanban')}>Kanban</button>
        </div>
      </div>

      <DataTable columns={columns} data={entries} loading={loading} emptyMessage="No records match your filters" />

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
          <span>{total} total records</span>
          <div className="flex items-center gap-2">
            <button className="btn-secondary py-1 px-3 text-xs" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>
            <span className="stat-mono">Page {page} / {pages}</span>
            <button className="btn-secondary py-1 px-3 text-xs" disabled={page === pages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
          </div>
        </div>
      )}
    </div>
  )
}
