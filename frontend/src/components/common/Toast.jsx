import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  const borderColor = isSuccess ? 'rgba(16, 185, 129, 0.4)' : isError ? 'rgba(244, 63, 94, 0.4)' : 'rgba(99, 102, 241, 0.4)';
  const bgColor = isSuccess ? '#064e3b' : isError ? '#881337' : '#1e1b4b';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.85rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        color: '#ffffff',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.6)',
        animation: 'slideUp 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        fontSize: '0.9rem',
        maxWidth: '420px',
      }}
    >
      {isSuccess ? (
        <CheckCircle2 size={18} color="#34d399" />
      ) : isError ? (
        <AlertCircle size={18} color="#fb7185" />
      ) : (
        <Info size={18} color="#818cf8" />
      )}
      <span style={{ flex: 1 }}>{toast.message}</span>
    </div>
  );
}
