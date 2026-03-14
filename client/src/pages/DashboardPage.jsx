import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getDashboard } from '../api/dashboard'
import KPICard from '../components/KPICard'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import PageHeader from '../components/PageHeader'
import {
  Package, AlertTriangle, XCircle, Inbox, Send, ArrowLeftRight,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#ec4899']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card px-3 py-2 text-xs space-y-1">
      <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="stat-mono font-medium">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = async () => {
    try {
      const { data: d } = await getDashboard()
      setData(d)
    } catch (err) {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <LoadingSpinner className="mt-20" size={40} />

  const kpis = data?.kpis || {}
  const activityFeed = data?.recentActivity || []
  const dailyMov = data?.dailyMovements || []
  const stockCat = data?.stockByCategory || []

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Real-time inventory overview" />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        <KPICard title="Products In Stock" value={kpis.totalInStock} icon={Package} color="green" />
        <KPICard title="Low Stock Items" value={kpis.lowStockCount} icon={AlertTriangle} color="amber" subtitle="Below reorder threshold" />
        <KPICard title="Out of Stock" value={kpis.outOfStockCount} icon={XCircle} color="red" />
        <KPICard title="Pending Receipts" value={kpis.pendingReceipts} icon={Inbox} color="blue" />
        <KPICard title="Pending Deliveries" value={kpis.pendingDeliveries} icon={Send} color="purple" />
        <KPICard title="Scheduled Transfers" value={kpis.scheduledTransfers} icon={ArrowLeftRight} color="amber" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 mb-6">
        {/* Bar Chart */}
        <div className="card p-4 xl:col-span-3">
          <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Stock Movement — Last 7 Days</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyMov} barGap={4}>
              <XAxis dataKey="_id" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="totalIn" name="In" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="totalOut" name="Out" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart */}
        <div className="card p-4 xl:col-span-2">
          <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Stock by Category</p>
          {stockCat.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-sm" style={{ color: 'var(--text-muted)' }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={stockCat} dataKey="qty" nameKey="category" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {stockCat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Activity</p>
        </div>
        {activityFeed.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No activity yet</div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {activityFeed.map((entry) => (
              <div key={entry._id} className="flex items-center gap-3 px-4 py-3 hover:bg-opacity-50 transition-colors" style={{ ':hover': { background: 'var(--bg-hover)' } }}>
                <StatusBadge status={entry.type} />
                <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>
                  {entry.productId?.name || '—'}
                </span>
                <span className={`stat-mono text-sm font-medium ${entry.delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {entry.delta > 0 ? '+' : ''}{entry.delta}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
