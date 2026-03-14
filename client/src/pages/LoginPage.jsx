import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { login } from '../api/auth'
import useAuthStore from '../store/authStore'
import { LogIn, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('All fields required')
    try {
      setLoading(true)
      const { data } = await login(form)
      setAuth(data)
      toast.success(`Welcome back, ${data.user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background: 'var(--accent)', color: '#000' }}>CI</div>
          <div>
            <p className="font-bold text-lg leading-none" style={{ color: 'var(--text-primary)' }}>CoreInventory</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Inventory Management Platform</p>
          </div>
        </div>

        <div className="card p-6">
          <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Sign In</h1>
          <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Access your inventory dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@company.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input className="input pr-10" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} onClick={() => setShowPw(s => !s)}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs hover:underline" style={{ color: 'var(--accent)' }}>Forgot password?</Link>
            </div>
            <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
              {loading ? 'Signing in...' : <><LogIn size={15} /> Sign In</>}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-4" style={{ color: 'var(--text-muted)' }}>
          No account? <Link to="/signup" className="hover:underline" style={{ color: 'var(--accent)' }}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}
