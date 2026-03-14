import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, maxWidth = '520px' }) {
  const overlayRef = useRef()

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className="card w-full h-full sm:h-auto sm:max-h-[90vh] flex flex-col sm:rounded-2xl animate-fade-in"
        style={{ maxWidth }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          <button onClick={onClose} className="p-1 rounded-md transition-colors hover:bg-opacity-50" style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  )
}
