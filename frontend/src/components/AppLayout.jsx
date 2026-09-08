import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const AppLayout = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sms_sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sms_sidebar_collapsed', isCollapsed ? 'true' : 'false');
  }, [isCollapsed]);

  return (
    <div className={`app-shell ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
      />

      <div className="app-main-frame">
        <Header onOpenMobile={() => setIsMobileOpen(true)} />

        <div className="app-content-scroll">
          <div className="app-content-wrapper">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
