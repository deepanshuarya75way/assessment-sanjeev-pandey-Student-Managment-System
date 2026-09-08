import React from 'react';

const ConfirmModal = ({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '420px', textAlign: 'center', padding: '24px' }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: confirmVariant === 'danger' ? 'var(--danger-light)' : 'var(--primary-light)',
            color: confirmVariant === 'danger' ? 'var(--danger)' : 'var(--primary)',
            border: confirmVariant === 'danger' ? '1px solid var(--danger-border)' : '1px solid rgba(59, 130, 246, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            margin: '0 auto 16px',
          }}
        >
          {confirmVariant === 'danger' ? '⚠️' : '❓'}
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
          {title}
        </h3>

        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '24px' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onCancel}
            disabled={loading}
            style={{ flex: 1 }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn ${confirmVariant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={loading}
            style={{ flex: 1 }}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
