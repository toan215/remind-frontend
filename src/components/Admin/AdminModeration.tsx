import React, { useEffect, useState } from "react";
import { apiHelper } from "../../utils/apiHelper";
import { API_ENDPOINTS } from "../../utils/constants";
import { AdminRoute } from "../../routes/adminRoutes";
import "./Admin.css";

export interface ContentReport {
  _id: string;
  type: "post" | "comment";
  targetId: string;
  reason: string;
  details?: string;
  reportedBy: string;
  reportedUser?: string;
  contentPreview: string;
  status: "open" | "resolved";
  createdAt: string;
}

const MOCK_REPORTS: ContentReport[] = [
  {
    _id: "r1",
    type: "post",
    targetId: "p101",
    reason: "Spam / Quảng cáo",
    details: "Bài viết chứa link giới thiệu sản phẩm không liên quan.",
    reportedBy: "student@remind.vn",
    reportedUser: "spammer@remind.vn",
    contentPreview: "Mua thuốc giảm cân giá siêu rẻ tại link...",
    status: "open",
    createdAt: "2026-07-15T09:20:00Z",
  },
  {
    _id: "r2",
    type: "comment",
    targetId: "c55",
    reason: "Ngôn từ gây thù ghét",
    details: "Bình luận có lời lăng mạ người khác.",
    reportedBy: "user2@remind.vn",
    reportedUser: "toxic@remind.vn",
    contentPreview: "Mày thật ngu ngốc và vô dụng...",
    status: "open",
    createdAt: "2026-07-16T14:05:00Z",
  },
  {
    _id: "r3",
    type: "post",
    targetId: "p88",
    reason: "Nội dung không phù hợp",
    details: "Chia sẻ thông tin y tế sai lệch.",
    reportedBy: "user3@remind.vn",
    reportedUser: "misinfo@remind.vn",
    contentPreview: "Uống lá này sẽ chữa khỏi trầm cảm hoàn toàn...",
    status: "open",
    createdAt: "2026-07-17T20:40:00Z",
  },
];

interface AdminModerationProps {
  onNavigate?: (route: AdminRoute) => void;
}

export const AdminModeration: React.FC<AdminModerationProps> = () => {
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("open");
  const [toast, setToast] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await apiHelper.get<{ reports: ContentReport[] }>(API_ENDPOINTS.ADMIN.REPORTS);
      const list = (res.reports || []).map((r) => ({ ...r, status: r.status || "open" }));
      setReports(list);
      setUsingMock(false);
    } catch (err) {
      setReports(MOCK_REPORTS);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleResolve = async (report: ContentReport) => {
    setResolvingId(report._id);
    const previous = reports;
    setReports((prev) =>
      prev.map((r) => (r._id === report._id ? { ...r, status: "resolved" } : r))
    );
    try {
      await apiHelper.post(API_ENDPOINTS.ADMIN.RESOLVE_REPORT(report._id), {});
      showToast("Đã xử lý báo cáo.");
    } catch (err) {
      setReports(previous);
      showToast("Lỗi: không thể xử lý báo cáo (backend chưa sẵn sàng).");
    } finally {
      setResolvingId(null);
    }
  };

  const filtered = reports.filter((r) => filter === "all" || r.status === filter);
  const openCount = reports.filter((r) => r.status === "open").length;

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });
  };

  if (loading) return <div className="admin-empty-state">Đang tải báo cáo nội dung...</div>;

  return (
    <div className="admin-dashboard-container">
      <div className="admin-page-header flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Kiểm duyệt & Báo cáo nội dung</h2>
          <p className="text-sm text-gray-500">
            Xem các báo cáo từ cộng đồng, xử lý nội dung vi phạm và khóa tài khoản vi phạm.
          </p>
        </div>
        <span className="admin-menu-badge red" style={{ fontSize: 14, padding: "4px 12px" }}>
          {openCount} đang chờ
        </span>
      </div>

      {usingMock && (
        <div className="admin-mock-banner">
          <i className="bx bx-info-circle"></i>
          Đang dùng dữ liệu mẫu (mock). Backend chưa có endpoint <code>GET /api/admin/reports</code>.
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {(["open", "resolved", "all"] as const).map((f) => (
          <button
            key={f}
            className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${
              filter === f
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-white text-gray-600 border-gray-200"
            }`}
            onClick={() => setFilter(f)}
          >
            {f === "open" ? "Đang chờ" : f === "resolved" ? "Đã xử lý" : "Tất cả"}
          </button>
        ))}
      </div>

      <div className="admin-report-list">
        {filtered.map((r) => (
          <div key={r._id} className={`admin-report-card ${r.status}`}>
            <div className="admin-report-head">
              <span className={`admin-report-type ${r.type}`}>
                <i className={`bx ${r.type === "post" ? "bx-file" : "bx-comment"}`}></i>
                {r.type === "post" ? "Bài viết" : "Bình luận"}
              </span>
              <span className="admin-report-reason">{r.reason}</span>
              <span className="admin-report-time">{formatTime(r.createdAt)}</span>
            </div>

            <p className="admin-report-preview">"{r.contentPreview}"</p>

            <div className="admin-report-meta">
              <span>Báo cáo bởi: <strong>{r.reportedBy}</strong></span>
              {r.reportedUser && (
                <span>Người viết: <strong>{r.reportedUser}</strong></span>
              )}
            </div>

            {r.details && <p className="admin-report-details">Chi tiết: {r.details}</p>}

            <div className="admin-report-actions">
              {r.status === "open" ? (
                <button
                  className="admin-action-btn-sm approve"
                  disabled={resolvingId === r._id}
                  onClick={() => handleResolve(r)}
                >
                  Đánh dấu đã xử lý
                </button>
              ) : (
                <span className="admin-report-resolved">
                  <i className="bx bx-check-circle"></i> Đã xử lý
                </span>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="admin-empty-state">
            <i className="bx bx-shield-check" style={{ fontSize: 32, color: "var(--success)", display: "block", marginBottom: 8 }}></i>
            Không có báo cáo nào trong mục này.
          </div>
        )}
      </div>

      {toast && <div className="admin-toast">{toast}</div>}
    </div>
  );
};

export default AdminModeration;
