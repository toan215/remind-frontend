import React, { useEffect, useState } from "react";
import { ExpertController } from "../../controllers/ExpertController";
import { apiHelper } from "../../utils/apiHelper";
import { API_ENDPOINTS } from "../../utils/constants";
import { getAdminSocket } from "../../utils/adminSocket";
import "./AdminExpertReview.css";

export const AdminExpertReview: React.FC = () => {
  const [experts, setExperts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [detailExpert, setDetailExpert] = useState<any | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchPendingExperts = async () => {
    setLoading(true);
    try {
      const data = await ExpertController.getPendingExperts();
      setExperts(data);
    } catch (err: any) {
      setError("Lỗi khi tải danh sách chuyên gia chờ duyệt.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingExperts();

    // ─── Realtime: lắng nghe khi expert nộp tài liệu mới ───────────────
    const token = localStorage.getItem("accessToken") || "";
    if (token) {
      const socket = getAdminSocket(token);
      const handleNewCredential = (data: { expertName: string; fileName: string }) => {
        showToast(`🔔 ${data.expertName} vừa nộp tài liệu mới: "${data.fileName}". Đang tải lại...`);
        // Tự động refresh danh sách để hiện expert nếu chưa có
        setTimeout(() => fetchPendingExperts(), 800);
      };
      socket.on("admin:new-credential", handleNewCredential);
      return () => {
        socket.off("admin:new-credential", handleNewCredential);
      };
    }
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await ExpertController.approveExpert(id);
      setExperts((prev) => prev.filter((e) => e._id !== id));
      setDetailExpert(null);
      showToast("Đã duyệt hồ sơ chuyên gia thành công!");
    } catch (err: any) {
      showToast("Lỗi khi duyệt chuyên gia.");
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      showToast("Vui lòng nhập lý do từ chối.");
      return;
    }
    try {
      await ExpertController.rejectExpert(id, rejectReason);
      setExperts((prev) => prev.filter((e) => e._id !== id));
      setRejectingId(null);
      setRejectReason("");
      setDetailExpert(null);
      showToast("Đã từ chối hồ sơ chuyên gia.");
    } catch (err: any) {
      showToast("Lỗi khi từ chối chuyên gia.");
    }
  };

  const openLightbox = async (expertId: string, fileId: string) => {
    try {
      const res = await apiHelper.get(API_ENDPOINTS.ADMIN.EXPERT_CREDENTIAL(expertId, fileId), {
        responseType: "blob",
      });
      const url = URL.createObjectURL(res);
      setLightboxUrl(url);
    } catch (err: any) {
      showToast("Lỗi khi tải tài liệu.");
    }
  };

  if (loading) {
    return (
      <div className="admin-expert-review-container">
        <div className="admin-expert-review-loading">
          <span className="admin-spinner" style={{ width: 20, height: 20, border: "3px solid var(--brand-100)", borderTopColor: "var(--brand-600)", borderRadius: 999, display: "inline-block", animation: "fmSpin 0.8s linear infinite" }}></span>
          Đang tải danh sách chuyên gia chờ duyệt...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-expert-review-container">
      {toastMessage && (
        <div className="admin-toast">
          <div className="flex items-center gap-2">
            <i className="bx bx-info-circle text-xl text-teal-400"></i>
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="admin-toast-close">
            <i className="bx bx-x"></i>
          </button>
        </div>
      )}

      <h2>Xét duyệt Chuyên gia</h2>
      <p className="er-subtitle">
        Xem xét hồ sơ, chứng chỉ và thông tin chuyên môn của chuyên gia trước khi phê duyệt tham gia nền tảng ReMind.
      </p>
      {error && <div className="rm-badge rm-badge-error">{error}</div>}

      {experts.length === 0 ? (
        <p className="empty-state">Không có chuyên gia nào chờ duyệt.</p>
      ) : (
        <div className="expert-cards">
          {experts.map((expert) => {
            const profile = expert.expert?.profile || {};
            const credentials = Array.isArray(expert.expert?.credentials) ? expert.expert.credentials : [];
            const initials = (expert.fullName || expert.email || "U")
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <div key={expert._id} className="expert-card">
                <div className="expert-card-header">
                  <div className="er-identity">
                    {expert.avatar ? (
                      <img
                        className="er-avatar"
                        src={expert.avatar}
                        alt={expert.fullName || expert.email}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className="er-avatar">{initials}</div>
                    )}
                    <div className="er-identity-main">
                      <div className="er-name-row">
                        <h3>{expert.fullName || "Chưa cập nhật tên"}</h3>
                        <span className="er-status-pill">
                          <i className="bx bx-time-five"></i> Chờ duyệt
                        </span>
                      </div>
                      <span className="er-expert-id">ID: {expert._id}</span>
                      <div className="er-title-line">{profile.professionalTitle || "Chưa cập nhật chức danh"}</div>
                    </div>
                  </div>
                </div>

                <div className="expert-card-body">
                  <div className="er-meta">
                    <span className="er-meta-item"><strong>Email:</strong> {expert.email}</span>
                    {profile.yearsOfExperience != null && (
                      <span className="er-meta-item"><strong>Kinh nghiệm:</strong> {profile.yearsOfExperience} năm</span>
                    )}
                  </div>

                  <p className="er-bio">
                    <strong style={{ color: "var(--ink-900)" }}>Bio:</strong> {profile.bio || "Chưa cập nhật"}
                  </p>

                  {Array.isArray(profile.specialties) && profile.specialties.length > 0 && (
                    <div className="er-specialties">
                      {profile.specialties.map((s: string, i: number) => (
                        <span key={i} className="er-tag">{s}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="expert-card-actions">
                  {rejectingId === expert._id ? (
                    <div className="reject-form">
                      <textarea
                        className="rm-input-field"
                        placeholder="Lý do từ chối..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={2}
                      />
                      <div className="reject-form-actions">
                        <button className="er-btn er-btn-outline" onClick={() => setRejectingId(null)}>Hủy</button>
                        <button
                          className="er-btn er-btn-reject"
                          style={{ background: "var(--error)", color: "#fff", borderColor: "var(--error)" }}
                          onClick={() => handleReject(expert._id)}
                        >
                          Xác nhận từ chối
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button className="er-btn er-btn-detail" onClick={() => setDetailExpert(expert)}>
                        <i className="bx bx-file-find"></i> Xem Chi tiết
                      </button>
                      <button className="er-btn er-btn-reject" onClick={() => setRejectingId(expert._id)}>
                        <i className="bx bx-x"></i> Từ chối
                      </button>
                      <button className="er-btn er-btn-approve" onClick={() => handleApprove(expert._id)}>
                        <i className="bx bx-check"></i> Chấp nhận
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {detailExpert && (
        <div className="er-overlay" onClick={() => setDetailExpert(null)}>
          <div className="er-modal" onClick={(e) => e.stopPropagation()}>
            <div className="er-modal-head">
              <h3>Hồ sơ Chuyên gia</h3>
              <button className="er-modal-close" onClick={() => setDetailExpert(null)}>
                <i className="bx bx-x"></i>
              </button>
            </div>
            <div className="er-modal-body">
              <div className="er-detail-hero">
                {detailExpert.avatar ? (
                  <img className="er-avatar" src={detailExpert.avatar} alt={detailExpert.fullName || detailExpert.email} />
                ) : (
                  <div className="er-avatar">
                    {(detailExpert.fullName || detailExpert.email || "U").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="er-detail-name">{detailExpert.fullName || "Chưa cập nhật tên"}</h4>
                  <div className="er-detail-title">{(detailExpert.expert?.profile || {}).professionalTitle || "Chưa cập nhật chức danh"}</div>
                  <div className="er-detail-email">{detailExpert.email}</div>
                </div>
              </div>

              <div>
                <h5 className="er-detail-section-title"><i className="bx bx-id-card"></i> Giới thiệu</h5>
                <p className="er-detail-bio">{(detailExpert.expert?.profile || {}).bio || "Chưa cập nhật"}</p>
              </div>

              {(detailExpert.expert?.profile?.specialties?.length > 0 || detailExpert.expert?.profile?.languages?.length > 0) && (
                <div>
                  <h5 className="er-detail-section-title"><i className="bx bx-star"></i> Chuyên môn & Ngôn ngữ</h5>
                  <div className="er-specialties">
                    {(detailExpert.expert?.profile?.specialties || []).map((s: string, i: number) => (
                      <span key={`sp-${i}`} className="er-tag">{s}</span>
                    ))}
                    {(detailExpert.expert?.profile?.languages || []).map((l: string, i: number) => (
                      <span key={`lg-${i}`} className="er-tag" style={{ background: "#eff6ff", color: "#1d4ed8", borderColor: "#bfdbfe" }}>{l}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="er-cert-section">
                <h5 className="er-detail-section-title"><i className="bx bx-award"></i> Xem Chứng chỉ</h5>
                {Array.isArray(detailExpert.expert?.credentials) && detailExpert.expert.credentials.length > 0 ? (
                  <div className="er-cert-grid">
                    {detailExpert.expert.credentials.map((cred: any, i: number) => (
                      <div
                        key={cred.fileId || i}
                        className="er-cert-placeholder"
                        title={cred.fileName || `Chứng chỉ ${i + 1}`}
                        onClick={() => cred.fileId && openLightbox(detailExpert._id, cred.fileId)}
                      >
                        <i className="bx bx-file"></i>
                        {cred.fileName || `Chứng chỉ ${i + 1}`}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: "var(--ink-500)", margin: 0 }}>Chuyên gia chưa tải lên chứng chỉ nào.</p>
                )}
              </div>
            </div>
            <div className="er-modal-foot">
              <button className="er-btn er-btn-reject" onClick={() => { setDetailExpert(null); setRejectingId(detailExpert._id); }}>
                <i className="bx bx-x"></i> Từ chối
              </button>
              <button className="er-btn er-btn-approve" onClick={() => handleApprove(detailExpert._id)}>
                <i className="bx bx-check"></i> Chấp nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div className="er-lightbox" onClick={() => { URL.revokeObjectURL(lightboxUrl); setLightboxUrl(null); }}>
          <button className="er-lightbox-close" onClick={(e) => { e.stopPropagation(); URL.revokeObjectURL(lightboxUrl); setLightboxUrl(null); }}>
            <i className="bx bx-x"></i>
          </button>
          <img src={lightboxUrl} alt="Chứng chỉ" />
        </div>
      )}
    </div>
  );
};
