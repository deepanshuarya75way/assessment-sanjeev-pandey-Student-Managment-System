import React from 'react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  badge,
  badgeType = 'info',
  onClick,
}) => {
  const getBadgeStyle = () => {
    switch (badgeType) {
      case 'success':
        return { bg: '#dcfce7', color: '#166534', border: '#86efac' };
      case 'warning':
        return { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' };
      case 'danger':
        return { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' };
      default:
        return { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' };
    }
  };

  const badgeStyle = getBadgeStyle();

  return (
    <div
      className="dashboard-stat-card"
      onClick={onClick}
      style={{
        background: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {icon && (
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 'bold',
              }}
            >
              {icon}
            </div>
          )}
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {title}
          </span>
        </div>

        {badge && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '9999px',
              backgroundColor: badgeStyle.bg,
              color: badgeStyle.color,
              border: `1px solid ${badgeStyle.border}`,
            }}
          >
            {badge}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1 }}>
          {value !== undefined && value !== null ? value : 0}
        </span>
      </div>

      {subtitle && (
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {subtitle}
        </span>
      )}
    </div>
  );
};

export default StatCard;
