import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getLocations, createLocation, updateLocation, deleteLocation } from '../api/locations'
import { getWarehouses } from '../api/warehouses'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import { Plus, Edit3, Trash2 } from 'lucide-react'

export default function LocationsPage() {
  const [locations, setLocations] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterWarehouse, setFilterWarehouse] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ warehouseId: '', name: '', code: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const [lRes, wRes] = await Promise.all([getLocations(filterWarehouse ? { warehouseId: filterWarehouse } : {}), getWarehouses()])
      setLocations(lRes.data); setWarehouses(wRes.data)
    } catch { toast.error('Failed to load') } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filterWarehouse])

  const openCreate = () => { setEditing(null); setForm({ warehouseId: filterWarehouse || '', name: '', code: '' }); setModalOpen(true) }
  const openEdit = (l) => { setEditing(l); setForm({ warehouseId: l.warehouseId?._id || l.warehouseId, name: l.name, code: l.code || '' }); setModalOpen(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.warehouseId || !form.name) return toast.error('Warehouse and name required')
    try {
      setSaving(true)
      if (editing) await updateLocation(editing._id, form)
      else await createLocation(form)
      toast.success(editing ? 'Updated' : 'Created'); setModalOpen(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete location?')) return
    try { await deleteLocation(id); toast.success('Deleted'); load() }
    catch { toast.error('Cannot delete') }
  }

  const columns = [
    { key: 'name', label: 'Location Name', sortable: true },
    { key: 'code', label: 'Code', mono: true, render: v => v || '—' },
    { key: 'warehouseId', label: 'Warehouse', render: v => v?.name || '—' },
    { key: '_id', label: 'Actions', render: (v, row) => (
      <div className="flex gap-2">
        <button className="btn-secondary py-1 px-2 text-xs" onClick={() => openEdit(row)}><Edit3 size={12} /> Edit</button>
        <button className="btn-danger py-1 px-2 text-xs" onClick={() => handleDelete(v)}><Trash2 size={12} /></button>
      </div>
    )},
  ]

  return (
    <div>
      <PageHeader title="Locations" subtitle="Storage locations within warehouses">
        <button className="btn-primary" onClick={openCreate}><Plus size={15} /> Add Location</button>
      </PageHeader>
      <div className="mb-4">
        <select className="input w-52" value={filterWarehouse} onChange={e => setFilterWarehouse(e.target.value)}>
          <option value="">All Warehouses</option>
          {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
        </select>
      </div>
      <DataTable columns={columns} data={locations} loading={loading} emptyMessage="No locations yet" />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Location' : 'New Location'} maxWidth="400px">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Warehouse *</label>
            <select className="input" value={form.warehouseId} onChange={e => setForm(f => ({ ...f, warehouseId: e.target.value }))}>
              <option value="">Select warehouse…</option>
              {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Location Name *</label>
              <input className="input" placeholder="e.g. Rack A-01" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Code</label>
              <input className="input stat-mono" placeholder="e.g. A-01" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
