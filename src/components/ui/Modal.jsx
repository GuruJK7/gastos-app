// src/components/ui/Modal.jsx
// ─── Reusable Modal ──────────────────────────────────────────────────────
import React, { useEffect, useRef } from 'react';

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 'var(--z-modal)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0, 0, 0, 0.55)',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
  animation: 'modal-fade-in 0.18s ease',
};

const panelStyle = {
  position: 'relative',
  width: '100%',
  maxWidth: '460px',
  margin: '1rem',
  padding: '1.5rem',
  background: 'var(--bg-elevated)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 'var(--radius-xl)',
  boxShadow: '0 16px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
  animation: 'modal-scale-in 0.2s cubic-bezier(0.34,1.56,0.64,1)',
};

const closeStyle = {
  position: 'absolute',
  top: '0.75rem',
  right: '0.75rem',
  width: '1.75rem',
  height: '1.75rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-muted)',
  fontSize: '0.875rem',
  cursor: 'pointer',
};

/**
 * @param {{ open: boolean, onClose: () => void, children: React.ReactNode }} props
 */
export default function Modal({ open, onClose, children }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      style={overlayStyle}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <style>{`
        @keyframes modal-fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modal-scale-in { from { opacity: 0; transform: scale(0.95) translateY(8px) } to { opacity: 1; transform: scale(1) translateY(0) } }
      `}</style>
      <div style={panelStyle}>
        <button style={closeStyle} onClick={onClose} type="button">✕</button>
        {children}
      </div>
    </div>
  );
}
