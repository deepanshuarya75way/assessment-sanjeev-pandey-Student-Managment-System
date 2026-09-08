import React, { useState, useEffect } from 'react';

const AnnouncementModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    targetAudience: 'Everyone',
    priority: 'Normal',
    status: 'Published',
    publishDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = Boolean(initialData && initialData._id);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || initialData.content || '',
        category: initialData.category || 'General',
        targetAudience: initialData.targetAudience || (initialData.targetRole === 'STUDENT' ? 'Students' : initialData.targetRole === 'TEACHER' ? 'Teachers' : 'Everyone'),
        priority: initialData.priority || 'Normal',
        status: initialData.status || 'Published',
        publishDate: initialData.publishDate ? new Date(initialData.publishDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        expiryDate: initialData.expiryDate ? new Date(initialData.expiryDate).toISOString().split('T')[0] : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'General',
        targetAudience: 'Everyone',
        priority: 'Normal',
        status: 'Published',
        publishDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
      });
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Announcement title is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Announcement description is required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        content: formData.description,
        targetRole: formData.targetAudience === 'Students' ? 'STUDENT' : formData.targetAudience === 'Teachers' ? 'TEACHER' : 'ALL',
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null,
        publishDate: formData.publishDate ? new Date(formData.publishDate) : new Date(),
      };
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-lg)',
                background: isEdit ? 'var(--accent-edit-light)' : 'var(--primary-light)',
                color: isEdit ? 'var(--accent-edit)' : 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: isEdit ? '1px solid var(--accent-edit-border)' : '1px solid rgba(59, 130, 246, 0.25)',
              }}
            >
              {isEdit ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0 }}>{isEdit ? 'Edit Institutional Notice' : 'Create Campus Announcement'}</h3>
                {isEdit && (
                  <span className="edit-mode-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      <path d="m15 5 4 4" />
                    </svg>
                    Edit Mode
                  </span>
                )}
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {isEdit ? `Updating notice: "${formData.title || 'Untitled'}"` : 'Publish news, schedules and circulars to students and faculty'}
              </p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose} type="button">&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '72vh', overflowY: 'auto' }}>
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label>Title <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="text"
                name="title"
                className="form-control"
                placeholder="e.g. Mid-Term Examination Schedule Released"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div className="form-group">
                <label>Target Audience</label>
                <select
                  name="targetAudience"
                  className="form-control"
                  value={formData.targetAudience}
                  onChange={handleChange}
                >
                  <option value="Everyone">Everyone</option>
                  <option value="Students">Students Only</option>
                  <option value="Teachers">Teachers Only</option>
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  name="priority"
                  className="form-control"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  className="form-control"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  className="form-control"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="General">General</option>
                  <option value="Academic">Academic</option>
                  <option value="Exam">Exam</option>
                  <option value="Event">Event</option>
                </select>
              </div>

              <div className="form-group">
                <label>Publish Date</label>
                <input
                  type="date"
                  name="publishDate"
                  className="form-control"
                  value={formData.publishDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Expiry Date (Optional)</label>
                <input
                  type="date"
                  name="expiryDate"
                  className="form-control"
                  value={formData.expiryDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description / Notice Body <span style={{ color: '#ef4444' }}>*</span></label>
              <textarea
                name="description"
                className="form-control"
                rows="5"
                placeholder="Write the full announcement details here..."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={isEdit ? { background: 'var(--accent-edit-gradient)', border: 'none', boxShadow: 'var(--shadow-edit-glow)' } : {}}
            >
              {loading ? (
                isEdit ? 'Saving Updates...' : 'Publishing...'
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {isEdit ? 'Update Announcement' : (formData.status === 'Draft' ? 'Save as Draft' : 'Publish Notice')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementModal;
