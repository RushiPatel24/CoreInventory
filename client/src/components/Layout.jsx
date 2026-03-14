import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Toaster } from 'react-hot-toast'

export default function Layout() {
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6" style={{ background: 'var(--bg-primary)' }}>
        <Outlet />
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: 'var(--success)', secondary: 'var(--bg-card)' } },
          error: { iconTheme: { primary: 'var(--danger)', secondary: 'var(--bg-card)' } },
        }}
      />
    </div>
  )
}
