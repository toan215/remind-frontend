import React from "react";

interface AdminGuardProps {
  userRole: string;
  onBackToHome: () => void;
  children: React.ReactNode;
}

export function AdminGuard({ userRole, onBackToHome, children }: AdminGuardProps) {
  if (userRole === "admin") {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "24px",
        background: "var(--canvas)",
        textAlign: "center"
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          padding: "32px",
          maxWidth: "480px",
          width: "100%",
          boxShadow: "var(--shadow)"
        }}
      >
        <div
          style={{
            fontSize: "48px",
            color: "var(--error)",
            marginBottom: "16px"
          }}
        >
          <i className="bx bx-shield-quarter"></i>
        </div>
        
        <h2 style={{ color: "var(--ink-900)", marginBottom: "12px", fontSize: "20px" }}>
          Truy cập bị từ chối
        </h2>
        
        <p style={{ color: "var(--ink-700)", fontSize: "14px", lineHeight: "1.5", marginBottom: "24px" }}>
          Bạn không có quyền quản trị viên để truy cập khu vực này. Vui lòng quay lại trang chủ hoặc đăng nhập bằng tài khoản có thẩm quyền.
        </p>

        <button
          onClick={onBackToHome}
          className="rm-btn rm-btn-primary"
          style={{ width: "100%", minHeight: "44px" }}
        >
          <i className="bx bx-home-alt" style={{ fontSize: "18px" }}></i>
          Quay lại Trang chủ
        </button>
      </div>
    </div>
  );
}
export default AdminGuard;
