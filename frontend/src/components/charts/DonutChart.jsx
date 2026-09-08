import React, { useState } from 'react';

const DonutChart = ({
  data = [],
  size = 180,
  strokeWidth = 26,
  centerLabel = '',
  centerValue = '',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const validData = data.filter((d) => typeof d.value === 'number' && d.value > 0);
  const total = validData.reduce((acc, curr) => acc + curr.value, 0);

  if (total === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', color: 'var(--text-muted)' }}>
        <div style={{ width: size, height: size, borderRadius: '50%', border: '4px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
          No data
        </div>
      </div>
    );
  }

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulativeAngle = 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth={strokeWidth}
          />

          {validData.map((item, idx) => {
            const percentage = (item.value / total) * 100;
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((cumulativeAngle / 100) * circumference);
            cumulativeAngle += percentage;

            const isHovered = hoveredIndex === idx;

            return (
              <circle
                key={item.label || idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={item.color || `hsl(${idx * 60 + 200}, 75%, 50%)`}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  opacity: hoveredIndex !== null && !isHovered ? 0.6 : 1,
                }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
            {hoveredIndex !== null ? validData[hoveredIndex].value : (centerValue || total)}
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginTop: '4px' }}>
            {hoveredIndex !== null ? validData[hoveredIndex].label : (centerLabel || 'Total')}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px 16px', maxWidth: '300px' }}>
        {validData.map((item, idx) => {
          const percentage = Math.round((item.value / total) * 100);
          return (
            <div
              key={item.label || idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                color: hoveredIndex === idx ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: hoveredIndex === idx ? 700 : 500,
                cursor: 'pointer',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span
                style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: item.color,
                  display: 'inline-block',
                }}
              />
              <span>{item.label}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({percentage}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DonutChart;
