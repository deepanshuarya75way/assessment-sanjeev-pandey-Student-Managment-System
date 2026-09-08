import React, { useState } from 'react';

const BarChart = ({
  data = [],
  height = 180,
  defaultColor = 'var(--primary)',
  valueSuffix = '',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        No bar data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value || 0), 1);
  const chartHeight = height - 40;

  return (
    <div style={{ width: '100%', height }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          height: chartHeight,
          gap: '12px',
          paddingBottom: '8px',
          borderBottom: '1px solid var(--border-color)',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', opacity: 0.25 }}>
          <div style={{ borderTop: '1px dashed var(--border-color)', width: '100%' }} />
          <div style={{ borderTop: '1px dashed var(--border-color)', width: '100%' }} />
          <div style={{ borderTop: '1px dashed var(--border-color)', width: '100%' }} />
        </div>

        {data.map((item, idx) => {
          const barHeightPct = Math.max(8, Math.round(((item.value || 0) / maxValue) * 100));
          const isHovered = hoveredIndex === idx;

          return (
            <div
              key={item.label || idx}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                height: '100%',
                position: 'relative',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {isHovered && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-32px',
                    backgroundColor: 'var(--text-primary)',
                    color: 'var(--text-inverse)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    boxShadow: 'var(--shadow-md)',
                    zIndex: 10,
                    pointerEvents: 'none',
                  }}
                >
                  {item.value} {valueSuffix}
                </div>
              )}

              <div
                style={{
                  width: '70%',
                  maxWidth: '36px',
                  minWidth: '12px',
                  height: `${barHeightPct}%`,
                  backgroundColor: item.color || defaultColor,
                  borderRadius: '6px 6px 0 0',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: hoveredIndex !== null && !isHovered ? 0.5 : 1,
                  transform: isHovered ? 'scaleY(1.03)' : 'scaleY(1)',
                  transformOrigin: 'bottom',
                }}
              />
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '12px', height: '32px', paddingTop: '6px' }}>
        {data.map((item, idx) => (
          <div
            key={item.label || idx}
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: '0.72rem',
              color: hoveredIndex === idx ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: hoveredIndex === idx ? 700 : 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              transition: 'color 0.15s ease',
            }}
            title={item.label}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;
