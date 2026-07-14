import { useState, useEffect } from 'react';
import { ExpertController } from '../controllers/ExpertController'; // Giả định ExpertController có hàm getDashboard
import './ExpertDashboard.css';

interface ExpertDashboardData {
    upcomingAppointments: any[];
    stats: {
        completedSessions: number;
        monthlyEarnings: number;
        rating: number;
    };
    profileCompletion: number;
}

const ExpertDashboard = () => {
    const [data, setData] = useState<ExpertDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Giả sử ExpertController đã được cập nhật để có phương thức này
                const result = await ExpertController.getDashboard();
                setData(result);
            } catch (err) {
                setError('Không thể tải dữ liệu dashboard của chuyên gia.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="dashboard-loading">Đang tải...</div>;
    if (error) return <div className="dashboard-error">{error}</div>;
    if (!data) return null;

    return (
        <div className="expert-dashboard">
            <h1 className="dashboard-title">Bảng điều khiển của Chuyên gia</h1>

            {/* Stat Cards */}
            <div className="stat-cards-grid">
                <div className="stat-card">
                    <div className="stat-card-info">
                        <span className="stat-card-value">{data.stats.completedSessions}</span>
                        <span className="stat-card-label">Số ca hoàn thành</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-info">
                        <span className="stat-card-value">{data.stats.monthlyEarnings.toLocaleString('vi-VN')}đ</span>
                        <span className="stat-card-label">Thu nhập tháng này</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-info">
                        <span className="stat-card-value">★ {data.stats.rating}</span>
                        <span className="stat-card-label">Đánh giá trung bình</span>
                    </div>
                </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="upcoming-appointments">
                <h2 className="section-title">Lịch hẹn sắp tới</h2>
                <div className="appointment-list">
                    {data.upcomingAppointments.length > 0 ? (
                        data.upcomingAppointments.map(appt => (
                            <div key={appt.id} className="appointment-item">
                                <div className="appointment-details">
                                    <p><strong>Học sinh:</strong> {appt.studentName}</p>
                                    <p><strong>Thời gian:</strong> {new Date(appt.time).toLocaleString('vi-VN')}</p>
                                </div>
                                <button className="rm-btn rm-btn-primary">Bắt đầu tư vấn</button>
                            </div>
                        ))
                    ) : (
                        <p>Không có lịch hẹn nào sắp tới.</p>
                    )}
                </div>
            </div>

             {/* Profile Completion */}
            <div className="profile-completion">
                <h2 className="section-title">Hoàn thiện hồ sơ</h2>
                <p>Hồ sơ của bạn đã hoàn thiện {data.profileCompletion}%. Hãy cập nhật để thu hút thêm học viên!</p>
                <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${data.profileCompletion}%` }}></div>
                </div>
            </div>
        </div>
    );
};

export default ExpertDashboard;