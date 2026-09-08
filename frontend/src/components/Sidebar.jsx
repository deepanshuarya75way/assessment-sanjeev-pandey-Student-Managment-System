import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as announcementService from '../services/announcementService';
import AcademicCrestLogo from './AcademicCrestLogo';

const NAV_ITEMS = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    path: '/students',
    label: 'Students',
    roles: ['ADMIN', 'TEACHER'],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    path: '/teachers',
    label: 'Faculty',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    path: '/courses',
    label: 'Courses',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
        <path d="M6 6h10" />
        <path d="M6 10h10" />
      </svg>
    ),
  },
  {
    path: '/subjects',
    label: 'Subjects',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
  {
    path: '/attendance',
    label: 'Attendance',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="m9 16 2 2 4-4" />
      </svg>
    ),
  },
  {
    path: '/marks',
    label: 'Marks & Results',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    path: '/announcements',
    label: 'Campus Notices',
    badgeKey: 'notices',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    path: '/profile',
    label: 'My Profile',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

const Sidebar = ({ isMobileOpen, onCloseMobile, isCollapsed, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      try {
        const res = await announcementService.getAnnouncements({ limit: 1 });
        if (isMounted && typeof res.unreadCount === 'number') {
          setUnreadCount(res.unreadCount);
        }
      } catch (err) {
      }
    };
    if (user) fetchUnread();
    return () => {
      isMounted = false;
    };
  }, [user, location.pathname]);

  useEffect(() => {
    if (isMobileOpen && onCloseMobile) {
      onCloseMobile();
    }
  }, [location.pathname]);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Admin', bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' };
      case 'TEACHER':
        return { label: 'Faculty', bg: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' };
      default:
        return { label: 'Student', bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' };
    }
  };

  const roleInfo = getRoleBadge(user?.role);

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (item.roles && !item.roles.includes(user?.role)) {
      return false;
    }
    return true;
  });

  return (
    <>
      {isMobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      <aside
        className={`app-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
      >
        <div className="sidebar-brand">
          <NavLink to="/dashboard" className="brand-link">
            <div className="brand-logo" style={{ background: 'transparent', boxShadow: 'none' }}>
              <AcademicCrestLogo size={32} />
            </div>
            {!isCollapsed && (
              <div className="brand-text">
                <span className="brand-title">SMS</span>
                <span className="brand-badge">Portal</span>
              </div>
            )}
          </NavLink>

          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-section">
            {!isCollapsed && <span className="nav-section-title">MAIN NAVIGATION</span>}
            <ul className="nav-list">
              {visibleNavItems.map((item) => {
                const badgeNumber = item.badgeKey === 'notices' ? unreadCount : 0;
                return (
                  <li key={item.path} className="nav-item">
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      {!isCollapsed && <span className="nav-label">{item.label}</span>}
                      {!isCollapsed && badgeNumber > 0 && (
                        <span className="nav-badge-pill">{badgeNumber}</span>
                      )}
                      {isCollapsed && badgeNumber > 0 && (
                        <span className="nav-badge-dot" />
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/profile" className="user-profile-card" title="View profile">
            <div className="user-avatar-circle">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            {!isCollapsed && (
              <div className="user-info-text">
                <span className="user-display-name">{user?.name || 'User'}</span>
                <span className="user-role-tag" style={{ backgroundColor: roleInfo.bg, color: roleInfo.color }}>
                  {roleInfo.label}
                </span>
              </div>
            )}
          </NavLink>

          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={logout}
            title="Sign Out"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
