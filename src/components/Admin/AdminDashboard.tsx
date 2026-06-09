import { useState, useEffect } from "react";
import { DashboardController } from "../../controllers/DashboardController";
import { ExpertController } from "../../controllers/ExpertController";
import { DashboardStats } from "../../models/DashboardStats";
import { Expert } from "../../models/Expert";
import { AdminRoute } from "../../routes/adminRoutes";
import "./Admin.css";

interface AdminDashboardProps {
  onNavigate: (route: AdminRoute) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingExperts, setPendingExperts] = useState<Expert[]>([]);

  // Load stats and pending requests
  const loadDashboardData = () => {
    const computedStats = DashboardController.getStats();
    setStats(computedStats);

    const experts = ExpertController.getExperts();
    const pending = experts.filter((e) => e.approvalStatus === "pending");
    setPendingExperts(pending);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleApprove = (id: number, name: string) => {
    ExpertController.approveExpert(id);
    loadDashboardData();
  };

  const handleSuspend = (id: number, name: string) => {
    ExpertController.suspendExpert(id);
    loadDashboardData();
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit"
    });
  };

  if (!stats) return <div className="admin-empty-state">Đang tải dữ liệu...</div>;

  return (
    <div className="admin-dashboard-container">
      {/* ===== METRICS ROW ===== */}
      <section className="admin-stats-grid">
        {/* Metric 1 */}
        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrapper teal">
            <i className="bx bx-user-voice"></i>
          </div>
          <div className="admin-stat-details">
            <span className="admin-stat-label">Tổng chuyên gia</span>
            <span className="admin-stat-value">{stats.totalExperts}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrapper orange">
            <i className="bx bx-time-five"></i>
          </div>
          <div className="admin-stat-details">
            <span className="admin-stat-label">Đang chờ duyệt</span>
            <span className="admin-stat-value">{stats.pendingApprovals}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrapper blue">
            <i className="bx bx-calendar-check"></i>
          </div>
          <div className="admin-stat-details">
            <span className="admin-stat-label">Lịch hẹn tuần này</span>
            <span className="admin-stat-value">{stats.activeConsultations}</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrapper red">
            <i className="bx bx-error-circle"></i>
          </div>
          <div className="admin-stat-details">
            <span className="admin-stat-label">Báo cáo vi phạm</span>
            <span className="admin-stat-value">{stats.reportedPosts}</span>
          </div>
        </div>
      </section>

      {/* ===== MAIN DASHBOARD ROW ===== */}
      <div className="admin-dashboard-row">
        {/* Left column: Pending Approvals list */}
        <div className="admin-panel-card">
          <h3 className="admin-dashboard-section-title">
            <span>Yêu cầu phê duyệt mới ({pendingExperts.length})</span>
            <button
              onClick={() => onNavigate("expert-crud")}
              style={{ background: "none", border: "none", color: "var(--brand-700)", fontWeight: 6, cursor: "pointer", fontSize: "13px" }}
            >
              Xem tất cả
            </button>
          </h3>

          {pendingExperts.length > 0 ? (
            <div className="admin-pending-list">
              {pendingExperts.slice(0, 5).map((expert) => (
                <div key={expert.id} className="admin-pending-item">
                  <div className="admin-pending-item-left">
                    <div className="admin-pending-avatar">{expert.avatar}</div>
                    <div className="admin-pending-info">
                      <h4>{expert.name}</h4>
                      <p>
                        {expert.specialty} • {expert.experience}
                      </p>
                    </div>
                  </div>

                  <div className="admin-pending-actions">
                    <button
                      className="admin-action-btn-sm approve"
                      onClick={() => handleApprove(expert.id, expert.name)}
                      title="Duyệt hồ sơ"
                    >
                      Duyệt
                    </button>
                    <button
                      className="admin-action-btn-sm reject"
                      onClick={() => handleSuspend(expert.id, expert.name)}
                      title="Từ chối/Đình chỉ"
                    >
                      Đình chỉ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-empty-state">
              <i className="bx bx-check-double" style={{ fontSize: "32px", color: "var(--success)", display: "block", marginBottom: "8px" }}></i>
              Không có hồ sơ nào đang chờ duyệt.
            </div>
          )}
        </div>

        {/* Right column: Recent Activity Logs */}
        <div className="admin-panel-card">
          <h3 className="admin-dashboard-section-title">
            <span>Nhật ký hoạt động</span>
          </h3>

          {stats.recentActions.length > 0 ? (
            <div className="admin-activity-list">
              {stats.recentActions.slice(0, 6).map((log) => (
                <div key={log.id} className="admin-activity-item">
                  <div className={`admin-activity-icon ${log.type}`}>
                    <i
                      className={`bx ${
                        log.type === "approve"
                          ? "bx-check-circle"
                          : log.type === "suspend"
                          ? "bx-block"
                          : log.type === "create"
                          ? "bx-plus-circle"
                          : log.type === "update"
                          ? "bx-edit-alt"
                          : "bx-trash"
                      }`}
                    ></i>
                  </div>
                  <div className="admin-activity-details">
                    <div className="admin-activity-text">
                      <strong>{log.adminName}</strong> đã <span>{log.action.toLowerCase()}</span>:{" "}
                      <strong>{log.targetName}</strong>
                    </div>
                    <div className="admin-activity-time">{formatTime(log.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-empty-state">Chưa có hoạt động nào được ghi lại.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
