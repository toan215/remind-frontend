import { useState, useEffect } from 'react';
import { DashboardController } from '../controllers/DashboardController';
import { DashboardStats, ActivityLog } from '../models/DashboardStats';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await DashboardController.getAdminStats();
        setStats(data);
      } catch (err: any) {
        setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="dashboard-loading">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  if (!stats) {
    return null;
  }

  const getIconForAction = (type: string) => {
    switch (type) {
      case 'approve': return 'bx-check-circle';
      case 'suspend': return 'bx-block';
      case 'delete': return 'bx-trash';
      default: return 'bx-edit-alt';
    }
  };

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">Tổng quan hệ thống</h1>

      {/* Stat Cards */}
      <div className="stat-cards-grid">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ backgroundColor: 'var(--blue-100)', color: 'var(--blue-600)'}}><i className='bx bx-user-pin'></i></div>
          <div className="stat-card-info">
            <span className="stat-card-value">{stats.totalExperts}</span>
            <span className="stat-card-label">Tổng số chuyên gia</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ backgroundColor: 'var(--orange-100)', color: 'var(--orange-600)'}}><i className='bx bx-time-five'></i></div>
          <div className="stat-card-info">
            <span className="stat-card-value">{stats.pendingApprovals}</span>
            <span className="stat-card-label">Hồ sơ chờ duyệt</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ backgroundColor: 'var(--teal-100)', color: 'var(--teal-600)'}}><i className='bx bx-headphone'></i></div>
          <div className="stat-card-info">
            <span className="stat-card-value">{stats.activeConsultations}</span>
            <span className="stat-card-label">Lượt tư vấn hoạt động</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ backgroundColor: 'var(--red-100)', color: 'var(--red-600)'}}><i className='bx bx-error-circle'></i></div>
          <div className="stat-card-info">
            <span className="stat-card-value">{stats.reportedPosts}</span>
            <span className="stat-card-label">Bài viết bị báo cáo</span>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="recent-activities">
        <h2 className="section-title">Hoạt động gần đây</h2>
        <div className="activity-list">
          {stats.recentActions.length > 0 ? (
            stats.recentActions.map((log: ActivityLog) => (
              <div key={log.id} className="activity-item">
                <div className={`activity-icon ${log.type}`}>
                  <i className={`bx ${getIconForAction(log.type)}`}></i>
                </div>
                <div className="activity-details">
                  <p>
                    <strong>{log.adminName}</strong> đã {log.action.toLowerCase()} <strong>{log.targetName}</strong>.
                  </p>
                  <span className="activity-time">
                    {new Date(log.timestamp).toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p>Chưa có hoạt động nào.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;