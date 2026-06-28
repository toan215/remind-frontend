import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthController } from '../../controllers/AuthController';
import { sidebarItems } from './mockData';
import '../../admin/tailwind.css';

// ===== SVG Icon Component =====
function Icon({ name, className = 'w-5 h-5' }: { name: string; className?: string }) {
  const icons: Record<string, React.ReactElement> = {
    grid: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    users: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    'shopping-bag': (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    box: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    'bar-chart-2': (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
    settings: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    search: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    bell: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    sun: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    moon: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
    logout: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    ),
    menu: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
    x: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    'chevron-left': (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
      </svg>
    ),
  };

  return icons[name] || <span className={className} />;
}

export default function AdminDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('admin-theme');
    return stored ? stored === 'dark' : true;
  });

  const user = AuthController.getCurrentUser();

  useEffect(() => {
    localStorage.setItem('admin-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await AuthController.logout();
    navigate('/admin');
  };

  const currentPath = location.pathname;
  const currentPageTitle = sidebarItems.find(item => currentPath.startsWith(item.path))?.label || 'Dashboard';

  const themeClass = isDark ? '' : 'admin-light';

  return (
    <div className={`admin-root ${themeClass} min-h-screen flex ${isDark ? 'bg-admin-bg text-admin-text' : 'bg-admin-light-bg text-admin-light-text'}`}>
      {/* ===== Mobile Overlay ===== */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`
          admin-sidebar-transition fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col
          ${isDark ? 'bg-admin-surface border-admin-border' : 'bg-admin-light-surface border-admin-light-border'}
          border-r
          ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
          ${mobileMenuOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Sidebar Header */}
        <div className={`flex items-center h-16 px-4 border-b ${isDark ? 'border-admin-border' : 'border-admin-light-border'} flex-shrink-0`}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-admin-primary/10 border border-admin-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🛡️</span>
              </div>
              <div className="min-w-0">
                <h2 className={`text-sm font-bold truncate ${isDark ? 'text-admin-text' : 'text-admin-light-text'}`}>ReMind</h2>
                <span className="text-xs text-admin-primary font-medium">Admin Panel</span>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-full flex justify-center">
              <div className="w-9 h-9 rounded-xl bg-admin-primary/10 border border-admin-primary/20 flex items-center justify-center">
                <span className="text-lg">🛡️</span>
              </div>
            </div>
          )}
          {/* Mobile close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className={`lg:hidden ml-auto p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-admin-surface-hover text-admin-text-muted' : 'hover:bg-admin-light-surface-hover text-admin-light-text-muted'}`}
          >
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = currentPath === item.path || (item.path === '/admin/dashboard' && currentPath === '/admin/dashboard');
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                  ${isActive
                    ? `bg-admin-primary/10 text-admin-primary ${isDark ? '' : 'bg-admin-primary/10'}`
                    : `${isDark ? 'text-admin-text-muted hover:bg-admin-surface-hover hover:text-admin-text' : 'text-admin-light-text-muted hover:bg-admin-light-surface-hover hover:text-admin-light-text'}`
                  }
                  ${sidebarCollapsed ? 'justify-center' : ''}
                `}
                title={sidebarCollapsed ? item.label : undefined}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-admin-primary rounded-r-full" />
                )}
                <Icon name={item.icon} className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-admin-primary' : ''}`} />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                {!sidebarCollapsed && item.badge && (
                  <span className="ml-auto bg-admin-primary/10 text-admin-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className={`p-3 border-t ${isDark ? 'border-admin-border' : 'border-admin-light-border'} space-y-2 flex-shrink-0`}>
          {/* Collapse toggle (desktop only) */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`hidden lg:flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isDark ? 'text-admin-text-muted hover:bg-admin-surface-hover hover:text-admin-text' : 'text-admin-light-text-muted hover:bg-admin-light-surface-hover hover:text-admin-light-text'} ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <Icon name="chevron-left" className={`w-5 h-5 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>

          {/* User card */}
          <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${isDark ? 'bg-admin-bg/50' : 'bg-admin-light-surface-hover'} ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-admin-primary/20 text-admin-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
              {user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AD'}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium truncate ${isDark ? 'text-admin-text' : 'text-admin-light-text'}`}>
                  {user?.fullName || 'Admin'}
                </p>
                <p className={`text-xs truncate ${isDark ? 'text-admin-text-dim' : 'text-admin-light-text-dim'}`}>
                  {user?.email || 'admin@remind.app'}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ===== MAIN AREA ===== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ===== HEADER ===== */}
        <header className={`sticky top-0 z-30 h-16 flex items-center gap-4 px-4 lg:px-6 border-b backdrop-blur-xl ${isDark ? 'bg-admin-bg/80 border-admin-border' : 'bg-admin-light-bg/80 border-admin-light-border'}`}>
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-admin-surface text-admin-text-muted' : 'hover:bg-admin-light-surface-hover text-admin-light-text-muted'}`}
          >
            <Icon name="menu" className="w-5 h-5" />
          </button>

          {/* Page title */}
          <h1 className={`text-lg font-semibold hidden sm:block ${isDark ? 'text-admin-text' : 'text-admin-light-text'}`}>
            {currentPageTitle}
          </h1>

          {/* Search bar */}
          <div className="flex-1 max-w-md ml-auto sm:ml-4">
            <div className={`relative flex items-center rounded-xl border transition-all duration-200 group ${isDark ? 'bg-admin-surface border-admin-border focus-within:border-admin-primary' : 'bg-admin-light-surface border-admin-light-border focus-within:border-admin-primary'}`}>
              <Icon name="search" className={`w-4 h-4 ml-3 flex-shrink-0 ${isDark ? 'text-admin-text-dim' : 'text-admin-light-text-dim'}`} />
              <input
                type="text"
                placeholder="Search anything..."
                className={`w-full px-3 py-2 bg-transparent text-sm outline-none ${isDark ? 'text-admin-text placeholder-admin-text-dim' : 'text-admin-light-text placeholder-admin-light-text-dim'}`}
              />
              <kbd className={`hidden sm:flex mr-3 items-center px-1.5 py-0.5 rounded text-[10px] font-mono border ${isDark ? 'bg-admin-bg border-admin-border text-admin-text-dim' : 'bg-admin-light-surface-hover border-admin-light-border text-admin-light-text-dim'}`}>
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-1">
            {/* Dark mode toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2.5 rounded-xl transition-all duration-200 ${isDark ? 'hover:bg-admin-surface text-admin-text-muted hover:text-admin-text' : 'hover:bg-admin-light-surface-hover text-admin-light-text-muted hover:text-admin-light-text'}`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <Icon name={isDark ? 'sun' : 'moon'} className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button className={`relative p-2.5 rounded-xl transition-all duration-200 ${isDark ? 'hover:bg-admin-surface text-admin-text-muted hover:text-admin-text' : 'hover:bg-admin-light-surface-hover text-admin-light-text-muted hover:text-admin-light-text'}`}>
              <Icon name="bell" className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-admin-danger rounded-full border-2 border-admin-bg" />
            </button>

            {/* Divider */}
            <div className={`hidden sm:block w-px h-8 mx-2 ${isDark ? 'bg-admin-border' : 'bg-admin-light-border'}`} />

            {/* User avatar + Logout */}
            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl transition-all duration-200 ${isDark ? 'hover:bg-admin-surface' : 'hover:bg-admin-light-surface-hover'}`}
              title="Logout"
            >
              <div className="w-8 h-8 rounded-full bg-admin-primary/20 text-admin-primary flex items-center justify-center text-xs font-bold">
                {user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AD'}
              </div>
              <Icon name="logout" className={`w-4 h-4 hidden sm:block ${isDark ? 'text-admin-text-dim' : 'text-admin-light-text-dim'}`} />
            </button>
          </div>
        </header>

        {/* ===== PAGE CONTENT ===== */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet context={{ isDark }} />
        </main>
      </div>
    </div>
  );
}
