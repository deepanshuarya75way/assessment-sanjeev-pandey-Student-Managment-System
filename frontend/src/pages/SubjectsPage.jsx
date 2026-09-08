import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import SubjectFormModal from '../components/SubjectFormModal';
import SubjectDetailModal from '../components/SubjectDetailModal';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import { SkeletonTable } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import * as subjectService from '../services/subjectService';
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

const SubjectsPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const canManage = user?.role === 'ADMIN';

  const [subjects, setSubjects] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All Departments');
  const [semester, setSemester] = useState('All Semesters');
  const [status, setStatus] = useState('All Statuses');
  const [sortBy, setSortBy] = useState('subjectCode');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [viewingSubject, setViewingSubject] = useState(null);
  const [deletingSubject, setDeletingSubject] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: pageSize,
        search: search.trim(),
        department: department === 'All Departments' ? '' : department,
        semester: semester === 'All Semesters' ? '' : semester,
        status: status === 'All Statuses' ? '' : status,
        sortBy,
        sortOrder,
      };
      const res = await subjectService.getSubjects(params);
      if (res.success) {
        setSubjects(res.subjects);
        setPagination(res.pagination);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to load subjects';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, department, semester, status, sortBy, sortOrder, toast]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

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
    setSemester('All Semesters');
    setStatus('All Statuses');
    setSortBy('subjectCode');
    setSortOrder('asc');
    setPage(1);
  };

  const handleSaveSubject = async (subjectData) => {
    try {
      if (editingSubject) {
        await subjectService.updateSubject(editingSubject._id, subjectData);
        toast.success(`Subject ${subjectData.subjectName} updated.`);
      } else {
        await subjectService.createSubject(subjectData);
        toast.success(`Subject ${subjectData.subjectName} created.`);
      }
      setIsFormOpen(false);
      setEditingSubject(null);
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save curriculum module');
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingSubject) return;
    setIsDeleting(true);
    try {
      await subjectService.deleteSubject(deletingSubject._id);
      toast.success(`Subject ${deletingSubject.subjectName} removed.`);
      setDeletingSubject(null);
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete subject');
    } finally {
      setIsDeleting(false);
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕';
    return sortOrder === 'asc' ? '▲' : '▼';
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    department !== 'All Departments' ||
    semester !== 'All Semesters' ||
    status !== 'All Statuses';

  return (
    <div className="layout-root">
      <Navbar />

      <main className="app-container" style={{ maxWidth: '1200px' }}>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 className="page-title">Curriculum Subjects</h1>
              <span className="count-badge">{pagination.total} Subjects</span>
            </div>
            <p className="page-subtitle">Academic credit requirements, course associations, and assigned instructors.</p>
          </div>

          {canManage && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingSubject(null);
                setIsFormOpen(true);
              }}
            >
              + Add New Subject
            </button>
          )}
        </div>

        {error && (
          <div className="alert-error" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span>{error}</span>
            <button className="btn btn-sm btn-outline" onClick={fetchSubjects}>Retry</button>
          </div>
        )}

        <div className="filters-bar">
          <div className="filter-input-search">
            <input
              type="text"
              className="form-control"
              placeholder="Search by code, subject title..."
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
        ) : subjects.length === 0 ? (
          <EmptyState
            title="No curriculum subjects found"
            message={
              hasActiveFilters
                ? 'No subjects match your current filter and search settings.'
                : 'No subjects have been registered in the curriculum yet.'
            }
            icon="📖"
            actionLabel={hasActiveFilters ? 'Clear All Filters' : canManage ? '+ Add First Subject' : null}
            onAction={
              hasActiveFilters
                ? handleResetFilters
                : canManage
                ? () => {
                    setEditingSubject(null);
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
                    <th className="sortable" onClick={() => handleSort('subjectCode')}>
                      Code <span className="sort-indicator">{getSortIcon('subjectCode')}</span>
                    </th>
                    <th className="sortable" onClick={() => handleSort('subjectName')}>
                      Subject Name <span className="sort-indicator">{getSortIcon('subjectName')}</span>
                    </th>
                    <th className="sortable" onClick={() => handleSort('credits')}>
                      Credits <span className="sort-indicator">{getSortIcon('credits')}</span>
                    </th>
                    <th className="sortable" onClick={() => handleSort('semester')}>
                      Semester <span className="sort-indicator">{getSortIcon('semester')}</span>
                    </th>
                    <th>Assigned Faculty</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject) => (
                    <tr key={subject._id}>
                      <td style={{ fontWeight: 600 }}>{subject.subjectCode}</td>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>{subject.subjectName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{subject.course?.courseName || subject.department}</div>
                      </td>
                      <td style={{ fontSize: '13px' }}>{subject.credits} Credits</td>
                      <td style={{ fontSize: '13px' }}>Sem {subject.semester}</td>
                      <td style={{ fontSize: '12px' }}>
                        {subject.teacher ? (
                          <span>Prof. {subject.teacher.firstName} {subject.teacher.lastName}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-btn-group">
                          <button
                            className="btn-action btn-action-view"
                            onClick={() => setViewingSubject(subject)}
                            title="View Subject Details"
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
                                setEditingSubject(subject);
                                setIsFormOpen(true);
                              }}
                              title="Edit Subject"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                <path d="m15 5 4 4" />
                              </svg>
                              Edit
                            </button>
                          )}
                          {canManage && (
                            <button
                              className="btn-action btn-action-delete"
                              onClick={() => setDeletingSubject(subject)}
                              title="Delete Subject"
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

        <SubjectFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingSubject(null);
          }}
          onSave={handleSaveSubject}
          onSubmit={handleSaveSubject}
          subject={editingSubject}
          initialData={editingSubject}
        />

        <SubjectDetailModal
          isOpen={!!viewingSubject}
          onClose={() => setViewingSubject(null)}
          subject={viewingSubject}
          onEdit={(sub) => {
            setViewingSubject(null);
            setEditingSubject(sub);
            setIsFormOpen(true);
          }}
        />

        <ConfirmModal
          isOpen={!!deletingSubject}
          title="Delete Subject Module"
          message={`Are you sure you want to remove ${deletingSubject?.subjectName} (${deletingSubject?.subjectCode})? Historical evaluations will be archived.`}
          confirmText="Delete Subject"
          confirmVariant="danger"
          loading={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingSubject(null)}
        />
      </main>
    </div>
  );
};

export default SubjectsPage;