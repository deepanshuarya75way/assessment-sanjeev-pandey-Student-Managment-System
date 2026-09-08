import React from 'react';

export const SkeletonTable = ({ rows = 5, columns = 5 }) => {
  return (
    <div className="skeleton-table-wrapper" aria-busy="true" aria-label="Loading data">
      <div className="skeleton-header">
        {Array.from({ length: columns }).map((_, idx) => (
          <div key={`th-${idx}`} className="skeleton-box skeleton-th" />
        ))}
      </div>
      <div className="skeleton-body">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={`tr-${rIdx}`} className="skeleton-row">
            {Array.from({ length: columns }).map((_, cIdx) => (
              <div
                key={`td-${rIdx}-${cIdx}`}
                className="skeleton-box skeleton-td"
                style={{ width: cIdx === 0 ? '40%' : cIdx === 1 ? '70%' : '60%' }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonCards = ({ count = 4 }) => {
  return (
    <div className="skeleton-cards-grid" aria-busy="true" aria-label="Loading cards">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="skeleton-card">
          <div className="skeleton-box" style={{ width: '60%', height: '20px', marginBottom: '12px' }} />
          <div className="skeleton-box" style={{ width: '40%', height: '14px', marginBottom: '16px' }} />
          <div className="skeleton-box" style={{ width: '90%', height: '14px', marginBottom: '8px' }} />
          <div className="skeleton-box" style={{ width: '75%', height: '14px' }} />
        </div>
      ))}
    </div>
  );
};

export const SkeletonStats = ({ count = 4 }) => {
  return (
    <div className="skeleton-stats-grid" aria-busy="true" aria-label="Loading stats">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="skeleton-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div className="skeleton-box" style={{ width: '50%', height: '14px' }} />
            <div className="skeleton-box" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
          </div>
          <div className="skeleton-box" style={{ width: '40%', height: '32px', marginBottom: '8px' }} />
          <div className="skeleton-box" style={{ width: '65%', height: '12px' }} />
        </div>
      ))}
    </div>
  );
};

export default {
  Table: SkeletonTable,
  Cards: SkeletonCards,
  Stats: SkeletonStats,
};
