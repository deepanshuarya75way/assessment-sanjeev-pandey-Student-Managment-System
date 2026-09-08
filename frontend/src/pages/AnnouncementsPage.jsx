import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import AnnouncementModal from '../components/AnnouncementModal';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import * as announcementService from '../services/announcementService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AUDIENCES = ['All Audiences', 'Everyone', 'Students', 'Teachers'];
const PRIORITIES = ['All Priorities', 'Normal', 'High', 'Urgent'];
const CATEGORIES = ['All Categories', 'General', 'Academic', 'Exam', 'Event'];
const STATUSES = ['All Statuses', 'Published', 'Draft', 'Archived'];

const AnnouncementsPage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const isAdmin = user?.role === 'ADMIN';

  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [audience, setAudience] = useState('All Audiences');
  const [priority, setPriority] = useState('All Priorities');
  const [category, setCategory] = useState('All Categories');
  const [status, setStatus] = useState('All Statuses');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: pageSize,
        search: search.trim(),
        sortBy: 'publishDate',
        sortOrder: 'desc',
      };

      if (audience !== 'All Audiences') {
        params.targetAudience = audience;
      }
      if (priority !== 'All Priorities') {
        params.priority = priority;
      }
      if (category !== 'All Categories') {
        params.category = category;
      }
      if (isAdmin && status !== 'All Statuses') {
        params.status = status;
      }

      const res = await announcementService.getAnnouncements(params);
      const items = res.announcements || res.data || [];
      setAnnouncements(items);
      setUnreadCount(res.unreadCount || 0);
      if (res.pagination) {
        setPagination(res.pagination);
      } else {
        setPagination({ page: 1, limit: pageSize, total: items.length, totalPages: 1 });
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError(err.response?.data?.message || 'Failed to load announcements.');
      toast.error('Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, audience, priority, category, status, isAdmin, toast]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (editingItem && editingItem._id) {
        await announcementService.updateAnnouncement(editingItem._id, formData);
        toast.success('Announcement updated successfully.');
      } else {
        await announcementService.createAnnouncement(formData);
        toast.success('Announcement published successfully.');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await announcementService.deleteAnnouncement(deletingItem._id);
      toast.success('Announcement deleted successfully.');
      setDeletingItem(null);
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete announcement.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await announcementService.markAsRead(id);
      setAnnouncements((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isRead: true } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success('Marked as read.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark as read.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await announcementService.markAllAsRead();
      setAnnouncements((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
      toast.success('All announcements marked as read.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark all as read.');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setAudience('All Audiences');
    setPriority('All Priorities');
    setCategory('All Categories');
    setStatus('All Statuses');
    setPage(1);
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    audience !== 'All Audiences' ||
    priority !== 'All Priorities' ||
    category !== 'All Categories' ||
    (isAdmin && status !== 'All Statuses');

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'Urgent':
        return <span className="status-badge disconnected" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }}><span className="status-dot" style={{ backgroundColor: '#ef4444' }}></span>Urgent</span>;
      case 'High':
        return <span className="status-badge" style={{ backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d' }}><span className="status-dot" style={{ backgroundColor: '#f59e0b' }}></span>High</span>;
      default:
        return <span className="status-badge" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}><span className="status-dot" style={{ backgroundColor: '#0ea5e9' }}></span>Normal</span>;
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'Published':
        return <span className="status-badge connected"><span className="status-dot"></span>Published</span>;
      case 'Draft':
        return <span className="status-badge" style={{ backgroundColor: '#fef9c3', color: '#854d0e', border: '1px solid #fde047' }}><span className="status-dot" style={{ backgroundColor: '#eab308' }}></span>Draft</span>;
      default:
        return <span className="status-badge disconnected"><span className="status-dot"></span>Archived</span>;
    }
  };

  return (
    <div className="layout-root">
      <Navbar />

      <main className="app-container" style={{ maxWidth: '1100px' }}>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 className="page-title">Campus Announcements</h1>
              <span className="count-badge">{pagination.total} Notices</span>
              {unreadCount > 0 && (
                <span className="count-badge" style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}>
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <p className="page-subtitle">Official institutional notices, examination circulars, and departmental updates.</p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {unreadCount > 0 && (
              <button className="btn btn-outline" onClick={handleMarkAllAsRead}>
                ✓ Mark All Read
              </button>
            )}

            {isAdmin && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setEditingItem(null);
                  setIsModalOpen(true);
                }}
              >
                + Post Announcement
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="alert-error" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span>{error}</span>
            <button className="btn btn-sm btn-outline" onClick={fetchAnnouncements}>Retry</button>
          </div>
        )}

        <div className="filters-bar" style={{ marginBottom: '20px' }}>
          <div className="filter-input-search" style={{ flex: '1 1 240px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search notices by title, description..."
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
              value={audience}
              onChange={(e) => {
                setAudience(e.target.value);
                setPage(1);
              }}
            >
              {AUDIENCES.map((aud) => (
                <option key={aud} value={aud}>{aud}</option>
              ))}
            </select>
          </div>

          <div className="filter-select">
            <select
              className="form-control"
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="filter-select">
            <select
              className="form-control"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {isAdmin && (
            <div className="filter-select">
              <select
                className="form-control"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {hasActiveFilters && (
            <button className="btn btn-outline" onClick={resetFilters} style={{ whiteSpace: 'nowrap' }}>
              Clear Filters
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3].map((n) => (
              <div key={n} className="card skeleton-card" style={{ height: '120px', borderRadius: '8px' }}></div>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <EmptyState
            title="No announcements found"
            message={hasActiveFilters ? 'No notices match your current filters. Try resetting the filters.' : 'There are currently no announcements posted for your role.'}
            actionLabel={hasActiveFilters ? 'Reset Filters' : (isAdmin ? '+ Post First Announcement' : null)}
            onAction={hasActiveFilters ? resetFilters : (isAdmin ? () => setIsModalOpen(true) : null)}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {announcements.map((item) => {
              const isUnread = item.isRead === false;
              const pubDate = item.publishDate ? new Date(item.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
              const expDate = item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

              return (
                <div
                  key={item._id}
                  className="card announcement-card"
                  style={{
                    backgroundColor: 'var(--card-bg, #ffffff)',
                    border: isUnread ? '1.5px solid #3b82f6' : '1px solid var(--border-color, #e2e8f0)',
                    borderRadius: '10px',
                    padding: '20px',
                    boxShadow: isUnread ? '0 4px 12px rgba(59, 130, 246, 0.08)' : '0 1px 3px rgba(0,0,0,0.05)',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 600, fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px' }}>
                        {item.category || 'General'}
                      </span>
                      <span className="badge" style={{ backgroundColor: '#ede9fe', color: '#6d28d9', fontWeight: 600, fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px' }}>
                        Target: {item.targetAudience || 'Everyone'}
                      </span>
                      {getPriorityBadge(item.priority)}
                      {isAdmin && getStatusBadge(item.status)}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        📅 {pubDate} {expDate ? `• Expires: ${expDate}` : ''}
                      </span>
                      {isUnread ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', backgroundColor: '#dbeafe', padding: '2px 8px', borderRadius: '12px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2563eb' }}></span>
                          Unread
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          ✓ Read
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary, #0f172a)', margin: '0 0 10px 0' }}>
                    {item.title}
                  </h3>

                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary, #334155)', lineHeight: 1.6, margin: '0 0 16px 0', whiteSpace: 'pre-line' }}>
                    {item.description || item.content}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-color, #f1f5f9)', flexWrap: 'wrap', gap: '10px' }}>
                    <span style={{ fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic' }}>
                      Issued by: <strong>{item.authorName || 'Campus Administration'}</strong>
                    </span>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {isUnread && (
                        <button
                          className="btn btn-sm btn-outline"
                          style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                          onClick={() => handleMarkAsRead(item._id)}
                        >
                          Mark as Read
                        </button>
                      )}

                      {isAdmin && (
                        <div className="action-btn-group">
                          <button
                            className="btn-action btn-action-edit"
                            onClick={() => {
                              setEditingItem(item);
                              setIsModalOpen(true);
                            }}
                            title="Edit Notice"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                              <path d="m15 5 4 4" />
                            </svg>
                            Edit
                          </button>
                          <button
                            className="btn-action btn-action-delete"
                            onClick={() => setDeletingItem(item)}
                            title="Delete Notice"
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
                </div>
              );
            })}
          </div>
        )}

        {!loading && announcements.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              pageSize={pagination.limit}
              onPageChange={(p) => setPage(p)}
              onPageSizeChange={(sz) => {
                setPageSize(sz);
                setPage(1);
              }}
            />
          </div>
        )}
      </main>

      {isAdmin && isModalOpen && (
        <AnnouncementModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          onSubmit={handleCreateOrUpdate}
          initialData={editingItem}
        />
      )}

      {isAdmin && deletingItem && (
        <ConfirmModal
          isOpen={Boolean(deletingItem)}
          title="Delete Announcement"
          message={`Are you sure you want to permanently delete "${deletingItem.title}"? This cannot be undone.`}
          confirmLabel="Delete Notice"
          isDanger={true}
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeletingItem(null)}
        />
      )}
    </div>
  );
};

export default AnnouncementsPage;
