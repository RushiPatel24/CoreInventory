import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Truck, ArrowLeftRight, ClipboardList,
  History, Settings, User, LogOut, ChevronRight, Box, BarChart3,
  Warehouse, MapPin, FileCheck, Send, RotateCcw, FolderOpen, Sun, Moon
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import useThemeStore from '../store/themeStore'
import toast from 'react-hot-toast'

const NavItem = ({ to, icon: Icon, label, end = false, onClick }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
    onClick={onClick}
  >
    <Icon size={16} />
    <span>{label}</span>
  </NavLink>
)

const SectionLabel = ({ label }) => (
  <p className="text-xs font-semibold uppercase tracking-widest px-3 mb-1 mt-5" style={{ color: 'var(--text-muted)' }}>
    {label}
  </p>
)

export default function Sidebar({ closeMobile }) {
  const { user, logout, isManager } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <aside className="flex flex-col h-full w-full border-r px-3 py-4 shrink-0" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 mb-6">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: 'var(--accent)', color: '#000' }}>
          CI
        </div>
        <div>
          <p className="text-sm font-bold leading-none" style={{ color: 'var(--text-primary)' }}>CoreInventory</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>IMS Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto space-y-0.5">
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" end onClick={closeMobile} />

        <SectionLabel label="Inventory" />
        <NavItem to="/products" icon={Package} label="Products" end onClick={closeMobile} />
        <NavItem to="/products/stock" icon={Box} label="Stock" onClick={closeMobile} />
        <NavItem to="/products/categories" icon={FolderOpen} label="Categories" onClick={closeMobile} />
        <NavItem to="/products/reorder-rules" icon={BarChart3} label="Reorder Rules" onClick={closeMobile} />

        <SectionLabel label="Operations" />
        <NavItem to="/operations/receipts" icon={FileCheck} label="Receipts" onClick={closeMobile} />
        <NavItem to="/operations/deliveries" icon={Send} label="Deliveries" onClick={closeMobile} />
        <NavItem to="/operations/transfers" icon={ArrowLeftRight} label="Transfers" onClick={closeMobile} />
        <NavItem to="/operations/adjustments" icon={RotateCcw} label="Adjustments" onClick={closeMobile} />
        <NavItem to="/operations/history" icon={History} label="Move History" onClick={closeMobile} />

        {isManager() && (
          <>
            <SectionLabel label="Settings" />
            <NavItem to="/settings/warehouses" icon={Warehouse} label="Warehouses" onClick={closeMobile} />
            <NavItem to="/settings/locations" icon={MapPin} label="Locations" onClick={closeMobile} />
          </>
        )}
      </nav>

      {/* User area */}
      <div className="mt-4 border-t pt-4 space-y-1" style={{ borderColor: 'var(--border)' }}>
        <NavItem to="/profile" icon={User} label="My Profile" onClick={closeMobile} />
        <button onClick={toggleTheme} className="nav-link w-full">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button onClick={handleLogout} className="nav-link w-full text-red-400 hover:text-red-300">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
        <div className="flex items-center gap-2.5 px-3 mt-3">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
            <p className="text-xs truncate capitalize" style={{ color: 'var(--text-muted)' }}>{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
