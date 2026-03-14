import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getAdjustments, createAdjustment, validateAdjustment, cancelAdjustment } from '../api/adjustments'
import { getProducts } from '../api/products'
import { getWarehouses } from '../api/warehouses'
import { getLocations } from '../api/locations'
import { getStock } from '../api/stock'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import { Plus, CheckCircle, XCircle, Trash2 } from 'lucide-react'

const emptyLine = () => ({ productId: '', locationId: '', warehouseId: '', countedQty: 0, reason: '' })

export default function AdjustmentsPage() {
  const [adjustments, setAdjustments] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [locations, setLocations] = useState([])
  const [form, setForm] = useState({ lines: [emptyLine()], notes: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const [aRes, pRes, wRes, lRes] = await Promise.all([getAdjustments(), getProducts({}), getWarehouses(), getLocations()])
      setAdjustments(aRes.data); setProducts(pRes.data); setWarehouses(wRes.data); setLocations(lRes.data)
    } catch { toast.error('Failed to load') } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleValidate = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Apply adjustment? Stock quantities will be updated.')) return
    try { await validateAdjustment(id); toast.success('Adjustment applied'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const handleCancel = async (id, e) => {
    e.stopPropagation()
    try { await cancelAdjustment(id); toast.success('Canceled'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const updateLine = (i, key, val) => setForm(f => ({ ...f, lines: f.lines.map((l, idx) => idx === i ? { ...l, [key]: val } : l) }))
  const locationsFor = (wId) => locations.filter(l => l.warehouseId?._id === wId || l.warehouseId === wId)

  const columns = [
    { key: 'refNo', label: 'Ref #', mono: true, sortable: true },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'lines', label: 'Lines', render: v => <span className="stat-mono">{v?.length || 0}</span> },
    { key: 'createdAt', label: 'Date', render: v => new Date(v).toLocaleDateString() },
    { key: '_id', label: 'Actions', render: (v, row) => (
      <div className="flex gap-2">
        {!['done','canceled'].includes(row.status) && (<button className="btn-primary py-1 px-2 text-xs" onClick={e => handleValidate(v, e)}><CheckCircle size={12} /> Apply</button>)}
        {!['done','canceled'].includes(row.status) && (<button className="btn-danger py-1 px-2 text-xs" onClick={e => handleCancel(v, e)}><XCircle size={12} /></button>)}
      </div>
    )},
  ]

  return (
    <div>
      <PageHeader title="Inventory Adjustments" subtitle="Correct stock quantities based on physical counts">
        <button className="btn-primary" onClick={() => { setForm({ lines: [emptyLine()], notes: '' }); setModalOpen(true) }}>
          <Plus size={15} /> New Adjustment
        </button>
      </PageHeader>
      <DataTable columns={columns} data={adjustments} loading={loading} emptyMessage="No adjustments yet" />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Inventory Adjustment" maxWidth="640px">
        <form onSubmit={async (e) => {
          e.preventDefault()
          try { setSaving(true); await createAdjustment(form); toast.success('Adjustment created'); setModalOpen(false); load() }
          catch (err) { toast.error(err.response?.data?.message || 'Error') }
          finally { setSaving(false) }
        }} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Adjustment Lines</label>
              <button type="button" className="text-xs" style={{ color: 'var(--accent)' }} onClick={() => setForm(f => ({ ...f, lines: [...f.lines, emptyLine()] }))}>+ Add Line</button>
            </div>
            {form.lines.map((line, i) => (
              <div key={i} className="p-3 rounded-lg mb-2 space-y-2" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="label">Product</label>
                    <select className="input" value={line.productId} onChange={e => updateLine(i, 'productId', e.target.value)}>
                      <option value="">Select…</option>
                      {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Warehouse</label>
                    <select className="input" value={line.warehouseId} onChange={e => { updateLine(i, 'warehouseId', e.target.value); updateLine(i, 'locationId', '') }}>
                      <option value="">Select…</option>
                      {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Location</label>
                    <select className="input" value={line.locationId} onChange={e => updateLine(i, 'locationId', e.target.value)}>
                      <option value="">Select…</option>
                      {locationsFor(line.warehouseId).map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center">
                  <div>
                    <label className="label">Counted Qty</label>
                    <input className="input stat-mono" type="number" min={0} value={line.countedQty} onChange={e => updateLine(i, 'countedQty', Number(e.target.value))} />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Reason</label>
                    <input className="input" placeholder="e.g. Damaged goods, Recount" value={line.reason} onChange={e => updateLine(i, 'reason', e.target.value)} />
                  </div>
                </div>
                {form.lines.length > 1 && (
                  <button type="button" className="text-xs" style={{ color: 'var(--danger)' }} onClick={() => setForm(f => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }))}>Remove line</button>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Create Adjustment'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
