import React, { useEffect, useState } from "react";
import { ExpertController } from "../../controllers/ExpertController";
import { apiHelper } from "../../utils/apiHelper";
import { API_ENDPOINTS } from "../../utils/constants";
import "./AdminExpertReview.css";

export const AdminExpertReview: React.FC = () => {
  const [experts, setExperts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

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
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await ExpertController.approveExpert(id);
      setExperts((prev) => prev.filter((e) => e._id !== id));
    } catch (err: any) {
      alert("Lỗi khi duyệt chuyên gia.");
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối.");
      return;
    }
    try {
      await ExpertController.rejectExpert(id, rejectReason);
      setExperts((prev) => prev.filter((e) => e._id !== id));
      setRejectingId(null);
      setRejectReason("");
    } catch (err: any) {
      alert("Lỗi khi từ chối chuyên gia.");
    }
  };

  const viewCredential = async (expertId: string, fileId: string) => {
    try {
      const res = await apiHelper.get(API_ENDPOINTS.ADMIN.EXPERT_CREDENTIAL(expertId, fileId), {
        responseType: "blob",
      });
      const url = URL.createObjectURL(res);
      window.open(url);
    } catch (err: any) {
      alert("Lỗi khi tải tài liệu.");
    }
  };

  if (loading) {
    return <div className="admin-expert-review-loading">Đang tải...</div>;
  }

  return (
    <div className="admin-expert-review-container">
      <h2>Xét duyệt Chuyên gia</h2>
      {error && <div className="rm-badge rm-badge-error">{error}</div>}

      {experts.length === 0 ? (
        <p className="empty-state">Không có chuyên gia nào chờ duyệt.</p>
      ) : (
        <div className="expert-cards">
          {experts.map((expert) => (
            <div key={expert._id} className="expert-card">
              <div className="expert-card-header">
                <h3>{expert.fullName || expert.email}</h3>
                <span className="rm-badge rm-badge-warning">Chờ duyệt</span>
              </div>
              <div className="expert-card-body">
                <p><strong>Email:</strong> {expert.email}</p>
                <p><strong>Chức danh:</strong> {expert.expert?.profile?.professionalTitle || "Chưa cập nhật"}</p>
                <p className="expert-bio"><strong>Bio:</strong> {expert.expert?.profile?.bio || "Chưa cập nhật"}</p>
                
                {Array.isArray(expert.expert?.credentials) && expert.expert.credentials.length > 0 && (
                  <div className="credential-section">
                    {expert.expert.credentials.map((cred: any, i: number) => (
                      <button
                        key={cred.fileId || i}
                        className="rm-btn rm-btn-outline btn-small"
                        onClick={() => viewCredential(expert._id, cred.fileId)}
                      >
                        Xem tài liệu {i + 1}: {cred.fileName}
                      </button>
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
                      <button
                        className="rm-btn rm-btn-outline btn-small"
                        onClick={() => setRejectingId(null)}
                      >
                        Hủy
                      </button>
                      <button
                        className="rm-btn rm-btn-primary btn-small"
                        style={{ backgroundColor: "var(--error)", borderColor: "var(--error)" }}
                        onClick={() => handleReject(expert._id)}
                      >
                        Xác nhận từ chối
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      className="rm-btn rm-btn-outline"
                      onClick={() => setRejectingId(expert._id)}
                    >
                      Từ chối
                    </button>
                    <button
                      className="rm-btn rm-btn-primary"
                      onClick={() => handleApprove(expert._id)}
                    >
                      Chấp nhận
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
