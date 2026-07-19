import React, { useEffect, useState } from "react";
import { apiHelper } from "../../utils/apiHelper";
import { API_ENDPOINTS } from "../../utils/constants";
import { AdminRoute } from "../../routes/adminRoutes";
import { getAdminSocket } from "../../utils/adminSocket";
import "./Admin.css";

export interface ContentReport {
  _id: string;
  type: "post" | "comment" | "user" | "expert" | "message" | "bug";
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
    reason: "Spam / Quảng cáo không được phép",
    details: "Bài viết chứa liên kết quảng cáo sản phẩm chưa qua kiểm duyệt.",
    reportedBy: "nguyen.an@remind.vn",
    reportedUser: "spammer@remind.vn",
    contentPreview: "Mua thuốc giảm cân cấp tốc giá siêu ưu đãi tại liên kết này...",
    status: "open",
    createdAt: "2026-07-19T09:20:00Z",
  },
  {
    _id: "r2",
    type: "comment",
    targetId: "c55",
    reason: "Ngôn từ gây thù ghét / Công kích",
    details: "Bình luận chứa phát ngôn công kích cá nhân trong diễn đàn.",
    reportedBy: "user2@remind.vn",
    reportedUser: "toxic@remind.vn",
    contentPreview: "Nội dung bình luận vi phạm tiêu chuẩn cộng đồng...",
    status: "open",
    createdAt: "2026-07-18T14:05:00Z",
  },
  {
    _id: "r3",
    type: "post",
    targetId: "p88",
    reason: "Nội dung y tế sai lệch",
    details: "Chia sẻ phương pháp tự điều trị chưa có căn cứ y khoa.",
    reportedBy: "user3@remind.vn",
    reportedUser: "misinfo@remind.vn",
    contentPreview: "Uống thảo dược này thay thế hoàn toàn ca tư vấn tâm lý...",
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
    setTimeout(() => setToast(null), 3000);
  };

  const formatUserLabel = (val: any) => {
    if (!val) return "Thành viên ReMind";
    if (typeof val === "object") {
      return val.fullName || val.name || val.email || "Thành viên ReMind";
    }
    const str = String(val);
    if (/^[0-9a-fA-F]{24}$/.test(str)) {
      return `Thành viên #${str.slice(-4).toUpperCase()}`;
    }
    return str;
  };

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await apiHelper.get<{ reports: any[] }>(API_ENDPOINTS.ADMIN.REPORTS);
      const list = (res.reports || []).map((r) => {
        return {
          _id: r._id,
          type: (r.targetType === "expert" ? "expert" : r.targetType) as ContentReport["type"],
          targetId: r.targetId || "",
          reason: r.reason || "Nội dung vi phạm tiêu chuẩn",
          details: r.description,
          reportedBy: formatUserLabel(r.reporterId),
          reportedUser: formatUserLabel(r.reportedUserId),
          contentPreview: r.description || "(Nội dung bị báo cáo vi phạm tiêu chuẩn cộng đồng)",
          status: (r.status || "open") as ContentReport["status"],
          createdAt: r.createdAt || new Date().toISOString(),
        };
      });
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

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const socket = getAdminSocket(token);

    const handleNewReport = (newReport: any) => {
      const mapped: ContentReport = {
        _id: newReport._id,
        type: (newReport.targetType === "expert" ? "expert" : newReport.targetType) as ContentReport["type"],
        targetId: newReport.targetId || "",
        reason: newReport.reason || "Nội dung vi phạm tiêu chuẩn",
        details: newReport.description,
        reportedBy: formatUserLabel(newReport.reporterId),
        reportedUser: formatUserLabel(newReport.reportedUserId),
        contentPreview: newReport.description || "(Nội dung bị báo cáo vi phạm tiêu chuẩn cộng đồng)",
        status: (newReport.status || "open") as ContentReport["status"],
        createdAt: newReport.createdAt || new Date().toISOString(),
      };

      setReports((prev) => {
        if (prev.some((r) => r._id === mapped._id)) return prev;
        return [mapped, ...prev];
      });
    };

    socket.on("admin:new-report", handleNewReport);

    return () => {
      socket.off("admin:new-report", handleNewReport);
    };
  }, []);

  const handleResolve = async (report: ContentReport) => {
    setResolvingId(report._id);
    const previous = reports;
    setReports((prev) =>
      prev.map((r) => (r._id === report._id ? { ...r, status: "resolved" } : r))
    );
    try {
      await apiHelper.post(API_ENDPOINTS.ADMIN.RESOLVE_REPORT(report._id), { action: "Đã xem xét và xử lý bởi quản trị viên." });
      showToast("Đã đánh dấu xử lý báo cáo thành công.");
    } catch (err) {
      setReports(previous);
      showToast("Lỗi: không thể xử lý báo cáo (backend chưa sẵn sàng).");
    } finally {
      setResolvingId(null);
    }
  };

  const filtered = reports.filter((r) => filter === "all" || r.status === filter);
  const openCount = reports.filter((r) => r.status === "open").length;
  const resolvedCount = reports.filter((r) => r.status === "resolved").length;

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) return <div className="admin-empty-state">Đang tải báo cáo nội dung...</div>;

  return (
    <div className="admin-moderation-container">
      {/* Toast Alert */}
      {toast && (
        <div className="admin-toast">
          <i className="bx bx-check-circle text-lg text-emerald-400"></i>
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="admin-dash-header-card mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="admin-chip-badge teal">An toàn & Kiểm duyệt</span>
              <span className="text-xs text-slate-400 font-medium">Tiêu chuẩn cộng đồng ReMind</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Kiểm duyệt & Báo cáo Nội dung
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Tiếp nhận và xem xét các phản hồi từ người dùng về nội dung bài viết, bình luận hoặc tài khoản vi phạm.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-4 py-2 rounded-2xl">
            <i className="bx bx-error-circle text-xl text-rose-600"></i>
            <span className="text-xs font-extrabold text-rose-800">
              {openCount} báo cáo cần xử lý
            </span>
          </div>
        </div>
      </div>

      {usingMock && (
        <div className="p-3.5 bg-amber-50/90 rounded-2xl border border-amber-200/80 text-xs text-amber-900 flex items-center justify-between gap-3 mb-6 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-base flex-shrink-0">
              <i className="bx bx-info-circle"></i>
            </div>
            <span>
              <strong>Chế độ Mẫu (Mock Data):</strong> Đang hiển thị báo cáo thử nghiệm do backend chưa có endpoint <code>GET /api/admin/reports</code>.
            </span>
          </div>
          <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200/60 whitespace-nowrap">
            Dữ liệu thử nghiệm
          </span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="admin-period-tabs">
          <button
            className={`admin-period-tab ${filter === "open" ? "active" : ""}`}
            onClick={() => setFilter("open")}
          >
            Đang chờ ({openCount})
          </button>
          <button
            className={`admin-period-tab ${filter === "resolved" ? "active" : ""}`}
            onClick={() => setFilter("resolved")}
          >
            Đã xử lý ({resolvedCount})
          </button>
          <button
            className={`admin-period-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Tất cả ({reports.length})
          </button>
        </div>

        <span className="text-xs text-slate-400 font-medium hidden sm:inline">
          Tự động cập nhật qua WebSocket
        </span>
      </div>

      {/* Reports List */}
      <div className="admin-report-list space-y-4">
        {filtered.map((r) => (
          <div
            key={r._id}
            className={`admin-report-card ${r.status === "resolved" ? "resolved opacity-85" : ""}`}
          >
            {/* Header row with distinct badges and timestamp */}
            <div className="admin-report-head mb-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Target Type Chip */}
                <span className={`admin-report-type ${r.type}`}>
                  <i
                    className={`bx mr-1 text-sm ${
                      r.type === "post"
                        ? "bx-file"
                        : r.type === "comment"
                        ? "bx-comment-detail"
                        : r.type === "expert"
                        ? "bx-certification"
                        : "bx-user-x"
                    }`}
                  />
                  <span>
                    {r.type === "post"
                      ? "Bài viết"
                      : r.type === "comment"
                      ? "Bình luận"
                      : r.type === "expert"
                      ? "Chuyên gia"
                      : "Người dùng"}
                  </span>
                </span>

                {/* Reason Tag */}
                <span className="admin-report-reason-chip">
                  <i className="bx bx-shield-quarter text-rose-600 text-sm"></i>
                  <span>Lý do: <strong className="font-extrabold">{r.reason}</strong></span>
                </span>
              </div>

              {/* Timestamp */}
              <div className="admin-report-time">
                <i className="bx bx-time-five text-slate-400 text-sm"></i>
                <span>{formatTime(r.createdAt)}</span>
              </div>
            </div>

            {/* Preview Box */}
            <div className="admin-report-preview">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200/60 text-xs font-bold text-slate-700">
                <i className="bx bxs-quote-alt-left text-teal-600 text-base"></i>
                <span>Nội dung bị phản ánh</span>
              </div>
              <p className="text-sm font-medium text-slate-800 leading-relaxed italic">
                "{r.contentPreview}"
              </p>
              {r.details && r.details !== r.contentPreview && (
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-xs text-slate-600">
                  <strong className="text-slate-700">Ghi chú bổ sung:</strong> {r.details}
                </div>
              )}
            </div>

            {/* Reporter & Details Meta */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-3 flex-wrap text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/60">
                  <i className="bx bx-user-voice text-teal-700 text-sm"></i>
                  <span>Báo cáo bởi: <strong className="text-slate-900 font-bold">{r.reportedBy}</strong></span>
                </div>
                {r.reportedUser && (
                  <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl text-rose-900">
                    <i className="bx bx-user-x text-rose-600 text-sm"></i>
                    <span>Bị báo cáo: <strong className="font-bold">{r.reportedUser}</strong></span>
                  </div>
                )}
              </div>

              <div className="admin-report-actions flex items-center gap-2">
                {r.status === "open" ? (
                  <button
                    className="rm-btn rm-btn-primary font-bold text-xs py-2 px-4 shadow-xs hover:shadow-md transition-all flex items-center gap-1.5"
                    disabled={resolvingId === r._id}
                    onClick={() => handleResolve(r)}
                  >
                    <i className="bx bx-check-double text-lg"></i>
                    <span>{resolvingId === r._id ? "Đang xử lý..." : "Đánh dấu đã xử lý"}</span>
                  </button>
                ) : (
                  <span className="admin-report-resolved flex items-center gap-1.5 text-emerald-700 font-extrabold text-xs bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200">
                    <i className="bx bx-check-circle text-base text-emerald-600"></i>
                    <span>Đã xử lý xong</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="admin-empty-state">
            <i className="bx bx-shield-check text-4xl text-emerald-600 block mb-2"></i>
            Không có báo cáo vi phạm nào trong mục này.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminModeration;
