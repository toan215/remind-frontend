import React, { useEffect, useState } from "react";
import "./Admin.css";
import { ADMIN_ROUTES, ADMIN_NAV_GROUPS, AdminRoute } from "../../routes/adminRoutes";
import { getAdminSocket } from "../../utils/adminSocket";
import { ExpertController } from "../../controllers/ExpertController";

interface AdminLayoutProps {
  currentRoute: AdminRoute;
  onNavigate: (route: AdminRoute) => void;
  onBackToHome: () => void;
  children: React.ReactNode;
}

export function AdminLayout({ currentRoute, onNavigate, onBackToHome, children }: AdminLayoutProps) {
  const [pendingCount, setPendingCount] = useState(0);
  const [newReportCount, setNewReportCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    // Fetch initial count
    ExpertController.getPendingExperts().then((experts) => {
      setPendingCount(experts.length);
    }).catch(() => {});

    // Connect socket
    const socket = getAdminSocket(token);
    
    const handleNewExpert = () => {
      setPendingCount((prev) => prev + 1);
    };

    const handleNewReport = () => {
      // Only increment if NOT already on moderation page
      setNewReportCount((prev) => prev + 1);
    };

    socket.on("admin:new-expert", handleNewExpert);
    socket.on("admin:new-report", handleNewReport);

    return () => {
      socket.off("admin:new-expert", handleNewExpert);
      socket.off("admin:new-report", handleNewReport);
    };
  }, []);

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

          {/* Navigation Links - grouped by use-case */}
          <nav className="admin-sidebar-menu">
            {ADMIN_NAV_GROUPS.map((group) => (
              <div key={group.id} className="admin-sidebar-group">
                <div className="admin-sidebar-group-label">
                  <i className={`bx ${group.icon}`}></i>
                  <span>{group.label}</span>
                </div>
                {group.routes.map((routePath) => {
                  const route = ADMIN_ROUTES.find((r) => r.path === routePath);
                  if (!route) return null;
                  const isActive = currentRoute === route.path;
                  const isExpertReview = route.path === "expert-review";
                  const isPriceRequest = route.path === "price-requests";
                  const isModeration = route.path === "moderation";
                  return (
                    <button
                      key={route.path}
                      className={`admin-menu-item ${isActive ? "active" : ""}`}
                      onClick={() => {
                        if (isModeration) setNewReportCount(0);
                        onNavigate(route.path);
                      }}
                      title={route.label}
                    >
                      <i className={`bx ${route.icon}`}></i>
                      <span>{route.label}</span>
                      {isExpertReview && pendingCount > 0 && (
                        <span className="admin-menu-badge red">{pendingCount}</span>
                      )}
                      {isPriceRequest && (
                        <span className="admin-menu-badge amber">3</span>
                      )}
                      {isModeration && newReportCount > 0 && (
                        <span className="admin-menu-badge red">{newReportCount}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
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
            {ADMIN_ROUTES.find(r => r.path === currentRoute)?.label || "Bảng điều khiển quản trị"}
          </h1>
          <div className="admin-top-actions">
            <button
              className="admin-bell-btn"
              onClick={() => onNavigate("expert-review" as AdminRoute)}
              title="Xét duyệt chuyên gia"
              style={{ position: "relative", background: "none", border: "none", cursor: "pointer", fontSize: "24px", color: "var(--ink-700)", marginRight: "16px" }}
            >
              <i className="bx bx-bell"></i>
              {pendingCount > 0 && (
                <span style={{ position: "absolute", top: "-4px", right: "-4px", background: "var(--error)", color: "white", fontSize: "10px", padding: "2px 6px", borderRadius: "10px", fontWeight: "bold" }}>
                  {pendingCount}
                </span>
              )}
            </button>
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
