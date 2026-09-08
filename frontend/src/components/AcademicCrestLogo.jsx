import React from 'react';

const AcademicCrestLogo = ({ size = 42, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <defs>
      <linearGradient id="crestGold" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FCD34D" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <linearGradient id="crestNavy" x1="32" y1="4" x2="32" y2="60" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1E3A8A" />
        <stop offset="100%" stopColor="#0F172A" />
      </linearGradient>
    </defs>

    <path
      d="M32 4 C48 4 56 12 56 26 C56 44 42 56 32 60 C22 56 8 44 8 26 C8 12 16 4 32 4 Z"
      fill="url(#crestNavy)"
      stroke="url(#crestGold)"
      strokeWidth="2.5"
    />

    <path
      d="M32 8 C44 8 52 15 52 26 C52 41 40 51 32 55 C24 51 12 41 12 26 C12 15 20 8 32 8 Z"
      fill="none"
      stroke="url(#crestGold)"
      strokeWidth="1"
      strokeDasharray="2 1"
      opacity="0.6"
    />

    <polygon
      points="32,15 48,22 32,29 16,22"
      fill="url(#crestGold)"
    />
    <polygon
      points="32,16.5 46,22 32,27.5 18,22"
      fill="#1E293B"
    />

    <path
      d="M24 25.5 V30 C24 33 40 33 40 30 V25.5"
      stroke="url(#crestGold)"
      strokeWidth="1.5"
      fill="#0F172A"
    />

    <path
      d="M44 23.5 C46 25 47 28 47 31"
      stroke="#FCD34D"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="47" cy="32" r="1.5" fill="#FCD34D" />

    <path
      d="M31 38 C26 36 21 37 18 39 V49 C21 47 26 46 31 48 Z"
      fill="#FFFFFF"
      stroke="#F59E0B"
      strokeWidth="1.2"
    />
    <path
      d="M33 38 C38 36 43 37 46 39 V49 C43 47 38 46 33 48 Z"
      fill="#FFFFFF"
      stroke="#F59E0B"
      strokeWidth="1.2"
    />
    <line x1="32" y1="37" x2="32" y2="49" stroke="#D97706" strokeWidth="1.5" />

    <line x1="21" y1="41" x2="28" y2="40" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
    <line x1="21" y1="44" x2="27" y2="43" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />

    <line x1="36" y1="40" x2="43" y2="41" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
    <line x1="37" y1="43" x2="43" y2="44" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />

    <polygon
      points="32,50 33,52.2 35.5,52.2 33.5,53.7 34.2,56 32,54.6 29.8,56 30.5,53.7 28.5,52.2 31,52.2"
      fill="url(#crestGold)"
    />
  </svg>
);

export default AcademicCrestLogo;
