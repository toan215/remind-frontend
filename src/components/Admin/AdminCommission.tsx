import { useState } from "react";
import { AdminRoute } from "../../routes/adminRoutes";
import "./Admin.css";
import "./AdminCommission.css";

interface RateLog {
  id: string;
  effectiveDate: string;
  previousRate: number;
  newRate: number;
  updatedBy: string;
  reason: string;
  target: string;
  targetKey: "all" | "standard" | "new_experts";
}

interface AdminCommissionProps {
  onNavigate: (route: AdminRoute) => void;
}

const TARGET_OPTIONS = [
  { id: "all", label: "Tất cả Chuyên gia (Toàn sàn)", icon: "bx-globe", short: "Tất cả Chuyên gia" },
  { id: "standard", label: "Chuyên gia Tiêu chuẩn", icon: "bx-user-check", short: "Chuyên gia Tiêu chuẩn" },
  { id: "new_experts", label: "Chuyên gia Mới gia nhập", icon: "bx-user-plus", short: "Chuyên gia Mới gia nhập" },
] as const;

export default function AdminCommission({ onNavigate }: AdminCommissionProps) {
  const [currentRate, setCurrentRate] = useState<number>(15);
  const [tempRate, setTempRate] = useState<number>(15);
  const [effectiveTarget, setEffectiveTarget] = useState<"all" | "standard" | "new_experts">("all");
  const [reasonNote, setReasonNote] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [simulatedPrice, setSimulatedPrice] = useState<number>(500000);

  const [logs, setLogs] = useState<RateLog[]>([
    {
      id: "LOG-003",
      effectiveDate: "2026-07-01 00:00",
      previousRate: 18,
      newRate: 15,
      updatedBy: "Admin Moderator",
      target: "Tất cả Chuyên gia",
      targetKey: "all",
      reason: "Giảm phí sàn để hỗ trợ thu hút thêm Chuyên gia mới gia nhập ReMind.",
    },
    {
      id: "LOG-002",
      effectiveDate: "2026-01-15 00:00",
      previousRate: 20,
      newRate: 18,
      updatedBy: "Admin Moderator",
      target: "Tất cả Chuyên gia",
      targetKey: "all",
      reason: "Điều chỉnh chính sách hoa hồng đầu năm 2026.",
    },
    {
      id: "LOG-001",
      effectiveDate: "2025-09-01 00:00",
      previousRate: 0,
      newRate: 20,
      updatedBy: "System Setup",
      target: "Toàn hệ thống",
      targetKey: "all",
      reason: "Khởi tạo mức phí hoa hồng tiêu chuẩn khi phát hành tính năng Tư vấn Chuyên gia.",
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApplyRate = () => {
    if (tempRate < 0 || tempRate > 50) {
      showToast("Lỗi: Tỷ lệ hoa hồng phải nằm trong khoảng từ 0% đến 50%.");
      return;
    }
    if (!reasonNote.trim()) {
      showToast("Lỗi: Vui lòng nhập lý do thay đổi mức phí hoa hồng.");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      const selected = TARGET_OPTIONS.find((t) => t.id === effectiveTarget)!;

      const newLog: RateLog = {
        id: `LOG-00${logs.length + 1}`,
        effectiveDate: new Date().toLocaleString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        previousRate: currentRate,
        newRate: tempRate,
        updatedBy: "Admin Moderator",
        target: selected.short,
        targetKey: effectiveTarget,
        reason: reasonNote.trim(),
      };

      setCurrentRate(tempRate);
      setLogs([newLog, ...logs]);
      setIsSaving(false);
      setReasonNote("");
      showToast(`Đã cập nhật mức phí hoa hồng thành công sang ${tempRate}%!`);
    }, 600);
  };

  const formatVND = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  const platformFee = (simulatedPrice * tempRate) / 100;
  const expertShare = simulatedPrice - platformFee;
  const selectedTarget = TARGET_OPTIONS.find((t) => t.id === effectiveTarget)!;

  return (
    <div className="cm-page">
      {toastMessage && (
        <div className="cm-toast">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <i className="bx bx-check-circle"></i>
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)}>
            <i className="bx bx-x"></i>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="cm-card cm-header-card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span className="admin-chip-badge teal">Cấu hình Tài chính</span>
              <span style={{ fontSize: 12, color: "var(--ink-400)" }}>Phiên bản 2026.2</span>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--ink-900)", letterSpacing: "-0.02em", margin: 0 }}>
              Quản lý & Điều chỉnh Mức Phí Hoa Hồng
            </h2>
            <p style={{ fontSize: 13, color: "var(--ink-500)", fontWeight: 500, marginTop: 6, marginBottom: 0, maxWidth: 560 }}>
              Thiết lập tỷ lệ trích hoa hồng sàn ReMind trên mỗi ca tư vấn chuyên gia và mô phỏng phân chia doanh thu trực quan.
            </p>
          </div>
          <button
            className="rm-btn rm-btn-outline font-bold shadow-sm flex items-center gap-2"
            onClick={() => onNavigate("finances")}
            style={{ flexShrink: 0 }}
          >
            <i className="bx bx-line-chart text-lg text-teal-700"></i>
            <span>Báo cáo Doanh thu</span>
          </button>
        </div>
      </div>

      <div className="cm-grid">
        {/* Left: Adjust */}
        <div className="cm-card" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
            <h3 className="cm-section-title">
              <span className="cm-section-icon teal"><i className="bx bx-slider-alt"></i></span>
              Điều chỉnh Mức Phí Hoa Hồng
            </h3>
            <span style={{ fontSize: 12, color: "var(--ink-400)", fontWeight: 600 }}>Thay đổi áp dụng tức thì</span>
          </div>

          {/* Active rate */}
          <div className="cm-active-banner">
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
              <div>
                <span className="cm-active-tag">Mức phí hiện tại đang áp dụng</span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 38, fontWeight: 800, color: "var(--brand-700)" }}>{currentRate}%</span>
                  <span style={{ fontSize: 12, color: "var(--brand-700)", fontWeight: 600 }}>trên mỗi giao dịch</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--brand-700)", opacity: 0.8, marginTop: 6, marginBottom: 0, fontWeight: 500 }}>
                  Áp dụng cho: <strong>{selectedTarget.short}</strong>
                </p>
              </div>
              <div className="cm-rate-circle">
                <span style={{ fontSize: 20, fontWeight: 800, color: "var(--brand-700)", lineHeight: 1 }}>%</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: "var(--brand-700)", textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 4, whiteSpace: "nowrap" }}>Hoa hồng sàn</span>
              </div>
            </div>
          </div>

          {/* Target tabs */}
          <div>
            <label className="cm-label">Đối tượng áp dụng</label>
            <div className="cm-target-grid">
              {TARGET_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`cm-target-tab ${effectiveTarget === item.id ? "active" : ""}`}
                  onClick={() => setEffectiveTarget(item.id)}
                  aria-pressed={effectiveTarget === item.id}
                >
                  <i className={`bx ${item.icon}`}></i>
                  <span>{item.label}</span>
                  <i className="bx bx-check cm-tab-check"></i>
                </button>
              ))}
            </div>
          </div>

          {/* Slider */}
          <div className="cm-slider-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <label className="cm-label" style={{ marginBottom: 0 }}>
                Mức phí hoa hồng mới đề xuất
                <span className={`cm-changed-badge ${tempRate !== currentRate ? "" : "hidden"}`} style={{ marginLeft: 8 }}>Đã thay đổi</span>
              </label>
              <span className="cm-rate-pill">{tempRate}%</span>
            </div>

            <div style={{ padding: "8px 4px" }}>
              <input
                type="range"
                min={0}
                max={40}
                step={1}
                className="cm-range"
                value={tempRate}
                onChange={(e) => setTempRate(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #19625e 0%, #2da19c ${(tempRate / 40) * 100}%, #e2e8f0 ${(tempRate / 40) * 100}%, #e2e8f0 100%)`,
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink-500)", marginTop: 8, fontFamily: "monospace", fontWeight: 600 }}>
                <span style={{ whiteSpace: "nowrap" }}>0% (Miễn phí)</span>
                <span>10%</span>
                <span style={{ whiteSpace: "nowrap" }}>20% (Phổ biến)</span>
                <span>30%</span>
                <span style={{ whiteSpace: "nowrap" }}>40% (Tối đa)</span>
              </div>
            </div>

            <div className="cm-preset-grid">
              <span className="cm-preset-label">Mức gợi ý nhanh:</span>
              {[10, 12, 15, 18, 20].map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`cm-preset ${tempRate === r ? "active" : ""}`}
                  onClick={() => setTempRate(r)}
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="cm-label">
              Lý do điều chỉnh (Hiển thị trong nhật ký quản trị) <span style={{ color: "#e11d48" }}>*</span>
            </label>
            <textarea
              rows={3}
              className="cm-textarea"
              placeholder="Nhập chi tiết lý do thay đổi (ví dụ: Giảm phí sàn để hỗ trợ thu hút thêm Chuyên gia mới gia nhập ReMind...)"
              value={reasonNote}
              onChange={(e) => setReasonNote(e.target.value)}
            />
          </div>

          {/* Submit */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16, borderTop: "1px solid var(--border)", paddingTop: 20 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--ink-500)", fontWeight: 500, cursor: "pointer" }}>
              <input type="checkbox" defaultChecked style={{ width: 16, height: 16, accentColor: "var(--brand-600)" }} />
              <span>Ghi lại chi tiết hoạt động trong Audit Log hệ thống</span>
            </label>
            <button className="cm-save-btn" onClick={handleApplyRate} disabled={isSaving}>
              {isSaving ? (
                <><i className="bx bx-loader-alt" style={{ animation: "cmSpin 0.8s linear infinite" }}></i> Đang lưu...</>
              ) : (
                <><i className="bx bx-check"></i> Lưu & Áp dụng Ngay</>
              )}
            </button>
          </div>
        </div>

        {/* Right: Simulation */}
        <div className="cm-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 20 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 16, marginBottom: 16 }}>
              <h3 className="cm-section-title">
                <span className="cm-section-icon amber"><i className="bx bx-calculator"></i></span>
                Mô phỏng Phân chia
              </h3>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#b45309", background: "#fffbeb", padding: "6px 14px", borderRadius: 9999, border: "1px solid #fde68a", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <i className="bx bx-pie-chart-alt-2" style={{ color: "#d97706", fontSize: 14 }}></i>
                {tempRate}% phí sàn
              </span>
            </div>

            <p style={{ fontSize: 12, color: "var(--ink-500)", fontWeight: 500, marginBottom: 16 }}>
              Kiểm tra số tiền Chuyên gia và Nền tảng ReMind thực nhận dựa trên giá ca tư vấn trị giá <strong>{formatVND(simulatedPrice)}</strong>.
            </p>

            <div style={{ marginBottom: 20 }}>
              <label className="cm-label">Giá dịch vụ tư vấn mẫu (VNĐ)</label>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  step={50000}
                  className="cm-input"
                  style={{ fontSize: 15, fontWeight: 800, color: "var(--ink-900)", paddingLeft: 28 }}
                  value={simulatedPrice}
                  onChange={(e) => setSimulatedPrice(Number(e.target.value))}
                />
                <span style={{ position: "absolute", left: 12, top: 12, color: "var(--ink-400)", fontWeight: 800, fontSize: 13 }}>₫</span>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
                <span style={{ color: "var(--brand-700)" }}>Chuyên gia ({100 - tempRate}%)</span>
                <span style={{ color: "#d97706" }}>ReMind ({tempRate}%)</span>
              </div>
              <div style={{ width: "100%", height: 12, borderRadius: 999, background: "#f1f5f9", display: "flex", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                <div style={{ height: "100%", background: "var(--brand-600)", borderRadius: "999px 0 0 999px", transition: "all 0.3s", width: `${100 - tempRate}%` }} />
                <div style={{ height: "100%", background: "#f59e0b", borderRadius: "0 999px 999px 0", transition: "all 0.3s", width: `${tempRate}%` }} />
              </div>
            </div>

            <div style={{ background: "#f8fafc", borderRadius: 16, padding: 16, border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, borderBottom: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: 12, color: "var(--ink-500)", fontWeight: 700 }}>Tổng chi phí ca tư vấn:</span>
                <span style={{ fontWeight: 800, color: "var(--ink-900)", fontSize: 13 }}>{formatVND(simulatedPrice)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 999, background: "var(--brand-600)", display: "inline-block" }}></span>
                  <span style={{ fontSize: 12, color: "var(--ink-700)", fontWeight: 600 }}>Chuyên gia thực nhận ({100 - tempRate}%):</span>
                </div>
                <span style={{ fontWeight: 800, color: "var(--brand-700)", fontSize: 13 }}>{formatVND(expertShare)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 999, background: "#f59e0b", display: "inline-block" }}></span>
                  <span style={{ fontSize: 12, color: "var(--ink-700)", fontWeight: 600 }}>Hoa hồng Sàn ReMind ({tempRate}%):</span>
                </div>
                <span style={{ fontWeight: 800, color: "#d97706", fontSize: 13 }}>{formatVND(platformFee)}</span>
              </div>
            </div>
          </div>

          <div style={{ padding: 14, background: "#fffbeb", borderRadius: 16, border: "1px solid #fde68a", fontSize: 12, color: "#92400e", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <i className="bx bx-info-circle" style={{ fontSize: 18, color: "#d97706", flexShrink: 0, marginTop: 2 }}></i>
            <span style={{ fontWeight: 500, lineHeight: 1.5 }}>
              <strong>Lưu ý quan trọng:</strong> Mức phí hoa hồng mới sẽ lập tức được áp dụng tự động cho các lịch hẹn tư vấn được người dùng thanh toán từ thời điểm cập nhật.
            </span>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="cm-card">
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
          <div>
            <h3 className="cm-section-title">
              <span className="cm-section-icon slate"><i className="bx bx-history"></i></span>
              Nhật ký Thay đổi Mức Phí Hoa Hồng
            </h3>
            <p style={{ fontSize: 12, color: "var(--ink-500)", fontWeight: 500, margin: "8px 0 0" }}>Lịch sử ghi lại tất cả các đợt điều chỉnh phí hoa hồng sàn.</p>
          </div>
          <span className="cm-count-pill">Tổng số: {logs.length} bản ghi</span>
        </div>

        <div className="cm-table-wrap">
          <table className="cm-table">
            <thead>
              <tr>
                <th>Mã Nhật Ký</th>
                <th>Thời Gian Cập Nhật</th>
                <th>Mức Cũ → Mới</th>
                <th>Đối Tượng</th>
                <th>Người Thực Hiện</th>
                <th>Lý Do Điều Chính</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td><span className="cm-code-chip">{log.id}</span></td>
                  <td style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-600)", whiteSpace: "nowrap" }}>{log.effectiveDate}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "monospace", fontSize: 12 }}>
                      <span style={{ color: "var(--ink-400)", textDecoration: "line-through", fontWeight: 600 }}>{log.previousRate}%</span>
                      <i className="bx bx-right-arrow-alt" style={{ color: "var(--brand-600)" }}></i>
                      <span className="cm-rate-new">{log.newRate}%</span>
                    </div>
                  </td>
                  <td><span className="cm-target-pill">{log.target}</span></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="cm-avatar">{log.updatedBy.split(" ").map((n) => n[0]).join("").slice(0, 2)}</div>
                      <span style={{ fontWeight: 600, color: "var(--ink-800)", fontSize: 12 }}>{log.updatedBy}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--ink-600)", maxWidth: 420, fontWeight: 500, lineHeight: 1.5 }}>{log.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
