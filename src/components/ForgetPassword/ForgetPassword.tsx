import { useState, useEffect } from "react";
import { AuthController } from "../../controllers/AuthController";
import "./ForgetPassword.css";

interface ForgetPasswordProps {
  onBack: () => void;
}

function ForgetPassword({ onBack }: ForgetPasswordProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg("Vui lòng nhập địa chỉ email.");
      return;
    }
    
    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Định dạng email không hợp lệ.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await AuthController.forgotPassword(email);
      setSuccessMsg("Mã OTP đã được gửi thành công đến email của bạn.");
      setStep(2);
      setCountdown(60); // 60 giây đếm ngược
    } catch (err: any) {
      setErrorMsg(err.message || "Không thể gửi OTP. Vui lòng kiểm tra lại email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await AuthController.forgotPassword(email);
      setSuccessMsg("Mã OTP đã được gửi lại thành công.");
      setCountdown(60);
    } catch (err: any) {
      setErrorMsg(err.message || "Không thể gửi lại OTP. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6 || isNaN(Number(otp))) {
      setErrorMsg("Mã OTP phải gồm 6 chữ số.");
      return;
    }
    setErrorMsg("");
    setSuccessMsg("");
    setStep(3);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorMsg("Mật khẩu mới phải dài ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await AuthController.resetPassword(email, otp, newPassword);
      alert("Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.");
      onBack();
    } catch (err: any) {
      setErrorMsg(err.message || "Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forget-page">
      {/* Animated background elements */}
      <div className="forget-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      <button onClick={onBack} className="back-button-expandable">
        <i className="bx bx-arrow-back"></i>
        <span className="back-text">Quay lại đăng nhập</span>
      </button>

      <div className="forget-container">
        <div className="forget-card">
          <div className="forget-header">
            <div className="forget-brand-icon">
              <i className="bx bx-lock-open-alt"></i>
            </div>
            <h2>Quên mật khẩu</h2>
            <p className="forget-subtitle">
              {step === 1 && "Nhập email đã đăng ký để nhận mã OTP khôi phục mật khẩu"}
              {step === 2 && `Mã xác thực OTP đã được gửi đến: ${email}`}
              {step === 3 && "Thiết lập mật khẩu mới cho tài khoản của bạn"}
            </p>
          </div>

          {errorMsg && <div className="forget-msg error">{errorMsg}</div>}
          {successMsg && <div className="forget-msg success">{successMsg}</div>}

          {step === 1 && (
            <form onSubmit={handleSendOtp} className="forget-form">
              <div className="forget-input-box">
                <input
                  type="email"
                  placeholder="Địa chỉ Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <i className="bx bx-envelope"></i>
              </div>
              <button type="submit" className="forget-btn" disabled={isLoading}>
                {isLoading ? <span className="forget-spinner"></span> : "Gửi mã OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="forget-form">
              <div className="forget-input-box">
                <input
                  type="text"
                  placeholder="Mã OTP gồm 6 chữ số"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                  maxLength={6}
                  required
                  disabled={isLoading}
                />
                <i className="bx bx-key"></i>
              </div>
              <div className="otp-resend-container">
                {countdown > 0 ? (
                  <span className="otp-countdown">Gửi lại mã sau {countdown}s</span>
                ) : (
                  <button type="button" onClick={handleResendOtp} className="otp-resend-btn" disabled={isLoading}>
                    Gửi lại mã OTP
                  </button>
                )}
              </div>
              <button type="submit" className="forget-btn" disabled={isLoading}>
                Xác thực OTP
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="forget-form">
              <div className="forget-input-box">
                <input
                  type="password"
                  placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <i className="bx bx-lock"></i>
              </div>
              <div className="forget-input-box">
                <input
                  type="password"
                  placeholder="Xác nhận mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <i className="bx bx-check-shield"></i>
              </div>
              <button type="submit" className="forget-btn" disabled={isLoading}>
                {isLoading ? <span className="forget-spinner"></span> : "Cập nhật mật khẩu"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgetPassword;
