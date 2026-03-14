import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getStock } from '../api/stock'
import DataTable from '../components/DataTable'
import PageHeader from '../components/PageHeader'
import { Search } from 'lucide-react'

export default function StockPage() {
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async () => {
    try {
      setLoading(true)
      const { data } = await getStock({ search })
      setStock(data)
    } catch {
      toast.error('Failed to load stock')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [search])

  const columns = [
    { key: 'product', label: 'Product', sortable: true, render: (v, row) => (
      <div>
        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{v?.name || row.productId?.name}</p>
        <p className="text-xs stat-mono" style={{ color: 'var(--text-muted)' }}>{v?.sku || row.productId?.sku}</p>
      </div>
    )},
    { key: 'perUnitCost', label: 'per unit cost', render: (v, row) => <span className="stat-mono">{(row.productId?.cost || 3000)} Rs</span> },
    { key: 'onHand', label: 'On hand', mono: true, render: (v, row) => v || row.quantity || 0 },
    { key: 'freeToUse', label: 'free to Use', mono: true, render: (v, row) => row.freeQty ?? row.quantity ?? 0 },
  ]

  return (
    <div>
      <PageHeader title="Stock" subtitle="This page contains the warehouse details & location.">
        
      </PageHeader>
      
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input pl-8" placeholder="Search product…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>User must be able to update the stock from here.</p>
      
      <DataTable columns={columns} data={stock} loading={loading} emptyMessage="No stock data" />
    </div>
  )
}
