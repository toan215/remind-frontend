import { useState } from "react";
import Register from "../Register/Register";
import { AuthController } from "../../controllers/AuthController";
import "./Login.css";

interface LoginProps {
  onLoginSuccess: (role: "user" | "admin") => void;
  onBack?: () => void;
}

function Login({ onLoginSuccess, onBack }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});

  const validateLogin = () => {
    const errors: Record<string, string> = {};
    if (!loginData.username.trim()) errors.username = "Email or Username is required";
    if (!loginData.password.trim()) errors.password = "Password is required";
    else if (loginData.password.length < 6)
      errors.password = "Password must be at least 6 characters";
    return errors;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateLogin();
    setLoginErrors(errors);
    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      try {
        const response = await AuthController.login(loginData.username, loginData.password);
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
          style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 1000, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow)', color: 'var(--ink-700)' }}
          title="Quay lại"
        >
          <i className="bx bx-arrow-back" style={{ fontSize: '20px' }}></i>
        </button>
      )}

      <div className={`login-container ${isSignUp ? "active" : ""}`}>
        {/* ===== LOGIN FORM (right side by default) ===== */}
        <div className="form-panel login-form-panel">
          <div className="login-form-box">
            <form onSubmit={handleLoginSubmit} id="login-form">
              <h1>Welcome Back</h1>
              <p className="login-subtitle">
                Sign in to your account to continue
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
                className={`login-input-box ${loginErrors.username ? "error" : ""}`}
              >
                <input
                  type="text"
                  id="login-username"
                  placeholder="Username"
                  value={loginData.username}
                  onChange={(e) => {
                    setLoginData({ ...loginData, username: e.target.value });
                    if (loginErrors.username)
                      setLoginErrors({ ...loginErrors, username: "" });
                  }}
                />
                <i className="bx bx-user"></i>
                {loginErrors.username && (
                  <span className="login-error-msg">
                    {loginErrors.username}
                  </span>
                )}
              </div>

              <div
                className={`login-input-box ${loginErrors.password ? "error" : ""}`}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-password"
                  placeholder="Password"
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
                  title={showPassword ? "Hide password" : "Show password"}
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
                  Remember me
                </label>
                <a
                  href="#"
                  className="login-forgot-link"
                  id="forgot-password-link"
                >
                  Forgot Password?
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
                    Login
                    <i className="bx bx-log-in-circle"></i>
                  </>
                )}
              </button>

              <div className="login-divider">
                <span>or login with</span>
              </div>

              <div className="login-social-icons">
                <a
                  href="#"
                  className="login-social-btn"
                  id="login-google"
                  title="Login with Google"
                >
                  <i className="bx bxl-google"></i>
                </a>
                <a
                  href="#"
                  className="login-social-btn"
                  id="login-facebook"
                  title="Login with Facebook"
                >
                  <i className="bx bxl-facebook"></i>
                </a>
                <a
                  href="#"
                  className="login-social-btn"
                  id="login-tiktok"
                  title="Login with TikTok"
                >
                  <i className="bx bxl-tiktok"></i>
                </a>
                <a
                  href="#"
                  className="login-social-btn"
                  id="login-github"
                  title="Login with GitHub"
                >
                  <i className="bx bxl-github"></i>
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
            <h2>Remind AI</h2>
            <p className="overlay-tagline">Mental health assistant</p>

            {/* Content shown when on Login page (panel is on the left) */}
            <div className="overlay-login-content">
              <p className="overlay-question">Don't have an account?</p>
              <button
                type="button"
                className="overlay-btn"
                id="switch-to-signup"
                onClick={switchToSignUp}
              >
                Sign Up
                <i className="bx bx-right-arrow-alt"></i>
              </button>
            </div>

            {/* Content shown when on Register page (panel is on the right) */}
            <div className="overlay-register-content">
              <p className="overlay-question">Already have an account?</p>
              <button
                type="button"
                className="overlay-btn"
                id="switch-to-login"
                onClick={switchToLogin}
              >
                <i className="bx bx-left-arrow-alt"></i>
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
