import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlobalSearch from './GlobalSearch';

const PAGE_TITLES = {
  '/dashboard': 'System Overview & Analytics',
  '/students': 'Student Directory',
  '/teachers': 'Faculty Roster',
  '/courses': 'Academic Programs',
  '/subjects': 'Course Curriculum & Modules',
  '/attendance': 'Class Attendance Management',
  '/marks': 'Grades & Academic Transcripts',
  '/announcements': 'Campus Notices & Announcements',
  '/profile': 'User Profile & Settings',
};

const Header = ({ onOpenMobile }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const currentTitle = PAGE_TITLES[location.pathname] || 'Academic Management';

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onOpenMobile}
          aria-label="Open Navigation"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="header-breadcrumbs">
          <span className="breadcrumb-root">Portal</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{currentTitle}</span>
        </div>
      </div>

      <div className="header-center">
        <GlobalSearch />
      </div>

      <div className="header-right">
        <NavLink
          to="/announcements"
          className="header-icon-btn"
          title="Campus Notices"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </NavLink>

        <NavLink to="/profile" className="header-user-pill" title="My Profile">
          <div className="header-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="header-user-name">{user?.name?.split(' ')[0] || 'Account'}</span>
        </NavLink>
      </div>
    </header>
  );
};

export default Header;
