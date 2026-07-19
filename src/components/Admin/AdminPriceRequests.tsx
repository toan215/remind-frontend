import { useState } from "react";
import { AdminRoute } from "../../routes/adminRoutes";
import "./Admin.css";
import "./AdminPriceRequests.css";

interface Certificate {
  name: string;
  image?: string;
}

interface PriceRequest {
  id: string;
  expertId: string;
  expertName: string;
  expertAvatar: string;
  avatarUrl?: string;
  email: string;
  bio: string;
  professionalTitle: string;
  education: string[];
  experience: string[];
  certificates: Certificate[];
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

const formatVND = (val: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);

export default function AdminPriceRequests({ onNavigate }: AdminPriceRequestsProps) {
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<PriceRequest | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCerts, setShowCerts] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [requests, setRequests] = useState<PriceRequest[]>([
    {
      id: "REQ-301",
      expertId: "EXP-101",
      expertName: "BS. Nguyễn Văn An",
      expertAvatar: "A",
      avatarUrl: "https://i.pravatar.cc/150?img=12",
      email: "nguyenvanan@remind.vn",
      bio: "Bác sĩ chuyên khoa II Tâm thần với hơn 12 năm kinh nghiệm điều trị các rối loạn lo âu, trầm cảm và mất ngủ cho người trưởng thành.",
      professionalTitle: "Bác sĩ Chuyên khoa II Tâm thần",
      education: [
        "Bác sĩ Đa khoa — ĐH Y Hà Nội (2008)",
        "Thạc sĩ Tâm thần học — ĐH Y Dược TP.HCM (2013)",
        "Chuyên khoa II Tâm thần — Viện Sức khỏe Tâm thần (2018)",
      ],
      experience: [
        "Trưởng khoa Tâm thần — Bệnh viện Đa khoa Tâm Anh (2019–nay)",
        "Bác sĩ điều trị viên — Trung tâm Tâm lý ReMind (2016–nay)",
      ],
      certificates: [
        { name: "Chứng chỉ Hành nghề" },
        { name: "Certificate in CBT (UK)" },
        { name: "Chuyên khoa II" },
      ],
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
      avatarUrl: "https://i.pravatar.cc/150?img=45",
      email: "lethimai@remind.vn",
      bio: "Thạc sĩ Tâm lý học Lâm sàng, chuyên hỗ trợ liệu pháp quản lý căng thẳng, lo âu và cân bằng cảm xúc cho người trẻ.",
      professionalTitle: "Thạc sĩ Tâm lý học Lâm sàng",
      education: [
        "Cử nhân Tâm lý học — ĐH Khoa học Xã hội & Nhân văn (2014)",
        "Thạc sĩ Tâm lý học Lâm sàng — ĐH Giáo dục (2017)",
      ],
      experience: [
        "Chuyên viên tham vấn — Trung tâm ReMind (2018–nay)",
        "Cộng tác viên — Dự án Sức khỏe học đường (2020–2023)",
      ],
      certificates: [
        { name: "Chứng chỉ Tham vấn" },
        { name: "EMDR Basic Training" },
      ],
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
      avatarUrl: "https://i.pravatar.cc/150?img=33",
      email: "hoangquocbao@remind.vn",
      bio: "Tiến sĩ Tâm lý học Hành vi, nghiên cứu và trị liệu chuyên sâu các rối loạn tâm lý phức tạp.",
      professionalTitle: "Tiến sĩ Tâm lý học Hành vi",
      education: [
        "Tiến sĩ Tâm lý học Hành vi — ĐH Quốc gia (2019)",
        "Thạc sĩ Tâm lý học — ĐH Amsterdam (2015)",
      ],
      experience: [
        "Giảng viên kiêm trị liệu viên — ReMind (2020–nay)",
      ],
      certificates: [
        { name: "PhD Certificate" },
        { name: "Licensed Psychologist" },
      ],
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
      avatarUrl: "https://i.pravatar.cc/150?img=20",
      email: "phamthihuong@remind.vn",
      bio: "Chuyên gia tư vấn giấc ngủ và thiền định, đồng hành cùng khách hàng cải thiện chất lượng nghỉ ngơi.",
      professionalTitle: "Chuyên gia Tư vấn Giấc ngủ",
      education: ["Cử nhân Y tế công cộng — ĐH Y tế công cộng (2012)"],
      experience: ["Chuyên viên tư vấn — ReMind (2017–nay)"],
      certificates: [{ name: "Sleep Coach Cert." }],
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
      avatarUrl: "https://i.pravatar.cc/150?img=51",
      email: "dangminhtuan@remind.vn",
      bio: "Tư vấn viên hôn nhân & gia đình với phương pháp tham vấn nhân văn.",
      professionalTitle: "Tư vấn Viên Hôn nhân & Gia đình",
      education: ["Thạc sĩ Công tác xã hội — ĐH Mở (2016)"],
      experience: ["Tham vấn viên — ReMind (2018–nay)"],
      certificates: [{ name: "Counseling Cert." }],
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

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleApprove = (req: PriceRequest) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === req.id
          ? { ...r, status: "approved", reviewedAt: new Date().toLocaleString("vi-VN") }
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

  const openDetail = (req: PriceRequest) => {
    setSelectedRequest(req);
    setShowCerts(false);
    setShowDetailModal(true);
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

  const tabs = [
    { id: "pending", label: `Chờ xét duyệt (${pendingCount})` },
    { id: "approved", label: "Đã phê duyệt" },
    { id: "rejected", label: "Đã từ chối" },
    { id: "all", label: "Tất cả" },
  ] as const;

  return (
    <div className="pr-page">
      {toast && (
        <div className={`pr-toast ${toast.type}`}>
          <i className={`bx ${toast.type === "success" ? "bx-check-circle" : "bx-x-circle"}`}></i>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="pr-header">
        <div>
          <h2 className="pr-title">Xét duyệt Yêu cầu Đổi giá Dịch vụ</h2>
          <p className="pr-subtitle">
            Quản lý và xét duyệt các yêu cầu thay đổi bảng giá tư vấn do Chuyên gia gửi lên.
          </p>
        </div>
        <button className="rm-btn rm-btn-outline text-xs" onClick={() => onNavigate("expert-review")}>
          <i className="bx bx-user-check"></i> Xét duyệt Hồ sơ Chuyên gia
        </button>
      </div>

      {/* Tabs + Search */}
      <div className="pr-toolbar">
        <div className="pr-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`pr-tab ${filterStatus === tab.id ? "active" : ""}`}
              onClick={() => setFilterStatus(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="pr-search">
          <i className="bx bx-search"></i>
          <input
            type="text"
            placeholder="Tìm theo tên chuyên gia, dịch vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="pr-list">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((req) => {
            const diffAmount = req.requestedPrice - req.currentPrice;
            const diffPercent = Math.round((diffAmount / req.currentPrice) * 100);

            return (
              <div key={req.id} className="pr-card">
                <div className="pr-card-top">
                  <div className="pr-expert">
                    {req.avatarUrl ? (
                      <img
                        className="pr-avatar"
                        src={req.avatarUrl}
                        alt={req.expertName}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className="pr-avatar">{req.expertAvatar}</div>
                    )}
                    <div>
                      <h4 className="pr-expert-name">
                        {req.expertName}
                        <span className={`pr-status-pill ${req.status}`}>
                          {req.status === "pending" ? "CHỜ DUYỆT" : req.status === "approved" ? "ĐÃ DUYỆT" : "TỪ CHỐI"}
                        </span>
                      </h4>
                      <span className="pr-req-id">{req.id}</span>
                      <div className="pr-title-line">{req.professionalTitle}</div>
                      <span className="pr-service-chip">
                        <i className="bx bx-bookmark-alt"></i> {req.serviceName}
                      </span>
                    </div>
                  </div>

                  <div className="pr-price">
                    <div className="pr-price-col">
                      <span className="pr-label">Giá hiện tại</span>
                      <span className="pr-price-old">{formatVND(req.currentPrice)}</span>
                    </div>
                    <span className="pr-price-arrow">→</span>
                    <div className="pr-price-col">
                      <span className="pr-label">Mức giá mới</span>
                      <span className="pr-price-new">
                        {formatVND(req.requestedPrice)}
                        <span className={`pr-diff ${diffPercent > 0 ? "up" : "down"}`}>
                          {diffPercent > 0 ? `+${diffPercent}%` : `${diffPercent}%`}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pr-card-bottom">
                  <div className="pr-reason">
                    <span className="pr-reason-label">Lý do điều chỉnh giá từ Chuyên gia:</span>
                    <p className="pr-reason-text">"{req.reason}"</p>
                    <span className="pr-reason-time">Gửi lúc: {req.requestedAt}</span>
                  </div>

                  <div className="pr-actions">
                    {req.status === "pending" ? (
                      <>
                        <button className="pr-btn pr-btn-detail" onClick={() => openDetail(req)}>
                          <i className="bx bx-file-find"></i> Xem Chi tiết
                        </button>
                        <button className="pr-btn pr-btn-reject" onClick={() => handleOpenRejectModal(req)}>
                          <i className="bx bx-x"></i> Từ chối
                        </button>
                        <button className="pr-btn pr-btn-approve" onClick={() => handleApprove(req)}>
                          <i className="bx bx-check"></i> Phê duyệt Mức Giá
                        </button>
                      </>
                    ) : (
                      <div className="pr-resolved">
                        <span className={`pr-resolved-pill ${req.status}`}>
                          {req.status === "approved" ? "Đã Phê Duyệt" : "Đã Từ Chối"}
                        </span>
                        {req.reviewedAt && <span className="pr-resolved-time">Xử lý lúc: {req.reviewedAt}</span>}
                        {req.reviewNote && <div className="pr-resolved-note">Lý do: {req.reviewNote}</div>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="pr-empty">
            <i className="bx bx-check-circle"></i>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-600)", margin: 0 }}>
              Không có yêu cầu đổi giá nào phù hợp.
            </p>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="pr-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="pr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pr-modal-head">
              <h3>Từ chối Yêu cầu Đổi giá</h3>
              <button className="pr-modal-close" onClick={() => setShowRejectModal(false)}>
                <i className="bx bx-x"></i>
              </button>
            </div>
            <div className="pr-modal-body">
              <p style={{ fontSize: 13, color: "var(--ink-600)", margin: 0 }}>
                Bạn đang từ chối đề xuất giá mới ({formatVND(selectedRequest.requestedPrice)}) của{" "}
                <strong>{selectedRequest.expertName}</strong>.
              </p>
              <div>
                <label className="pr-detail-section-title">Lý do từ chối (Gửi thông báo cho chuyên gia)</label>
                <textarea
                  rows={3}
                  className="pr-reason-text"
                  style={{ width: "100%", border: "1px solid var(--pr-border)", borderRadius: 12, padding: 12, fontSize: 13, fontFamily: "inherit", resize: "vertical", color: "var(--pr-ink-900)" }}
                  placeholder="Nhập lý do từ chối (ví dụ: Mức giá đề xuất vượt khung quy định của nền tảng...)"
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                />
              </div>
            </div>
            <div className="pr-modal-foot">
              <button className="pr-btn pr-btn-outline" onClick={() => setShowRejectModal(false)}>Hủy bỏ</button>
              <button
                className="pr-btn pr-btn-reject"
                onClick={handleConfirmReject}
                style={{ background: "#dc2626", color: "#fff", borderColor: "#dc2626" }}
              >
                Xác nhận Từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="pr-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="pr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pr-modal-head">
              <h3>Hồ sơ Chuyên gia</h3>
              <button className="pr-modal-close" onClick={() => setShowDetailModal(false)}>
                <i className="bx bx-x"></i>
              </button>
            </div>
            <div className="pr-modal-body">
              <div className="pr-detail-hero">
                {selectedRequest.avatarUrl ? (
                  <img className="pr-avatar" src={selectedRequest.avatarUrl} alt={selectedRequest.expertName} />
                ) : (
                  <div className="pr-avatar">{selectedRequest.expertAvatar}</div>
                )}
                <div>
                  <h4 className="pr-detail-name">{selectedRequest.expertName}</h4>
                  <div className="pr-detail-title">{selectedRequest.professionalTitle}</div>
                  <div className="pr-detail-email">{selectedRequest.email}</div>
                </div>
              </div>

              <div>
                <h5 className="pr-detail-section-title"><i className="bx bx-id-card"></i> Giới thiệu</h5>
                <p className="pr-detail-bio">{selectedRequest.bio}</p>
              </div>

              <div>
                <h5 className="pr-detail-section-title"><i className="bx bx-graduation"></i> Học vấn</h5>
                <ul className="pr-detail-list">
                  {selectedRequest.education.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>

              <div>
                <h5 className="pr-detail-section-title"><i className="bx bx-briefcase"></i> Kinh nghiệm</h5>
                <ul className="pr-detail-list">
                  {selectedRequest.experience.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>

              <div>
                <h5 className="pr-detail-section-title"><i className="bx bx-award"></i> Chứng chỉ</h5>
                <button className="pr-cert-btn" onClick={() => setShowCerts((s) => !s)}>
                  <i className="bx bx-image-alt"></i>
                  {showCerts ? "Ẩn chứng chỉ" : `Xem Chứng chỉ (${selectedRequest.certificates.length})`}
                </button>
                {showCerts && (
                  <div className="pr-cert-grid">
                    {selectedRequest.certificates.map((c, i) => (
                      c.image ? (
                        <img key={i} className="pr-cert-thumb" src={c.image} alt={c.name} />
                      ) : (
                        <div key={i} className="pr-cert-placeholder" title={c.name}>
                          <i className="bx bx-file"></i>
                          {c.name}
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="pr-modal-foot">
              <button className="pr-btn pr-btn-approve" onClick={() => { setShowDetailModal(false); handleApprove(selectedRequest); }}>
                <i className="bx bx-check"></i> Phê duyệt Mức Giá
              </button>
              <button className="pr-btn pr-btn-reject" onClick={() => { setShowDetailModal(false); handleOpenRejectModal(selectedRequest); }}>
                <i className="bx bx-x"></i> Từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
