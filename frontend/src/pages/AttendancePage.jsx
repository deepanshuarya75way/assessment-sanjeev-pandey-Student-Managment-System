import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Pagination from '../components/Pagination';
import { SkeletonTable } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import * as attendanceService from '../services/attendanceService';
import * as courseService from '../services/courseService';
import * as subjectService from '../services/subjectService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AttendancePage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const isStudent = user?.role === 'STUDENT';

  const [activeTab, setActiveTab] = useState(isStudent ? 'my_attendance' : 'mark');

  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [roster, setRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [submittingAttendance, setSubmittingAttendance] = useState(false);

  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyPagination, setHistoryPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [filterCourse, setFilterCourse] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(15);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [stats, setStats] = useState(null);

  const [myStats, setMyStats] = useState(null);
  const [myHistory, setMyHistory] = useState([]);
  const [loadingMyAttendance, setLoadingMyAttendance] = useState(false);

  useEffect(() => {
    courseService.getCourses({ limit: 100 }).then((res) => {
      const list = res.courses || res.data || [];
      if (list.length > 0) {
        setCourses(list);
        setSelectedCourse((prev) => prev || list[0]._id);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      subjectService.getSubjects({ course: selectedCourse, limit: 100 }).then((res) => {
        const list = res.subjects || res.data || [];
        setSubjects(list);
        if (list.length > 0) {
          setSelectedSubject((prev) => (list.some((s) => s._id === prev) ? prev : list[0]._id));
        } else {
          setSelectedSubject('');
        }
      }).catch(() => {});
    }
  }, [selectedCourse]);

  const loadRoster = useCallback(async () => {
    if (!selectedCourse || !selectedSubject) return;
    setLoadingRoster(true);

    try {
      const res = await attendanceService.getEnrolledStudents({
        courseId: selectedCourse,
        subjectId: selectedSubject,
      });

      if (res.success && res.students) {
        const existingRes = await attendanceService.getAttendance({
          courseId: selectedCourse,
          subjectId: selectedSubject,
          dateString: selectedDate,
          limit: 100,
        });

        const existingMap = {};
        if (existingRes.success && existingRes.records) {
          existingRes.records.forEach((rec) => {
            if (rec.student) existingMap[rec.student._id] = rec.status;
          });
        }

        const initialRoster = res.students.map((stu) => ({
          studentId: stu._id,
          code: stu.studentId,
          name: `${stu.firstName} ${stu.lastName}`,
          department: stu.department,
          status: existingMap[stu._id] || 'Present',
          remarks: '',
        }));

        setRoster(initialRoster);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load students roster');
    } finally {
      setLoadingRoster(false);
    }
  }, [selectedCourse, selectedSubject, selectedDate, toast]);

  useEffect(() => {
    if (activeTab === 'mark' && selectedCourse && selectedSubject) {
      loadRoster();
    }
  }, [activeTab, selectedCourse, selectedSubject, selectedDate, loadRoster]);

  const setAllStatus = (newStatus) => {
    setRoster((prev) => prev.map((item) => ({ ...item, status: newStatus })));
  };

  const setStudentStatus = (studentId, status) => {
    setRoster((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, status } : item))
    );
  };

  const handleSaveAttendance = async () => {
    if (roster.length === 0) {
      toast.error('No students in roll sheet to mark attendance.');
      return;
    }
    setSubmittingAttendance(true);

    try {
      const records = roster.map((r) => ({
        studentId: r.studentId,
        status: r.status,
        remarks: r.remarks,
      }));

      const res = await attendanceService.markAttendance({
        courseId: selectedCourse,
        subjectId: selectedSubject,
        date: selectedDate,
        records,
      });

      toast.success(res.message || 'Attendance saved successfully.');
      await loadRoster();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to submit attendance');
    } finally {
      setSubmittingAttendance(false);
    }
  };

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const params = {
        page: historyPage,
        limit: historyPageSize,
        courseId: filterCourse,
        subjectId: filterSubject,
        status: filterStatus,
        startDate: filterStartDate,
        endDate: filterEndDate,
        search: filterSearch.trim(),
        sortBy,
        sortOrder,
      };

      const [historyRes, statsRes] = await Promise.all([
        attendanceService.getAttendance(params),
        attendanceService.getAttendanceStats({ courseId: filterCourse, subjectId: filterSubject }),
      ]);

      if (historyRes.success) {
        setHistoryRecords(historyRes.records);
        setHistoryPagination(historyRes.pagination);
      }
      if (statsRes.success) {
        setStats(statsRes.stats);
      }
    } catch (err) {
      toast.error('Failed to load attendance history logs');
    } finally {
      setLoadingHistory(false);
    }
  }, [historyPage, historyPageSize, filterCourse, filterSubject, filterStatus, filterStartDate, filterEndDate, filterSearch, sortBy, sortOrder, toast]);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, fetchHistory]);

  const handleSortHistory = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setHistoryPage(1);
  };

  const handleResetHistoryFilters = () => {
    setFilterCourse('');
    setFilterSubject('');
    setFilterStatus('');
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterSearch('');
    setSortBy('date');
    setSortOrder('desc');
    setHistoryPage(1);
  };

  const fetchMyAttendance = useCallback(async () => {
    setLoadingMyAttendance(true);
    try {
      const res = await attendanceService.getMyAttendance();
      if (res.success) {
        setMyStats(res.stats);
        setMyHistory(res.history);
      }
    } catch (err) {
      console.log('My attendance lookup:', err.message);
    } finally {
      setLoadingMyAttendance(false);
    }
  }, []);

  useEffect(() => {
    if (isStudent || activeTab === 'my_attendance') {
      fetchMyAttendance();
    }
  }, [isStudent, activeTab, fetchMyAttendance]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return <span className="status-badge connected"><span className="status-dot"></span>Present</span>;
      case 'Late':
        return <span className="status-badge connecting"><span className="status-dot"></span>Late</span>;
      case 'Absent':
        return <span className="status-badge disconnected"><span className="status-dot"></span>Absent</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  const hasHistoryFilters =
    filterCourse !== '' ||
    filterSubject !== '' ||
    filterStatus !== '' ||
    filterStartDate !== '' ||
    filterEndDate !== '' ||
    filterSearch.trim() !== '';

  return (
    <div className="layout-root">
      <Navbar />

      <main className="app-container" style={{ maxWidth: '1200px' }}>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 className="page-title">Attendance Tracking</h1>
            <p className="page-subtitle">Record daily attendance, inspect student logs, and track attendance percentages.</p>
          </div>

          {!isStudent && (
            <div className="tab-buttons" style={{ display: 'flex', gap: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '4px', borderRadius: '8px' }}>
              <button
                className={`btn btn-sm ${activeTab === 'mark' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab('mark')}
              >
                Mark Attendance
              </button>
              <button
                className={`btn btn-sm ${activeTab === 'history' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab('history')}
              >
                Attendance Records
              </button>
            </div>
          )}
        </div>

        {!isStudent && activeTab === 'mark' && (
          <div>
            <div className="card" style={{ marginBottom: '20px' }}>
              <div className="card-title">
                <span>Select Class & Subject</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label>Course</label>
                  <select
                    className="form-control"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                  >
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.courseName} ({c.courseCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Subject</label>
                  <select
                    className="form-control"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  >
                    {subjects.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.subjectName} ({s.subjectCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>
                    Roll Sheet ({roster.length} Students)
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Date: {selectedDate}
                  </span>
                </div>

                {roster.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginRight: '4px' }}>Batch actions:</span>
                    <button className="btn btn-sm btn-outline" onClick={() => setAllStatus('Present')}>
                      All Present
                    </button>
                    <button className="btn btn-sm btn-outline" onClick={() => setAllStatus('Absent')}>
                      All Absent
                    </button>
                  </div>
                )}
              </div>

              {loadingRoster ? (
                <div style={{ padding: '20px' }}>
                  <SkeletonTable rows={5} columns={4} />
                </div>
              ) : roster.length === 0 ? (
                <EmptyState
                  title="No enrolled students found"
                  message="There are no active students mapped to this course and subject."
                  icon="📅"
                />
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Roll Number</th>
                        <th>Student Name</th>
                        <th>Department</th>
                        <th style={{ textAlign: 'center' }}>Attendance Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roster.map((stu) => (
                        <tr key={stu.studentId}>
                          <td style={{ fontWeight: 600 }}>{stu.code}</td>
                          <td style={{ fontWeight: 500 }}>{stu.name}</td>
                          <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{stu.department}</td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                type="button"
                                className={`btn-att att-present ${stu.status === 'Present' ? 'active' : ''}`}
                                onClick={() => setStudentStatus(stu.studentId, 'Present')}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                className={`btn-att att-late ${stu.status === 'Late' ? 'active' : ''}`}
                                onClick={() => setStudentStatus(stu.studentId, 'Late')}
                              >
                                Late
                              </button>
                              <button
                                type="button"
                                className={`btn-att att-absent ${stu.status === 'Absent' ? 'active' : ''}`}
                                onClick={() => setStudentStatus(stu.studentId, 'Absent')}
                              >
                                Absent
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {roster.length > 0 && (
                <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-primary"
                    onClick={handleSaveAttendance}
                    disabled={submittingAttendance}
                  >
                    {submittingAttendance ? 'Saving...' : 'Save Attendance'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {!isStudent && activeTab === 'history' && (
          <div>
            {stats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div className="card" style={{ marginBottom: 0, padding: '16px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Records</span>
                  <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>{stats.totalRecords}</div>
                </div>
                <div className="card" style={{ marginBottom: 0, padding: '16px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sessions Conducted</span>
                  <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>{stats.sessionsConducted} Dates</div>
                </div>
                <div className="card" style={{ marginBottom: 0, padding: '16px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Attendance Rate</span>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: stats.percentage >= 75 ? 'var(--success)' : 'var(--danger)', marginTop: '4px' }}>
                    {stats.percentage}%
                  </div>
                </div>
                <div className="card" style={{ marginBottom: 0, padding: '16px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Breakdown</span>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '8px' }}>
                    <span style={{ color: 'var(--success)' }}>{stats.presentCount} P</span> &bull;{' '}
                    <span style={{ color: 'var(--warning)' }}>{stats.lateCount} L</span> &bull;{' '}
                    <span style={{ color: 'var(--danger)' }}>{stats.absentCount} A</span>
                  </div>
                </div>
              </div>
            )}

            <div className="filters-bar">
              <div className="filter-input-search">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search student by name or roll number..."
                  value={filterSearch}
                  onChange={(e) => {
                    setFilterSearch(e.target.value);
                    setHistoryPage(1);
                  }}
                />
              </div>

              <div className="filter-select">
                <select
                  className="form-control"
                  value={filterCourse}
                  onChange={(e) => {
                    setFilterCourse(e.target.value);
                    setHistoryPage(1);
                  }}
                >
                  <option value="">All Courses</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>{c.courseCode}</option>
                  ))}
                </select>
              </div>

              <div className="filter-select">
                <select
                  className="form-control"
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setHistoryPage(1);
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>From:</span>
                <input
                  type="date"
                  className="form-control"
                  style={{ width: '135px' }}
                  value={filterStartDate}
                  onChange={(e) => {
                    setFilterStartDate(e.target.value);
                    setHistoryPage(1);
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>To:</span>
                <input
                  type="date"
                  className="form-control"
                  style={{ width: '135px' }}
                  value={filterEndDate}
                  onChange={(e) => {
                    setFilterEndDate(e.target.value);
                    setHistoryPage(1);
                  }}
                />
              </div>

              {hasHistoryFilters && (
                <button className="btn btn-outline btn-sm" onClick={handleResetHistoryFilters}>
                  Reset Filters
                </button>
              )}
            </div>

            {loadingHistory ? (
              <SkeletonTable rows={historyPageSize > 10 ? 8 : 5} columns={6} />
            ) : historyRecords.length === 0 ? (
              <EmptyState
                title="No attendance logs found"
                message={
                  hasHistoryFilters
                    ? 'No attendance records match the specified date range or search filters.'
                    : 'No attendance records recorded yet.'
                }
                icon="📅"
                actionLabel={hasHistoryFilters ? 'Clear All Filters' : null}
                onAction={hasHistoryFilters ? handleResetHistoryFilters : null}
              />
            ) : (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th className="sortable" onClick={() => handleSortHistory('date')}>
                          Date <span className="sort-indicator">{sortBy === 'date' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}</span>
                        </th>
                        <th>Roll No</th>
                        <th>Student Name</th>
                        <th>Subject</th>
                        <th>Course</th>
                        <th>Status</th>
                        <th>Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyRecords.map((r) => (
                        <tr key={r._id}>
                          <td style={{ fontWeight: 500, fontSize: '13px' }}>{r.dateString}</td>
                          <td style={{ fontWeight: 600 }}>{r.student?.studentId || '--'}</td>
                          <td style={{ fontWeight: 500 }}>
                            {r.student?.firstName} {r.student?.lastName}
                          </td>
                          <td style={{ fontSize: '12px' }}>{r.subject?.subjectCode || r.subject?.name}</td>
                          <td style={{ fontSize: '12px' }}>{r.course?.courseCode}</td>
                          <td>{getStatusBadge(r.status)}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                            {r.remarks || '--'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ padding: '0 20px 14px' }}>
                  <Pagination
                    currentPage={historyPagination.page}
                    totalPages={historyPagination.totalPages}
                    totalItems={historyPagination.total}
                    pageSize={historyPageSize}
                    onPageChange={(newPage) => setHistoryPage(newPage)}
                    onPageSizeChange={(newSize) => {
                      setHistoryPageSize(newSize);
                      setHistoryPage(1);
                    }}
                    pageSizeOptions={[10, 15, 25, 50]}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {(isStudent || activeTab === 'my_attendance') && (
          <div>
            {loadingMyAttendance ? (
              <SkeletonTable rows={6} columns={4} />
            ) : !myStats ? (
              <EmptyState
                title="No student profile matched"
                message="Your user account is not linked to an active student record."
                icon="🎓"
              />
            ) : (
              <div>
                <div
                  className="card"
                  style={{
                    borderLeft: myStats.isLowAttendance ? '4px solid var(--danger)' : '4px solid var(--success)',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
                        Overall Attendance: {myStats.overallPercentage}%
                      </h2>
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0' }}>
                        {myStats.isLowAttendance
                          ? 'Warning: Your attendance is below the minimum 75% requirement.'
                          : 'Your attendance meets the minimum college requirement.'}
                      </p>
                    </div>
                    <span className={`status-badge ${myStats.isLowAttendance ? 'disconnected' : 'connected'}`} style={{ fontSize: '13px', padding: '5px 12px' }}>
                      {myStats.isLowAttendance ? 'Low Attendance (<75%)' : 'Good Standing (>=75%)'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginTop: '16px' }}>
                    <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', padding: '12px 16px', borderRadius: 'var(--radius-lg)' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Classes</span>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>{myStats.totalClasses || 0}</div>
                    </div>
                    <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', padding: '12px 16px', borderRadius: 'var(--radius-lg)' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Present</span>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>{myStats.presentCount ?? myStats.totalPresent ?? 0}</div>
                    </div>
                    <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', padding: '12px 16px', borderRadius: 'var(--radius-lg)' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Late</span>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--warning)', marginTop: '4px' }}>{myStats.lateCount ?? myStats.totalLate ?? 0}</div>
                    </div>
                    <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', padding: '12px 16px', borderRadius: 'var(--radius-lg)' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Absent</span>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--danger)', marginTop: '4px' }}>{myStats.absentCount ?? myStats.totalAbsent ?? 0}</div>
                    </div>
                    {(() => {
                      const tot = myStats.totalClasses || 0;
                      const pres = myStats.presentCount ?? myStats.totalPresent ?? 0;
                      const late = myStats.lateCount ?? myStats.totalLate ?? 0;
                      const effAttended = pres + (late * 0.5);
                      const moreNeeded = Math.max(0, Math.ceil(3 * tot - 4 * effAttended));

                      if (myStats.isLowAttendance || moreNeeded > 0) {
                        return (
                          <div style={{ background: 'rgba(239, 68, 68, 0.18)', border: '1px solid rgba(239, 68, 68, 0.45)', padding: '12px 16px', borderRadius: 'var(--radius-lg)' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Needed for 75%
                            </span>
                            <div style={{ fontSize: '22px', fontWeight: 800, color: '#f87171', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>+{moreNeeded}</span>
                              <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', background: 'var(--danger)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                Next
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '12px 16px', borderRadius: 'var(--radius-lg)' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#86efac', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Status
                          </span>
                          <div style={{ fontSize: '18px', fontWeight: 800, color: '#4ade80', marginTop: '6px' }}>
                            Safe &ge; 75%
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {(() => {
                    const tot = myStats.totalClasses || 0;
                    const pres = myStats.presentCount ?? myStats.totalPresent ?? 0;
                    const late = myStats.lateCount ?? myStats.totalLate ?? 0;
                    const effAttended = pres + (late * 0.5);
                    const moreNeeded = Math.max(0, Math.ceil(3 * tot - 4 * effAttended));
                    if (moreNeeded > 0) {
                      return (
                        <div style={{ marginTop: '14px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)', fontSize: '13px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>💡</span>
                          <span>
                            Attend the next <strong>{moreNeeded} consecutive {moreNeeded === 1 ? 'class' : 'classes'}</strong> without missing any to restore your attendance to 75%.
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Class Attendance History</h3>
                  </div>

                  {myHistory.length === 0 ? (
                    <EmptyState
                      title="No class logs yet"
                      message="No attendance has been recorded for your enrolled subjects."
                      icon="📅"
                    />
                  ) : (
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
                          {myHistory.map((att) => (
                            <tr key={att._id}>
                              <td style={{ fontWeight: 500 }}>{att.dateString}</td>
                              <td>{att.subject?.name || att.subject?.subjectName}</td>
                              <td>{getStatusBadge(att.status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AttendancePage;