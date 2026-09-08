import React from 'react';
import { useAuth } from '../context/AuthContext';
import AcademicCrestLogo from '../components/AcademicCrestLogo';

const DashboardLanding = () => {
  const { user, logout } = useAuth();

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'ADMIN':
        return { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' };
      case 'TEACHER':
        return { bg: '#e0e7ff', color: '#3730a3', border: '#a5b4fc' };
      default:
        return { bg: '#dcfce7', color: '#166534', border: '#86efac' };
    }
  };

  const badge = getRoleBadgeStyle(user?.role);

  return (
    <div className="app-container">
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <AcademicCrestLogo size={42} />
          <div>
            <h1>Student Management System</h1>
            <p>Authenticated Session Overview</p>
          </div>
        </div>
        <button className="btn btn-outline" onClick={logout}>
          Sign Out
        </button>
      </header>

      <div className="card">
        <div className="card-title">
          <span>Active User Session</span>
          <span
            style={{
              backgroundColor: badge.bg,
              color: badge.color,
              border: `1px solid ${badge.border}`,
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {user?.role}
          </span>
        </div>

        <div className="grid-two">
          <div className="metric-item">
            <span className="metric-label">Full Name</span>
            <span className="metric-value">{user?.name}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Email Address</span>
            <span className="metric-value">{user?.email}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">User ID</span>
            <span className="metric-value">{user?._id}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Account Status</span>
            <span className="metric-value" style={{ color: 'var(--success)' }}>
              Active
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <span>Role-Based Access Control Verification</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: user?.role === 'ADMIN' ? 'var(--primary-light)' : 'var(--bg-main)',
              opacity: user?.role === 'ADMIN' ? 1 : 0.6,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Administrator Privileges</span>
              <span style={{ fontSize: '12px', fontWeight: 500 }}>
                {user?.role === 'ADMIN' ? 'Granted' : 'Restricted'}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Full institutional oversight, user management, course catalog control, system reports.
            </p>
          </div>

          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: ['ADMIN', 'TEACHER'].includes(user?.role) ? 'var(--primary-light)' : 'var(--bg-main)',
              opacity: ['ADMIN', 'TEACHER'].includes(user?.role) ? 1 : 0.6,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Faculty / Teacher Privileges</span>
              <span style={{ fontSize: '12px', fontWeight: 500 }}>
                {['ADMIN', 'TEACHER'].includes(user?.role) ? 'Granted' : 'Restricted'}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Attendance recording, marks entry, student evaluation, course schedules.
            </p>
          </div>

          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: ['ADMIN', 'TEACHER', 'STUDENT'].includes(user?.role) ? 'var(--primary-light)' : 'var(--bg-main)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Student Privileges</span>
              <span style={{ fontSize: '12px', fontWeight: 500 }}>Granted</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Academic attendance records, grade report view, enrolled courses, announcements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLanding;