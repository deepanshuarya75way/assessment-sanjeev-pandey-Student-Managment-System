import React from 'react';

const SubjectDetailModal = ({ isOpen, onClose, subject }) => {
  if (!isOpen || !subject) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ margin: 0, fontSize: '18px' }}>{subject.subjectName}</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {subject.subjectCode} &bull; {subject.department}
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="detail-body">
          <div className="detail-section">
            <h4 className="detail-heading">Curriculum Metrics</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Credits</span>
                <span className="detail-value">{subject.credits} Credits</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Semester</span>
                <span className="detail-value">Semester {subject.semester}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Associated Course</span>
                <span className="detail-value">
                  {subject.course ? `${subject.course.courseCode} - ${subject.course.courseName}` : 'Unassigned'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Assigned Faculty</span>
                <span className="detail-value">
                  {subject.teacher ? `Prof. ${subject.teacher.firstName} ${subject.teacher.lastName}` : 'Unassigned'}
                </span>
              </div>
            </div>
          </div>

          {subject.description && (
            <div className="detail-section">
              <h4 className="detail-heading">Course Description & Syllabus</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                {subject.description}
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default SubjectDetailModal;