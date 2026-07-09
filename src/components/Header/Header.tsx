import { useState, useEffect, useRef } from "react";
import "../Home/Home.css";

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
  const [unreadCount, setUnreadCount] = useState(1);
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
                <div className="notif-header">
                  <h4>Thông báo</h4>
                </div>
                <div className="notif-list">
                  <div className="notif-item">
                    <div className="notif-icon like-icon">
                      <i className="bx bxs-heart"></i>
                    </div>
                    <div className="notif-content">
                      <p>
                        <strong>Admin</strong> đã thích bài viết của bạn
                      </p>
                      <span>Vừa xong</span>
                    </div>
                  </div>
                  <div className="notif-item">
                    <div className="notif-icon comment-icon">
                      <i className="bx bxs-comment-detail"></i>
                    </div>
                    <div className="notif-content">
                      <p>
                        <strong>Chuyên gia</strong> đã trả lời bình luận của
                        bạn
                      </p>
                      <span>2 giờ trước</span>
                    </div>
                  </div>
                  <div className="notif-item">
                    <div className="notif-icon check-icon">
                      <i className="bx bx-check-circle"></i>
                    </div>
                    <div className="notif-content">
                      <p>
                        Bài viết của bạn đã được <strong>phê duyệt</strong>
                      </p>
                      <span>1 ngày trước</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

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
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=PhucHoang"
                    alt="Avatar"
                  />
                </div>
                <div className="user-pill-info">
                  <span className="user-pill-name">
                    {userRole === "admin" ? "Quản trị viên" : "Phuc Hoang"}
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
