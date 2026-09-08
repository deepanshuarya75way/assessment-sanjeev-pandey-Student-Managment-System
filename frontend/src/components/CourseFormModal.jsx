import React, { useState, useEffect } from 'react';
import { getTeachers } from '../services/teacherService';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Mechanical Engineering',
  'Electronics & Communication',
  'Civil Engineering',
  'Electrical Engineering',
  'Business Administration',
];

const CourseFormModal = ({
  isOpen,
  onClose,
  onSave,
  onSubmit,
  course = null,
  initialData = null,
}) => {
  const activeCourse = course || initialData;
  const saveHandler = onSave || onSubmit;
  const isEdit = Boolean(activeCourse);

  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    department: 'Computer Science & Engineering',
    duration: '4 Years',
    semester: 8,
    description: '',
    assignedTeachers: [],
    status: 'Active',
  });

  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getTeachers({ limit: 50 }).then((res) => {
        if (res.success) setAvailableTeachers(res.teachers);
      }).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    const currentCourse = course || initialData;
    if (currentCourse) {
      setFormData({
        courseCode: currentCourse.courseCode || '',
        courseName: currentCourse.courseName || '',
        department: currentCourse.department || 'Computer Science & Engineering',
        duration: currentCourse.duration || '4 Years',
        semester: currentCourse.semester || 8,
        description: currentCourse.description || '',
        assignedTeachers: currentCourse.assignedTeachers ? currentCourse.assignedTeachers.map((t) => t._id || t) : [],
        status: currentCourse.status || 'Active',
      });
    } else {
      setFormData({
        courseCode: '',
        courseName: '',
        department: 'Computer Science & Engineering',
        duration: '4 Years',
        semester: 8,
        description: '',
        assignedTeachers: [],
        status: 'Active',
      });
    }
    setError('');
  }, [course, initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleTeacherToggle = (teacherId) => {
    setFormData((prev) => {
      const exists = prev.assignedTeachers.includes(teacherId);
      return {
        ...prev,
        assignedTeachers: exists
          ? prev.assignedTeachers.filter((id) => id !== teacherId)
          : [...prev.assignedTeachers, teacherId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.courseCode.trim() || !formData.courseName.trim()) {
      setError('Course code and course name are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (typeof saveHandler === 'function') {
        await saveHandler({
          ...formData,
          semester: Number(formData.semester) || 8,
        });
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save course');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-lg)',
                background: isEdit ? 'var(--accent-edit-light)' : 'var(--success-light)',
                color: isEdit ? 'var(--accent-edit)' : 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: isEdit ? '1px solid var(--accent-edit-border)' : '1px solid var(--success-border)',
              }}
            >
              {isEdit ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                  <path d="M6 6h10" />
                  <path d="M6 10h10" />
                </svg>
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0 }}>{isEdit ? 'Edit Course Program' : 'Create New Course Program'}</h3>
                {isEdit && (
                  <span className="edit-mode-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      <path d="m15 5 4 4" />
                    </svg>
                    Edit Mode
                  </span>
                )}
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {isEdit ? `Updating curriculum configuration for ${formData.courseName} (${formData.courseCode})` : 'Define degree program details, department allocation and duration'}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button">&times;</button>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-section-title">Course Identification</div>
          <div className="form-grid-3">
            <div className="form-group">
              <label>Course Code *</label>
              <input
                type="text"
                name="courseCode"
                value={formData.courseCode}
                onChange={handleChange}
                placeholder="e.g. BTECH-CSE"
                required
              />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Course Name *</label>
              <input
                type="text"
                name="courseName"
                value={formData.courseName}
                onChange={handleChange}
                placeholder="e.g. B.Tech Computer Science & Engineering"
                required
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label>Department *</label>
              <select name="department" value={formData.department} onChange={handleChange}>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Program Duration</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g. 4 Years"
              />
            </div>
            <div className="form-group">
              <label>Total Semesters</label>
              <input
                type="number"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                min="1"
                max="12"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Course Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="form-control"
              placeholder="Program overview and objectives..."
            />
          </div>

          <div className="form-section-title">Assign Faculty to Course</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px', maxHeight: '140px', overflowY: 'auto', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
            {availableTeachers.map((tch) => (
              <label key={tch._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.assignedTeachers.includes(tch._id)}
                  onChange={() => handleTeacherToggle(tch._id)}
                />
                <span>Prof. {tch.firstName} {tch.lastName}</span>
              </label>
            ))}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={isEdit ? { background: 'var(--accent-edit-gradient)', border: 'none', boxShadow: 'var(--shadow-edit-glow)' } : {}}
            >
              {submitting ? 'Saving...' : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {isEdit ? 'Update Course Program' : 'Create Course Program'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseFormModal;