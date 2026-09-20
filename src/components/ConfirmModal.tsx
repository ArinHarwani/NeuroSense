import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  variant?: 'amber' | 'crimson';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText = 'CANCEL',
  variant = 'amber',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="tactical-modal-backdrop">
      <div className={`tactical-modal ${variant === 'crimson' ? 'modal-crimson' : ''}`}>
        <div
          style={{
            fontFamily: 'var(--font-headline)',
            fontSize: '18px',
            fontWeight: 700,
            color: variant === 'crimson' ? 'var(--crimson)' : 'var(--amber)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </div>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: 'var(--text-2)',
            lineHeight: '1.5',
          }}
        >
          {message}
        </p>

        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            style={{ minHeight: '48px' }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={variant === 'crimson' ? 'btn-primary btn-hazard' : 'btn-primary'}
            onClick={onConfirm}
            style={{
              minHeight: '48px',
              backgroundColor: variant === 'crimson' ? 'var(--crimson)' : 'var(--amber)',
              borderColor: variant === 'crimson' ? '#f87171' : '#fbbf24',
              color: '#020617',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
