import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ className = '', size = 24 }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 size={size} className="animate-spin" style={{ color: 'var(--accent)' }} />
    </div>
  )
}
