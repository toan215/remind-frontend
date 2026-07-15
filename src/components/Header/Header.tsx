import { useState, useEffect, useRef } from "react";
import "../Home/Home.css";
import { AuthController } from "../../controllers/AuthController";
import NotificationBell from "./NotificationBell";

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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      const user = AuthController.getCurrentUser();
      setCurrentUser(user);
    } else {
      setCurrentUser(null);
    }
  }, [userRole]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
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

          <NotificationBell userRole={userRole} onOpenLogin={onOpenLogin} />

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
