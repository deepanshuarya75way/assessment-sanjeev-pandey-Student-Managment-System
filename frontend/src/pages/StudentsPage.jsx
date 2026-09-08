import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import StudentFormModal from '../components/StudentFormModal';
import StudentDetailModal from '../components/StudentDetailModal';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import { SkeletonTable } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import * as studentService from '../services/studentService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const DEPARTMENTS = [
  'All Departments',
  'Computer Science & Engineering',
  'Information Technology',
  'Mechanical Engineering',
  'Electronics & Communication',
  'Civil Engineering',
  'Electrical Engineering',
  'Business Administration',
];

const StudentsPage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const canManage = ['ADMIN', 'TEACHER'].includes(user?.role);
  const canDelete = user?.role === 'ADMIN';

  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All Departments');
  const [status, setStatus] = useState('All Statuses');
  const [semester, setSemester] = useState('All Semesters');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: pageSize,
        search: search.trim(),
        department: department === 'All Departments' ? '' : department,
        status: status === 'All Statuses' ? '' : status,
        semester: semester === 'All Semesters' ? '' : semester,
        sortBy,
        sortOrder,
      };
      const res = await studentService.getStudents(params);
      if (res.success) {
        setStudents(res.students);
        setPagination(res.pagination);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to load students';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, department, status, semester, sortBy, sortOrder, toast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setDepartment('All Departments');
    setStatus('All Statuses');
    setSemester('All Semesters');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const handleSaveStudent = async (studentData) => {
    try {
      if (editingStudent) {
        await studentService.updateStudent(editingStudent._id, studentData);
        toast.success(`Student ${studentData.firstName} updated successfully.`);
      } else {
        await studentService.createStudent(studentData);
        toast.success(`Student ${studentData.firstName} registered successfully.`);
      }
      setIsFormOpen(false);
      setEditingStudent(null);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save student record');
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingStudent) return;
    setIsDeleting(true);
    try {
      await studentService.deleteStudent(deletingStudent._id);
      toast.success(`Student ${deletingStudent.firstName} ${deletingStudent.lastName} removed.`);
      setDeletingStudent(null);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete student');
    } finally {
      setIsDeleting(false);
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕';
    return sortOrder === 'asc' ? '▲' : '▼';
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'Active':
        return <span className="status-badge connected"><span className="status-dot"></span>Active</span>;
      case 'Graduated':
        return <span className="status-badge connecting"><span className="status-dot"></span>Graduated</span>;
      case 'Suspended':
        return <span className="status-badge disconnected"><span className="status-dot"></span>Suspended</span>;
      default:
        return <span className="status-badge disconnected"><span className="status-dot"></span>Inactive</span>;
    }
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    department !== 'All Departments' ||
    status !== 'All Statuses' ||
    semester !== 'All Semesters';

  return (
    <div className="layout-root">
      <Navbar />

      <main className="app-container" style={{ maxWidth: '1200px' }}>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 className="page-title">Student Directory</h1>
              <span className="count-badge">{pagination.total} Students</span>
            </div>
            <p className="page-subtitle">Manage student enrollments, profiles, and academic status.</p>
          </div>

          {canManage && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingStudent(null);
                setIsFormOpen(true);
              }}
            >
              + Add New Student
            </button>
          )}
        </div>

        {error && (
          <div className="alert-error" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span>{error}</span>
            <button className="btn btn-sm btn-outline" onClick={fetchStudents}>Retry</button>
          </div>
        )}

        <div className="filters-bar">
          <div className="filter-input-search">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, roll number, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="filter-select">
            <select
              className="form-control"
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setPage(1);
              }}
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="filter-select">
            <select
              className="form-control"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Graduated">Graduated</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div className="filter-select">
            <select
              className="form-control"
              value={semester}
              onChange={(e) => {
                setSemester(e.target.value);
                setPage(1);
              }}
            >
              <option value="All Semesters">All Semesters</option>
              {Array.from({ length: 8 }, (_, i) => i + 1).map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button className="btn btn-outline btn-sm" onClick={handleResetFilters}>
              Reset Filters
            </button>
          )}
        </div>

        {loading ? (
          <SkeletonTable rows={pageSize > 10 ? 8 : 5} columns={6} />
        ) : students.length === 0 ? (
          <EmptyState
            title="No students found"
            message={
              hasActiveFilters
                ? 'No student records match the applied search and filter criteria.'
                : 'No student records found in the database yet.'
            }
            icon="🎓"
            actionLabel={hasActiveFilters ? 'Clear All Filters' : canManage ? '+ Register First Student' : null}
            onAction={
              hasActiveFilters
                ? handleResetFilters
                : canManage
                ? () => {
                    setEditingStudent(null);
                    setIsFormOpen(true);
                  }
                : null
            }
          />
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleSort('studentId')}>
                      Roll No <span className="sort-indicator">{getSortIcon('studentId')}</span>
                    </th>
                    <th className="sortable" onClick={() => handleSort('firstName')}>
                      Student Name <span className="sort-indicator">{getSortIcon('firstName')}</span>
                    </th>
                    <th className="sortable" onClick={() => handleSort('department')}>
                      Department <span className="sort-indicator">{getSortIcon('department')}</span>
                    </th>
                    <th className="sortable" onClick={() => handleSort('semester')}>
                      Semester <span className="sort-indicator">{getSortIcon('semester')}</span>
                    </th>
                    <th className="sortable" onClick={() => handleSort('status')}>
                      Status <span className="sort-indicator">{getSortIcon('status')}</span>
                    </th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td style={{ fontWeight: 600 }}>{student.studentId}</td>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                          {student.firstName} {student.middleName ? `${student.middleName} ` : ''}{student.lastName}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{student.email}</div>
                      </td>
                      <td style={{ fontSize: '13px' }}>{student.department}</td>
                      <td style={{ fontSize: '13px' }}>Sem {student.semester}</td>
                      <td>{getStatusBadge(student.status)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-btn-group">
                          <button
                            className="btn-action btn-action-view"
                            onClick={() => setViewingStudent(student)}
                            title="View Profile"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            View
                          </button>
                          {canManage && (
                            <button
                              className="btn-action btn-action-edit"
                              onClick={() => {
                                setEditingStudent(student);
                                setIsFormOpen(true);
                              }}
                              title="Edit Record"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                <path d="m15 5 4 4" />
                              </svg>
                              Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              className="btn-action btn-action-delete"
                              onClick={() => setDeletingStudent(student)}
                              title="Delete Student"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              </svg>
                              Delete
                            </button>
                          )}
                        </div>
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
                pageSizeOptions={[5, 10, 20, 50]}
              />
            </div>
          </div>
        )}

        <StudentFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingStudent(null);
          }}
          onSave={handleSaveStudent}
          onSubmit={handleSaveStudent}
          student={editingStudent}
          initialData={editingStudent}
        />

        <StudentDetailModal
          isOpen={!!viewingStudent}
          onClose={() => setViewingStudent(null)}
          student={viewingStudent}
          onEdit={(stu) => {
            setViewingStudent(null);
            setEditingStudent(stu);
            setIsFormOpen(true);
          }}
        />

        <ConfirmModal
          isOpen={!!deletingStudent}
          title="Delete Student Record"
          message={`Are you sure you want to permanently delete ${deletingStudent?.firstName} ${deletingStudent?.lastName} (${deletingStudent?.studentId})? All academic history will be removed.`}
          confirmText="Delete Record"
          confirmVariant="danger"
          loading={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingStudent(null)}
        />
      </main>
    </div>
  );
};

export default StudentsPage;