import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as studentService from '../services/studentService';
import * as teacherService from '../services/teacherService';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const toast = useToast();

  const [extendedProfile, setExtendedProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchExtendedDetails = async () => {
      if (!user?.email) return;
      setLoading(true);

      try {
        if (user.role === 'STUDENT') {
          const res = await studentService.getMyProfile();
          const stu = res.student || res.data;
          if (isMounted && stu) setExtendedProfile(stu);
        } else if (user.role === 'TEACHER') {
          const res = await teacherService.getTeachers({ search: user.email, limit: 1 });
          const tch = res.teachers?.[0] || res.data?.[0];
          if (isMounted && tch) setExtendedProfile(tch);
        }
      } catch (err) {
        console.error('Error loading role profile:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchExtendedDetails();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'System Administrator', bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' };
      case 'TEACHER':
        return { label: 'Faculty Member', bg: '#e0e7ff', color: '#3730a3', border: '#a5b4fc' };
      default:
        return { label: 'Enrolled Student', bg: '#dcfce7', color: '#166534', border: '#86efac' };
    }
  };

  const badge = getRoleBadge(user?.role);
  const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'September 2026';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '28px', flexWrap: 'wrap' }}>
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 800,
            boxShadow: 'var(--shadow-md)',
            flexShrink: 0,
          }}
        >
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>

        <div style={{ flex: '1 1 300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {user?.name || 'User Account'}
            </h2>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '9999px',
                backgroundColor: badge.bg,
                color: badge.color,
                border: `1px solid ${badge.border}`,
              }}
            >
              {badge.label}
            </span>
            <span className="status-badge connected">
              <span className="status-dot"></span>
              Active Account
            </span>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0 0 8px 0' }}>
            {user?.email}
          </p>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Member since {joinDate} &bull; ID: <code>{user?._id || 'N/A'}</code>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" onClick={logout}>
            Sign Out
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {user?.role === 'STUDENT' && (
          <div className="card">
            <div className="card-title">
              <span>Academic Enrollment Details</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="metric-row" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Roll Number</span>
                <strong style={{ color: 'var(--text-primary)' }}>{extendedProfile?.studentId || 'STU-2026-001'}</strong>
              </div>
              <div className="metric-row" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Degree / Program</span>
                <strong style={{ color: 'var(--text-primary)' }}>{extendedProfile?.course || 'B.Tech Computer Science & Engineering'}</strong>
              </div>
              <div className="metric-row" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Department</span>
                <strong style={{ color: 'var(--text-primary)' }}>{extendedProfile?.department || 'Computer Science & Engineering'}</strong>
              </div>
              <div className="metric-row" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Current Semester</span>
                <strong style={{ color: 'var(--text-primary)' }}>Semester {extendedProfile?.semester || 4}</strong>
              </div>
              <div className="metric-row" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Contact Phone</span>
                <strong style={{ color: 'var(--text-primary)' }}>{extendedProfile?.phone || '+91 9811223344'}</strong>
              </div>
              <div className="metric-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Location</span>
                <strong style={{ color: 'var(--text-primary)' }}>{extendedProfile?.city ? `${extendedProfile.city}, ${extendedProfile.country || 'India'}` : 'New Delhi, India'}</strong>
              </div>
            </div>
          </div>
        )}

        {user?.role === 'TEACHER' && (
          <div className="card">
            <div className="card-title">
              <span>Faculty Academic Profile</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="metric-row" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Faculty ID</span>
                <strong style={{ color: 'var(--text-primary)' }}>{extendedProfile?.teacherId || 'TCH-2026-001'}</strong>
              </div>
              <div className="metric-row" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Department</span>
                <strong style={{ color: 'var(--text-primary)' }}>{extendedProfile?.department || 'Computer Science & Engineering'}</strong>
              </div>
              <div className="metric-row" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Highest Qualification</span>
                <strong style={{ color: 'var(--text-primary)' }}>{extendedProfile?.qualification || 'Ph.D in Computer Science'}</strong>
              </div>
              <div className="metric-row" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Teaching Experience</span>
                <strong style={{ color: 'var(--text-primary)' }}>{extendedProfile?.experience ? `${extendedProfile.experience} Years` : '10+ Years'}</strong>
              </div>
              <div className="metric-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Specialization</span>
                <strong style={{ color: 'var(--text-primary)' }}>{extendedProfile?.specialization || 'Distributed Systems & Algorithms'}</strong>
              </div>
            </div>
          </div>
        )}

        {user?.role === 'ADMIN' && (
          <div className="card">
            <div className="card-title">
              <span>Administrative Privileges & Scopes</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--success)', fontSize: '1.2rem' }}>✓</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Full Student, Teacher & Course Lifecycle Management</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--success)', fontSize: '1.2rem' }}>✓</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Attendance Session Overrides & Verification</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--success)', fontSize: '1.2rem' }}>✓</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Grade Ledger Calibration & Transcript Generation</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--success)', fontSize: '1.2rem' }}>✓</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Campus Announcements & Notices</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--success)', fontSize: '1.2rem' }}>✓</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Database & Server Operations</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
