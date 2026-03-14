import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Toaster } from 'react-hot-toast'
import { Menu, X } from 'lucide-react'

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-full flex-col md:flex-row relative">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs" style={{ background: 'var(--accent)', color: '#000' }}>CI</div>
          <span className="font-bold text-sm">CoreInventory</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 rounded-lg border" 
          style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Sidebar - Desktop always visible, Mobile overlay */}
      <div 
        className={`fixed inset-0 z-50 md:relative md:flex shrink-0 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto'}`}
      >
        <div className="absolute inset-0 bg-black/50 md:hidden" onClick={() => setIsSidebarOpen(false)} />
        <div 
          className={`relative h-full w-64 transform transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <Sidebar closeMobile={() => setIsSidebarOpen(false)} />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6" style={{ background: 'var(--bg-primary)' }}>
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
