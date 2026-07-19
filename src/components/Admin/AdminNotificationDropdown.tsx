import { useState, useEffect, useRef } from "react";
import { AdminRoute } from "../../routes/adminRoutes";
import { getAdminSocket } from "../../utils/adminSocket";
import { ExpertController } from "../../controllers/ExpertController";

export interface AdminNotificationItem {
  id: string;
  type: "EXPERT_REVIEW" | "PRICE_REQUEST" | "MODERATION" | "COMMISSION" | "SYSTEM";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  targetRoute: AdminRoute;
  badgeText: string;
  badgeTone: "teal" | "amber" | "red" | "blue";
  icon: string;
}

interface AdminNotificationDropdownProps {
  onNavigate: (route: AdminRoute) => void;
  onClose: () => void;
  unreadCount: number;
  onMarkAllAsRead: () => void;
  notifications: AdminNotificationItem[];
  onItemClick: (item: AdminNotificationItem) => void;
}

export function AdminNotificationDropdown({
  onNavigate,
  onClose,
  unreadCount,
  onMarkAllAsRead,
  notifications,
  onItemClick,
}: AdminNotificationDropdownProps) {
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === "unread") return !item.isRead;
    return true;
  });

  return (
    <div className="admin-notif-dropdown-wrapper" ref={dropdownRef}>
      {/* Header */}
      <div className="admin-notif-header">
        <div className="admin-notif-title-row">
          <div className="flex items-center gap-2">
            <h4 className="admin-notif-title">Thông báo hệ thống</h4>
            {unreadCount > 0 && (
              <span className="admin-notif-count-pill">{unreadCount} mới</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              className="admin-notif-mark-btn"
              onClick={onMarkAllAsRead}
            >
              Đánh dấu đã đọc
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="admin-notif-tabs">
          <button
            className={`admin-notif-tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            Tất cả ({notifications.length})
          </button>
          <button
            className={`admin-notif-tab ${activeTab === "unread" ? "active" : ""}`}
            onClick={() => setActiveTab("unread")}
          >
            Chưa đọc ({unreadCount})
          </button>
        </div>
      </div>

      {/* List */}
      <div className="admin-notif-list">
        {filteredNotifications.length === 0 ? (
          <div className="admin-notif-empty">
            <div className="admin-notif-empty-icon">
              <i className="bx bx-bell-off"></i>
            </div>
            <p>Không có thông báo {activeTab === "unread" ? "chưa đọc" : ""} nào</p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              className={`admin-notif-item ${!item.isRead ? "unread" : ""}`}
              onClick={() => onItemClick(item)}
            >
              <div className={`admin-notif-icon-box ${item.badgeTone}`}>
                <i className={`bx ${item.icon}`}></i>
              </div>

              <div className="admin-notif-content">
                <div className="admin-notif-item-top">
                  <span className={`admin-notif-tag ${item.badgeTone}`}>
                    {item.badgeText}
                  </span>
                  <span className="admin-notif-time">{item.timestamp}</span>
                </div>
                <h5 className="admin-notif-item-title">{item.title}</h5>
                <p className="admin-notif-item-msg">{item.message}</p>
              </div>

              {!item.isRead && <span className="admin-notif-dot" />}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="admin-notif-footer">
        <button
          className="admin-notif-footer-btn"
          onClick={() => {
            onClose();
            onNavigate("dashboard");
          }}
        >
          <span>Xem tổng quan hệ thống</span>
          <i className="bx bx-right-arrow-alt"></i>
        </button>
      </div>
    </div>
  );
}

export default AdminNotificationDropdown;
