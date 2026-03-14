import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getTransfers, createTransfer, validateTransfer, cancelTransfer } from '../api/transfers'
import { getProducts } from '../api/products'
import { getWarehouses } from '../api/warehouses'
import { getLocations } from '../api/locations'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import { Plus, CheckCircle, XCircle, Trash2 } from 'lucide-react'

export default function TransfersPage() {
  const [transfers, setTransfers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [locations, setLocations] = useState([])
  const [form, setForm] = useState({ fromWarehouseId: '', fromLocationId: '', toWarehouseId: '', toLocationId: '', lines: [{ productId: '', qty: 1 }], notes: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const [tRes, pRes, wRes, lRes] = await Promise.all([getTransfers(), getProducts({}), getWarehouses(), getLocations()])
      setTransfers(tRes.data); setProducts(pRes.data); setWarehouses(wRes.data); setLocations(lRes.data)
    } catch { toast.error('Failed to load') } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleValidate = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Validate transfer? Stock will be moved.')) return
    try { await validateTransfer(id); toast.success('Transfer done!'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Insufficient stock') }
  }

  const handleCancel = async (id, e) => {
    e.stopPropagation()
    try { await cancelTransfer(id); toast.success('Canceled'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const updateLine = (i, key, val) => setForm(f => ({ ...f, lines: f.lines.map((l, idx) => idx === i ? { ...l, [key]: val } : l) }))
  const locationsFor = (wId) => locations.filter(l => l.warehouseId?._id === wId || l.warehouseId === wId)

  const columns = [
    { key: 'refNo', label: 'Ref #', mono: true, sortable: true },
    { key: 'fromLocationId', label: 'From', render: (v, row) => `${row.fromWarehouseId?.name || '?'} / ${v?.name || '?'}` },
    { key: 'toLocationId', label: 'To', render: (v, row) => `${row.toWarehouseId?.name || '?'} / ${v?.name || '?'}` },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'createdAt', label: 'Date', render: v => new Date(v).toLocaleDateString() },
    { key: '_id', label: 'Actions', render: (v, row) => (
      <div className="flex gap-2">
        {!['done','canceled'].includes(row.status) && (<button className="btn-primary py-1 px-2 text-xs" onClick={e => handleValidate(v, e)}><CheckCircle size={12} /> Validate</button>)}
        {!['done','canceled'].includes(row.status) && (<button className="btn-danger py-1 px-2 text-xs" onClick={e => handleCancel(v, e)}><XCircle size={12} /></button>)}
      </div>
    )},
  ]

  return (
    <div>
      <PageHeader title="Internal Transfers" subtitle="Move stock between locations">
        <button className="btn-primary" onClick={() => { setForm({ fromWarehouseId: '', fromLocationId: '', toWarehouseId: '', toLocationId: '', lines: [{ productId: '', qty: 1 }], notes: '' }); setModalOpen(true) }}>
          <Plus size={15} /> New Transfer
        </button>
      </PageHeader>
      <DataTable columns={columns} data={transfers} loading={loading} emptyMessage="No transfers yet" />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Internal Transfer" maxWidth="600px">
        <form onSubmit={async (e) => {
          e.preventDefault()
          try { setSaving(true); await createTransfer(form); toast.success('Transfer created'); setModalOpen(false); load() }
          catch (err) { toast.error(err.response?.data?.message || 'Error') }
          finally { setSaving(false) }
        }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--accent)' }}>FROM</p>
              <div className="space-y-2">
                <div>
                  <label className="label">Warehouse</label>
                  <select className="input" value={form.fromWarehouseId} onChange={e => setForm(f => ({ ...f, fromWarehouseId: e.target.value, fromLocationId: '' }))}>
                    <option value="">Select…</option>
                    {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Location</label>
                  <select className="input" value={form.fromLocationId} onChange={e => setForm(f => ({ ...f, fromLocationId: e.target.value }))}>
                    <option value="">Select…</option>
                    {locationsFor(form.fromWarehouseId).map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: '#3b82f6' }}>TO</p>
              <div className="space-y-2">
                <div>
                  <label className="label">Warehouse</label>
                  <select className="input" value={form.toWarehouseId} onChange={e => setForm(f => ({ ...f, toWarehouseId: e.target.value, toLocationId: '' }))}>
                    <option value="">Select…</option>
                    {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Location</label>
                  <select className="input" value={form.toLocationId} onChange={e => setForm(f => ({ ...f, toLocationId: e.target.value }))}>
                    <option value="">Select…</option>
                    {locationsFor(form.toWarehouseId).map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Products</label>
              <button type="button" className="text-xs" style={{ color: 'var(--accent)' }} onClick={() => setForm(f => ({ ...f, lines: [...f.lines, { productId: '', qty: 1 }] }))}>+ Add</button>
            </div>
            {form.lines.map((line, i) => (
              <div key={i} className="flex gap-2 mb-2 items-center">
                <select className="input flex-1" value={line.productId} onChange={e => updateLine(i, 'productId', e.target.value)}>
                  <option value="">Select product…</option>
                  {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
                <input className="input w-24 stat-mono" type="number" min={1} value={line.qty} onChange={e => updateLine(i, 'qty', Number(e.target.value))} />
                <button type="button" onClick={() => setForm(f => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }))} style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Create Transfer'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
