import React from 'react';

const CourseDetailModal = ({ isOpen, onClose, course }) => {
  if (!isOpen || !course) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ margin: 0, fontSize: '18px' }}>{course.courseName}</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {course.courseCode} &bull; {course.department}
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="detail-body">
          <div className="detail-section">
            <h4 className="detail-heading">Program Overview</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Duration</span>
                <span className="detail-value">{course.duration}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Total Semesters</span>
                <span className="detail-value">{course.semester} Semesters</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Enrolled Subjects</span>
                <span className="detail-value">{course.subjects?.length || 0} Subjects</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Faculty Staff</span>
                <span className="detail-value">{course.assignedTeachers?.length || 0} Professors</span>
              </div>
            </div>
            {course.description && (
              <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                {course.description}
              </p>
            )}
          </div>

          <div className="detail-section">
            <h4 className="detail-heading">Curriculum & Subjects ({course.subjects?.length || 0})</h4>
            {(!course.subjects || course.subjects.length === 0) ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No subjects mapped yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
                {course.subjects.map((sub) => (
                  <div
                    key={sub._id || sub}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{sub.subjectCode} - {sub.subjectName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Credits: {sub.credits} &bull; Semester: {sub.semester}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="detail-section">
            <h4 className="detail-heading">Assigned Faculty Members</h4>
            {(!course.assignedTeachers || course.assignedTeachers.length === 0) ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No faculty assigned yet.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {course.assignedTeachers.map((tch) => (
                  <span
                    key={tch._id || tch}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      backgroundColor: '#e0e7ff',
                      color: '#3730a3',
                      fontSize: '12px',
                      fontWeight: 500,
                    }}
                  >
                    Prof. {tch.firstName} {tch.lastName} ({tch.department})
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailModal;