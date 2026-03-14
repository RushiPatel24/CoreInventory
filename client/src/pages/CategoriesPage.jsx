import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categories'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import { Plus, Edit3, Trash2 } from 'lucide-react'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try { setLoading(true); const { data } = await getCategories(); setCategories(data) }
    catch { toast.error('Failed to load categories') } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '' }); setModalOpen(true) }
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, description: c.description || '' }); setModalOpen(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name) return toast.error('Name required')
    try {
      setSaving(true)
      if (editing) await updateCategory(editing._id, form)
      else await createCategory(form)
      toast.success(editing ? 'Updated' : 'Created')
      setModalOpen(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return
    try { await deleteCategory(id); toast.success('Deleted'); load() }
    catch { toast.error('Cannot delete') }
  }

  const columns = [
    { key: 'name', label: 'Category Name', sortable: true },
    { key: 'description', label: 'Description', render: v => v || <span style={{ color: 'var(--text-muted)' }}>—</span> },
    { key: '_id', label: 'Actions', render: (v, row) => (
      <div className="flex gap-2">
        <button className="btn-secondary py-1 px-2 text-xs" onClick={e => { e.stopPropagation(); openEdit(row) }}><Edit3 size={12} /> Edit</button>
        <button className="btn-danger py-1 px-2 text-xs" onClick={e => { e.stopPropagation(); handleDelete(v) }}><Trash2 size={12} /></button>
      </div>
    )},
  ]

  return (
    <div>
      <PageHeader title="Categories" subtitle="Manage product categories">
        <button className="btn-primary" onClick={openCreate}><Plus size={15} /> Add Category</button>
      </PageHeader>
      <DataTable columns={columns} data={categories} loading={loading} emptyMessage="No categories yet" />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'New Category'} maxWidth="400px">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Name *</label>
            <input className="input" placeholder="e.g. Electronics" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={2} placeholder="Optional description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
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
