import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getDeliveries, createDelivery, validateDelivery, cancelDelivery, updateDelivery } from '../api/deliveries'
import { getProducts } from '../api/products'
import { getWarehouses } from '../api/warehouses'
import { getLocations } from '../api/locations'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import { Plus, CheckCircle, XCircle, Trash2 } from 'lucide-react'

const emptyLine = () => ({ productId: '', locationId: '', warehouseId: '', qty: 1 })

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [locations, setLocations] = useState([])
  const [form, setForm] = useState({ customer: '', lines: [emptyLine()], notes: '' })
  const [saving, setSaving] = useState(false)
  const [viewMode, setViewMode] = useState('list')
  const [search, setSearch] = useState('')

  const load = async () => {
    try {
      setLoading(true)
      const [dRes, pRes, wRes, lRes] = await Promise.all([getDeliveries(), getProducts({}), getWarehouses(), getLocations()])
      setDeliveries(dRes.data); setProducts(pRes.data); setWarehouses(wRes.data); setLocations(lRes.data)
    } catch { toast.error('Failed to load') } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await createDelivery(form)
      toast.success('Delivery created'); setModalOpen(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const handleValidate = async (id, e) => {
    if (e) e.stopPropagation()
    if (!confirm('Validate delivery? Stock will be deducted.')) return
    try { const { data } = await validateDelivery(id); toast.success('Delivery done! Stock updated.'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Insufficient stock') }
  }

  const handleStatusChange = async (id, newStatus, e) => {
    if (e) e.stopPropagation()
    if (newStatus === 'done') return handleValidate(id, e)
    try {
      setLoading(true)
      // Call update API (we'll just use the existing updateDelivery via imported function, so we need to put it in api/deliveries.js as updateDelivery(id, {status}))
      await updateDelivery(id, { status: newStatus })
      toast.success('Status updated')
      load()
    } catch (err) {
      toast.error('Error updating status')
      setLoading(false)
    }
  }

  const handleCancel = async (id, e) => {
    if (e) e.stopPropagation()
    try { await cancelDelivery(id); toast.success('Canceled'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const updateLine = (i, key, val) => setForm(f => ({ ...f, lines: f.lines.map((l, idx) => idx === i ? { ...l, [key]: val } : l) }))
  const locationsByWarehouse = (wId) => locations.filter(l => l.warehouseId?._id === wId || l.warehouseId === wId)

  const columns = [
    { key: 'refNo', label: 'Reference', mono: true, sortable: true },
    { key: 'from', label: 'From', render: (v, row) => row.lines?.[0]?.warehouseId?.name || '—' },
    { key: 'to', label: 'To', render: () => 'vendor' },
    { key: 'customer', label: 'Contact', render: v => v || '—' },
    { key: 'createdAt', label: 'Schedule date', render: v => new Date(v).toLocaleDateString() },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: '_id', label: 'Actions', render: (v, row) => (
      <div className="flex gap-2">
        {!['done','canceled'].includes(row.status) && (
          <button className="btn-primary py-1 px-2 text-xs" onClick={e => handleValidate(v, e)}><CheckCircle size={12} /> Validate</button>
        )}
        {!['done','canceled'].includes(row.status) && (
          <button className="btn-danger py-1 px-2 text-xs" onClick={e => handleCancel(v, e)}><XCircle size={12} /></button>
        )}
      </div>
    )},
  ]

  const kanbanStatuses = ['draft', 'waiting', 'ready', 'done']
  const filteredDeliveries = deliveries.filter(d => (!search || d.refNo?.includes(search) || d.customer?.includes(search)))

  return (
    <div>
      <PageHeader title="Delivery" subtitle="Outgoing stock to customers">
        <button className="btn-primary" onClick={() => { setForm({ customer: '', lines: [emptyLine()], notes: '' }); setModalOpen(true) }}>
          <Plus size={15} /> New Delivery
        </button>
      </PageHeader>
      <div className="flex flex-wrap items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <input className="input w-64" placeholder="Search Delivery based on reference & contacts" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-1 border rounded-lg overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <button className={`px-3 py-1.5 ${viewMode === 'list' ? 'bg-blue-500 text-white' : ''}`} onClick={() => setViewMode('list')}>List</button>
          <button className={`px-3 py-1.5 ${viewMode === 'kanban' ? 'bg-blue-500 text-white' : ''}`} onClick={() => setViewMode('kanban')}>Kanban</button>
        </div>
      </div>
      <div className="mb-4">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Populate all delivery orders</p>
      </div>

      {viewMode === 'list' ? (
        <DataTable columns={columns} data={filteredDeliveries} loading={loading} emptyMessage="No deliveries yet" />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 h-full">
          {kanbanStatuses.map(status => (
            <div key={status} className="flex-1 min-w-[280px] p-4 rounded-xl flex flex-col gap-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold uppercase text-xs tracking-wider" style={{ color: 'var(--text-secondary)' }}>{status}</h3>
                <span className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">{filteredDeliveries.filter(d => d.status === status).length}</span>
              </div>
              <div className="flex-1 flex flex-col gap-3 overflow-y-auto min-h-[150px]">
                {filteredDeliveries.filter(d => d.status === status).map(d => (
                  <div key={d._id} className="p-3 rounded-lg border shadow-sm cursor-pointer hover:border-blue-400 transition-colors" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }} onClick={() => { setForm({ ...d, lines: d.lines.map(l => ({ ...l, productId: l.productId?._id, warehouseId: l.warehouseId?._id, locationId: l.locationId?._id })) }); setModalOpen(true) }}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="stat-mono text-sm font-bold">{d.refNo}</span>
                      <StatusBadge status={d.status} />
                    </div>
                    <p className="text-sm mb-1">{d.customer || 'No Customer'}</p>
                    <p className="text-xs stat-mono mb-3" style={{ color: 'var(--text-muted)' }}>{new Date(d.createdAt).toLocaleDateString()}</p>
                    {d.status !== 'done' && d.status !== 'canceled' && (
                      <div className="flex gap-2 mt-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                        {status !== 'draft' && <button className="btn-secondary py-1 px-2 text-[10px]" onClick={e => handleStatusChange(d._id, kanbanStatuses[kanbanStatuses.indexOf(status) - 1], e)}>← Move</button>}
                        {status !== 'done' && <button className="btn-secondary py-1 px-2 text-[10px] ml-auto" onClick={e => handleStatusChange(d._id, kanbanStatuses[kanbanStatuses.indexOf(status) + 1], e)}>Move →</button>}
                      </div>
                    )}
                  </div>
                ))}
                {filteredDeliveries.filter(d => d.status === status).length === 0 && <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>Empty</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Delivery Order" maxWidth="640px">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Customer</label>
            <input className="input" placeholder="Customer name" value={form.customer} onChange={e => setForm(f => ({ ...f, customer: e.target.value }))} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Product Lines</label>
              <button type="button" className="text-xs" style={{ color: 'var(--accent)' }} onClick={() => setForm(f => ({ ...f, lines: [...f.lines, emptyLine()] }))}>+ Add Line</button>
            </div>
            <div className="space-y-2">
              {form.lines.map((line, i) => (
                <div key={i} className={`flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-2 items-start p-3 rounded-lg ${line.qty > 50 ? 'border-red-500 bg-red-500/10' : ''}`} style={{ background: line.qty > 50 ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-secondary)', border: `1px solid ${line.qty > 50 ? 'red' : 'var(--border)'}` }}>
                  <div className="w-full sm:col-span-4">
                    <label className="label">Product</label>
                    <select className="input" value={line.productId} onChange={e => updateLine(i, 'productId', e.target.value)}>
                      <option value="">Select…</option>
                      {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="w-full sm:col-span-3">
                    <label className="label">Warehouse</label>
                    <select className="input" value={line.warehouseId} onChange={e => { updateLine(i, 'warehouseId', e.target.value); updateLine(i, 'locationId', '') }}>
                      <option value="">Select…</option>
                      {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                    </select>
                  </div>
                  <div className="w-full sm:col-span-2">
                    <label className="label">Location</label>
                    <select className="input" value={line.locationId} onChange={e => updateLine(i, 'locationId', e.target.value)}>
                      <option value="">Select…</option>
                      {locationsByWarehouse(line.warehouseId).map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                    </select>
                  </div>
                  <div className="w-full sm:col-span-2">
                    <label className="label">Qty</label>
                    <input className="input stat-mono px-2" type="number" min={1} value={line.qty} onChange={e => updateLine(i, 'qty', Number(e.target.value))} />
                  </div>
                  <div className="w-full sm:col-span-1 flex items-end justify-end sm:justify-center sm:pb-2">
                    <button type="button" onClick={() => setForm(f => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }))} style={{ color: 'var(--danger)' }} className="p-2 sm:p-0"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Create Delivery'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
