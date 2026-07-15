import { useState, useEffect, useRef } from "react";
import { NotificationController, INotification } from "../../controllers/NotificationController";

interface NotificationBellProps {
  userRole: string;
  onOpenLogin: () => void;
}

export default function NotificationBell({ userRole, onOpenLogin }: NotificationBellProps) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userRole !== "guest") {
      NotificationController.getList()
        .then((data) => {
          setNotifications(data);
          setUnreadCount(data.filter((n) => !n.isRead).length);
        })
        .catch(console.error);
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setIsNotifOpen(false);
    }
  }, [userRole]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif: INotification) => {
    if (!notif.isRead) {
      try {
        await NotificationController.markAsRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error(err);
      }
    }
    // TODO: Navigation based on referenceId if needed
  };

  const markAllAsRead = async () => {
    try {
      await NotificationController.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="auth-pill-dropdown-container" ref={notifRef}>
      <div
        className="auth-pill bell-pill"
        onClick={() => {
          setIsNotifOpen(!isNotifOpen);
          if (!isNotifOpen && userRole !== "guest") setUnreadCount(0);
        }}
      >
        <i className="bx bx-bell"></i>
        {userRole !== "guest" && unreadCount > 0 && (
          <span className="bell-badge">{unreadCount}</span>
        )}
      </div>

      {isNotifOpen && (
        <div className="auth-dropdown-menu notif-dropdown">
          <div className="notif-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4>Thông báo</h4>
            {userRole !== "guest" && unreadCount > 0 && (
              <span 
                style={{ fontSize: '0.8rem', color: 'var(--brand-600)', cursor: 'pointer' }}
                onClick={markAllAsRead}
              >
                Đánh dấu đã đọc tất cả
              </span>
            )}
          </div>
          <div className="notif-list">
            {userRole === "guest" ? (
              <div className="notif-item" style={{ justifyContent: 'center', color: '#666', flexDirection: 'column', padding: '20px', gap: '10px' }}>
                <p style={{ margin: 0, textAlign: 'center' }}>Vui lòng đăng nhập để xem thông báo</p>
                <button 
                  style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '13px', backgroundColor: 'var(--brand-600)', color: 'white', border: 'none', cursor: 'pointer' }}
                  onClick={() => {
                    setIsNotifOpen(false);
                    onOpenLogin();
                  }}
                >
                  Đăng nhập ngay
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notif-item" style={{ justifyContent: 'center', color: '#666' }}>
                Không có thông báo nào
              </div>
            ) : (
              notifications.map((notif) => {
                let iconClass = "bx-info-circle";
                let iconColorClass = "";
                
                if (notif.type === "LIKE_POST") {
                  iconClass = "bxs-heart";
                  iconColorClass = "like-icon";
                } else if (notif.type === "COMMENT_POST" || notif.type === "REPLY_COMMENT") {
                  iconClass = "bxs-comment-detail";
                  iconColorClass = "comment-icon";
                } else if (notif.type === "POST_APPROVED") {
                  iconClass = "bx-check-circle";
                  iconColorClass = "check-icon";
                }

                // Fallback text if content is empty
                const text = notif.content || "Bạn có một thông báo mới";
                
                return (
                  <div 
                    key={notif._id} 
                    className={`notif-item ${!notif.isRead ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notif)}
                    style={{ cursor: 'pointer', opacity: notif.isRead ? 0.7 : 1, backgroundColor: notif.isRead ? 'transparent' : '#f0fdf4' }}
                  >
                    <div className={`notif-icon ${iconColorClass}`}>
                      <i className={`bx ${iconClass}`}></i>
                    </div>
                    <div className="notif-content">
                      <p dangerouslySetInnerHTML={{ __html: text }}></p>
                      <span>{new Date(notif.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
