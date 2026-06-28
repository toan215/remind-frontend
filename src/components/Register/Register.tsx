import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import './Register.css';

interface RegisterProps {
  isLoading: boolean;
  onSubmit: (data: any, resetForm: () => void) => void;
}

function Register({ isLoading, onSubmit }: RegisterProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [registerData, setRegisterData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const registerWithGoogle = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log("Đăng ký Google thành công, Token:", tokenResponse.access_token);
      alert("Đăng ký Google thành công!\n(Xem token trong Console F12)\nTiếp theo bạn cần gửi token này xuống backend.");
      // TODO: Gửi tokenResponse.access_token xuống backend
    },
    onError: () => {
      console.error("Đăng ký Google thất bại");
      alert("Đăng ký Google thất bại!");
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
      onSubmit(registerData, () => {
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
          </a>
        </div>
      </form>
    </div>
  );
}

export default Register;
