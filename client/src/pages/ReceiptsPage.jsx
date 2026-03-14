import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getReceipts, createReceipt, validateReceipt, cancelReceipt } from '../api/receipts'
import { getProducts } from '../api/products'
import { getWarehouses } from '../api/warehouses'
import { getLocations } from '../api/locations'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import { Plus, CheckCircle, XCircle, Trash2 } from 'lucide-react'

const emptyLine = () => ({ productId: '', locationId: '', warehouseId: '', expectedQty: 1, receivedQty: 0 })

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [locations, setLocations] = useState([])
  const [form, setForm] = useState({ supplier: '', lines: [emptyLine()], notes: '' })
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  const load = async () => {
    try {
      setLoading(true)
      const [rRes, pRes, wRes, lRes] = await Promise.all([getReceipts(), getProducts({}), getWarehouses(), getLocations()])
      setReceipts(rRes.data); setProducts(pRes.data); setWarehouses(wRes.data); setLocations(lRes.data)
    } catch { toast.error('Failed to load') } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await createReceipt(form)
      toast.success('Receipt created')
      setModalOpen(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const handleValidate = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Validate this receipt? Stock will be updated.')) return
    try { await validateReceipt(id); toast.success('Receipt validated — stock updated'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const handleCancel = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Cancel this receipt?')) return
    try { await cancelReceipt(id); toast.success('Canceled'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const updateLine = (i, key, val) => setForm(f => ({ ...f, lines: f.lines.map((l, idx) => idx === i ? { ...l, [key]: val } : l) }))
  const removeLine = (i) => setForm(f => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }))

  const locationsByWarehouse = (wId) => locations.filter(l => l.warehouseId?._id === wId || l.warehouseId === wId)

  const columns = [
    { key: 'refNo', label: 'Ref #', mono: true, sortable: true },
    { key: 'supplier', label: 'Supplier', render: v => v || '—' },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'lines', label: 'Lines', render: v => <span className="stat-mono">{v?.length || 0}</span> },
    { key: 'createdAt', label: 'Date', render: v => new Date(v).toLocaleDateString() },
    { key: '_id', label: 'Actions', render: (v, row) => (
      <div className="flex gap-2">
        {row.status !== 'done' && row.status !== 'canceled' && (
          <button className="btn-primary py-1 px-2 text-xs" onClick={e => handleValidate(v, e)}><CheckCircle size={12} /> Validate</button>
        )}
        {row.status !== 'done' && row.status !== 'canceled' && (
          <button className="btn-danger py-1 px-2 text-xs" onClick={e => handleCancel(v, e)}><XCircle size={12} /></button>
        )}
      </div>
    )},
  ]

  return (
    <div>
      <PageHeader title="Receipts" subtitle="Incoming stock from suppliers">
        <button className="btn-primary" onClick={() => { setForm({ supplier: '', lines: [emptyLine()], notes: '' }); setModalOpen(true) }}>
          <Plus size={15} /> New Receipt
        </button>
      </PageHeader>

      <DataTable columns={columns} data={receipts} loading={loading} emptyMessage="No receipts yet" />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Receipt" maxWidth="640px">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Supplier</label>
            <input className="input" placeholder="Supplier name" value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Product Lines</label>
              <button type="button" className="text-xs" style={{ color: 'var(--accent)' }} onClick={() => setForm(f => ({ ...f, lines: [...f.lines, emptyLine()] }))}>+ Add Line</button>
            </div>
            <div className="space-y-2">
              {form.lines.map((line, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-start p-3 rounded-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <div className="col-span-4">
                    <label className="label">Product</label>
                    <select className="input" value={line.productId} onChange={e => updateLine(i, 'productId', e.target.value)}>
                      <option value="">Select…</option>
                      {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <label className="label">Warehouse</label>
                    <select className="input" value={line.warehouseId} onChange={e => { updateLine(i, 'warehouseId', e.target.value); updateLine(i, 'locationId', '') }}>
                      <option value="">Select…</option>
                      {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="label">Location</label>
                    <select className="input" value={line.locationId} onChange={e => updateLine(i, 'locationId', e.target.value)}>
                      <option value="">Select…</option>
                      {locationsByWarehouse(line.warehouseId).map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="label">Qty</label>
                    <input className="input stat-mono px-2" type="number" min={1} value={line.expectedQty} onChange={e => updateLine(i, 'expectedQty', Number(e.target.value))} />
                  </div>
                  <div className="col-span-1 flex items-end pb-1">
                    <button type="button" onClick={() => removeLine(i)} style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea className="input" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Create Receipt'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
