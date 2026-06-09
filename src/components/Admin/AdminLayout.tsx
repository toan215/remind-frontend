import React from "react";
import "./Admin.css";
import { ADMIN_ROUTES, AdminRoute } from "../../routes/adminRoutes";

interface AdminLayoutProps {
  currentRoute: AdminRoute;
  onNavigate: (route: AdminRoute) => void;
  onBackToHome: () => void;
  children: React.ReactNode;
}

export function AdminLayout({ currentRoute, onNavigate, onBackToHome, children }: AdminLayoutProps) {
  return (
    <div className="admin-layout-container">
      {/* ===== SIDEBAR ===== */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          {/* Logo */}
          <div className="admin-sidebar-logo">
            <div className="admin-logo-icon">R</div>
            <span className="admin-logo-text">ReMind</span>
            <span className="admin-logo-badge">Admin</span>
          </div>

          {/* Navigation Links */}
          <nav className="admin-sidebar-menu">
            {ADMIN_ROUTES.map((route) => {
              const isActive = currentRoute === route.path;
              return (
                <button
                  key={route.path}
                  className={`admin-menu-item ${isActive ? "active" : ""}`}
                  onClick={() => onNavigate(route.path)}
                  title={route.label}
                >
                  <i className={`bx ${route.icon}`}></i>
                  <span>{route.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Back to User Mode */}
        <div className="admin-sidebar-bottom">
          <button
            className="admin-menu-item"
            onClick={onBackToHome}
            title="Thoát trang quản trị"
            style={{ borderTop: "1px solid var(--border)", borderRadius: 0, paddingTop: "16px" }}
          >
            <i className="bx bx-log-out-circle"></i>
            <span>Về Trang chủ</span>
          </button>

          <div className="admin-user-card">
            <div className="admin-user-avatar">AD</div>
            <div className="admin-user-info">
              <span className="admin-user-name">Admin Moderator</span>
              <span className="admin-user-role">Quản trị viên</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== WORKSPACE CONTENT AREA ===== */}
      <div className="admin-workspace">
        {/* Top Header */}
        <header className="admin-top-bar">
          <h1 className="admin-page-title">
            {currentRoute === "dashboard" ? "Bảng điều khiển quản trị" : "Quản lý danh sách chuyên gia"}
          </h1>
          <div className="admin-top-actions">
            <button
              onClick={onBackToHome}
              className="rm-btn rm-btn-outline"
              style={{ height: "38px" }}
            >
              <i className="bx bx-home-alt"></i>
              Xem trang chủ
            </button>
          </div>
        </header>

        {/* Content Container */}
        <main className="admin-main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
