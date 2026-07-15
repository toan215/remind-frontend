import React, { useState, useEffect, useRef } from "react";
import { UserController } from "../../controllers/UserController";
import { AuthController, UserDto } from "../../controllers/AuthController";
import gsap from "gsap";
import "./Profile.css";

interface ProfileProps {
  onBack: () => void;
  onLogout: () => void;
  onProfileUpdate?: (updatedUser: UserDto) => void;
}

export default function Profile({ onBack, onLogout, onProfileUpdate }: ProfileProps) {
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "password">("info");
  
  // Profile fields state
  const [fullName, setFullName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);
  
  // Password fields state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const sidebarInfoRef = useRef<HTMLDivElement>(null);
  const tabsNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load current user profile from server for accuracy
    UserController.getProfile()
      .then((user) => {
        setCurrentUser(user);
        setFullName(user.fullName || "");
        setIsAnonymous(!!user.isAnonymous);
        setAvatarUrl(user.avatar || "");
        onProfileUpdate?.(user);
      })
      .catch((err) => {
        console.error("Lỗi khi tải Profile:", err);
        // Fallback to local storage if server is unreachable
        const localUser = AuthController.getCurrentUser();
        if (localUser) {
          setCurrentUser(localUser);
          setFullName(localUser.fullName || "");
          setIsAnonymous(!!localUser.isAnonymous);
          setAvatarUrl(localUser.avatar || "");
        }
      });

    // Staggered GSAP page entrance
    if (containerRef.current) {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      
      // Set initial values to prevent flash of content
      gsap.set(containerRef.current, { opacity: 1 });
      if (sidebarRef.current) gsap.set(sidebarRef.current, { opacity: 0, x: -30 });
      if (contentAreaRef.current) gsap.set(contentAreaRef.current, { opacity: 0, x: 30 });
      if (avatarRef.current) gsap.set(avatarRef.current, { opacity: 0, scale: 0.8 });
      if (sidebarInfoRef.current) gsap.set(sidebarInfoRef.current, { opacity: 0, y: 15 });
      if (tabsNavRef.current) gsap.set(tabsNavRef.current, { opacity: 0, y: 15 });

      tl.to([sidebarRef.current, contentAreaRef.current], {
        opacity: 1,
        x: 0,
        duration: 0.7,
        stagger: 0.15
      })
      .to(avatarRef.current, { opacity: 1, scale: 1, duration: 0.5 }, "-=0.3")
      .to(sidebarInfoRef.current, { opacity: 1, y: 0, duration: 0.4 }, "-=0.3")
      .to(tabsNavRef.current, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2");
    }
  }, []);

  // Animate tab card transition on activeTab changes
  useEffect(() => {
    if (contentAreaRef.current) {
      const activeCard = contentAreaRef.current.querySelector(".profile-card");
      if (activeCard) {
        gsap.fromTo(
          activeCard,
          { opacity: 0, y: 15, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power3.out" }
        );
      }
    }
  }, [activeTab]);

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingInfo(true);
    try {
      const updatedUser = await UserController.updateProfile(fullName, isAnonymous);
      setCurrentUser(updatedUser);
      onProfileUpdate?.(updatedUser);
      alert("Cập nhật thông tin thành công!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdatingInfo(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không trùng khớp");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải dài ít nhất 6 ký tự");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await UserController.changePassword(currentPassword, newPassword);
      setPasswordSuccess("Thay đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    // Simple file validation
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, JPEG)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước file tối đa là 5MB");
      return;
    }

    try {
      const newUrl = await UserController.uploadAvatar(file);
      setAvatarUrl(newUrl);
      if (currentUser) {
        const updatedUser = { ...currentUser, avatar: newUrl };
        setCurrentUser(updatedUser);
        onProfileUpdate?.(updatedUser);
      }
      alert("Tải lên ảnh đại diện thành công!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "student":
        return "Sinh viên / Người dùng";
      case "expert":
        return "Chuyên gia tâm lý";
      case "admin":
        return "Quản trị viên";
      case "system_manager":
        return "Quản lý hệ thống";
      default:
        return "Thành viên";
    }
  };

  return (
    <div className="profile-page" ref={containerRef}>
      <div className="profile-container">
        <div className="profile-main-layout">
          {/* Left Panel: Avatar & Basic Details */}
          <div className="profile-sidebar" ref={sidebarRef}>
            <div className="profile-avatar-wrapper" ref={avatarRef}>
              <div className="profile-avatar-container" onClick={triggerFileInput}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="profile-avatar-img" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgba(255, 255, 255, 0.75)" style={{ width: "70%", height: "70%", display: "block" }}>
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                )}
                <div className="profile-avatar-overlay" title="Tải lên ảnh mới">
                  <i className="bx bx-camera"></i>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleFileChange}
              />
              <p className="profile-avatar-help">Nhấp vào ảnh để thay đổi</p>
            </div>

            <div className="profile-sidebar-info" ref={sidebarInfoRef}>
              <h2>{fullName || "Người dùng ReMind"}</h2>
              <p className="profile-email-label">{currentUser?.email}</p>
              
              <div className="profile-badge-group">
                <span className={`profile-badge role-${currentUser?.role || "student"}`}>
                  {getRoleLabel(currentUser?.role)}
                </span>
                <span className={`profile-badge status-${currentUser?.status || "active"}`}>
                  Active
                </span>
              </div>
            </div>

            {/* Sidebar Navigation Tabs */}
            <div className="profile-tabs-nav" ref={tabsNavRef}>
              <button
                className={`profile-tab-btn ${activeTab === "info" ? "active" : ""}`}
                onClick={() => setActiveTab("info")}
              >
                <i className="bx bx-user-circle"></i>
                Thông tin cá nhân
              </button>
              <button
                className={`profile-tab-btn ${activeTab === "password" ? "active" : ""}`}
                onClick={() => setActiveTab("password")}
              >
                <i className="bx bx-key"></i>
                Bảo mật & Mật khẩu
              </button>
            </div>
          </div>

          {/* Right Panel: Tab Content */}
          <div className="profile-content-area" ref={contentAreaRef}>
            {activeTab === "info" && (
              <div className="profile-card">
                <h3 className="profile-card-title">Cập nhật hồ sơ</h3>
                <form onSubmit={handleUpdateInfo} className="profile-form">
                  <div className="profile-form-group">
                    <label htmlFor="profile-fullName">Họ và tên</label>
                    <div className="profile-input-wrapper">
                      <i className="bx bx-user"></i>
                      <input
                        type="text"
                        id="profile-fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nhập họ và tên của bạn"
                        required
                      />
                    </div>
                  </div>

                  <div className="profile-form-group">
                    <label>Địa chỉ Email</label>
                    <div className="profile-input-wrapper disabled">
                      <i className="bx bx-envelope"></i>
                      <input
                        type="email"
                        value={currentUser?.email || ""}
                        disabled
                        placeholder="email@example.com"
                      />
                    </div>
                    <span className="profile-input-hint">Email tài khoản không thể thay đổi.</span>
                  </div>

                  {/* Anonymous Mode Option */}
                  <div className="profile-anonymous-box">
                    <div className="profile-anon-desc">
                      <h4>
                        <i className="bx bx-ghost"></i> Chế độ ẩn danh
                      </h4>
                      <p>
                        Khi kích hoạt, các bài đăng hoặc bình luận của bạn trên Góc tâm sự (Diễn đàn) 
                        sẽ được ẩn danh (hiển thị dưới dạng "Người dùng ẩn danh") để bảo vệ quyền riêng tư tuyệt đối của bạn.
                      </p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className={`profile-submit-btn ${isUpdatingInfo ? "loading" : ""}`}
                    disabled={isUpdatingInfo}
                  >
                    {isUpdatingInfo ? (
                      <span className="profile-spinner"></span>
                    ) : (
                      <>
                        <span>Lưu thay đổi</span>
                        <i className="bx bx-check-circle"></i>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {activeTab === "password" && (
              <div className="profile-card">
                <h3 className="profile-card-title">Đổi mật khẩu</h3>
                
                {passwordError && (
                  <div className="profile-alert alert-error">
                    <i className="bx bx-error-circle"></i>
                    <span>{passwordError}</span>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="profile-alert alert-success">
                    <i className="bx bx-check-circle"></i>
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="profile-form">
                  <div className="profile-form-group">
                    <label htmlFor="current-password">Mật khẩu hiện tại</label>
                    <div className="profile-input-wrapper">
                      <i className="bx bx-lock-alt"></i>
                      <input
                        type="password"
                        id="current-password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Nhập mật khẩu hiện tại"
                        required
                      />
                    </div>
                  </div>

                  <div className="profile-form-group">
                    <label htmlFor="new-password">Mật khẩu mới</label>
                    <div className="profile-input-wrapper">
                      <i className="bx bx-lock-open-alt"></i>
                      <input
                        type="password"
                        id="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                        required
                      />
                    </div>
                  </div>

                  <div className="profile-form-group">
                    <label htmlFor="confirm-password">Xác nhận mật khẩu mới</label>
                    <div className="profile-input-wrapper">
                      <i className="bx bx-lock-alt"></i>
                      <input
                        type="password"
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Xác nhận lại mật khẩu mới"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`profile-submit-btn ${isUpdatingPassword ? "loading" : ""}`}
                    disabled={isUpdatingPassword}
                  >
                    {isUpdatingPassword ? (
                      <span className="profile-spinner"></span>
                    ) : (
                      <>
                        <span>Cập nhật mật khẩu</span>
                        <i className="bx bx-key"></i>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
