import React, { useEffect, useState } from "react";
import "./Admin.css";
import { ADMIN_ROUTES, ADMIN_NAV_GROUPS, AdminRoute } from "../../routes/adminRoutes";
import { getAdminSocket } from "../../utils/adminSocket";
import { ExpertController } from "../../controllers/ExpertController";
import AdminNotificationDropdown, { AdminNotificationItem } from "./AdminNotificationDropdown";

interface AdminLayoutProps {
  currentRoute: AdminRoute;
  onNavigate: (route: AdminRoute) => void;
  onLogout?: () => void;
  onBackToHome?: () => void;
  children: React.ReactNode;
}

export function AdminLayout({ currentRoute, onNavigate, onLogout, onBackToHome, children }: AdminLayoutProps) {
  const [pendingCount, setPendingCount] = useState(0);
  const [newReportCount, setNewReportCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else if (onBackToHome) {
      onBackToHome();
    }
  };

  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([
    {
      id: "notif-1",
      type: "EXPERT_REVIEW",
      title: "Xét duyệt hồ sơ Chuyên gia",
      message: "BS. Nguyễn Văn An vừa nộp hồ sơ xin cấp phép hoạt động tư vấn.",
      timestamp: "5 phút trước",
      isRead: false,
      targetRoute: "expert-review",
      badgeText: "Xét duyệt",
      badgeTone: "teal",
      icon: "bx-user-check",
    },
    {
      id: "notif-2",
      type: "PRICE_REQUEST",
      title: "Yêu cầu điều chỉnh giá dịch vụ",
      message: "ThS. Lê Thị Mai gửi đề xuất cập nhật mức giá ca tư vấn 1:1.",
      timestamp: "32 phút trước",
      isRead: false,
      targetRoute: "price-requests",
      badgeText: "Đổi giá",
      badgeTone: "amber",
      icon: "bx-purchase-tag",
    },
    {
      id: "notif-3",
      type: "MODERATION",
      title: "Báo cáo vi phạm tiêu chuẩn",
      message: "Có 1 báo cáo mới từ người dùng về nội dung thảo luận diễn đàn.",
      timestamp: "2 giờ trước",
      isRead: false,
      targetRoute: "moderation",
      badgeText: "Báo cáo",
      badgeTone: "red",
      icon: "bx-shield-x",
    },
    {
      id: "notif-4",
      type: "COMMISSION",
      title: "Cập nhật chính sách hoa hồng",
      message: "Mức phí sàn ReMind hiện được duy trì ở 15% cho tất cả tư vấn.",
      timestamp: "Hôm qua",
      isRead: true,
      targetRoute: "commission",
      badgeText: "Hệ thống",
      badgeTone: "blue",
      icon: "bx-slider-alt",
    },
  ]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    // Fetch initial count
    ExpertController.getPendingExperts().then((experts) => {
      setPendingCount(experts.length);
      if (experts.length > 0) {
        setNotifications((prev) => [
          {
            id: `expert-pending-live-${Date.now()}`,
            type: "EXPERT_REVIEW",
            title: "Hồ sơ chuyên gia chờ duyệt",
            message: `Hiện có ${experts.length} chuyên gia đang chờ bạn xét duyệt.`,
            timestamp: "Vừa xong",
            isRead: false,
            targetRoute: "expert-review",
            badgeText: "Xét duyệt",
            badgeTone: "teal",
            icon: "bx-user-plus",
          },
          ...prev.filter((n) => !n.id.startsWith("expert-pending-live-")),
        ]);
      }
    }).catch(() => {});

    // Connect socket
    const socket = getAdminSocket(token);

    const handleNewExpert = (data?: any) => {
      setPendingCount((prev) => prev + 1);
      setNotifications((prev) => [
        {
          id: `new-expert-${Date.now()}`,
          type: "EXPERT_REVIEW",
          title: "Chuyên gia mới đăng ký!",
          message: data?.name ? `${data.name} vừa nộp hồ sơ xét duyệt.` : "Một chuyên gia vừa gửi yêu cầu xét duyệt hồ sơ.",
          timestamp: "Vừa xong",
          isRead: false,
          targetRoute: "expert-review",
          badgeText: "Xét duyệt",
          badgeTone: "teal",
          icon: "bx-user-plus",
        },
        ...prev,
      ]);
    };

    const handleNewReport = (data?: any) => {
      setNewReportCount((prev) => prev + 1);
      setNotifications((prev) => [
        {
          id: `new-report-${Date.now()}`,
          type: "MODERATION",
          title: "Báo cáo nội dung mới",
          message: data?.reason ? `Lý do: ${data.reason}` : "Có báo cáo mới cần kiểm duyệt trên hệ thống.",
          timestamp: "Vừa xong",
          isRead: false,
          targetRoute: "moderation",
          badgeText: "Báo cáo",
          badgeTone: "red",
          icon: "bx-error-circle",
        },
        ...prev,
      ]);
    };

    socket.on("admin:new-expert", handleNewExpert);
    socket.on("admin:new-report", handleNewReport);

    return () => {
      socket.off("admin:new-expert", handleNewExpert);
      socket.off("admin:new-report", handleNewReport);
    };
  }, []);

  const totalUnread = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setPendingCount(0);
    setNewReportCount(0);
  };

  const handleNotificationItemClick = (item: AdminNotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );
    if (item.targetRoute === "moderation") setNewReportCount(0);
    setIsNotifOpen(false);
    onNavigate(item.targetRoute);
  };

  return (
    <div className="admin-layout-container">
      {/* ===== SIDEBAR ===== */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          {/* Logo Brand */}
          <div className="admin-sidebar-logo">
            <div className="admin-logo-icon">R</div>
            <div className="flex flex-col">
              <span className="admin-logo-text">ReMind</span>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">MANAGEMENT</span>
            </div>
            <span className="admin-logo-badge">Admin</span>
          </div>

          {/* Navigation Links */}
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
                        <span className="admin-menu-badge red pulse">{pendingCount}</span>
                      )}
                      {isPriceRequest && (
                        <span className="admin-menu-badge red">3</span>
                      )}
                      {isModeration && newReportCount > 0 && (
                        <span className="admin-menu-badge red pulse">{newReportCount}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* User Card */}
        <div className="admin-sidebar-bottom">
          <div className="admin-user-card">
            <div className="relative">
              <div className="admin-user-avatar">AD</div>
              <span className="admin-user-online-dot" />
            </div>
            <div className="admin-user-info">
              <span className="admin-user-name">Admin Moderator</span>
              <span className="admin-user-role">Quản trị viên ReMind</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== WORKSPACE CONTENT AREA ===== */}
      <div className="admin-workspace">
        {/* Top Header Bar */}
        <header className="admin-top-bar">
          <div className="flex items-center gap-3">
            <h1 className="admin-page-title">
              {ADMIN_ROUTES.find((r) => r.path === currentRoute)?.label || "Bảng điều khiển quản trị"}
            </h1>
          </div>

          <div className="admin-top-actions">
            {/* Bell Dropdown Trigger */}
            <div className="admin-bell-wrapper">
              <button
                className={`admin-bell-btn ${isNotifOpen ? "active" : ""}`}
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                title="Thông báo hệ thống"
              >
                <i className="bx bx-bell"></i>
                {totalUnread > 0 && (
                  <span className="admin-bell-badge">
                    {totalUnread > 9 ? "9+" : totalUnread}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {isNotifOpen && (
                <AdminNotificationDropdown
                  onNavigate={onNavigate}
                  onClose={() => setIsNotifOpen(false)}
                  unreadCount={totalUnread}
                  onMarkAllAsRead={handleMarkAllAsRead}
                  notifications={notifications}
                  onItemClick={handleNotificationItemClick}
                />
              )}
            </div>

            <button
              onClick={handleLogout}
              className="rm-btn rm-btn-outline admin-logout-btn"
              title="Đăng xuất khỏi hệ thống"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "#dc2626",
                borderColor: "#fecaca",
                backgroundColor: "#fff1f2",
                fontWeight: 700,
                fontSize: "13px",
                padding: "8px 16px",
                borderRadius: "9999px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <i className="bx bx-log-out text-base"></i>
              <span>Đăng xuất</span>
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
