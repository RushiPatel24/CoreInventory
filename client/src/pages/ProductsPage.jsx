import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getProducts, createProduct, updateProduct, archiveProduct, unarchiveProduct, deleteProduct } from '../api/products'
import { getCategories } from '../api/categories'
import { getStock } from '../api/stock'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import { Plus, Archive, ArchiveRestore, Edit3, Search, Package, Trash2 } from 'lucide-react'

const emptyForm = { name: '', sku: '', category: '', unitOfMeasure: 'pcs', reorderQty: 0 }

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const [pRes, cRes] = await Promise.all([
        getProducts({ search, category: filterCat || undefined, archived: showArchived }),
        getCategories()
      ])
      setProducts(pRes.data)
      setCategories(cRes.data)
    } catch { toast.error('Failed to load products') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search, filterCat, showArchived])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (p) => { setEditing(p); setForm({ name: p.name, sku: p.sku, category: p.category?._id || '', unitOfMeasure: p.unitOfMeasure, reorderQty: p.reorderQty }); setModalOpen(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name || !form.sku) return toast.error('Name and SKU required')
    try {
      setSaving(true)
      if (editing) await updateProduct(editing._id, form)
      else await createProduct(form)
      toast.success(editing ? 'Product updated' : 'Product created')
      setModalOpen(false)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const handleArchive = async (p) => {
    try {
      if (p.isArchived) await unarchiveProduct(p._id)
      else await archiveProduct(p._id)
      toast.success(p.isArchived ? 'Unarchived' : 'Archived')
      load()
    } catch { toast.error('Error') }
  }

  const handleDelete = async (p) => {
    if (!confirm('Are you sure you want to permanently delete this product?')) return
    try {
      await deleteProduct(p._id)
      toast.success('Product deleted')
      load()
    } catch { toast.error('Failed to delete product') }
  }

  const columns = [
    { key: 'name', label: 'Product', sortable: true, render: (v, row) => (
      <div>
        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{v}</p>
        <p className="text-xs stat-mono" style={{ color: 'var(--text-muted)' }}>{row.sku}</p>
      </div>
    )},
    { key: 'category', label: 'Category', render: (v) => v?.name || <span style={{ color: 'var(--text-muted)' }}>—</span> },
    { key: 'unitOfMeasure', label: 'UoM', mono: true },
    { key: 'reorderQty', label: 'Reorder Qty', mono: true },
    { key: 'isArchived', label: 'Status', render: (v) => v
      ? <StatusBadge status="canceled" />
      : <span className="text-xs font-medium" style={{ color: '#10b981' }}>Active</span>
    },
    { key: '_id', label: 'Actions', render: (v, row) => (
      <div className="flex items-center gap-2">
        <button className="btn-secondary py-1 px-2 text-xs" onClick={(e) => { e.stopPropagation(); openEdit(row) }}><Edit3 size={12} /> Edit</button>
        <button className="btn-secondary py-1 px-2 text-xs" onClick={(e) => { e.stopPropagation(); handleArchive(row) }}>
          {row.isArchived ? <><ArchiveRestore size={12} /> Restore</> : <><Archive size={12} /> Archive</>}
        </button>
        <button className="btn-danger py-1 px-2 text-xs" onClick={(e) => { e.stopPropagation(); handleDelete(row) }}><Trash2 size={12} /> Delete</button>
      </div>
    )},
  ]

  return (
    <div>
      <PageHeader title="Products" subtitle="Manage your product catalog">
        <button className="btn-primary" onClick={openCreate}><Plus size={15} /> Add Product</button>
      </PageHeader>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input pl-8" placeholder="Search name or SKU…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-40" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} />
          Show Archived
        </label>
      </div>

      <DataTable columns={columns} data={products} loading={loading} emptyMessage="No products found" />

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'New Product'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Product Name *</label>
              <input className="input" placeholder="e.g. Steel Bolt M10" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">SKU *</label>
              <input className="input stat-mono" placeholder="e.g. STL-BOLT-M10" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option value="">No Category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Unit of Measure</label>
              <input className="input" placeholder="pcs, kg, m, box…" value={form.unitOfMeasure} onChange={e => setForm(f => ({ ...f, unitOfMeasure: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Reorder Quantity</label>
            <input className="input stat-mono" type="number" min={0} value={form.reorderQty} onChange={e => setForm(f => ({ ...f, reorderQty: Number(e.target.value) }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Product'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
