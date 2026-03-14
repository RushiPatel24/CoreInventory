import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from '../api/warehouses'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import { Plus, Edit3, Trash2, CheckCircle, XCircle } from 'lucide-react'

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', address: '', isActive: true })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try { setLoading(true); const { data } = await getWarehouses(); setWarehouses(data) }
    catch { toast.error('Failed to load') } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm({ name: '', address: '', isActive: true }); setModalOpen(true) }
  const openEdit = (w) => { setEditing(w); setForm({ name: w.name, address: w.address || '', isActive: w.isActive }); setModalOpen(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name) return toast.error('Name required')
    try {
      setSaving(true)
      if (editing) await updateWarehouse(editing._id, form)
      else await createWarehouse(form)
      toast.success(editing ? 'Updated' : 'Created')
      setModalOpen(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete warehouse?')) return
    try { await deleteWarehouse(id); toast.success('Deleted'); load() }
    catch { toast.error('Cannot delete') }
  }

  const columns = [
    { key: 'name', label: 'Warehouse Name', sortable: true },
    { key: 'address', label: 'Address', render: v => v || '—' },
    { key: 'isActive', label: 'Status', render: v => v
      ? <span className="text-xs font-medium text-green-400 flex items-center gap-1"><CheckCircle size={12} /> Active</span>
      : <span className="text-xs font-medium text-red-400 flex items-center gap-1"><XCircle size={12} /> Inactive</span>
    },
    { key: '_id', label: 'Actions', render: (v, row) => (
      <div className="flex gap-2">
        <button className="btn-secondary py-1 px-2 text-xs" onClick={() => openEdit(row)}><Edit3 size={12} /> Edit</button>
        <button className="btn-danger py-1 px-2 text-xs" onClick={() => handleDelete(v)}><Trash2 size={12} /></button>
      </div>
    )},
  ]

  return (
    <div>
      <PageHeader title="Warehouses" subtitle="Manage storage facilities">
        <button className="btn-primary" onClick={openCreate}><Plus size={15} /> Add Warehouse</button>
      </PageHeader>
      <DataTable columns={columns} data={warehouses} loading={loading} emptyMessage="No warehouses yet" />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Warehouse' : 'New Warehouse'} maxWidth="400px">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Name *</label>
            <input className="input" placeholder="e.g. Main Warehouse" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Address</label>
            <textarea className="input" rows={2} placeholder="Full address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
            Active
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
