import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import MarksEntryModal from '../components/MarksEntryModal';
import Pagination from '../components/Pagination';
import { SkeletonTable } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import * as marksService from '../services/marksService';
import * as courseService from '../services/courseService';
import * as subjectService from '../services/subjectService';
import { getStudents } from '../services/studentService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const MarksPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const isStudent = user?.role === 'STUDENT';

  const [activeTab, setActiveTab] = useState(isStudent ? 'report' : 'registry');

  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [studentList, setStudentList] = useState([]);

  const [filterCourse, setFilterCourse] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterSemester, setFilterSemester] = useState('All Semesters');
  const [filterGrade, setFilterGrade] = useState('All Grades');
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  const [filterSearch, setFilterSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [marksList, setMarksList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loadingMarks, setLoadingMarks] = useState(false);

  const [selectedStudentForReport, setSelectedStudentForReport] = useState('');
  const [selectedSemesterForReport, setSelectedSemesterForReport] = useState('3');
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMark, setEditingMark] = useState(null);

  useEffect(() => {
    courseService.getCourses({ limit: 100 }).then((res) => {
      if (res.success) setCourses(res.courses);
    }).catch(() => {});

    subjectService.getSubjects({ limit: 100 }).then((res) => {
      if (res.success) setSubjects(res.subjects);
    }).catch(() => {});

    if (!isStudent) {
      getStudents({ limit: 100 }).then((res) => {
        if (res.success && res.students.length > 0) {
          setStudentList(res.students);
          setSelectedStudentForReport(res.students[0]._id);
        }
      }).catch(() => {});
    }
  }, [isStudent]);

  const fetchMarks = useCallback(async () => {
    setLoadingMarks(true);
    try {
      const params = {
        page,
        limit: pageSize,
        courseId: filterCourse,
        subjectId: filterSubject,
        semester: filterSemester === 'All Semesters' ? '' : filterSemester,
        grade: filterGrade === 'All Grades' ? '' : filterGrade,
        isPassed: filterStatus === 'Passed' ? 'true' : filterStatus === 'Failed' ? 'false' : '',
        search: filterSearch.trim(),
        sortBy,
        sortOrder,
      };

      const res = await marksService.getMarks(params);
      if (res.success) {
        setMarksList(res.marks);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Failed to load marks ledger records');
    } finally {
      setLoadingMarks(false);
    }
  }, [page, pageSize, filterCourse, filterSubject, filterSemester, filterGrade, filterStatus, filterSearch, sortBy, sortOrder, toast]);

  useEffect(() => {
    if (!isStudent && activeTab === 'registry') {
      fetchMarks();
    }
  }, [isStudent, activeTab, fetchMarks]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilterCourse('');
    setFilterSubject('');
    setFilterSemester('All Semesters');
    setFilterGrade('All Grades');
    setFilterStatus('All Statuses');
    setFilterSearch('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const fetchReport = useCallback(async () => {
    setLoadingReport(true);
    try {
      if (isStudent) {
        const res = await marksService.getMyResults(selectedSemesterForReport);
        if (res.success) setReportData(res.report);
      } else if (selectedStudentForReport) {
        const res = await marksService.getStudentResult(selectedStudentForReport, selectedSemesterForReport);
        if (res.success) setReportData(res.report);
      }
    } catch (err) {
      toast.error('Failed to load semester grade transcript');
    } finally {
      setLoadingReport(false);
    }
  }, [isStudent, selectedStudentForReport, selectedSemesterForReport, toast]);

  useEffect(() => {
    if (isStudent || activeTab === 'report') {
      fetchReport();
    }
  }, [isStudent, activeTab, fetchReport]);

  const handleSaveMarks = async (data) => {
    try {
      await marksService.saveMarks(data);
      toast.success('Marks recorded and auto-graded successfully.');
      setIsModalOpen(false);
      setEditingMark(null);
      if (activeTab === 'registry') fetchMarks();
      if (activeTab === 'report') fetchReport();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save marks');
    }
  };

  const getGradeBadge = (grade) => {
    const colors = {
      'A+': { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
      'A':  { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
      'B+': { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc' },
      'B':  { bg: '#ecfeff', text: '#0e7490', border: '#a5f3fc' },
      'C':  { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
      'D':  { bg: '#ffedd5', text: '#c2410c', border: '#fed7aa' },
      'F':  { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' },
    };
    const c = colors[grade] || colors['F'];

    return (
      <span
        style={{
          display: 'inline-block',
          padding: '2px 8px',
          borderRadius: '9999px',
          backgroundColor: c.bg,
          color: c.text,
          border: `1px solid ${c.border}`,
          fontWeight: 700,
          fontSize: '12px',
        }}
      >
        {grade}
      </span>
    );
  };

  const hasActiveFilters =
    filterCourse !== '' ||
    filterSubject !== '' ||
    filterSemester !== 'All Semesters' ||
    filterGrade !== 'All Grades' ||
    filterStatus !== 'All Statuses' ||
    filterSearch.trim() !== '';

  return (
    <div className="layout-root">
      <Navbar />

      <main className="app-container" style={{ maxWidth: '1200px' }}>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 className="page-title">Marks & Results</h1>
            <p className="page-subtitle">View and enter subject marks, calculate semester SGPA, and generate student grade reports.</p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {!isStudent && (
              <div className="tab-buttons" style={{ display: 'flex', gap: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '4px', borderRadius: '8px' }}>
                <button
                  className={`btn btn-sm ${activeTab === 'registry' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setActiveTab('registry')}
                >
                  Marks List
                </button>
                <button
                  className={`btn btn-sm ${activeTab === 'report' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setActiveTab('report')}
                >
                  Student Results
                </button>
              </div>
            )}

            {!isStudent && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setEditingMark(null);
                  setIsModalOpen(true);
                }}
              >
                + Enter Marks
              </button>
            )}
          </div>
        </div>

        {!isStudent && activeTab === 'registry' && (
          <div>
            <div className="filters-bar">
              <div className="filter-input-search">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search student by name or roll number..."
                  value={filterSearch}
                  onChange={(e) => {
                    setFilterSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              <div className="filter-select">
                <select
                  className="form-control"
                  value={filterCourse}
                  onChange={(e) => {
                    setFilterCourse(e.target.value);
                    setPage(1);
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
                  value={filterSubject}
                  onChange={(e) => {
                    setFilterSubject(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Subjects</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>{s.subjectCode}</option>
                  ))}
                </select>
              </div>

              <div className="filter-select">
                <select
                  className="form-control"
                  value={filterSemester}
                  onChange={(e) => {
                    setFilterSemester(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="All Semesters">All Semesters</option>
                  {Array.from({ length: 8 }, (_, i) => i + 1).map((s) => (
                    <option key={s} value={s}>Sem {s}</option>
                  ))}
                </select>
              </div>

              <div className="filter-select">
                <select
                  className="form-control"
                  value={filterGrade}
                  onChange={(e) => {
                    setFilterGrade(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="All Grades">All Grades</option>
                  <option value="A+">Grade A+</option>
                  <option value="A">Grade A</option>
                  <option value="B+">Grade B+</option>
                  <option value="B">Grade B</option>
                  <option value="C">Grade C</option>
                  <option value="D">Grade D</option>
                  <option value="F">Grade F</option>
                </select>
              </div>

              <div className="filter-select">
                <select
                  className="form-control"
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="All Statuses">All Results</option>
                  <option value="Passed">Passed</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button className="btn btn-outline btn-sm" onClick={handleResetFilters}>
                  Reset Filters
                </button>
              )}
            </div>

            {loadingMarks ? (
              <SkeletonTable rows={pageSize > 10 ? 8 : 5} columns={8} />
            ) : marksList.length === 0 ? (
              <EmptyState
                title="No marks records found"
                message={
                  hasActiveFilters
                    ? 'No evaluation records match the applied filters.'
                    : 'No student marks have been entered for this semester yet.'
                }
                icon="📝"
                actionLabel={hasActiveFilters ? 'Clear Filters' : '+ Enter First Marks'}
                onAction={
                  hasActiveFilters
                    ? handleResetFilters
                    : () => {
                        setEditingMark(null);
                        setIsModalOpen(true);
                      }
                }
              />
            ) : (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Roll No</th>
                        <th>Student Name</th>
                        <th>Subject</th>
                        <th>Internal (30)</th>
                        <th>External (70)</th>
                        <th className="sortable" onClick={() => handleSort('totalMarks')}>
                          Total (100) <span className="sort-indicator">{sortBy === 'totalMarks' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}</span>
                        </th>
                        <th className="sortable" onClick={() => handleSort('percentage')}>
                          % <span className="sort-indicator">{sortBy === 'percentage' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}</span>
                        </th>
                        <th>Grade</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marksList.map((m) => (
                        <tr key={m._id}>
                          <td style={{ fontWeight: 600 }}>{m.student?.studentId}</td>
                          <td>
                            <div style={{ fontWeight: 500 }}>{m.student?.firstName} {m.student?.lastName}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sem {m.semester}</div>
                          </td>
                          <td style={{ fontSize: '12px' }}>{m.subject?.subjectCode || m.subject?.name}</td>
                          <td>{m.internalMarks}</td>
                          <td>{m.externalMarks}</td>
                          <td style={{ fontWeight: 600 }}>{m.totalMarks}</td>
                          <td style={{ fontWeight: 600 }}>{m.percentage}%</td>
                          <td>{getGradeBadge(m.grade)}</td>
                          <td>
                            <button
                              className="btn-action btn-action-edit"
                              onClick={() => {
                                setEditingMark(m);
                                setIsModalOpen(true);
                              }}
                              title="Recalibrate Scores"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                <path d="m15 5 4 4" />
                              </svg>
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ padding: '0 20px 14px' }}>
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.total}
                    pageSize={pageSize}
                    onPageChange={(newPage) => setPage(newPage)}
                    onPageSizeChange={(newSize) => {
                      setPageSize(newSize);
                      setPage(1);
                    }}
                    pageSizeOptions={[10, 15, 25, 50]}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {(isStudent || activeTab === 'report') && (
          <div>
            {!isStudent && (
              <div className="card" style={{ marginBottom: '20px' }}>
                <div className="card-title">
                  <span>Student Result View</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div className="form-group">
                    <label>Select Student</label>
                    <select
                      className="form-control"
                      value={selectedStudentForReport}
                      onChange={(e) => setSelectedStudentForReport(e.target.value)}
                    >
                      {studentList.map((stu) => (
                        <option key={stu._id} value={stu._id}>
                          {stu.studentId} — {stu.firstName} {stu.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Semester</label>
                    <select
                      className="form-control"
                      value={selectedSemesterForReport}
                      onChange={(e) => setSelectedSemesterForReport(e.target.value)}
                    >
                      {Array.from({ length: 8 }, (_, i) => i + 1).map((s) => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {loadingReport ? (
              <SkeletonTable rows={4} columns={6} />
            ) : !reportData || reportData.subjects?.length === 0 ? (
              <EmptyState
                title="No transcript records available"
                message={`No evaluation records have been posted for Semester ${selectedSemesterForReport}.`}
                icon="📊"
              />
            ) : (
              <div>
                <div
                  className="card"
                  style={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    color: 'white',
                    padding: '24px',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
                        {reportData.student?.name}
                      </h2>
                      <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0' }}>
                        Roll No: <strong>{reportData.student?.studentId}</strong> &bull; Semester {reportData.semester} &bull; Result: <strong>{reportData.academicStatus}</strong>
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '28px', fontWeight: 800, color: '#38bdf8' }}>{reportData.sgpa}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>SGPA (10.0)</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '28px', fontWeight: 800, color: '#4ade80' }}>{reportData.overallPercentage}%</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Percentage</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Subject Code</th>
                          <th>Subject Title</th>
                          <th>Credits</th>
                          <th>Internal</th>
                          <th>External</th>
                          <th>Total</th>
                          <th>Grade</th>
                          <th>Grade Point</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.subjects && reportData.subjects.length > 0 ? (
                          reportData.subjects.map((sub) => (
                            <tr key={sub.subjectId}>
                              <td style={{ fontWeight: 600 }}>{sub.subjectCode}</td>
                              <td style={{ fontWeight: 500 }}>{sub.subjectName}</td>
                              <td>{sub.credits}</td>
                              <td>{sub.internalMarks} / 30</td>
                              <td>{sub.externalMarks} / 70</td>
                              <td style={{ fontWeight: 600 }}>{sub.totalMarks} / 100</td>
                              <td>{getGradeBadge(sub.grade)}</td>
                              <td style={{ fontWeight: 600 }}>{sub.gradePoint}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                              No graded subject evaluations recorded for this semester.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <MarksEntryModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingMark(null);
          }}
          onSave={handleSaveMarks}
          onSubmit={handleSaveMarks}
          existingMark={editingMark}
          initialData={editingMark}
          courses={courses}
          subjects={subjects}
          students={studentList}
        />
      </main>
    </div>
  );
};

export default MarksPage;