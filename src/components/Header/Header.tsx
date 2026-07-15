import { useState, useEffect, useRef } from "react";
import "../Home/Home.css";
import { AuthController, UserDto } from "../../controllers/AuthController";
import { NotificationController, INotification } from "../../controllers/NotificationController";
import gsap from "gsap";

interface HeaderProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onLogout: () => void;
  userRole: string;
  onOpenAdminPortal: () => void;
  onOpenChat: () => void;
  currentUser?: UserDto | null;
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
  currentUser,
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

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
    if (!headerRef.current) return;
    if (isScrolled) {
      gsap.to(headerRef.current, {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(12px)",
        webkitBackdropFilter: "blur(12px)",
        borderBottomColor: "var(--border)",
        boxShadow: "0px 1px 8px rgba(23, 107, 104, 0.06)",
        duration: 0.3,
        ease: "power2.out"
      });
    } else {
      gsap.to(headerRef.current, {
        backgroundColor: "rgba(255, 255, 255, 0)",
        backdropFilter: "blur(0px)",
        webkitBackdropFilter: "blur(0px)",
        borderBottomColor: "rgba(0, 0, 0, 0)",
        boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)",
        duration: 0.3,
        ease: "power2.out"
      });
    }
  }, [isScrolled]);

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
      className={`home-header ${isScrolled ? "scrolled" : ""}`}
      id="home-header"
      ref={headerRef}
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
            Chuyên gia
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
                  {currentUser?.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt="Avatar"
                    />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#a0aec0" style={{ width: "100%", height: "100%", display: "block", background: "#edf2f7", borderRadius: "50%" }}>
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  )}
                </div>
                <div className="user-pill-info">
                  <span className="user-pill-name">
                    {userRole === "admin" ? "Quản trị viên" : (currentUser?.fullName || AuthController.getCurrentUser()?.fullName || "Người dùng")}
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
                        onNavigate("settings");
                      }}
                    >
                      <div className="dropdown-item-icon setting-icon">
                        <i className="bx bx-cog"></i>
                      </div>
                      <span>Cài đặt tài khoản</span>
                    </button>
                    {currentUser?.role === "expert" && (
                      <button
                        className="auth-dropdown-item"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onNavigate("calendar");
                        }}
                      >
                        <div className="dropdown-item-icon calendar-icon">
                          <i className="bx bx-calendar"></i>
                        </div>
                        <span>Lịch hẹn của tôi</span>
                      </button>
                    )}
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
