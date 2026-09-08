import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import TeacherFormModal from '../components/TeacherFormModal';
import TeacherDetailModal from '../components/TeacherDetailModal';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import { SkeletonTable } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import * as teacherService from '../services/teacherService';
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

const TeachersPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const canManage = user?.role === 'ADMIN';

  const [teachers, setTeachers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All Departments');
  const [status, setStatus] = useState('All Statuses');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [viewingTeacher, setViewingTeacher] = useState(null);
  const [deletingTeacher, setDeletingTeacher] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: pageSize,
        search: search.trim(),
        department: department === 'All Departments' ? '' : department,
        status: status === 'All Statuses' ? '' : status,
        sortBy,
        sortOrder,
      };
      const res = await teacherService.getTeachers(params);
      if (res.success) {
        setTeachers(res.teachers);
        setPagination(res.pagination);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to load faculty records';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, department, status, sortBy, sortOrder, toast]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

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
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const handleSaveTeacher = async (teacherData) => {
    try {
      if (editingTeacher) {
        await teacherService.updateTeacher(editingTeacher._id, teacherData);
        toast.success(`Prof. ${teacherData.firstName} ${teacherData.lastName} updated successfully.`);
      } else {
        await teacherService.createTeacher(teacherData);
        toast.success(`Prof. ${teacherData.firstName} ${teacherData.lastName} appointed successfully.`);
      }
      setIsFormOpen(false);
      setEditingTeacher(null);
      fetchTeachers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save faculty record');
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTeacher) return;
    setIsDeleting(true);
    try {
      await teacherService.deleteTeacher(deletingTeacher._id);
      toast.success(`Prof. ${deletingTeacher.firstName} ${deletingTeacher.lastName} removed.`);
      setDeletingTeacher(null);
      fetchTeachers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete faculty record');
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
    status !== 'All Statuses';

  return (
    <div className="layout-root">
      <Navbar />

      <main className="app-container" style={{ maxWidth: '1200px' }}>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 className="page-title">Faculty Management</h1>
              <span className="count-badge">{pagination.total} Faculty</span>
            </div>
            <p className="page-subtitle">Oversee academic faculty members, departments, and course assignments.</p>
          </div>

          {canManage && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingTeacher(null);
                setIsFormOpen(true);
              }}
            >
              + Add New Teacher
            </button>
          )}
        </div>

        {error && (
          <div className="alert-error" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span>{error}</span>
            <button className="btn btn-sm btn-outline" onClick={fetchTeachers}>Retry</button>
          </div>
        )}

        <div className="filters-bar">
          <div className="filter-input-search">
            <input
              type="text"
              className="form-control"
              placeholder="Search faculty by name, ID, email, specialization..."
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
        ) : teachers.length === 0 ? (
          <EmptyState
            title="No faculty members found"
            message={
              hasActiveFilters
                ? 'No faculty members match the applied filters.'
                : 'No faculty records found in the database.'
            }
            icon="👨‍🏫"
            actionLabel={hasActiveFilters ? 'Clear All Filters' : canManage ? '+ Add Faculty Member' : null}
            onAction={
              hasActiveFilters
                ? handleResetFilters
                : canManage
                ? () => {
                    setEditingTeacher(null);
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
                    <th className="sortable" onClick={() => handleSort('teacherId')}>
                      Faculty ID <span className="sort-indicator">{getSortIcon('teacherId')}</span>
                    </th>
                    <th className="sortable" onClick={() => handleSort('firstName')}>
                      Name <span className="sort-indicator">{getSortIcon('firstName')}</span>
                    </th>
                    <th className="sortable" onClick={() => handleSort('department')}>
                      Department <span className="sort-indicator">{getSortIcon('department')}</span>
                    </th>
                    <th className="sortable" onClick={() => handleSort('experience')}>
                      Experience <span className="sort-indicator">{getSortIcon('experience')}</span>
                    </th>
                    <th className="sortable" onClick={() => handleSort('status')}>
                      Status <span className="sort-indicator">{getSortIcon('status')}</span>
                    </th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((teacher) => (
                    <tr key={teacher._id}>
                      <td style={{ fontWeight: 600 }}>{teacher.teacherId}</td>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                          Prof. {teacher.firstName} {teacher.lastName}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{teacher.email}</div>
                      </td>
                      <td style={{ fontSize: '13px' }}>{teacher.department}</td>
                      <td style={{ fontSize: '13px' }}>{teacher.experience} Years</td>
                      <td>
                        <span className={`badge ${teacher.status === 'Active' ? 'badge-success' : 'badge-inactive'}`}>
                          {teacher.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-btn-group">
                          <button
                            className="btn-action btn-action-view"
                            onClick={() => setViewingTeacher(teacher)}
                            title="View Faculty Profile"
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
                                setEditingTeacher(teacher);
                                setIsFormOpen(true);
                              }}
                              title="Edit Faculty Record"
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
                              onClick={() => setDeletingTeacher(teacher)}
                              title="Delete Faculty Record"
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

        <TeacherFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingTeacher(null);
          }}
          onSave={handleSaveTeacher}
          onSubmit={handleSaveTeacher}
          teacher={editingTeacher}
          initialData={editingTeacher}
        />

        <TeacherDetailModal
          isOpen={!!viewingTeacher}
          onClose={() => setViewingTeacher(null)}
          teacher={viewingTeacher}
          onEdit={(tch) => {
            setViewingTeacher(null);
            setEditingTeacher(tch);
            setIsFormOpen(true);
          }}
        />

        <ConfirmModal
          isOpen={!!deletingTeacher}
          title="Delete Faculty Profile"
          message={`Are you sure you want to remove Prof. ${deletingTeacher?.firstName} ${deletingTeacher?.lastName} (${deletingTeacher?.teacherId})? Course allocations will need re-assignment.`}
          confirmText="Delete Faculty"
          confirmVariant="danger"
          loading={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingTeacher(null)}
        />
      </main>
    </div>
  );
};

export default TeachersPage;