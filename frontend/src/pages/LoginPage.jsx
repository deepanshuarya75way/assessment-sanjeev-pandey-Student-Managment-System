import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AcademicCrestLogo from '../components/AcademicCrestLogo';

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    department: 'Computer Science & Engineering',
    phone: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isRegister) {
        if (!formData.name.trim()) {
          throw new Error('Please enter your full name');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        await register(formData);
      } else {
        await login(formData.email, formData.password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Authentication request failed'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoCredentials = (role) => {
    const creds = {
      ADMIN: { email: 'admin@sms.edu', password: 'password123' },
      TEACHER: { email: 'teacher@sms.edu', password: 'password123' },
      STUDENT: { email: 'student@sms.edu', password: 'password123' },
    };
    setIsRegister(false);
    setFormData({
      name: '',
      email: creds[role].email,
      password: creds[role].password,
      role,
      department: 'Computer Science & Engineering',
      phone: '',
    });
    setError('');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-split-card">
        <div className="auth-showcase-panel">
          <div className="showcase-header">
            <div className="showcase-logo" style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }}>
              <AcademicCrestLogo size={46} />
            </div>
            <div>
              <h1 className="showcase-title">Student Management</h1>
              <span style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                College Academic Portal
              </span>
            </div>
          </div>

          <div className="showcase-body">
            <h2 className="showcase-headline">
              College Academic & Student Management Portal
            </h2>
            <p className="showcase-desc">
              Comprehensive portal for managing student admissions, class attendance, marks, courses, and announcements.
            </p>

            <div className="showcase-features">
              <div className="feature-pill">
                <span className="feature-check">✓</span>
                <span>Role-based access for Admin, Teachers, and Students</span>
              </div>
              <div className="feature-pill">
                <span className="feature-check">✓</span>
                <span>Attendance tracking and monthly percentage reports</span>
              </div>
              <div className="feature-pill">
                <span className="feature-check">✓</span>
                <span>Internal and external marks entry with automatic grading</span>
              </div>
              <div className="feature-pill">
                <span className="feature-check">✓</span>
                <span>College notices and official circulars</span>
              </div>
            </div>
          </div>

          <div className="showcase-footer">
            <span>&copy; {new Date().getFullYear()} Student Management System</span>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-card">
            <div className="auth-header">
              <h2>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
              <p>
                {isRegister
                  ? 'Enter your details to create an account'
                  : 'Enter your credentials to continue'}
              </p>
            </div>

            {error && <div className="alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              {isRegister && (
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <datalist id="register-name-suggestions">
                    {['Rahul Sharma', 'Priya Verma', 'Aarav Gupta', 'Ananya Singh', 'Rohan Patel', 'Diya Joshi', 'Aditya Rao', 'Neha Nair'].map((n) => (
                      <option key={n} value={n} />
                    ))}
                  </datalist>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    list="register-name-suggestions"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={handleChange}
                    required={isRegister}
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                    {['Rahul Sharma', 'Priya Verma', 'Aarav Gupta', 'Ananya Singh'].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, name: n }))}
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
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="e.g. rahul.sharma@sms.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {isRegister && (
                <>
                  <div className="form-group">
                    <label htmlFor="role">Account Role</label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="STUDENT">Student</option>
                      <option value="TEACHER">Teacher</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </div>

                  {formData.role !== 'ADMIN' && (
                    <>
                      <div className="form-group">
                        <label htmlFor="department">Academic Department</label>
                        <select
                          id="department"
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                        >
                          <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                          <option value="Information Technology">Information Technology</option>
                          <option value="Mechanical Engineering">Mechanical Engineering</option>
                          <option value="Electronics & Communication">Electronics & Communication</option>
                          <option value="Civil Engineering">Civil Engineering</option>
                          <option value="Electrical Engineering">Electrical Engineering</option>
                          <option value="Business Administration">Business Administration</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="phone">Contact Phone</label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="e.g. 9876543210"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={submitting}
                style={{ padding: '12px 18px', marginTop: '6px' }}
              >
                {submitting
                  ? 'Processing...'
                  : isRegister
                  ? 'Create Account'
                  : 'Sign In to Portal'}
              </button>
            </form>

            <div className="auth-toggle">
              <span>
                {isRegister
                  ? 'Already have an account?'
                  : "Don't have an account yet?"}
              </span>
              <button
                type="button"
                className="btn-link"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                }}
              >
                {isRegister ? 'Sign In' : 'Register'}
              </button>
            </div>

            <div className="demo-accounts">
              <p className="demo-title">Login</p>
              <div className="demo-buttons">
                <button
                  type="button"
                  className="btn-demo"
                  onClick={() => fillDemoCredentials('ADMIN')}
                >
                  <span style={{ fontSize: '13px' }}>👑</span>
                  <span>Admin</span>
                </button>
                <button
                  type="button"
                  className="btn-demo"
                  onClick={() => fillDemoCredentials('TEACHER')}
                >
                  <span style={{ fontSize: '13px' }}>👨‍🏫</span>
                  <span>Teacher</span>
                </button>
                <button
                  type="button"
                  className="btn-demo"
                  onClick={() => fillDemoCredentials('STUDENT')}
                >
                  <span style={{ fontSize: '13px' }}>🎓</span>
                  <span>Student</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;