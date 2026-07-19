import { useState, useEffect, useRef } from "react";
import "../Home/Home.css";
import { AuthController, UserDto } from "../../controllers/AuthController";
import NotificationBell from "./NotificationBell";
import gsap from "gsap";
import {
  NotificationController,
  INotification,
} from "../../controllers/NotificationController";

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
  onGoToLogin?: () => void;
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
  onGoToLogin,
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

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
        ease: "power2.out",
      });
    } else {
      gsap.to(headerRef.current, {
        backgroundColor: "rgba(255, 255, 255, 0)",
        backdropFilter: "blur(0px)",
        webkitBackdropFilter: "blur(0px)",
        borderBottomColor: "rgba(0, 0, 0, 0)",
        boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)",
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, [isScrolled]);

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
      className={`home-header ${isScrolled ? "scrolled" : ""}`}
      id="home-header"
      ref={headerRef}
    >
      <div className="home-header-inner">
        <div
          className="home-logo"
          onClick={() => onNavigate("home")}
          style={{ cursor: "pointer" }}
        >
          <div className="home-logo-icon">R</div>
          <span className="home-logo-text">ReMind</span>
        </div>
        <nav className="home-nav" id="home-nav">
          <a
            href="#about"
            className={`home-nav-link ${currentScreen === "about" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate("about");
            }}
          >
            Về chúng tôi
          </a>
          <a
            href="#ai-companion"
            className={`home-nav-link ${currentScreen === "aichat" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              if (userRole === "guest") onOpenLogin();
              else onNavigate("aichat");
            }}
          >
            AI Chat
          </a>
          <a
            href="#clinic"
            className={`home-nav-link ${currentScreen === "expert" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate("expert");
            }}
          >
            Chuyên gia
          </a>
          <a
            href="#forum"
            className={`home-nav-link ${currentScreen === "forum" ? "active" : ""}`}
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
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt="Avatar" />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="#a0aec0"
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "block",
                        background: "#edf2f7",
                        borderRadius: "50%",
                      }}
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  )}
                </div>
                <div className="user-pill-info">
                  <span className="user-pill-name">
                    {userRole === "admin"
                      ? "Quản trị viên"
                      : currentUser?.fullName ||
                        AuthController.getCurrentUser()?.fullName ||
                        "Người dùng"}
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
                        if (onGoToLogin) onGoToLogin();
                        else onNavigate("login");
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
