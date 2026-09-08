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

const COURSES = [
  'B.Tech Computer Science',
  'B.Tech IT',
  'B.Tech Mechanical',
  'B.Tech ECE',
  'B.Tech Civil',
  'B.Tech Electrical',
  'BBA',
  'MBA',
];

const StudentFormModal = ({
  isOpen,
  onClose,
  onSave,
  onSubmit,
  student = null,
  initialData = null,
}) => {
  const activeStudent = student || initialData;
  const saveHandler = onSave || onSubmit;
  const isEdit = Boolean(activeStudent);

  const [formData, setFormData] = useState({
    studentId: '',
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Male',
    department: 'Computer Science & Engineering',
    course: 'B.Tech Computer Science',
    semester: 1,
    status: 'Active',
    address: '',
    city: '',
    state: '',
    country: 'India',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const currentStudent = student || initialData;
    if (currentStudent) {
      setFormData({
        studentId: currentStudent.studentId || '',
        firstName: currentStudent.firstName || '',
        middleName: currentStudent.middleName || '',
        lastName: currentStudent.lastName || '',
        email: currentStudent.email || '',
        phone: currentStudent.phone || '',
        dateOfBirth: currentStudent.dateOfBirth ? currentStudent.dateOfBirth.substring(0, 10) : '',
        gender: currentStudent.gender || 'Male',
        department: currentStudent.department || 'Computer Science & Engineering',
        course: currentStudent.course || 'B.Tech Computer Science',
        semester: currentStudent.semester || 1,
        status: currentStudent.status || 'Active',
        address: currentStudent.address || '',
        city: currentStudent.city || '',
        state: currentStudent.state || '',
        country: currentStudent.country || 'India',
      });
    } else {
      const randomNum = Math.floor(100 + Math.random() * 900);
      setFormData({
        studentId: `STU-2026-${randomNum}`,
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: 'Male',
        department: 'Computer Science & Engineering',
        course: 'B.Tech Computer Science',
        semester: 1,
        status: 'Active',
        address: '',
        city: '',
        state: '',
        country: 'India',
      });
    }
    setError('');
  }, [student, initialData, isOpen]);

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
      setError('Please provide first and last name.');
      return;
    }
    if (!formData.studentId.trim()) {
      setError('Student ID is required.');
      return;
    }
    if (!formData.email.trim() || !formData.phone.trim()) {
      setError('Email and phone number are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (typeof saveHandler === 'function') {
        await saveHandler({
          ...formData,
          semester: parseInt(formData.semester, 10) || 1,
        });
      }
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to save student record'
      );
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
                background: isEdit ? 'var(--accent-edit-light)' : 'var(--primary-light)',
                color: isEdit ? 'var(--accent-edit)' : 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: isEdit ? '1px solid var(--accent-edit-border)' : '1px solid rgba(59, 130, 246, 0.25)',
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
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0 }}>{isEdit ? 'Edit Student Record' : 'Register New Student'}</h3>
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
                {isEdit ? `Updating details for ${formData.firstName} ${formData.lastName} (${formData.studentId})` : 'Enter student enrollment and academic background information'}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button">&times;</button>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-section-title">Academic & Identity Information</div>
          <div className="form-grid-3">
            <div className="form-group">
              <label>Student ID *</label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="e.g. STU-2026-001"
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
              <label>Course *</label>
              <select name="course" value={formData.course} onChange={handleChange}>
                {COURSES.map((course) => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label>Current Semester *</label>
              <select name="semester" value={formData.semester} onChange={handleChange}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Enrollment Status *</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
                <option value="Graduated">Graduated</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-section-title">Personal Information</div>
          <datalist id="student-firstnames">
            {['Aarav', 'Rahul', 'Priya', 'Ananya', 'Rohan', 'Diya', 'Aditya', 'Neha', 'Ishaan', 'Sneha', 'Vikram', 'Pooja', 'Siddharth', 'Meera', 'Arjun', 'Riya'].map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>

          <datalist id="student-middlenames">
            {['Kumar', 'Pratap', 'Singh', 'Chandra', 'Prakash', 'Nath'].map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>

          <datalist id="student-lastnames">
            {['Sharma', 'Verma', 'Patel', 'Gupta', 'Singh', 'Joshi', 'Mehta', 'Nair', 'Rao', 'Reddy', 'Chatterjee', 'Malhotra'].map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>

          <div className="form-grid-3">
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                name="firstName"
                list="student-firstnames"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="e.g. Aarav"
                required
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                {['Aarav', 'Rahul', 'Priya', 'Ananya', 'Rohan'].map((n) => (
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
              <label>Middle Name</label>
              <input
                type="text"
                name="middleName"
                list="student-middlenames"
                value={formData.middleName}
                onChange={handleChange}
                placeholder="e.g. Kumar"
              />
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                name="lastName"
                list="student-lastnames"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="e.g. Sharma"
                required
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                {['Sharma', 'Verma', 'Patel', 'Gupta', 'Singh'].map((n) => (
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
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. aarav.sharma@sms.edu"
                required
              />
            </div>
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
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-section-title">Address Details</div>
          <div className="form-grid-3">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. New Delhi"
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g. Delhi"
              />
            </div>
            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="e.g. India"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Street Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="House/Street/Locality"
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
                  {isEdit ? 'Update Student Record' : 'Complete Registration'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentFormModal;