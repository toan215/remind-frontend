import { useState } from "react";
import { AdminRoute } from "../../routes/adminRoutes";
import "./Admin.css";

interface RateLog {
  id: string;
  effectiveDate: string;
  previousRate: number;
  newRate: number;
  updatedBy: string;
  reason: string;
}

interface AdminCommissionProps {
  onNavigate: (route: AdminRoute) => void;
}

export default function AdminCommission({ onNavigate }: AdminCommissionProps) {
  const [currentRate, setCurrentRate] = useState<number>(15);
  const [tempRate, setTempRate] = useState<number>(15);
  const [effectiveTarget, setEffectiveTarget] = useState<"all" | "standard" | "new_experts">("all");
  const [reasonNote, setReasonNote] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Simulation test amount
  const [simulatedPrice, setSimulatedPrice] = useState<number>(500000);

  // History log
  const [logs, setLogs] = useState<RateLog[]>([
    {
      id: "LOG-003",
      effectiveDate: "2026-07-01 00:00",
      previousRate: 18,
      newRate: 15,
      updatedBy: "Admin Moderator",
      reason: "Giảm phí sàn để hỗ trợ thu hút thêm Chuyên gia mới gia nhập ReMind.",
    },
    {
      id: "LOG-002",
      effectiveDate: "2026-01-15 00:00",
      previousRate: 20,
      newRate: 18,
      updatedBy: "Admin Moderator",
      reason: "Điều chỉnh chính sách hoa hồng đầu năm 2026.",
    },
    {
      id: "LOG-001",
      effectiveDate: "2025-09-01 00:00",
      previousRate: 0,
      newRate: 20,
      updatedBy: "System Setup",
      reason: "Khởi tạo mức phí hoa hồng tiêu chuẩn khi phát hành tính năng Tư vấn Chuyên gia.",
    },
  ]);

  const handleApplyRate = () => {
    if (tempRate < 0 || tempRate > 50) {
      alert("Tỷ lệ hoa hồng phải nằm trong khoảng từ 0% đến 50%.");
      return;
    }
    if (!reasonNote.trim()) {
      alert("Vui lòng nhập lý do thay đổi mức phí hoa hồng.");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      const newLog: RateLog = {
        id: `LOG-00${logs.length + 1}`,
        effectiveDate: new Date().toLocaleString("vi-VN"),
        previousRate: currentRate,
        newRate: tempRate,
        updatedBy: "Admin Moderator",
        reason: reasonNote.trim(),
      };

      setCurrentRate(tempRate);
      setLogs([newLog, ...logs]);
      setIsSaving(false);
      setReasonNote("");
      setToastMessage(`Đã cập nhật mức phí hoa hồng thành công sang ${tempRate}%!`);

      setTimeout(() => setToastMessage(null), 4000);
    }, 600);
  };

  const formatVND = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  // Simulation calculations
  const platformFee = (simulatedPrice * tempRate) / 100;
  const expertShare = simulatedPrice - platformFee;

  return (
    <div className="admin-commission-container">
      {toastMessage && (
        <div className="bg-green-600 text-white p-3 rounded-lg shadow-lg mb-4 flex items-center justify-between animate-fade-in text-sm font-medium">
          <div className="flex items-center gap-2">
            <i className="bx bx-check-circle text-lg"></i>
            {toastMessage}
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white hover:text-gray-200">
            <i className="bx bx-x"></i>
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="admin-page-header flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Cấu hình Tỷ lệ Hoa hồng Nền tảng</h2>
          <p className="text-sm text-gray-500">
            Thay đổi tỷ lệ phần trăm phí sàn thu trên các ca tư vấn chuyên gia và theo dõi nhật ký điều chỉnh.
          </p>
        </div>
        <button
          className="rm-btn rm-btn-outline"
          onClick={() => onNavigate("finances")}
          title="Xem báo cáo doanh thu"
        >
          <i className="bx bx-dollar-circle"></i> Xem báo cáo Doanh thu
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column: Form Adjust Commission */}
        <div className="lg:col-span-2 admin-panel-card">
          <h3 className="admin-dashboard-section-title">
            <i className="bx bx-slider-alt"></i> Điều chỉnh Mức Phí Hoa Hồng
          </h3>

          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <span className="text-xs text-teal-700 font-semibold uppercase tracking-wider block">Mức phí hiện tại đang áp dụng</span>
              <span className="text-3xl font-extrabold text-teal-800">{currentRate}%</span>
              <span className="text-xs text-teal-600 block mt-0.5">Áp dụng cho tất cả dịch vụ đặt lịch tư vấn</span>
            </div>
            <div className="w-14 h-14 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center text-2xl font-bold">
              %
            </div>
          </div>

          <div className="space-y-5">
            {/* Target selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Đối tượng áp dụng
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "all", label: "Tất cả Chuyên gia (Toàn sàn)" },
                  { id: "standard", label: "Chuyên gia Tiêu chuẩn" },
                  { id: "new_experts", label: "Chuyên gia Mới gia nhập" },
                ].map((item) => (
                  <button
                    key={item.id}
                    className={`py-2 px-3 text-xs rounded-xl border font-medium text-center transition-all ${
                      effectiveTarget === item.id
                        ? "bg-teal-600 text-white border-teal-600 shadow"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => setEffectiveTarget(item.id as any)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider / Range Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Mức phí hoa hồng mới (%)
                </label>
                <span className="text-lg font-bold text-teal-700">{tempRate}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                value={tempRate}
                onChange={(e) => setTempRate(Number(e.target.value))}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1 font-mono">
                <span>0% (Miễn phí)</span>
                <span>10%</span>
                <span>20% (Phổ biến)</span>
                <span>30%</span>
                <span>40% (Tối đa)</span>
              </div>
            </div>

            {/* Quick preset buttons */}
            <div>
              <span className="text-xs font-semibold text-gray-500 block mb-1.5">Mức gợi ý nhanh:</span>
              <div className="flex gap-2">
                {[10, 12, 15, 18, 20].map((r) => (
                  <button
                    key={r}
                    className={`px-3 py-1 text-xs rounded-lg border font-mono transition-all ${
                      tempRate === r ? "bg-teal-700 text-white border-teal-700" : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                    }`}
                    onClick={() => setTempRate(r)}
                  >
                    {r}%
                  </button>
                ))}
              </div>
            </div>

            {/* Reason note */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Lý do điều chỉnh (Hiển thị trong nhật ký quản trị) <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                className="rm-input-field text-xs w-full"
                placeholder="Nhập lý do thay đổi (ví dụ: Giảm phí để hỗ trợ chuyên gia trong đợt khuyến mãi...)"
                value={reasonNote}
                onChange={(e) => setReasonNote(e.target.value)}
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex justify-end">
              <button
                className="rm-btn rm-btn-primary"
                onClick={handleApplyRate}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <i className="bx bx-loader-alt animate-spin"></i> Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="bx bx-check"></i> Lưu & Áp Dụng Ngay
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Simulation Calculator */}
        <div className="admin-panel-card flex flex-col justify-between">
          <div>
            <h3 className="admin-dashboard-section-title">
              <i className="bx bx-calculator"></i> Mô phỏng Phân chia Doanh thu
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Kiểm tra số tiền Chuyên gia và Nền tảng ReMind nhận được dựa trên mức phí <strong>{tempRate}%</strong>.
            </p>

            {/* Input price sample */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Giá dịch vụ mẫu (VNĐ)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="50000"
                  className="rm-input-field text-sm font-bold pl-8 w-full"
                  value={simulatedPrice}
                  onChange={(e) => setSimulatedPrice(Number(e.target.value))}
                />
                <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-xs">₫</span>
              </div>
            </div>

            {/* Simulated Result Breakdown */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-xs text-gray-600 font-medium">Tổng phí ca tư vấn:</span>
                <span className="font-bold text-gray-900">{formatVND(simulatedPrice)}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                  <span className="text-xs text-gray-700">Chuyên gia thực nhận ({100 - tempRate}%):</span>
                </div>
                <span className="font-extrabold text-teal-600">{formatVND(expertShare)}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-xs text-gray-700">Hoa hồng Sàn ReMind ({tempRate}%):</span>
                </div>
                <span className="font-extrabold text-amber-600">{formatVND(platformFee)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-800 flex gap-2 items-start">
            <i className="bx bx-info-circle text-base text-amber-600 flex-shrink-0 mt-0.5"></i>
            <span>Lưu ý: Mức phí hoa hồng mới sẽ lập tức áp dụng cho các lịch hẹn tư vấn được tạo kể từ thời điểm cập nhật.</span>
          </div>
        </div>
      </div>

      {/* History Log Section */}
      <div className="admin-panel-card">
        <h3 className="admin-dashboard-section-title">
          <i className="bx bx-history"></i> Nhật ký Thay đổi Mức Phí Hoa Hồng
        </h3>

        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã Nhật Ký</th>
                <th>Thời Gian Cập Nhật</th>
                <th>Mức Cũ</th>
                <th>Mức Mới</th>
                <th>Người Thực Hiện</th>
                <th>Lý Do Điều Chỉnh</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="font-mono text-xs font-bold text-gray-500">{log.id}</td>
                  <td className="text-xs text-gray-600">{log.effectiveDate}</td>
                  <td className="text-gray-500 font-mono line-through">{log.previousRate}%</td>
                  <td className="font-extrabold text-teal-700 font-mono text-sm">{log.newRate}%</td>
                  <td className="font-medium text-gray-800">{log.updatedBy}</td>
                  <td className="text-xs text-gray-600 max-w-md">{log.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
