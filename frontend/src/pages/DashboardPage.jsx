import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as dashboardService from '../services/dashboardService';
import * as announcementService from '../services/announcementService';
import StatCard from '../components/StatCard';
import AnnouncementModal from '../components/AnnouncementModal';
import ConfirmModal from '../components/ConfirmModal';
import { SkeletonStats, SkeletonTable } from '../components/SkeletonLoader';
import DonutChart from '../components/charts/DonutChart';
import BarChart from '../components/charts/BarChart';
import AcademicCrestLogo from '../components/AcademicCrestLogo';

const DashboardPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [roleView, setRoleView] = useState(user?.role || 'ADMIN');
  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState(null);
  const [deletingAnnId, setDeletingAnnId] = useState(null);
  const [isDeletingAnn, setIsDeletingAnn] = useState(false);

  const fetchDashboard = async (view = roleView) => {
    try {
      setLoading(true);
      setError('');
      const res = await dashboardService.getDashboardStats(view);
      setDashboardData(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load dashboard metrics';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(roleView);
  }, [roleView]);

  const handleSwitchView = (newView) => {
    setRoleView(newView);
  };

  const handleSaveAnnouncement = async (formData) => {
    try {
      if (editingAnn && editingAnn._id) {
        await announcementService.updateAnnouncement(editingAnn._id, formData);
        toast.success('Announcement updated successfully.');
      } else {
        await announcementService.createAnnouncement(formData);
        toast.success('Announcement published successfully.');
      }
      setIsAnnounceModalOpen(false);
      setEditingAnn(null);
      fetchDashboard(roleView);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save announcement');
      throw err;
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await announcementService.markAsRead(id);
      toast.success('Marked as read.');
      fetchDashboard(roleView);
    } catch (err) {
      toast.error('Failed to mark as read.');
    }
  };

  const handleConfirmDeleteAnnouncement = async () => {
    if (!deletingAnnId) return;
    setIsDeletingAnn(true);
    try {
      await announcementService.deleteAnnouncement(deletingAnnId);
      toast.success('Announcement deleted.');
      setDeletingAnnId(null);
      fetchDashboard(roleView);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete announcement');
    } finally {
      setIsDeletingAnn(false);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Urgent':
        return { bg: 'rgba(239, 68, 68, 0.16)', color: '#f87171', border: 'rgba(239, 68, 68, 0.35)' };
      case 'High':
        return { bg: 'rgba(245, 158, 11, 0.16)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.35)' };
      default:
        return { bg: 'rgba(59, 130, 246, 0.16)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.35)' };
    }
  };

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'Exam':
        return { bg: 'rgba(244, 63, 94, 0.16)', color: '#fb7185', border: 'rgba(244, 63, 94, 0.35)' };
      case 'Academic':
        return { bg: 'rgba(99, 102, 241, 0.16)', color: '#a5b4fc', border: 'rgba(99, 102, 241, 0.35)' };
      case 'Event':
        return { bg: 'rgba(16, 185, 129, 0.16)', color: '#34d399', border: 'rgba(16, 185, 129, 0.35)' };
      default:
        return { bg: 'var(--bg-badge)', color: 'var(--text-secondary)', border: 'var(--border-color)' };
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="app-container" style={{ maxWidth: '1200px' }}>
        <div style={{ marginBottom: '24px' }}>
          <SkeletonStats count={4} />
          <SkeletonTable rows={5} columns={4} />
        </div>
      </div>
    );
  }

  const activeRole = roleView;

  return (
    <div className="app-container" style={{ maxWidth: '1200px' }}>
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <AcademicCrestLogo size={42} />
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {activeRole === 'ADMIN' && 'Admin Dashboard'}
              {activeRole === 'TEACHER' && 'Teacher Dashboard'}
              {activeRole === 'STUDENT' && 'Student Dashboard'}
            </h1>
            <p>Overview of academic records and campus activity</p>
          </div>
        </div>

        {user?.role === 'ADMIN' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '4px', borderRadius: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', paddingLeft: '8px' }}>
              ROLE VIEW:
            </span>
            <button
              className={`btn btn-sm ${activeRole === 'ADMIN' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleSwitchView('ADMIN')}
              style={{ fontSize: '12px', padding: '4px 10px' }}
            >
              Admin
            </button>
            <button
              className={`btn btn-sm ${activeRole === 'TEACHER' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleSwitchView('TEACHER')}
              style={{ fontSize: '12px', padding: '4px 10px' }}
            >
              Teacher View
            </button>
            <button
              className={`btn btn-sm ${activeRole === 'STUDENT' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleSwitchView('STUDENT')}
              style={{ fontSize: '12px', padding: '4px 10px' }}
            >
              Student View
            </button>
          </div>
        )}
      </header>

      {error && <div className="alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

      {activeRole === 'ADMIN' && dashboardData && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <StatCard
              title="Total Students"
              value={dashboardData.metrics?.totalStudents}
              subtitle="Active registered students"
              icon="🎓"
              badge="Enrolled"
              badgeType="success"
              onClick={() => navigate('/students')}
            />
            <StatCard
              title="Total Teachers"
              value={dashboardData.metrics?.totalTeachers}
              subtitle="Faculty members"
              icon="👨‍🏫"
              badge="Faculty"
              badgeType="info"
              onClick={() => navigate('/teachers')}
            />
            <StatCard
              title="Total Courses"
              value={dashboardData.metrics?.totalCourses}
              subtitle="Degree programs"
              icon="📚"
              badge="Curriculum"
              badgeType="neutral"
              onClick={() => navigate('/courses')}
            />
            <StatCard
              title="Total Subjects"
              value={dashboardData.metrics?.totalSubjects}
              subtitle="Teaching subjects"
              icon="📖"
              badge="Modules"
              badgeType="neutral"
              onClick={() => navigate('/subjects')}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-title">
                <span>Attendance Overview</span>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    backgroundColor: (dashboardData.attendanceOverview?.rate || 0) >= 75 ? 'var(--success-light)' : 'var(--danger-light)',
                    color: (dashboardData.attendanceOverview?.rate || 0) >= 75 ? 'var(--success)' : 'var(--danger)',
                    border: (dashboardData.attendanceOverview?.rate || 0) >= 75 ? '1px solid var(--success-border)' : '1px solid var(--danger-border)',
                  }}
                >
                  {(dashboardData.attendanceOverview?.rate || 0) >= 75 ? 'Good Attendance' : 'Low Attendance'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '16px', margin: '16px 0', flexWrap: 'wrap' }}>
                <DonutChart
                  size={150}
                  strokeWidth={20}
                  centerValue={`${dashboardData.attendanceOverview?.rate || 0}%`}
                  centerLabel="Present Rate"
                  data={[
                    { label: 'Present', value: dashboardData.attendanceOverview?.presentCount || 0, color: '#10b981' },
                    { label: 'Absent', value: dashboardData.attendanceOverview?.absentCount || 0, color: '#ef4444' },
                  ]}
                />

                <div style={{ flex: 1, minWidth: '170px' }}>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
                    <div
                      style={{
                        width: `${Math.min(100, dashboardData.attendanceOverview?.rate || 0)}%`,
                        height: '100%',
                        backgroundColor: (dashboardData.attendanceOverview?.rate || 0) >= 75 ? 'var(--success)' : 'var(--warning)',
                        borderRadius: '4px',
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Calculated across <strong>{dashboardData.attendanceOverview?.totalRecords || 0}</strong> class attendance records. Minimum 75% attendance required.
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ textAlign: 'center', padding: '8px', background: 'var(--bg-card-hover)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--success)' }}>
                    {dashboardData.attendanceOverview?.presentCount || 0}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Present</div>
                </div>
                <div style={{ textAlign: 'center', padding: '8px', background: 'var(--bg-card-hover)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--danger)' }}>
                    {dashboardData.attendanceOverview?.absentCount || 0}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Absent</div>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-title">
                <span>Department Enrollment Distribution</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>By Department</span>
              </div>

              <div style={{ marginTop: '16px' }}>
                {dashboardData.studentDistribution && dashboardData.studentDistribution.length > 0 ? (
                  <BarChart
                    height={190}
                    defaultColor="var(--primary)"
                    valueSuffix=" students"
                    data={dashboardData.studentDistribution.map((item, idx) => ({
                      label: item.department || 'General',
                      value: item.count || 0,
                      color: idx % 2 === 0 ? 'var(--primary)' : '#6366f1',
                    }))}
                  />
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                    No department data logged
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-title">
                <span>Recent Students</span>
                <button className="btn btn-link" onClick={() => navigate('/students')} style={{ fontSize: '12px', padding: 0 }}>
                  View All &rarr;
                </button>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Name</th>
                      <th>Department</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentStudents && dashboardData.recentStudents.length > 0 ? (
                      dashboardData.recentStudents.map((stu) => (
                        <tr key={stu._id}>
                          <td style={{ fontWeight: 600, fontSize: '12px' }}>{stu.studentId}</td>
                          <td>{stu.firstName} {stu.lastName}</td>
                          <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{stu.department} (Sem {stu.semester})</td>
                          <td>
                            <span className={`badge ${stu.status === 'Active' ? 'badge-success' : 'badge-inactive'}`}>
                              {stu.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No student records found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-title">
                <span>Recent Activity</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Latest updates</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                {dashboardData.recentActivity && dashboardData.recentActivity.length > 0 ? (
                  dashboardData.recentActivity.map((act, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '10px 12px',
                        background: 'var(--bg-card-hover)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor:
                            act.type === 'STUDENT_ENROLLED' ? 'rgba(16, 185, 129, 0.16)' :
                            act.type === 'MARKS_PUBLISHED' ? 'rgba(99, 102, 241, 0.16)' : 'rgba(245, 158, 11, 0.16)',
                          color:
                            act.type === 'STUDENT_ENROLLED' ? 'var(--success)' :
                            act.type === 'MARKS_PUBLISHED' ? 'var(--primary-hover)' : 'var(--warning)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          flexShrink: 0,
                        }}
                      >
                        {act.type === 'STUDENT_ENROLLED' ? '🎓' : act.type === 'MARKS_PUBLISHED' ? '📝' : '📅'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                          {act.title}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {act.description}
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>
                        {new Date(act.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                    No recorded activity yet
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Announcements & Notices</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link to="/announcements" className="btn btn-sm btn-outline">
                  View All &rarr;
                </Link>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    setEditingAnn(null);
                    setIsAnnounceModalOpen(true);
                  }}
                >
                  + Post Announcement
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginTop: '12px' }}>
              {dashboardData.announcements && dashboardData.announcements.length > 0 ? (
                dashboardData.announcements.map((item) => {
                  const pStyle = getPriorityBadge(item.priority);
                  const cStyle = getCategoryBadge(item.category);
                  return (
                    <div
                      key={item._id}
                      style={{
                        padding: '16px',
                        background: 'var(--bg-card-hover)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '10px',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: cStyle.bg,
                              color: cStyle.color,
                            }}
                          >
                            {item.category}
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              backgroundColor: pStyle.bg,
                              color: pStyle.color,
                              border: `1px solid ${pStyle.border}`,
                            }}
                          >
                            {item.priority}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                          {item.title}
                        </h4>

                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          {item.description || item.content}
                        </p>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <span>Target: <strong>{item.targetAudience || item.targetRole}</strong> &bull; {new Date(item.publishDate || item.createdAt).toLocaleDateString()}</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn-action btn-action-edit"
                            onClick={() => {
                              setEditingAnn(item);
                              setIsAnnounceModalOpen(true);
                            }}
                            title="Edit Notice"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                              <path d="m15 5 4 4" />
                            </svg>
                            Edit
                          </button>
                          <button
                            className="btn-action btn-action-delete"
                            onClick={() => setDeletingAnnId(item._id)}
                            title="Remove Notice"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '16px 0' }}>
                  No published announcements. Click "+ Post Announcement" to publish one.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeRole === 'TEACHER' && dashboardData && (
        <>
          {dashboardData.teacherProfile && (
            <div className="card" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: 700,
                    }}
                  >
                    {dashboardData.teacherProfile.firstName?.[0] || 'T'}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
                      Prof. {dashboardData.teacherProfile.firstName} {dashboardData.teacherProfile.lastName}
                    </h2>
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0' }}>
                      {dashboardData.teacherProfile.department} &bull; {dashboardData.teacherProfile.teacherId} &bull; {dashboardData.teacherProfile.specialization || 'Faculty'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-sm btn-outline" onClick={() => navigate('/attendance')} style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                    Mark Attendance
                  </button>
                  <button className="btn btn-sm btn-primary" onClick={() => navigate('/marks')}>
                    Enter Marks
                  </button>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <StatCard
              title="Assigned Courses"
              value={dashboardData.metrics?.assignedCoursesCount}
              subtitle="Assigned department courses"
              icon="📚"
              badge="Teaching"
              badgeType="info"
              onClick={() => navigate('/courses')}
            />
            <StatCard
              title="Assigned Students"
              value={dashboardData.metrics?.assignedStudentsCount}
              subtitle="Students in your department"
              icon="🎓"
              badge="Department"
              badgeType="success"
            />
            <StatCard
              title="Today's Attendance"
              value={dashboardData.todayAttendance?.total || 0}
              subtitle={`${dashboardData.todayAttendance?.present || 0} Present, ${dashboardData.todayAttendance?.absent || 0} Absent`}
              icon="📅"
              badge={dashboardData.todayAttendance?.total > 0 ? 'Recorded' : 'Pending'}
              badgeType={dashboardData.todayAttendance?.total > 0 ? 'success' : 'warning'}
              onClick={() => navigate('/attendance')}
            />
            <StatCard
              title="Marks Entered"
              value={dashboardData.metrics?.recentMarksCount}
              subtitle="Total marks submitted"
              icon="📝"
              badge="Graded"
              badgeType="neutral"
              onClick={() => navigate('/marks')}
            />
          </div>

          {dashboardData.todayAttendance?.total > 0 && (
            <div className="card" style={{ marginBottom: '24px' }}>
              <div className="card-title">
                <span>Today's Attendance</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Date: {dashboardData.todayAttendance.date}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '20px', margin: '16px 0', flexWrap: 'wrap' }}>
                <DonutChart
                  size={140}
                  strokeWidth={20}
                  centerValue={`${dashboardData.todayAttendance.total}`}
                  centerLabel="Roll Count"
                  data={[
                    { label: 'Present', value: dashboardData.todayAttendance.present || 0, color: '#10b981' },
                    { label: 'Absent', value: dashboardData.todayAttendance.absent || 0, color: '#ef4444' },
                  ]}
                />
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center', padding: '12px 20px', background: 'var(--bg-card-hover)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--success)' }}>{dashboardData.todayAttendance.present}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Present</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '12px 20px', background: 'var(--bg-card-hover)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--danger)' }}>{dashboardData.todayAttendance.absent}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Absent</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-title">
                <span>My Assigned Courses</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Semester Schedules</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                {dashboardData.assignedCourses && dashboardData.assignedCourses.length > 0 ? (
                  dashboardData.assignedCourses.map((c) => (
                    <div
                      key={c._id}
                      style={{
                        padding: '14px',
                        background: 'var(--bg-card-hover)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>{c.courseName}</span>
                        <span className="badge badge-info" style={{ fontSize: '11px' }}>{c.courseCode}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        {c.department} &bull; Duration: {c.duration} &bull; {c.semester} Semesters
                      </div>
                      {c.subjects && c.subjects.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {c.subjects.map((s) => (
                            <span
                              key={s._id}
                              style={{
                                fontSize: '11px',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: 'var(--bg-badge)',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border-color)',
                              }}
                            >
                              {s.code}: {s.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                    No assigned courses allocated to your profile.
                  </div>
                )}
              </div>
            </div>

            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-title">
                <span>Recent Marks Entered</span>
                <button className="btn btn-link" onClick={() => navigate('/marks')} style={{ fontSize: '12px', padding: 0 }}>
                  Enter More Marks &rarr;
                </button>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Subject</th>
                      <th>Score</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentMarks && dashboardData.recentMarks.length > 0 ? (
                      dashboardData.recentMarks.map((m) => (
                        <tr key={m._id}>
                          <td>
                            <div style={{ fontWeight: 500 }}>{m.student?.firstName} {m.student?.lastName}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.student?.studentId}</div>
                          </td>
                          <td style={{ fontSize: '12px' }}>{m.subject?.name}</td>
                          <td style={{ fontWeight: 600 }}>{m.totalMarks} ({m.percentage}%)</td>
                          <td>
                            <span className="badge badge-success" style={{ fontWeight: 700 }}>
                              {m.grade}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No recent evaluations recorded</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Announcements</span>
                <Link to="/announcements" className="btn btn-sm btn-outline">
                  View All &rarr;
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                {dashboardData.announcements && dashboardData.announcements.length > 0 ? (
                  dashboardData.announcements.map((item) => (
                    <div key={item._id} style={{ padding: '12px', background: 'var(--bg-card-hover)', borderRadius: 'var(--radius-md)', border: item.isRead === false ? '1.5px solid var(--primary)' : '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-main)' }}>{item.title}</span>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: item.priority === 'Urgent' ? 'var(--danger)' : 'var(--primary)' }}>
                          {item.priority}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 6px', lineHeight: 1.4 }}>
                        {item.description || item.content}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8' }}>
                        <span>{item.category} &bull; {new Date(item.publishDate || item.createdAt).toLocaleDateString()}</span>
                        {item.isRead === false && (
                          <button
                            className="btn-link"
                            onClick={() => handleMarkAsRead(item._id)}
                            style={{ fontSize: '11px', color: 'var(--primary)' }}
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>
                    No announcements available
                  </div>
                )}
              </div>
            </div>

            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-title">
                <span>Recent Activity</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                {dashboardData.recentActivity && dashboardData.recentActivity.length > 0 ? (
                  dashboardData.recentActivity.map((act, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'var(--bg-card-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '16px' }}>{act.type === 'ATTENDANCE_RECORDED' ? '📅' : '📝'}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>{act.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{act.description}</div>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {new Date(act.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>
                    No recent activity
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeRole === 'STUDENT' && dashboardData && (
        <>
          {dashboardData.studentProfile && (
            <div className="card" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: 'white', padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: 700,
                    }}
                  >
                    {dashboardData.studentProfile.firstName?.[0] || 'S'}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>
                      {dashboardData.studentProfile.firstName} {dashboardData.studentProfile.lastName}
                    </h2>
                    <p style={{ fontSize: '13px', color: '#e0f2fe', margin: '4px 0 0' }}>
                      Roll No: <strong>{dashboardData.studentProfile.studentId}</strong> &bull; {dashboardData.studentProfile.department} &bull; Semester {dashboardData.studentProfile.semester}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-sm btn-outline" onClick={() => navigate('/attendance')} style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}>
                    My Attendance
                  </button>
                  <button className="btn btn-sm btn-outline" onClick={() => navigate('/marks')} style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}>
                    My Results
                  </button>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <StatCard
              title="Attendance Rate"
              value={`${dashboardData.metrics?.attendanceRate || 0}%`}
              subtitle={`${dashboardData.metrics?.presentCount || 0} Present / ${dashboardData.metrics?.totalClasses || 0} Total Classes`}
              icon="📅"
              badge={(dashboardData.metrics?.attendanceRate || 0) >= 75 ? 'Eligible' : 'Shortage'}
              badgeType={(dashboardData.metrics?.attendanceRate || 0) >= 75 ? 'success' : 'danger'}
              onClick={() => navigate('/attendance')}
            />
            <StatCard
              title="Cumulative GPA"
              value={dashboardData.metrics?.cgpa || '0.00'}
              subtitle="Calculated on 10.0 scale"
              icon="🌟"
              badge={parseFloat(dashboardData.metrics?.cgpa || 0) >= 8.0 ? 'Distinction' : 'Passed'}
              badgeType="success"
              onClick={() => navigate('/marks')}
            />
            <StatCard
              title="Aggregate Score"
              value={`${dashboardData.metrics?.overallPercentage || 0}%`}
              subtitle={`Graded across ${dashboardData.metrics?.subjectsGraded || 0} subjects`}
              icon="📊"
              badge="Academic"
              badgeType="info"
              onClick={() => navigate('/marks')}
            />
            <StatCard
              title="Current Program"
              value={dashboardData.studentProfile?.semester ? `Sem ${dashboardData.studentProfile.semester}` : 'Enrolled'}
              subtitle={dashboardData.studentProfile?.course || 'Degree Program'}
              icon="🎓"
              badge={dashboardData.studentProfile?.status || 'Active'}
              badgeType="neutral"
            />
          </div>

          {(dashboardData.metrics?.attendanceRate || 0) < 75 && (() => {
            const tot = dashboardData.metrics?.totalClasses || 0;
            const pres = dashboardData.metrics?.presentCount ?? dashboardData.metrics?.totalPresent ?? 0;
            const moreNeeded = Math.max(0, Math.ceil(3 * tot - 4 * pres));

            return (
              <div
                className="card"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  borderColor: 'rgba(239, 68, 68, 0.38)',
                  borderLeft: '4px solid var(--danger)',
                  padding: '18px 22px',
                  marginBottom: '24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <span style={{ fontSize: '26px', lineHeight: 1 }}>⚠️</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <h4 style={{ margin: 0, color: '#fca5a5', fontSize: '15px', fontWeight: 800 }}>
                        Attendance Shortage Notice: Below 75% Threshold ({dashboardData.metrics?.attendanceRate || 0}%)
                      </h4>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: 'rgba(239, 68, 68, 0.25)',
                          color: '#fca5a5',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                        }}
                      >
                        Action Required
                      </span>
                    </div>

                    <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
                      College rules require a minimum 75% attendance to be eligible for end-semester examinations.
                    </p>

                    {/* Key Metrics: Total Classes, Classes Attended, More Classes to Attend */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                        gap: '12px',
                        marginTop: '14px',
                      }}
                    >
                      <div
                        style={{
                          background: 'var(--bg-card-hover)',
                          border: '1px solid var(--border-color)',
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-lg)',
                        }}
                      >
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Total Classes
                        </span>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', marginTop: '3px' }}>
                          {tot}
                        </div>
                      </div>

                      <div
                        style={{
                          background: 'var(--bg-card-hover)',
                          border: '1px solid var(--border-color)',
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-lg)',
                        }}
                      >
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Classes Attended
                        </span>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: '#38bdf8', marginTop: '3px' }}>
                          {pres} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>Present</span>
                        </div>
                      </div>

                      <div
                        style={{
                          background: 'rgba(239, 68, 68, 0.18)',
                          border: '1px solid rgba(239, 68, 68, 0.45)',
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-lg)',
                        }}
                      >
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          More Classes for 75%
                        </span>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: '#f87171', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>+{moreNeeded} {moreNeeded === 1 ? 'class' : 'classes'}</span>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              color: '#ffffff',
                              background: 'var(--danger)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              textTransform: 'uppercase',
                            }}
                          >
                            Consecutive
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '12px', fontSize: '12.5px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>💡</span>
                      <span>
                        Attend the next <strong>{moreNeeded} consecutive {moreNeeded === 1 ? 'class' : 'classes'}</strong> without missing any to restore your attendance to 75%.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-title">
                <span>Semester Marks & Grades</span>
                <button className="btn btn-link" onClick={() => navigate('/marks')} style={{ fontSize: '12px', padding: 0 }}>
                  Detailed Result &rarr;
                </button>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Credits</th>
                      <th>Score</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentMarks && dashboardData.recentMarks.length > 0 ? (
                      dashboardData.recentMarks.map((m) => (
                        <tr key={m._id}>
                          <td>
                            <div style={{ fontWeight: 500 }}>{m.subject?.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.subject?.code}</div>
                          </td>
                          <td style={{ fontSize: '13px' }}>{m.subject?.credits || 3}</td>
                          <td style={{ fontWeight: 600 }}>{m.totalMarks} ({m.percentage}%)</td>
                          <td>
                            <span className="badge badge-success" style={{ fontWeight: 700 }}>
                              {m.grade}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No marks posted yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-title">
                <span>My Attendance Record</span>
                <button className="btn btn-link" onClick={() => navigate('/attendance')} style={{ fontSize: '12px', padding: 0 }}>
                  Full History &rarr;
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '16px', margin: '12px 0 16px', flexWrap: 'wrap' }}>
                <DonutChart
                  size={130}
                  strokeWidth={18}
                  centerValue={`${dashboardData.metrics?.attendanceRate || 0}%`}
                  centerLabel="Present Rate"
                  data={[
                    { label: 'Present', value: dashboardData.metrics?.presentCount || 0, color: '#10b981' },
                    { label: 'Absent', value: dashboardData.metrics?.absentCount || 0, color: '#ef4444' },
                  ]}
                />
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.8, minWidth: '130px' }}>
                  <div>Total Classes: <strong>{dashboardData.metrics?.totalClasses || 0}</strong></div>
                  <div><span style={{ color: 'var(--success)', fontWeight: 700 }}>●</span> Present: <strong>{dashboardData.metrics?.presentCount || 0}</strong></div>
                  <div><span style={{ color: 'var(--danger)', fontWeight: 700 }}>●</span> Absent: <strong>{dashboardData.metrics?.absentCount || 0}</strong></div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Subject</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.attendanceHistory && dashboardData.attendanceHistory.length > 0 ? (
                      dashboardData.attendanceHistory.map((att) => (
                        <tr key={att._id}>
                          <td style={{ fontSize: '12px', fontWeight: 500 }}>{att.dateString}</td>
                          <td style={{ fontSize: '12px' }}>{att.subject?.name}</td>
                          <td>
                            <span
                              className={`badge ${
                                att.status === 'Present'
                                  ? 'badge-success'
                                  : 'badge-inactive'
                              }`}
                            >
                              {att.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No attendance history</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Announcements & Notices</span>
              <Link to="/announcements" className="btn btn-sm btn-outline">
                View All &rarr;
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px', marginTop: '8px' }}>
              {dashboardData.announcements && dashboardData.announcements.length > 0 ? (
                dashboardData.announcements.map((item) => {
                  const pStyle = getPriorityBadge(item.priority);
                  return (
                    <div key={item._id} style={{ padding: '16px', background: 'var(--bg-card-hover)', borderRadius: 'var(--radius-lg)', border: item.isRead === false ? '1.5px solid var(--primary)' : '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: 'var(--bg-badge)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                          {item.category}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: pStyle.bg, color: pStyle.color, border: `1px solid ${pStyle.border}` }}>
                          {item.priority}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                        {item.title}
                      </h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.45, margin: '4px 0 8px' }}>
                        {item.description || item.content}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8' }}>
                        <span>By {item.authorName || 'Administration'} &bull; {new Date(item.publishDate || item.createdAt).toLocaleDateString()}</span>
                        {item.isRead === false && (
                          <button
                            className="btn-link"
                            onClick={() => handleMarkAsRead(item._id)}
                            style={{ fontSize: '11px', color: 'var(--primary)' }}
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '16px 0' }}>
                  No announcements published for students.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <AnnouncementModal
        isOpen={isAnnounceModalOpen}
        onClose={() => {
          setIsAnnounceModalOpen(false);
          setEditingAnn(null);
        }}
        onSubmit={handleSaveAnnouncement}
        initialData={editingAnn}
      />

      <ConfirmModal
        isOpen={!!deletingAnnId}
        title="Remove Announcement"
        message="Are you sure you want to delete this announcement?"
        confirmText="Delete"
        confirmVariant="danger"
        loading={isDeletingAnn}
        onConfirm={handleConfirmDeleteAnnouncement}
        onCancel={() => setDeletingAnnId(null)}
      />
    </div>
  );
};

export default DashboardPage;
