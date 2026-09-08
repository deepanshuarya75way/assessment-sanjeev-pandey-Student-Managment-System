import React, { useState, useEffect } from 'react';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Mechanical Engineering',
  'Electronics & Communication',
  'Civil Engineering',
  'Electrical Engineering',
  'Business Administration',
];

const TeacherFormModal = ({
  isOpen,
  onClose,
  onSave,
  onSubmit,
  teacher = null,
  initialData = null,
}) => {
  const activeTeacher = teacher || initialData;
  const saveHandler = onSave || onSubmit;
  const isEdit = Boolean(activeTeacher);

  const [formData, setFormData] = useState({
    teacherId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Computer Science & Engineering',
    qualification: 'Ph.D',
    experience: 5,
    specialization: '',
    status: 'Active',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const currentTeacher = teacher || initialData;
    if (currentTeacher) {
      setFormData({
        teacherId: currentTeacher.teacherId || '',
        firstName: currentTeacher.firstName || '',
        lastName: currentTeacher.lastName || '',
        email: currentTeacher.email || '',
        phone: currentTeacher.phone || '',
        department: currentTeacher.department || 'Computer Science & Engineering',
        qualification: currentTeacher.qualification || 'Ph.D',
        experience: currentTeacher.experience !== undefined ? currentTeacher.experience : 5,
        specialization: currentTeacher.specialization || '',
        status: currentTeacher.status || 'Active',
      });
    } else {
      const randomNum = Math.floor(100 + Math.random() * 900);
      setFormData({
        teacherId: `TCH-2026-${randomNum}`,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: 'Computer Science & Engineering',
        qualification: 'Ph.D',
        experience: 5,
        specialization: '',
        status: 'Active',
      });
    }
    setError('');
  }, [teacher, initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First and last name are required.');
      return;
    }
    if (!formData.email.trim() || !formData.phone.trim()) {
      setError('Email and phone are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (typeof saveHandler === 'function') {
        await saveHandler({
          ...formData,
          experience: Number(formData.experience) || 0,
        });
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save teacher');
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
                background: isEdit ? 'var(--accent-edit-light)' : 'var(--purple-light)',
                color: isEdit ? 'var(--accent-edit)' : 'var(--purple)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: isEdit ? '1px solid var(--accent-edit-border)' : '1px solid var(--purple-border)',
              }}
            >
              {isEdit ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0 }}>{isEdit ? 'Edit Faculty Profile' : 'Register New Faculty'}</h3>
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
                {isEdit ? `Updating details for Prof. ${formData.firstName} ${formData.lastName} (${formData.teacherId})` : 'Enter faculty credentials, department and research specialization'}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button">&times;</button>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-section-title">Faculty Credentials & Identity</div>
          <div className="form-grid-3">
            <div className="form-group">
              <label>Teacher ID *</label>
              <input
                type="text"
                name="teacherId"
                value={formData.teacherId}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Department *</label>
              <select name="department" value={formData.department} onChange={handleChange}>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Status *</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <datalist id="teacher-firstnames">
            {['Rajesh', 'Sunita', 'Amit', 'Meenakshi', 'Sanjay', 'Kavita', 'Vikram', 'Deepak', 'Ramesh', 'Archana', 'Manoj', 'Pooja'].map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>

          <datalist id="teacher-lastnames">
            {['Verma', 'Sharma', 'Rao', 'Gupta', 'Mishra', 'Khanna', 'Deshmukh', 'Kulkarni', 'Bhattacharya', 'Pillai'].map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>

          <div className="form-grid-3">
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                name="firstName"
                list="teacher-firstnames"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="e.g. Rajesh"
                required
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                {['Rajesh', 'Sunita', 'Amit', 'Meenakshi', 'Sanjay'].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, firstName: n }))}
                    style={{
                      fontSize: '11px',
                      padding: '1px 6px',
                      backgroundColor: 'var(--bg-badge)',
                      borderRadius: '4px',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                name="lastName"
                list="teacher-lastnames"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="e.g. Verma"
                required
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                {['Verma', 'Sharma', 'Rao', 'Gupta', 'Mishra'].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, lastName: n }))}
                    style={{
                      fontSize: '11px',
                      padding: '1px 6px',
                      backgroundColor: 'var(--bg-badge)',
                      borderRadius: '4px',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. rajesh.verma@sms.edu"
                required
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
                required
              />
            </div>
            <div className="form-group">
              <label>Highest Qualification</label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                placeholder="e.g. Ph.D, M.Tech"
              />
            </div>
            <div className="form-group">
              <label>Experience (Years)</label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Area of Specialization / Research</label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              placeholder="e.g. Machine Learning, Cloud Computing, VLSI Design"
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
                  {isEdit ? 'Update Faculty Profile' : 'Complete Appointment'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherFormModal;