const STATUS_CONFIG = {
  draft:    { label: 'Draft',     bg: 'rgba(100,116,139,0.15)', text: '#94a3b8', border: 'rgba(100,116,139,0.3)' },
  waiting:  { label: 'Waiting',   bg: 'rgba(59,130,246,0.15)',  text: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  ready:    { label: 'Ready',     bg: 'rgba(245,158,11,0.15)',  text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  pick:     { label: 'Pick',      bg: 'rgba(139,92,246,0.15)',  text: '#a78bfa', border: 'rgba(139,92,246,0.3)' },
  pack:     { label: 'Pack',      bg: 'rgba(234,179,8,0.15)',   text: '#eab308', border: 'rgba(234,179,8,0.3)' },
  done:     { label: 'Done',      bg: 'rgba(16,185,129,0.15)',  text: '#34d399', border: 'rgba(16,185,129,0.3)' },
  canceled: { label: 'Canceled',  bg: 'rgba(239,68,68,0.12)',   text: '#f87171', border: 'rgba(239,68,68,0.3)' },
  receipt:  { label: 'Receipt',   bg: 'rgba(16,185,129,0.12)',  text: '#34d399', border: 'rgba(16,185,129,0.25)' },
  delivery: { label: 'Delivery',  bg: 'rgba(239,68,68,0.12)',   text: '#f87171', border: 'rgba(239,68,68,0.25)' },
  transfer_out: { label: 'Transfer Out', bg: 'rgba(245,158,11,0.1)', text: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
  transfer_in:  { label: 'Transfer In',  bg: 'rgba(59,130,246,0.1)', text: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
  adjustment:   { label: 'Adjustment',   bg: 'rgba(139,92,246,0.1)', text: '#a78bfa', border: 'rgba(139,92,246,0.25)' },
}

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: 'rgba(100,116,139,0.1)', text: '#94a3b8', border: 'rgba(100,116,139,0.2)' }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}>
      {cfg.label}
    </span>
  )
}
