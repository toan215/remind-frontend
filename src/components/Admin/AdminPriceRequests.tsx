import { useState } from "react";
import { AdminRoute } from "../../routes/adminRoutes";
import "./Admin.css";

interface PriceRequest {
  id: string;
  expertId: string;
  expertName: string;
  expertAvatar: string;
  professionalTitle: string;
  serviceName: string;
  currentPrice: number;
  requestedPrice: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  reviewedAt?: string;
  reviewNote?: string;
}

interface AdminPriceRequestsProps {
  onNavigate: (route: AdminRoute) => void;
}

export default function AdminPriceRequests({ onNavigate }: AdminPriceRequestsProps) {
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<PriceRequest | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [requests, setRequests] = useState<PriceRequest[]>([
    {
      id: "REQ-301",
      expertId: "EXP-101",
      expertName: "BS. Nguyễn Văn An",
      expertAvatar: "A",
      professionalTitle: "Bác sĩ Chuyên khoa II Tâm thần",
      serviceName: "Tư vấn tâm lý trực tuyến (60 phút)",
      currentPrice: 500000,
      requestedPrice: 650000,
      reason: "Cập nhật chứng chỉ chuyên môn cao cấp cấp quốc tế và kinh nghiệm làm việc 12 năm.",
      status: "pending",
      requestedAt: "2026-07-19 08:15",
    },
    {
      id: "REQ-302",
      expertId: "EXP-104",
      expertName: "ThS. Lê Thị Mai",
      expertAvatar: "M",
      professionalTitle: "Thạc sĩ Tâm lý học Lâm sàng",
      serviceName: "Liệu pháp Quản lý Căng thẳng & Lo âu",
      currentPrice: 600000,
      requestedPrice: 750000,
      reason: "Điều chỉnh chi phí theo quy định mới của phòng khám đối tác.",
      status: "pending",
      requestedAt: "2026-07-18 15:30",
    },
    {
      id: "REQ-303",
      expertId: "EXP-108",
      expertName: "TS. Hoàng Quốc Bảo",
      expertAvatar: "B",
      professionalTitle: "Tiến sĩ Tâm lý học Hành vi",
      serviceName: "Đánh giá Chuyên sâu Rối loạn Tâm lý",
      currentPrice: 800000,
      requestedPrice: 1000000,
      reason: "Tăng thời lượng tham vấn lên 90 phút và bao gồm bộ công cụ trắc nghiệm tâm lý.",
      status: "pending",
      requestedAt: "2026-07-17 11:45",
    },
    {
      id: "REQ-300",
      expertId: "EXP-102",
      expertName: "BS. Phạm Thị Hương",
      expertAvatar: "H",
      professionalTitle: "Chuyên gia Tư vấn Giấc ngủ",
      serviceName: "Tư vấn Giấc ngủ & Thiền định",
      currentPrice: 450000,
      requestedPrice: 550000,
      reason: "Điều chỉnh giá theo thị trường.",
      status: "approved",
      requestedAt: "2026-07-15 09:00",
      reviewedAt: "2026-07-15 14:20",
    },
    {
      id: "REQ-299",
      expertId: "EXP-105",
      expertName: "ThS. Đặng Minh Tuấn",
      expertAvatar: "T",
      professionalTitle: "Tư vấn Viên Hôn nhân & Gia đình",
      serviceName: "Tham vấn Mối quan hệ",
      currentPrice: 700000,
      requestedPrice: 1200000,
      reason: "Đề xuất mức giá mới.",
      status: "rejected",
      requestedAt: "2026-07-14 10:10",
      reviewedAt: "2026-07-14 11:30",
      reviewNote: "Mức giá đề xuất tăng quá 70% vượt mức quy định khung giá của hệ thống.",
    },
  ]);

  const handleApprove = (req: PriceRequest) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === req.id
          ? {
              ...r,
              status: "approved",
              reviewedAt: new Date().toLocaleString("vi-VN"),
            }
          : r
      )
    );
    showToast(`Đã phê duyệt mức giá mới (${formatVND(req.requestedPrice)}) cho ${req.expertName}!`, "success");
  };

  const handleOpenRejectModal = (req: PriceRequest) => {
    setSelectedRequest(req);
    setRejectionNote("");
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    if (!selectedRequest) return;
    setRequests((prev) =>
      prev.map((r) =>
        r.id === selectedRequest.id
          ? {
              ...r,
              status: "rejected",
              reviewedAt: new Date().toLocaleString("vi-VN"),
              reviewNote: rejectionNote || "Không đáp ứng tiêu chuẩn điều chỉnh giá.",
            }
          : r
      )
    );
    setShowRejectModal(false);
    showToast(`Đã từ chối yêu cầu đổi giá của ${selectedRequest.expertName}.`, "error");
    setSelectedRequest(null);
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const formatVND = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  const filteredRequests = requests.filter((r) => {
    const matchesStatus = filterStatus === "all" || r.status === filterStatus;
    const matchesSearch =
      r.expertName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="admin-price-requests-container">
      {toast && (
        <div
          className={`p-3 rounded-lg shadow-lg mb-4 flex items-center justify-between animate-fade-in text-sm font-medium ${
            toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <i className={`bx ${toast.type === "success" ? "bx-check-circle" : "bx-x-circle"} text-lg`}></i>
            {toast.message}
          </div>
          <button onClick={() => setToast(null)} className="text-white">
            <i className="bx bx-x"></i>
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="admin-page-header flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Xét duyệt Yêu cầu Đổi giá Dịch vụ</h2>
          <p className="text-sm text-gray-500">
            Quản lý và xét duyệt các yêu cầu thay đổi bảng giá tư vấn do Chuyên gia gửi lên.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="rm-btn rm-btn-outline text-xs"
            onClick={() => onNavigate("expert-review")}
          >
            <i className="bx bx-user-check"></i> Xét duyệt Hồ sơ Chuyên gia
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="admin-panel-card mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex gap-2">
            {[
              { id: "pending", label: `Chờ xét duyệt (${pendingCount})` },
              { id: "approved", label: "Đã phê duyệt" },
              { id: "rejected", label: "Đã từ chối" },
              { id: "all", label: "Tất cả" },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`py-2 px-4 text-xs font-semibold rounded-xl border transition-all ${
                  filterStatus === tab.id
                    ? "bg-teal-600 text-white border-teal-600 shadow"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => setFilterStatus(tab.id as any)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <input
              type="text"
              className="rm-input-field text-xs pl-8 pr-3 py-2 w-full"
              placeholder="Tìm theo tên chuyên gia, dịch vụ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="bx bx-search absolute left-2.5 top-2.5 text-gray-400 text-sm"></i>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((req) => {
            const diffAmount = req.requestedPrice - req.currentPrice;
            const diffPercent = Math.round((diffAmount / req.currentPrice) * 100);

            return (
              <div
                key={req.id}
                className="admin-panel-card hover:border-teal-300 transition-all border border-gray-200 shadow-sm"
              >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-gray-100 mb-4">
                  {/* Expert Profile & Service Details */}
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-lg flex-shrink-0">
                      {req.expertAvatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900 text-base">{req.expertName}</h4>
                        <span className="text-xs text-gray-400 font-mono">({req.id})</span>
                      </div>
                      <p className="text-xs text-teal-700 font-medium mb-1">{req.professionalTitle}</p>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold">
                        <i className="bx bx-bookmark-alt text-teal-600"></i> {req.serviceName}
                      </div>
                    </div>
                  </div>

                  {/* Price Comparison Badge */}
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-gray-400 block">Giá hiện tại</span>
                      <span className="font-semibold text-gray-600 line-through">{formatVND(req.currentPrice)}</span>
                    </div>

                    <div className="text-teal-500 font-bold text-lg">→</div>

                    <div>
                      <span className="text-xs text-gray-500 font-semibold block">Mức giá mới đề xuất</span>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-teal-800 text-lg">{formatVND(req.requestedPrice)}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            diffPercent > 0 ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {diffPercent > 0 ? `+${diffPercent}%` : `${diffPercent}%`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reason Body & Action Footer */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1 bg-teal-50/50 p-3 rounded-xl border border-teal-100">
                    <span className="text-xs font-bold text-teal-800 block mb-1">
                      Lý do điều chỉnh giá từ Chuyên gia:
                    </span>
                    <p className="text-xs text-gray-700 italic">"{req.reason}"</p>
                    <span className="text-[11px] text-gray-400 block mt-1">Gửi lúc: {req.requestedAt}</span>
                  </div>

                  {/* Status or Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    {req.status === "pending" ? (
                      <>
                        <button
                          className="rm-btn rm-btn-outline text-xs text-red-600 hover:bg-red-50 border-red-200"
                          onClick={() => handleOpenRejectModal(req)}
                        >
                          <i className="bx bx-x"></i> Từ chối
                        </button>
                        <button
                          className="rm-btn rm-btn-primary text-xs"
                          onClick={() => handleApprove(req)}
                        >
                          <i className="bx bx-check"></i> Phê duyệt Mức Giá
                        </button>
                      </>
                    ) : (
                      <div className="text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                            req.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {req.status === "approved" ? "Đã Phê Duyệt" : "Đã Từ Chối"}
                        </span>
                        {req.reviewedAt && (
                          <span className="text-[11px] text-gray-400 block mt-1">
                            Xử lý lúc: {req.reviewedAt}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="admin-panel-card text-center py-12 text-gray-400">
            <i className="bx bx-check-circle text-4xl text-teal-500 mb-2"></i>
            <p className="text-sm font-medium text-gray-600">Không có yêu cầu đổi giá nào phù hợp.</p>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Từ chối Yêu cầu Đổi giá</h3>
            <p className="text-xs text-gray-600 mb-4">
              Bạn đang từ chối đề xuất giá mới ({formatVND(selectedRequest.requestedPrice)}) của{" "}
              <strong>{selectedRequest.expertName}</strong>.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Lý do từ chối (Gửi thông báo cho chuyên gia)
              </label>
              <textarea
                rows={3}
                className="rm-input-field text-xs w-full"
                placeholder="Nhập lý do từ chối (ví dụ: Mức giá đề xuất vượt khung quy định của nền tảng...)"
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                className="rm-btn rm-btn-outline text-xs"
                onClick={() => setShowRejectModal(false)}
              >
                Hủy bỏ
              </button>
              <button
                className="rm-btn text-xs bg-red-600 text-white hover:bg-red-700"
                onClick={handleConfirmReject}
              >
                Xác nhận Từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
