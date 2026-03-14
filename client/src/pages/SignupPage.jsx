import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { signup } from '../api/auth'
import useAuthStore from '../store/authStore'
import { UserPlus } from 'lucide-react'

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' })
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return toast.error('All fields required')
    try {
      setLoading(true)
      const { data } = await signup(form)
      setAuth(data)
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background: 'var(--accent)', color: '#000' }}>CI</div>
          <div>
            <p className="font-bold text-lg leading-none" style={{ color: 'var(--text-primary)' }}>CoreInventory</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Create your account</p>
          </div>
        </div>

        <div className="card p-6">
          <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Create Account</h1>
          <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Join your inventory workspace</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" type="text" placeholder="John Doe" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@company.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="Min 6 characters" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div>
              <label className="label">Role</label>
              <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="staff">Warehouse Staff</option>
                <option value="manager">Inventory Manager</option>
              </select>
            </div>
            <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
              {loading ? 'Creating account...' : <><UserPlus size={15} /> Create Account</>}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-4" style={{ color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" className="hover:underline" style={{ color: 'var(--accent)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
