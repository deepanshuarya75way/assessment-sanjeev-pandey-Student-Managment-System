import React, { useState, useEffect } from 'react';
import { getStudents } from '../services/studentService';
import { getCourses } from '../services/courseService';
import { getSubjects } from '../services/subjectService';

const MarksEntryModal = ({
  isOpen,
  onClose,
  onSave,
  onSubmit,
  existingMark = null,
  initialData = null,
  courses: initialCourses = null,
  subjects: initialSubjects = null,
  students: initialStudents = null,
}) => {
  const activeMark = existingMark || initialData;
  const saveHandler = onSave || onSubmit;
  const isEdit = Boolean(activeMark);

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    subjectId: '',
    semester: 3,
    internalMarks: 20,
    externalMarks: 50,
    remarks: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialStudents && initialStudents.length > 0) {
        setStudents(initialStudents);
      } else {
        getStudents({ limit: 100 }).then((res) => { if (res.success) setStudents(res.students); }).catch(() => {});
      }

      if (initialCourses && initialCourses.length > 0) {
        setCourses(initialCourses);
      } else {
        getCourses({ limit: 100 }).then((res) => { if (res.success) setCourses(res.courses); }).catch(() => {});
      }

      if (initialSubjects && initialSubjects.length > 0) {
        setSubjects(initialSubjects);
      } else {
        getSubjects({ limit: 100 }).then((res) => { if (res.success) setSubjects(res.subjects); }).catch(() => {});
      }
    }
  }, [isOpen, initialStudents, initialCourses, initialSubjects]);

  useEffect(() => {
    const currentMark = existingMark || initialData;
    if (currentMark) {
      setFormData({
        studentId: currentMark.student?._id || currentMark.student || '',
        courseId: currentMark.course?._id || currentMark.course || '',
        subjectId: currentMark.subject?._id || currentMark.subject || '',
        semester: currentMark.semester || 3,
        internalMarks: currentMark.internalMarks || 0,
        externalMarks: currentMark.externalMarks || 0,
        remarks: currentMark.remarks || '',
      });
    } else {
      setFormData({
        studentId: students[0]?._id || '',
        courseId: courses[0]?._id || '',
        subjectId: subjects[0]?._id || '',
        semester: 3,
        internalMarks: 24,
        externalMarks: 56,
        remarks: '',
      });
    }
    setError('');
  }, [existingMark, initialData, isOpen, students, courses, subjects]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const numInternal = Math.max(0, Math.min(Number(formData.internalMarks) || 0, 30));
  const numExternal = Math.max(0, Math.min(Number(formData.externalMarks) || 0, 70));
  const total = numInternal + numExternal;
  const percentage = Math.round((total / 100) * 100);

  const getPreviewGrade = (pct) => {
    if (pct >= 90) return { grade: 'A+', color: '#16a34a' };
    if (pct >= 80) return { grade: 'A', color: '#16a34a' };
    if (pct >= 70) return { grade: 'B+', color: '#2563eb' };
    if (pct >= 60) return { grade: 'B', color: '#2563eb' };
    if (pct >= 50) return { grade: 'C', color: '#d97706' };
    if (pct >= 40) return { grade: 'D', color: '#d97706' };
    return { grade: 'F', color: '#dc2626' };
  };

  const preview = getPreviewGrade(percentage);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.studentId || !formData.courseId || !formData.subjectId) {
      setError('Please select student, course, and subject.');
      return;
    }

    setSubmitting(true);
    try {
      if (typeof saveHandler === 'function') {
        await saveHandler({
          ...formData,
          internalMarks: numInternal,
          externalMarks: numExternal,
          semester: Number(formData.semester),
        });
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to record marks');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-lg)',
                background: isEdit ? 'var(--accent-edit-light)' : 'var(--primary-light)',
                color: isEdit ? 'var(--accent-edit)' : 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: isEdit ? '1px solid var(--accent-edit-border)' : '1px solid rgba(59, 130, 246, 0.25)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                {isEdit ? (
                  <>
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                  </>
                ) : (
                  <>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                  </>
                )}
              </svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0 }}>{isEdit ? 'Update Student Marks' : 'Enter Academic Marks'}</h3>
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
                {isEdit ? 'Recalibrate scores and grade evaluation' : 'Record internal assessments, assignments and exam performance'}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button">&times;</button>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Select Student *</label>
            <select
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              disabled={isEdit}
              className="form-control"
              required
            >
              <option value="">-- Choose Student --</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.studentId} - {s.firstName} {s.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label>Course *</label>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="">-- Choose Course --</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>{c.courseCode}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Subject *</label>
              <select
                name="subjectId"
                value={formData.subjectId}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="">-- Choose Subject --</option>
                {subjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>{sub.subjectCode} - {sub.subjectName}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Semester *</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="form-control"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>Sem {sem}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid-3" style={{ marginTop: '8px' }}>
            <div className="form-group">
              <label>Internal Marks (Max 30) *</label>
              <input
                type="number"
                name="internalMarks"
                value={formData.internalMarks}
                onChange={handleChange}
                min="0"
                max="30"
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label>External Marks (Max 70) *</label>
              <input
                type="number"
                name="externalMarks"
                value={formData.externalMarks}
                onChange={handleChange}
                min="0"
                max="70"
                className="form-control"
                required
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                  Total / Grade
                </span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: preview.color }}>
                  {total}/100 ({percentage}%) &bull; {preview.grade}
                </span>
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '12px' }}>
            <label>Instructor Remarks</label>
            <input
              type="text"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="e.g. Good grasp on algorithms, participated actively."
              className="form-control"
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
                  {isEdit ? 'Update Evaluation' : 'Record Marks'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarksEntryModal;