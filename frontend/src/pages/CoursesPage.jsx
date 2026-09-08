import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import CourseFormModal from '../components/CourseFormModal';
import CourseDetailModal from '../components/CourseDetailModal';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import { SkeletonCards } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import * as courseService from '../services/courseService';
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

const CoursesPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const canManage = user?.role === 'ADMIN';

  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All Departments');
  const [status, setStatus] = useState('All Statuses');
  const [sortBy, setSortBy] = useState('courseName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [viewingCourse, setViewingCourse] = useState(null);
  const [deletingCourse, setDeletingCourse] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCourses = useCallback(async () => {
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
      const res = await courseService.getCourses(params);
      if (res.success) {
        setCourses(res.courses);
        setPagination(res.pagination);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to load courses';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, department, status, sortBy, sortOrder, toast]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleResetFilters = () => {
    setSearch('');
    setDepartment('All Departments');
    setStatus('All Statuses');
    setSortBy('courseName');
    setSortOrder('asc');
    setPage(1);
  };

  const handleSaveCourse = async (courseData) => {
    try {
      if (editingCourse) {
        await courseService.updateCourse(editingCourse._id, courseData);
        toast.success(`Course ${courseData.courseName} updated successfully.`);
      } else {
        await courseService.createCourse(courseData);
        toast.success(`Course ${courseData.courseName} registered successfully.`);
      }
      setIsFormOpen(false);
      setEditingCourse(null);
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save course program');
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCourse) return;
    setIsDeleting(true);
    try {
      await courseService.deleteCourse(deletingCourse._id);
      toast.success(`Course ${deletingCourse.courseName} removed.`);
      setDeletingCourse(null);
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete course');
    } finally {
      setIsDeleting(false);
    }
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
              <h1 className="page-title">Degree Programs & Courses</h1>
              <span className="count-badge">{pagination.total} Courses</span>
            </div>
            <p className="page-subtitle">Curriculum catalogs, syllabus structure, and faculty course allocations.</p>
          </div>

          {canManage && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingCourse(null);
                setIsFormOpen(true);
              }}
            >
              + Create New Course
            </button>
          )}
        </div>

        {error && (
          <div className="alert-error" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span>{error}</span>
            <button className="btn btn-sm btn-outline" onClick={fetchCourses}>Retry</button>
          </div>
        )}

        <div className="filters-bar">
          <div className="filter-input-search">
            <input
              type="text"
              className="form-control"
              placeholder="Search by course code, program name..."
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

          <div className="filter-select">
            <select
              className="form-control"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so);
                setPage(1);
              }}
            >
              <option value="courseName-asc">Name (A-Z)</option>
              <option value="courseName-desc">Name (Z-A)</option>
              <option value="courseCode-asc">Code (A-Z)</option>
              <option value="createdAt-desc">Recently Added</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button className="btn btn-outline btn-sm" onClick={handleResetFilters}>
              Reset Filters
            </button>
          )}
        </div>

        {loading ? (
          <SkeletonCards count={pageSize > 6 ? 6 : 4} />
        ) : courses.length === 0 ? (
          <EmptyState
            title="No degree courses found"
            message={
              hasActiveFilters
                ? 'No course programs match your current search and department filters.'
                : 'No course programs have been configured in the curriculum catalog yet.'
            }
            icon="📚"
            actionLabel={hasActiveFilters ? 'Clear All Filters' : canManage ? '+ Create First Course' : null}
            onAction={
              hasActiveFilters
                ? handleResetFilters
                : canManage
                ? () => {
                    setEditingCourse(null);
                    setIsFormOpen(true);
                  }
                : null
            }
          />
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    marginBottom: 0,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
                      <span className="badge badge-info" style={{ fontWeight: 700, fontSize: '12px' }}>
                        {course.courseCode}
                      </span>
                      <span className={`badge ${course.status === 'Active' ? 'badge-success' : 'badge-inactive'}`}>
                        {course.status}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                      {course.courseName}
                    </h3>

                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                      {course.department} &bull; {course.duration} &bull; {course.semester} Semesters
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                        <span>Curriculum Subjects:</span>
                        <strong style={{ color: 'var(--text-main)' }}>{course.subjects?.length || 0} Modules</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                        <span>Assigned Faculty:</span>
                        <strong style={{ color: 'var(--text-main)' }}>{course.assignedTeachers?.length || 0} Instructors</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
                    <button
                      className="btn-action btn-action-view"
                      onClick={() => setViewingCourse(course)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      View Details
                    </button>

                    {canManage && (
                      <div className="action-btn-group">
                        <button
                          className="btn-action btn-action-edit"
                          onClick={() => {
                            setEditingCourse(course);
                            setIsFormOpen(true);
                          }}
                          title="Edit Course"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            <path d="m15 5 4 4" />
                          </svg>
                          Edit
                        </button>
                        <button
                          className="btn-action btn-action-delete"
                          onClick={() => setDeletingCourse(course)}
                          title="Delete Course"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

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
              pageSizeOptions={[6, 12, 24]}
            />
          </div>
        )}

        <CourseFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingCourse(null);
          }}
          onSave={handleSaveCourse}
          onSubmit={handleSaveCourse}
          course={editingCourse}
          initialData={editingCourse}
        />

        <CourseDetailModal
          isOpen={!!viewingCourse}
          onClose={() => setViewingCourse(null)}
          course={viewingCourse}
          onEdit={(crs) => {
            setViewingCourse(null);
            setEditingCourse(crs);
            setIsFormOpen(true);
          }}
        />

        <ConfirmModal
          isOpen={!!deletingCourse}
          title="Delete Course Program"
          message={`Are you sure you want to delete ${deletingCourse?.courseName} (${deletingCourse?.courseCode})? Sub-module relationships will be disconnected.`}
          confirmText="Delete Course"
          confirmVariant="danger"
          loading={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingCourse(null)}
        />
      </main>
    </div>
  );
};

export default CoursesPage;