import { useState, useEffect, useRef } from "react";
import "../Home/Home.css";
import { AuthController } from "../../controllers/AuthController";
import { NotificationController, INotification } from "../../controllers/NotificationController";

interface HeaderProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onLogout: () => void;
  userRole: string;
  onOpenAdminPortal: () => void;
  onOpenChat: () => void;
}

export default function Header({
  currentScreen,
  onNavigate,
  onOpenLogin,
  onOpenRegister,
  onLogout,
  userRole,
  onOpenAdminPortal,
  onOpenChat,
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (userRole !== "guest") {
      NotificationController.getList()
        .then((data) => {
          setNotifications(data);
          setUnreadCount(data.filter((n) => !n.isRead).length);
        })
        .catch(console.error);
    }
  }, [userRole]);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
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

  return (
    <header
      className={`home-header ${isScrolled || currentScreen !== 'home' ? "scrolled" : ""}`}
      id="home-header"
    >
      <div className="home-header-inner">
        <div className="home-logo" onClick={() => onNavigate("home")} style={{cursor: 'pointer'}}>
          <div className="home-logo-icon">R</div>
          <span className="home-logo-text">ReMind</span>
        </div>
        <nav className="home-nav" id="home-nav">
          <a href="#about" className={`home-nav-link ${currentScreen === 'about' ? 'active' : ''}`} onClick={(e) => {
              e.preventDefault();
              onNavigate("about");
            }}>
            Về chúng tôi
          </a>
          <a href="#ai-companion" className={`home-nav-link ${currentScreen === 'aichat' ? 'active' : ''}`} onClick={(e) => {
              e.preventDefault();
              if (userRole === "guest") onOpenLogin();
              else onNavigate("aichat");
            }}>
            AI Companion
          </a>
          <a
            href="#clinic"
            className={`home-nav-link ${currentScreen === 'expert' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate("expert");
            }}
          >
            Phòng khám ẩn danh
          </a>
          <a
            href="#forum"
            className={`home-nav-link ${currentScreen === 'forum' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate("forum");
            }}
          >
            Góc tâm sự
          </a>
          {userRole === "admin" && (
            <a
              href="#admin"
              className="home-nav-link"
              onClick={(e) => {
                e.preventDefault();
                onOpenAdminPortal();
              }}
              style={{ color: "var(--brand-700)", fontWeight: "600" }}
            >
              Quản trị <i className="bx bx-wrench"></i>
            </a>
          )}
        </nav>

        <div className="home-auth-pills">
          {/* Chat Pill */}
          <div
            className="auth-pill bell-pill"
            onClick={onOpenChat}
            title="Tin nhắn"
          >
            <i className="bx bx-message-rounded-dots"></i>
          </div>

          {userRole !== "guest" && (
            <div className="auth-pill-dropdown-container" ref={notifRef}>
              <div
                className="auth-pill bell-pill"
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  if (!isNotifOpen) setUnreadCount(0);
                }}
              >
                <i className="bx bx-bell"></i>
                {unreadCount > 0 && (
                  <span className="bell-badge">{unreadCount}</span>
                )}
              </div>

              {isNotifOpen && (
                <div className="auth-dropdown-menu notif-dropdown">
                  <div className="notif-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4>Thông báo</h4>
                    {unreadCount > 0 && (
                      <span 
                        style={{ fontSize: '0.8rem', color: 'var(--brand-600)', cursor: 'pointer' }}
                        onClick={markAllAsRead}
                      >
                        Đánh dấu đã đọc tất cả
                      </span>
                    )}
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 ? (
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
          )}

          <div className="auth-pill-dropdown-container" ref={dropdownRef}>
            {userRole === "guest" ? (
              <div
                className="auth-pill user-pill guest-pill"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="user-pill-avatar">
                  <i className="bx bx-user"></i>
                </div>
                <div className="user-pill-info">
                  <span className="user-pill-name">Khách</span>
                  <span className="user-pill-status">KHÁCH</span>
                </div>
                <i className="bx bx-chevron-down"></i>
              </div>
            ) : (
              <div
                className="auth-pill user-pill logged-pill"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="user-pill-avatar">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${AuthController.getCurrentUser()?.fullName || "User"}`}
                    alt="Avatar"
                  />
                </div>
                <div className="user-pill-info">
                  <span className="user-pill-name">
                    {userRole === "admin" ? "Quản trị viên" : (AuthController.getCurrentUser()?.fullName || "Người dùng")}
                  </span>
                  <span className="user-pill-status active-status">
                    <span className="status-dot"></span> ONLINE
                  </span>
                </div>
              </div>
            )}

            {isDropdownOpen && (
              <div className="auth-dropdown-menu">
                {userRole === "guest" ? (
                  <>
                    <button
                      className="auth-dropdown-item"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenLogin();
                      }}
                    >
                      <div className="dropdown-item-icon login-icon">
                        <i className="bx bx-log-in"></i>
                      </div>
                      <span>Đăng nhập tài khoản</span>
                    </button>
                    <button
                      className="auth-dropdown-item"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenRegister();
                      }}
                    >
                      <div className="dropdown-item-icon register-icon">
                        <i className="bx bx-user-plus"></i>
                      </div>
                      <span>Tạo tài khoản mới</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="auth-dropdown-item"
                      onClick={() => {
                        setIsDropdownOpen(false);
                      }}
                    >
                      <div className="dropdown-item-icon setting-icon">
                        <i className="bx bx-cog"></i>
                      </div>
                      <span>Cài đặt tài khoản</span>
                    </button>
                    <button
                      className="auth-dropdown-item"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onLogout();
                      }}
                    >
                      <div className="dropdown-item-icon logout-icon">
                        <i className="bx bx-log-out"></i>
                      </div>
                      <span>Đăng xuất</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
