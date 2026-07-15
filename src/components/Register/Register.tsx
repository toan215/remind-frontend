import { useState, useRef, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { AuthController } from '../../controllers/AuthController';
import gsap from 'gsap';
import './Register.css';

interface RegisterProps {
  isLoading: boolean;
  onSubmit: (data: any, resetForm: () => void) => void;
  onLoginSuccess?: (role: 'user' | 'admin') => void;
}

function Register({ isLoading, onSubmit, onLoginSuccess }: RegisterProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'student' | 'expert'>('student');
  const [registerData, setRegisterData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const studentRef = useRef<HTMLButtonElement>(null);
  const expertRef = useRef<HTMLButtonElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeEl = role === 'student' ? studentRef.current : expertRef.current;
    if (activeEl && indicatorRef.current && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      const left = activeRect.left - containerRect.left;
      const width = activeRect.width;

      gsap.to(indicatorRef.current, {
        left: left,
        width: width,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  }, [role]);

  const registerWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const result = await AuthController.googleLogin(tokenResponse.access_token);
        if (onLoginSuccess) {
          const role =
            result.user.role === 'admin' || result.user.role === 'system_manager'
              ? 'admin'
              : 'user';
          onLoginSuccess(role);
        }
      } catch (err: any) {
        alert(err.message);
      }
    },
    onError: () => {
      alert('Đăng ký Google thất bại');
    }
  });
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!registerData.fullname.trim()) newErrors.fullname = 'Full name is required';
    if (!registerData.email.trim()) newErrors.email = 'Email không được để trống';
    else if (!/\S+@\S+\.\S+/.test(registerData.email))
      newErrors.email = 'Email không hợp lệ';
    if (!registerData.password.trim()) newErrors.password = 'Mật khẩu không được để trống';
    else if (registerData.password.length < 6)
      newErrors.password = 'Mật khẩu phải dài ít nhất 6 ký tự';
    if (!registerData.confirmPassword.trim())
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    else if (registerData.password !== registerData.confirmPassword)
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      onSubmit({ ...registerData, role }, () => {
        setRegisterData({ fullname: '', email: '', password: '', confirmPassword: '' });
        setErrors({});
      });
    }
  };

  const updateField = (field: string, value: string) => {
    setRegisterData({ ...registerData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  return (
    <div className="login-form-box">
      <form onSubmit={handleSubmit} id="register-form">
        <h1>Tạo tài khoản</h1>
        <p className="login-subtitle">Tham gia cùng chúng tôi ngay hôm nay</p>

        <div className="segmented-control" ref={containerRef}>
          <div className="segmented-indicator" ref={indicatorRef}></div>
          <button
            type="button"
            ref={studentRef}
            className={`segmented-btn ${role === 'student' ? 'active' : ''}`}
            onClick={() => setRole('student')}
          >
            Sinh viên
          </button>
          <button
            type="button"
            ref={expertRef}
            className={`segmented-btn ${role === 'expert' ? 'active' : ''}`}
            onClick={() => setRole('expert')}
          >
            Chuyên gia
          </button>
        </div>

        <div className={`login-input-box ${errors.fullname ? 'error' : ''}`}>
          <input
            type="text"
            id="register-fullname"
            placeholder="Họ và tên"
            value={registerData.fullname}
            onChange={(e) => updateField('fullname', e.target.value)}
          />
          <i className="bx bx-id-card"></i>
          {errors.fullname && <span className="login-error-msg">{errors.fullname}</span>}
        </div>

        <div className={`login-input-box ${errors.email ? 'error' : ''}`}>
          <input
            type="email"
            id="register-email"
            placeholder="Email"
            value={registerData.email}
            onChange={(e) => updateField('email', e.target.value)}
          />
          <i className="bx bx-envelope"></i>
          {errors.email && <span className="login-error-msg">{errors.email}</span>}
        </div>


        <div className={`login-input-box ${errors.password ? 'error' : ''}`}>
          <input
            type={showPassword ? 'text' : 'password'}
            id="register-password"
            placeholder="Mật khẩu"
            value={registerData.password}
            onChange={(e) => updateField('password', e.target.value)}
          />
          <i
            className={`bx ${showPassword ? 'bx-show' : 'bx-hide'}`}
            onClick={() => setShowPassword(!showPassword)}
            style={{ cursor: 'pointer' }}
            title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          ></i>
          {errors.password && <span className="login-error-msg">{errors.password}</span>}
        </div>

        <div className={`login-input-box ${errors.confirmPassword ? 'error' : ''}`}>
          <input
            type="password"
            id="register-confirm-password"
            placeholder="Xác nhận mật khẩu"
            value={registerData.confirmPassword}
            onChange={(e) => updateField('confirmPassword', e.target.value)}
          />
          <i className="bx bx-lock"></i>
          {errors.confirmPassword && (
            <span className="login-error-msg">{errors.confirmPassword}</span>
          )}
        </div>

        <button
          type="submit"
          className={`login-btn ${isLoading ? 'loading' : ''}`}
          id="register-submit-btn"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="login-spinner"></span>
          ) : (
            <>
              <span>Đăng ký</span>
              <i className="bx bx-user-plus"></i>
            </>
          )}
        </button>

        <div className="login-divider">
          <span>hoặc đăng ký với</span>
        </div>

        <div className="login-social-icons">
          <a href="#" className="login-social-btn" id="signup-google" title="Đăng ký bằng Google" onClick={(e) => { e.preventDefault(); registerWithGoogle(); }}>
            <i className="bx bxl-google"></i>
            <span>Đăng ký bằng Google</span>
          </a>
        </div>
      </form>
    </div>
  );
}

export default Register;
