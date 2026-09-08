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
        return { bg: 'rgba(16, 185, 129, 0.16)', color: '#34d399', border: 'rgba(16, 185, 129, 0.35)' };
      case 'warning':
        return { bg: 'rgba(245, 158, 11, 0.16)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.35)' };
      case 'danger':
        return { bg: 'rgba(239, 68, 68, 0.16)', color: '#f87171', border: 'rgba(239, 68, 68, 0.35)' };
      default:
        return { bg: 'rgba(59, 130, 246, 0.16)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.35)' };
    }
  };

  const badgeStyle = getBadgeStyle();

  return (
    <div
      className="dashboard-stat-card"
      onClick={onClick}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
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
