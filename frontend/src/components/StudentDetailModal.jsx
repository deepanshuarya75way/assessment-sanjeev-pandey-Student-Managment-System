import React from 'react';

const StudentDetailModal = ({ isOpen, onClose, student }) => {
  if (!isOpen || !student) return null;

  const fullName = [student.firstName, student.middleName, student.lastName]
    .filter(Boolean)
    .join(' ');

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Active':
        return 'status-badge connected';
      case 'Graduated':
        return 'status-badge connecting';
      default:
        return 'status-badge disconnected';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="avatar-circle">
              {student.firstName?.[0]}
              {student.lastName?.[0]}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px' }}>{fullName}</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {student.studentId}
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="detail-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Enrollment Status:</span>
            <span className={getStatusBadgeClass(student.status)}>
              <span className="status-dot"></span>
              {student.status}
            </span>
          </div>

          <div className="detail-section">
            <h4 className="detail-heading">Academic Information</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Department</span>
                <span className="detail-value">{student.department || '--'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Course</span>
                <span className="detail-value">{student.course || '--'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Current Semester</span>
                <span className="detail-value">Semester {student.semester}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Admission Date</span>
                <span className="detail-value">{formatDate(student.admissionDate)}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h4 className="detail-heading">Contact & Personal Details</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Email Address</span>
                <span className="detail-value">{student.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone</span>
                <span className="detail-value">{student.phone}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Gender</span>
                <span className="detail-value">{student.gender || '--'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Date of Birth</span>
                <span className="detail-value">{formatDate(student.dateOfBirth)}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h4 className="detail-heading">Address Details</h4>
            <p className="detail-value" style={{ margin: '4px 0' }}>
              {[student.address, student.city, student.state, student.country]
                .filter(Boolean)
                .join(', ') || 'No address specified'}
            </p>
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

export default StudentDetailModal;