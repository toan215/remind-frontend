import { useState, useEffect } from "react";
import { Expert } from "../../models/Expert";
import { ExpertController } from "../../controllers/ExpertController";
import "./Payment.css";

interface PaymentProps {
  onBack: () => void;
  onPaymentComplete: () => void;
  bookingDetails: {
    expert: Expert;
    expertId?: string;
    slotId?: string;
    date: string;
    slot: string;
    totalCost: number;
  };
}

const PAYMENT_METHODS = [
  { id: "momo", name: "Ví MoMo", icon: "bx bx-wallet" },
  { id: "vnpay", name: "VNPay", icon: "bx bx-qr-scan" },
  { id: "card", name: "Thẻ Tín dụng/Ghi nợ", icon: "bx bx-credit-card" }
];

export default function Payment({ onBack, onPaymentComplete, bookingDetails }: PaymentProps) {
  const [selectedMethod, setSelectedMethod] = useState("vnpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const { expert, expertId, slotId, date, slot, totalCost } = bookingDetails;

  // Capture VNPAY return status (?status=success|failed) when redirected back
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    if (status === "success") setIsSuccess(true);
    else if (status === "failed") setIsFailed(true);
  }, []);

  const handlePay = async () => {
    if (!expertId || !slotId) {
      setPaymentError("Thiếu thông tin lịch hẹn. Vui lòng quay lại bước đặt lịch.");
      setIsFailed(true);
      return;
    }

    setIsProcessing(true);
    setPaymentError("");

    try {
      const { appointment } = await ExpertController.bookAppointment(expertId, slotId);
      const response = await ExpertController.createAppointmentPayment(appointment._id);

      // Demo mode: instant success, no redirect
      if (response.status === 'succeeded') {
        setIsProcessing(false);
        setIsSuccess(true);
        return;
      }

      // Real payment gateway: redirect to checkout
      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      }
    } catch (err: any) {
      setIsProcessing(false);
      const msg = err?.response?.data?.error || "Không thể khởi tạo thanh toán. Vui lòng thử lại.";
      setPaymentError(msg);
      setIsFailed(true);
    }
  };

  const handleRetry = () => {
    setIsFailed(false);
    setPaymentError("");
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("vi-VN", { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (isFailed) {
    return (
      <div className="payment-page">
        <div className="payment-container" style={{ maxWidth: "480px" }}>
          <div className="payment-success-content">
            <div className="payment-failed-icon">
              <i className="bx bx-x"></i>
            </div>
            <h2>Thanh toán thất bại</h2>
            <p>
              Rất tiếc, giao dịch của bạn không thành công. <br />
              <strong>Lý do:</strong> {paymentError}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="payment-retry-btn" onClick={handleRetry}>
                Thử lại
              </button>
              <button className="payment-cancel-btn" onClick={onBack}>
                Quay lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="payment-page">
        <div className="payment-container" style={{ maxWidth: "480px" }}>
          <div className="payment-success-content">
            <div className="payment-success-icon">
              <i className="bx bx-check"></i>
            </div>
            <h2>Thanh toán thành công!</h2>
            <p>
              Cảm ơn bạn đã đặt lịch. Lịch hẹn của bạn với chuyên gia <strong>{expert.name}</strong> vào 
              <strong> {slot}</strong> ngày <strong>{formatDate(date)}</strong> đã được ghi nhận.
            </p>
            <button className="payment-home-btn" onClick={onPaymentComplete}>
              Quay về Trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-header">
          <button className="payment-back-btn" onClick={onBack} title="Quay lại">
            <i className="bx bx-left-arrow-alt"></i>
          </button>
          <h2 className="payment-title">Thanh toán lịch hẹn</h2>
        </div>

        <div className="payment-content">
          <h3 className="payment-section-title">Thông tin lịch hẹn</h3>
          
          <div className="payment-summary-card">
            <div className="payment-expert-avatar">
              {expert.avatar}
            </div>
            <div className="payment-expert-info">
              <h4>{expert.name}</h4>
              <p>{expert.specialty}</p>
              <div className="payment-booking-details">
                <span><i className="bx bx-calendar"></i> {formatDate(date)}</span>
                <span><i className="bx bx-time"></i> {slot}</span>
              </div>
            </div>
          </div>

          <h3 className="payment-section-title">Chi tiết thanh toán</h3>
          <div className="payment-cost-breakdown">
            <div className="cost-row">
              <span>Giá tư vấn (1 buổi)</span>
              <span>{totalCost.toLocaleString('vi-VN')} VNĐ</span>
            </div>
            <div className="cost-row">
              <span>Thuế & Phí nền tảng</span>
              <span>Miễn phí</span>
            </div>
            <div className="cost-row total">
              <span>Tổng cộng</span>
              <span>{totalCost.toLocaleString('vi-VN')} VNĐ</span>
            </div>
            <div className="cost-row deposit">
              <span>Cần thanh toán</span>
              <span>{totalCost.toLocaleString('vi-VN')} VNĐ</span>
            </div>
          </div>

          {totalCost > 0 && (
            <>
              <h3 className="payment-section-title">Phương thức thanh toán</h3>
              <div className="payment-methods-grid">
                {PAYMENT_METHODS.map((method) => (
                  <div
                    key={method.id}
                    className={`payment-method-card ${selectedMethod === method.id ? "selected" : ""}`}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <div className="payment-method-icon">
                      <i className={method.icon}></i>
                    </div>
                    <div className="payment-method-name">{method.name}</div>
                    <div className="payment-method-radio">
                      {selectedMethod === method.id && <i className="bx bx-check"></i>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <button 
            className={`payment-submit-btn ${isProcessing ? "loading" : ""}`}
            disabled={isProcessing}
            onClick={handlePay}
          >
            {isProcessing ? "Đang chuyển hướng..." : (totalCost > 0 ? `Thanh toán ${totalCost.toLocaleString('vi-VN')} VNĐ` : "Xác nhận đặt lịch Miễn phí")}
          </button>
        </div>
      </div>
    </div>
  );
}
