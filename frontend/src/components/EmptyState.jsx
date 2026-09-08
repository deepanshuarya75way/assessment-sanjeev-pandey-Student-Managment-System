import React from 'react';

const EmptyState = ({
  title = 'No records found',
  message = 'Try adjusting your search criteria or filters.',
  icon = '🔍',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="empty-state-container">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {actionLabel && onAction && (
        <button type="button" className="btn btn-outline btn-sm empty-state-action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
