import React, { useState, useEffect } from 'react';
import { getCourses } from '../services/courseService';
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

const SubjectFormModal = ({
  isOpen,
  onClose,
  onSave,
  onSubmit,
  subject = null,
  initialData = null,
}) => {
  const activeSubject = subject || initialData;
  const saveHandler = onSave || onSubmit;
  const isEdit = Boolean(activeSubject);

  const [formData, setFormData] = useState({
    subjectCode: '',
    subjectName: '',
    department: 'Computer Science & Engineering',
    credits: 3,
    semester: 1,
    course: '',
    teacher: '',
    description: '',
    status: 'Active',
  });

  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getCourses({ limit: 50 }).then((res) => { if (res.success) setCourses(res.courses); }).catch(() => {});
      getTeachers({ limit: 50 }).then((res) => { if (res.success) setTeachers(res.teachers); }).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    const currentSubject = subject || initialData;
    if (currentSubject) {
      setFormData({
        subjectCode: currentSubject.subjectCode || '',
        subjectName: currentSubject.subjectName || '',
        department: currentSubject.department || 'Computer Science & Engineering',
        credits: currentSubject.credits || 3,
        semester: currentSubject.semester || 1,
        course: currentSubject.course?._id || currentSubject.course || '',
        teacher: currentSubject.teacher?._id || currentSubject.teacher || '',
        description: currentSubject.description || '',
        status: currentSubject.status || 'Active',
      });
    } else {
      setFormData({
        subjectCode: '',
        subjectName: '',
        department: 'Computer Science & Engineering',
        credits: 3,
        semester: 1,
        course: '',
        teacher: '',
        description: '',
        status: 'Active',
      });
    }
    setError('');
  }, [subject, initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.subjectCode.trim() || !formData.subjectName.trim()) {
      setError('Subject code and subject name are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (typeof saveHandler === 'function') {
        await saveHandler({
          ...formData,
          credits: Number(formData.credits) || 3,
          semester: Number(formData.semester) || 1,
          course: formData.course || undefined,
          teacher: formData.teacher || undefined,
        });
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save subject');
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
                background: isEdit ? 'var(--accent-edit-light)' : 'var(--warning-light)',
                color: isEdit ? 'var(--accent-edit)' : 'var(--warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: isEdit ? '1px solid var(--accent-edit-border)' : '1px solid var(--warning-border)',
              }}
            >
              {isEdit ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0 }}>{isEdit ? 'Edit Subject Details' : 'Add Curriculum Subject'}</h3>
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
                {isEdit ? `Updating subject syllabus and faculty assignment for ${formData.subjectName} (${formData.subjectCode})` : 'Register a new subject module and allocate credit weightage'}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button">&times;</button>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-section-title">Subject Identity</div>
          <div className="form-grid-3">
            <div className="form-group">
              <label>Subject Code *</label>
              <input
                type="text"
                name="subjectCode"
                value={formData.subjectCode}
                onChange={handleChange}
                placeholder="e.g. CS301"
                required
              />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Subject Title *</label>
              <input
                type="text"
                name="subjectName"
                value={formData.subjectName}
                onChange={handleChange}
                placeholder="e.g. Data Structures & Algorithms"
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
              <label>Credits</label>
              <input
                type="number"
                name="credits"
                value={formData.credits}
                onChange={handleChange}
                min="1"
                max="8"
              />
            </div>
            <div className="form-group">
              <label>Semester</label>
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

          <div className="form-section-title">Academic Linkages</div>
          <div className="form-grid-3">
            <div className="form-group" style={{ gridColumn: 'span 1' }}>
              <label>Belongs to Course</label>
              <select name="course" value={formData.course} onChange={handleChange}>
                <option value="">-- Unassigned --</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>{c.courseCode} - {c.courseName}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Assigned Faculty / Professor</label>
              <select name="teacher" value={formData.teacher} onChange={handleChange}>
                <option value="">-- Unassigned --</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>Prof. {t.firstName} {t.lastName} ({t.department})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Subject Syllabus & Objectives</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="2"
              className="form-control"
              placeholder="Outline course topics and learning outcomes..."
            />
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
                  {isEdit ? 'Update Subject Record' : 'Add Subject'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubjectFormModal;