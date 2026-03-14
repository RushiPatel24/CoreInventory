import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function KPICard({ title, value, icon: Icon, color = 'amber', trend, subtitle }) {
  const colorMap = {
    amber: { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b', border: 'rgba(245,158,11,0.2)' },
    green: { bg: 'rgba(16,185,129,0.12)', text: '#10b981', border: 'rgba(16,185,129,0.2)' },
    red: { bg: 'rgba(239,68,68,0.12)', text: '#ef4444', border: 'rgba(239,68,68,0.2)' },
    blue: { bg: 'rgba(59,130,246,0.12)', text: '#3b82f6', border: 'rgba(59,130,246,0.2)' },
    purple: { bg: 'rgba(139,92,246,0.12)', text: '#8b5cf6', border: 'rgba(139,92,246,0.2)' },
  }
  const c = colorMap[color] || colorMap.amber

  return (
    <div className="card p-5 flex items-start justify-between hover:border-opacity-60 transition-all duration-200">
      <div className="flex-1">
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{title}</p>
        <p className="text-3xl font-bold stat-mono" style={{ color: 'var(--text-primary)' }}>{value ?? '—'}</p>
        {subtitle && <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
      </div>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ml-3" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
        {Icon && <Icon size={18} style={{ color: c.text }} />}
      </div>
    </div>
  )
}
