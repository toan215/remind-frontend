import { useState } from "react";
import Register from "../Register/Register";
import { AuthController } from "../../controllers/AuthController";
import { useGoogleLogin } from '@react-oauth/google';
import "./Login.css";

interface LoginProps {
  onLoginSuccess: (role: "user" | "admin") => void;
  onBack?: () => void;
  initialMode?: "login" | "register";
}

function Login({ onLoginSuccess, onBack, initialMode = "login" }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(initialMode === "register");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Khởi tạo hook Google Login
  const loginWithGoogle = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log("Đăng nhập Google thành công, Token:", tokenResponse.access_token);
      alert("Đăng nhập Google thành công!\n(Xem token trong Console F12)\nTiếp theo bạn cần gửi token này xuống backend.");
      // TODO: Call API gửi tokenResponse.access_token xuống backend ở đây
    },
    onError: () => {
      console.error("Đăng nhập Google thất bại");
      alert("Đăng nhập Google thất bại!");
    }
  });

  // Login form state
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});

  const validateLogin = () => {
    const errors: Record<string, string> = {};
    if (!loginData.email.trim()) errors.email = "Email không được để trống";
    if (!loginData.password.trim()) errors.password = "Mật khẩu không được để trống";
    else if (loginData.password.length < 6)
      errors.password = "Mật khẩu phải dài ít nhất 6 ký tự";
    return errors;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateLogin();
    setLoginErrors(errors);
    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      try {
        const response = await AuthController.login(loginData.email, loginData.password);
        setIsLoading(false);
        if (onLoginSuccess) {
          const role =
            response.user.role === "admin" || response.user.role === "system_manager"
              ? "admin"
              : "user";
          onLoginSuccess(role);
        }
      } catch (err: any) {
        setIsLoading(false);
        setLoginErrors({ global: err.message });
      }
    }
  };

  const handleRegisterSubmit = async (data: any, resetForm: () => void) => {
    setIsLoading(true);
    try {
      await AuthController.register(data.fullname, data.email, data.password, "student");
      setIsLoading(false);
      alert(`Đăng ký thành công!\nChào mừng, ${data.fullname}!`);
      resetForm();
      setIsSignUp(false);
    } catch (err: any) {
      setIsLoading(false);
      alert(err.message);
    }
  };

  const switchToSignUp = () => {
    setIsSignUp(true);
    setLoginErrors({});
  };

  const switchToLogin = () => {
    setIsSignUp(false);
  };

  return (
    <div className="login-page">
      {/* Animated background elements */}
      <div className="login-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      {onBack && (
        <button 
          onClick={onBack}
          className="back-button-expandable"
        >
          <i className="bx bx-arrow-back"></i>
          <span className="back-text">Quay lại</span>
        </button>
      )}

      <div className={`login-container ${isSignUp ? "active" : ""}`}>
        {/* ===== LOGIN FORM (right side by default) ===== */}
        <div className="form-panel login-form-panel">
          <div className="login-form-box">
            <form onSubmit={handleLoginSubmit} id="login-form">
              <h1>Chào mừng trở lại</h1>
              <p className="login-subtitle">
                Đăng nhập vào tài khoản của bạn để tiếp tục
              </p>

              {loginErrors.global && (
                <div 
                  className="login-error-global" 
                  style={{ 
                    color: "var(--red, #ef4444)", 
                    marginBottom: "15px", 
                    textAlign: "center", 
                    fontSize: "14px",
                    padding: "8px",
                    background: "rgba(239, 68, 68, 0.1)",
                    borderRadius: "6px",
                    border: "1px solid rgba(239, 68, 68, 0.2)"
                  }}
                >
                  {loginErrors.global}
                </div>
              )}

              <div
                className={`login-input-box ${loginErrors.email ? "error" : ""}`}
              >
                <input
                  type="email"
                  id="login-email"
                  placeholder="Email"
                  value={loginData.email}
                  onChange={(e) => {
                    setLoginData({ ...loginData, email: e.target.value });
                    if (loginErrors.email)
                      setLoginErrors({ ...loginErrors, email: "" });
                  }}
                />
                <i className="bx bx-envelope"></i>
                {loginErrors.email && (
                  <span className="login-error-msg">
                    {loginErrors.email}
                  </span>
                )}
              </div>

              <div
                className={`login-input-box ${loginErrors.password ? "error" : ""}`}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-password"
                  placeholder="Mật khẩu"
                  value={loginData.password}
                  onChange={(e) => {
                    setLoginData({ ...loginData, password: e.target.value });
                    if (loginErrors.password)
                      setLoginErrors({ ...loginErrors, password: "" });
                  }}
                />
                <i
                  className={`bx ${showPassword ? "bx-show" : "bx-hide"}`}
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: "pointer" }}
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                ></i>
                {loginErrors.password && (
                  <span className="login-error-msg">
                    {loginErrors.password}
                  </span>
                )}
              </div>

              <div className="login-options">
                <label className="login-remember" htmlFor="remember-me">
                  <input type="checkbox" id="remember-me" />
                  <span className="checkmark"></span>
                  Ghi nhớ đăng nhập
                </label>
                <a
                  href="#"
                  className="login-forgot-link"
                  id="forgot-password-link"
                >
                  Quên mật khẩu?
                </a>
              </div>

              <button
                type="submit"
                className={`login-btn ${isLoading && !isSignUp ? "loading" : ""}`}
                id="login-submit-btn"
                disabled={isLoading && !isSignUp}
              >
                {isLoading && !isSignUp ? (
                  <span className="login-spinner"></span>
                ) : (
                  <>
                    <span>Đăng nhập</span>
                    <i className="bx bx-log-in-circle"></i>
                  </>
                )}
              </button>

              <div className="login-divider">
                <span>hoặc đăng nhập với</span>
              </div>

              <div className="login-social-icons">
                <a
                  href="#"
                  className="login-social-btn"
                  id="login-google"
                  title="Đăng nhập bằng Google"
                  onClick={(e) => { e.preventDefault(); loginWithGoogle(); }}
                >
                  <i className="bx bxl-google"></i>
                  <span>Đăng nhập bằng Google</span>
                </a>
              </div>
            </form>
          </div>
        </div>

        {/* ===== REGISTER FORM (left side when active) ===== */}
        <div className="form-panel register-form-panel">
          <Register
            isLoading={isLoading && isSignUp}
            onSubmit={handleRegisterSubmit}
          />
        </div>

        {/* ===== SLIDING OVERLAY PANEL ===== */}
        <div className="overlay-panel">
          <div className="overlay-content">
            <div className="login-brand-icon">
              <i className="bx bx-code-alt"></i>
            </div>
            <h2>ReMind AI</h2>
            <p className="overlay-tagline">Nền tảng hỗ trợ tâm lý</p>

            {/* Content shown when on Login page (panel is on the left) */}
            <div className="overlay-login-content">
              <p className="overlay-question">Chưa có tài khoản?</p>
              <button
                type="button"
                className="overlay-btn"
                id="switch-to-signup"
                onClick={switchToSignUp}
              >
                <span>Đăng ký</span>
                <i className="bx bx-right-arrow-alt"></i>
              </button>
            </div>

            {/* Content shown when on Register page (panel is on the right) */}
            <div className="overlay-register-content">
              <p className="overlay-question">Đã có tài khoản?</p>
              <button
                type="button"
                className="overlay-btn"
                id="switch-to-login"
                onClick={switchToLogin}
              >
                <i className="bx bx-left-arrow-alt"></i>
                <span>Đăng nhập</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
