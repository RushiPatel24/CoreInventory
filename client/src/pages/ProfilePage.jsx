import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getMe, updateMe, changePassword } from '../api/users'
import PageHeader from '../components/PageHeader'
import { User, KeyRound } from 'lucide-react'
import useAuthStore from '../store/authStore'

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [profileForm, setProfileForm] = useState({ name: '', email: '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' })
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const { setAuth, token } = useAuthStore()

  const load = async () => {
    try { const { data } = await getMe(); setUser(data); setProfileForm({ name: data.name, email: data.email }) }
    catch { toast.error('Failed to load profile') } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      setSavingProfile(true)
      const { data } = await updateMe(profileForm)
      setUser(data); setAuth({ user: data, token })
      toast.success('Profile updated')
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSavingProfile(false) }
  }

  const handleChangePw = async (e) => {
    e.preventDefault()
    if (!pwForm.currentPassword || !pwForm.newPassword) return toast.error('All fields required')
    try {
      setSavingPw(true)
      await changePassword(pwForm)
      toast.success('Password changed')
      setPwForm({ currentPassword: '', newPassword: '' })
    } catch (err) { toast.error(err.response?.data?.message || 'Incorrect password') }
    finally { setSavingPw(false) }
  }

  if (loading) return null

  return (
    <div className="max-w-2xl">
      <PageHeader title="My Profile" subtitle="Manage your account details" />

      {/* User info card */}
      <div className="card p-5 mb-4">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold" style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
            <p className="text-sm capitalize" style={{ color: 'var(--text-muted)' }}>{user?.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <User size={15} style={{ color: 'var(--accent)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Profile Details</p>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Full Name</label>
              <input className="input" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={profileForm.email} onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={savingProfile}>{savingProfile ? 'Saving…' : 'Update Profile'}</button>
          </div>
        </form>
      </div>

      {/* Change password card */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound size={15} style={{ color: 'var(--accent)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Change Password</p>
        </div>
        <form onSubmit={handleChangePw} className="space-y-3">
          <div>
            <label className="label">Current Password</label>
            <input className="input" type="password" placeholder="••••••••" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} />
          </div>
          <div>
            <label className="label">New Password</label>
            <input className="input" type="password" placeholder="••••••••" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={savingPw}>{savingPw ? 'Saving…' : 'Change Password'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
