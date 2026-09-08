import React from 'react';

const TeacherDetailModal = ({ isOpen, onClose, teacher }) => {
  if (!isOpen || !teacher) return null;

  const fullName = `Prof. ${teacher.firstName} ${teacher.lastName}`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="avatar-circle" style={{ backgroundColor: '#4f46e5' }}>
              {teacher.firstName?.[0]}
              {teacher.lastName?.[0]}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px' }}>{fullName}</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {teacher.teacherId} &bull; {teacher.department}
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="detail-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Faculty Status:</span>
            <span className={`status-badge ${teacher.status === 'Active' ? 'connected' : 'disconnected'}`}>
              <span className="status-dot"></span>
              {teacher.status}
            </span>
          </div>

          <div className="detail-section">
            <h4 className="detail-heading">Academic & Professional Background</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Department</span>
                <span className="detail-value">{teacher.department}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Qualification</span>
                <span className="detail-value">{teacher.qualification || 'Post Graduate'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Teaching Experience</span>
                <span className="detail-value">{teacher.experience} Years</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Specialization</span>
                <span className="detail-value">{teacher.specialization || 'General Engineering'}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h4 className="detail-heading">Contact Details</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Email Address</span>
                <span className="detail-value">{teacher.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone</span>
                <span className="detail-value">{teacher.phone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetailModal;