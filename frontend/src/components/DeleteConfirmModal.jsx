import React, { useState } from 'react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, student }) => {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !student) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm(student._id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ color: 'var(--danger)' }}>Confirm Deletion</h3>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div style={{ padding: '16px 0', fontSize: '14px', lineHeight: '1.6' }}>
          <p>
            Are you sure you want to delete student{' '}
            <strong>
              {student.firstName} {student.lastName} ({student.studentId})
            </strong>
            ?
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px' }}>
            This will permanently remove their academic profile. This action cannot be undone.
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose} disabled={deleting}>
            Cancel
          </button>
          <button
            className="btn"
            style={{ backgroundColor: 'var(--danger)', color: 'white' }}
            onClick={handleConfirm}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Student'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;