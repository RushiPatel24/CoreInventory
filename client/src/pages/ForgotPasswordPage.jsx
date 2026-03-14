import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { forgotPassword, verifyOTP, resetPassword } from '../api/auth'
import { KeyRound, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1) // 1=email, 2=otp, 3=newpw
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const sendOTP = async (e) => {
    e.preventDefault()
    if (!email) return toast.error('Email required')
    try {
      setLoading(true)
      await forgotPassword({ email })
      toast.success('OTP sent! Check server console.')
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setLoading(false) }
  }

  const checkOTP = async (e) => {
    e.preventDefault()
    if (!otp) return toast.error('OTP required')
    try {
      setLoading(true)
      await verifyOTP({ email, otp })
      toast.success('OTP verified')
      setStep(3)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
    } finally { setLoading(false) }
  }

  const doReset = async (e) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) return toast.error('Password must be at least 6 chars')
    try {
      setLoading(true)
      await resetPassword({ email, otp, newPassword })
      toast.success('Password reset! Please login.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background: 'var(--accent)', color: '#000' }}>CI</div>
          <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>CoreInventory</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound size={18} style={{ color: 'var(--accent)' }} />
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {step === 1 ? 'Forgot Password' : step === 2 ? 'Enter OTP' : 'New Password'}
            </h1>
          </div>

          {/* Step indicators */}
          <div className="flex gap-2 mb-5">
            {[1, 2, 3].map(s => (
              <div key={s} className="h-1 flex-1 rounded-full transition-all duration-300" style={{ background: s <= step ? 'var(--accent)' : 'var(--border)' }} />
            ))}
          </div>

          {step === 1 && (
            <form onSubmit={sendOTP} className="space-y-4">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Enter your email to receive a 6-digit OTP.</p>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={checkOTP} className="space-y-4">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Check the server console for your OTP.</p>
              <div>
                <label className="label">6-digit OTP</label>
                <input className="input stat-mono text-center text-lg tracking-widest" type="text" placeholder="000000" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} />
              </div>
              <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={doReset} className="space-y-4">
              <div>
                <label className="label">New Password</label>
                <input className="input" type="password" placeholder="Min 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm mt-4">
          <Link to="/login" className="flex items-center justify-center gap-1 hover:underline" style={{ color: 'var(--text-muted)' }}>
            <ArrowLeft size={13} /> Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
