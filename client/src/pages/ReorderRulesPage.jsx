import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getReorderRules, upsertReorderRule, deleteReorderRule } from '../api/users'
import { getProducts } from '../api/products'
import { getWarehouses } from '../api/warehouses'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import { Plus, Trash2, Edit3 } from 'lucide-react'

export default function ReorderRulesPage() {
  const [rules, setRules] = useState([])
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ productId: '', warehouseId: '', minQty: 10 })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const [rRes, pRes, wRes] = await Promise.all([getReorderRules(), getProducts({}), getWarehouses()])
      setRules(rRes.data); setProducts(pRes.data); setWarehouses(wRes.data)
    } catch { toast.error('Failed to load') } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.productId || !form.warehouseId) return toast.error('All fields required')
    try { setSaving(true); await upsertReorderRule(form); toast.success('Rule saved'); setModalOpen(false); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete rule?')) return
    try { await deleteReorderRule(id); toast.success('Deleted'); load() }
    catch { toast.error('Error') }
  }

  const openEdit = (rule) => {
    setEditing(true)
    setForm({
      productId: rule.productId?._id || rule.productId,
      warehouseId: rule.warehouseId?._id || rule.warehouseId,
      minQty: rule.minQty
    })
    setModalOpen(true)
  }

  const columns = [
    { key: 'productId', label: 'Product', render: v => <span>{v?.name} <span className="stat-mono text-xs" style={{ color: 'var(--text-muted)' }}>{v?.sku}</span></span> },
    { key: 'warehouseId', label: 'Warehouse', render: v => v?.name },
    { key: 'minQty', label: 'Min Qty', mono: true },
    { key: '_id', label: 'Actions', render: (v, row) => (
      <div className="flex gap-2">
        <button className="btn-secondary py-1 px-2 text-xs" onClick={() => openEdit(row)}><Edit3 size={12} /> Edit</button>
        <button className="btn-danger py-1 px-2 text-xs" onClick={() => handleDelete(v)}><Trash2 size={12} /></button>
      </div>
    )},
  ]

  return (
    <div>
      <PageHeader title="Reorder Rules" subtitle="Set low-stock thresholds per product/warehouse">
        <button className="btn-primary" onClick={() => { setForm({ productId: '', warehouseId: '', minQty: 10 }); setEditing(false); setModalOpen(true) }}>
          <Plus size={15} /> Add Rule
        </button>
      </PageHeader>
      <DataTable columns={columns} data={rules} loading={loading} emptyMessage="No reorder rules set" />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Reorder Rule" : "New Reorder Rule"} maxWidth="420px">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Product *</label>
            <select className="input" disabled={editing} value={form.productId} onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}>
              <option value="">Select product…</option>
              {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
            </select>
          </div>
          <div>
            <label className="label">Warehouse *</label>
            <select className="input" disabled={editing} value={form.warehouseId} onChange={e => setForm(f => ({ ...f, warehouseId: e.target.value }))}>
              <option value="">Select warehouse…</option>
              {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Minimum Quantity *</label>
            <input className="input stat-mono" type="number" min={0} value={form.minQty} onChange={e => setForm(f => ({ ...f, minQty: Number(e.target.value) }))} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Rule'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
