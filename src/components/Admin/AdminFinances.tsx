import { useState } from "react";
import { AdminRoute } from "../../routes/adminRoutes";
import { RevenueGrowthChart } from "./RevenueGrowthChart";
import "./Admin.css";

interface Transaction {
  id: string;
  expertName: string;
  userName: string;
  serviceType: string;
  amount: number;
  commissionAmount: number;
  netPayout: number;
  status: "completed" | "pending" | "refunded";
  date: string;
}

interface AdminFinancesProps {
  onNavigate: (route: AdminRoute) => void;
}

export default function AdminFinances({ onNavigate }: AdminFinancesProps) {
  const [timeRange, setTimeRange] = useState<"month" | "quarter" | "year">("month");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "pending" | "refunded">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Sample financial data
  const financialSummary = {
    totalRevenue: 154200000, // 154.2M VND
    platformCommission: 23130000, // 15% platform fee = 23.13M VND
    expertPayouts: 131070000, // 131.07M VND
    totalTransactions: 342,
    avgTransactionValue: 450877,
    currentCommissionRate: 15,
  };

  const monthlyChartData = [
    { month: "Tháng 2", revenue: 18500000, commission: 2775000, consultations: 42 },
    { month: "Tháng 3", revenue: 22400000, commission: 3360000, consultations: 51 },
    { month: "Tháng 4", revenue: 26800000, commission: 4020000, consultations: 59 },
    { month: "Tháng 5", revenue: 31200000, commission: 4680000, consultations: 68 },
    { month: "Tháng 6", revenue: 38500000, commission: 5775000, consultations: 84 },
    { month: "Tháng 7", revenue: 42100000, commission: 6315000, consultations: 92 },
  ];

  const transactions: Transaction[] = [
    {
      id: "TXN-90812",
      expertName: "BS. Nguyễn Văn An",
      userName: "Trần Minh Khoa",
      serviceType: "Tư vấn tâm lý trực tuyến (60 phút)",
      amount: 500000,
      commissionAmount: 75000,
      netPayout: 425000,
      status: "completed",
      date: "2026-07-19 09:30",
    },
    {
      id: "TXN-90811",
      expertName: "ThS. Lê Thị Mai",
      userName: "Phạm Hồng Nhung",
      serviceType: "Liệu pháp quản lý căng thẳng",
      amount: 600000,
      commissionAmount: 90000,
      netPayout: 510000,
      status: "completed",
      date: "2026-07-18 16:45",
    },
    {
      id: "TXN-90810",
      expertName: "TS. Hoàng Quốc Bảo",
      userName: "Vũ Tuấn Anh",
      serviceType: "Đánh giá rối loạn lo âu",
      amount: 800000,
      commissionAmount: 120000,
      netPayout: 680000,
      status: "completed",
      date: "2026-07-18 14:15",
    },
    {
      id: "TXN-90809",
      expertName: "BS. Phạm Thị Hương",
      userName: "Đỗ Gia Huy",
      serviceType: "Tư vấn giấc ngủ & thiền định",
      amount: 450000,
      commissionAmount: 67500,
      netPayout: 382500,
      status: "pending",
      date: "2026-07-18 10:20",
    },
    {
      id: "TXN-90808",
      expertName: "ThS. Đặng Minh Tuấn",
      userName: "Bùi Khánh Linh",
      serviceType: "Tư vấn mối quan hệ & gia đình",
      amount: 700000,
      commissionAmount: 105000,
      netPayout: 595000,
      status: "completed",
      date: "2026-07-17 19:00",
    },
    {
      id: "TXN-90807",
      expertName: "BS. Nguyễn Văn An",
      userName: "Ngô Quốc Việt",
      serviceType: "Tư vấn tâm lý trực tuyến (60 phút)",
      amount: 500000,
      commissionAmount: 75000,
      netPayout: 425000,
      status: "refunded",
      date: "2026-07-17 11:10",
    },
  ];

  const formatVND = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesFilter = filterStatus === "all" || t.status === filterStatus;
    const matchesSearch =
      t.expertName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const maxRevenue = Math.max(...monthlyChartData.map((d) => d.revenue));

  return (
    <div className="admin-finances-container">
      {/* Header Banner */}
      <div className="admin-page-header flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Theo dõi Doanh thu & Tài chính</h2>
          <p className="text-sm text-gray-500">Báo cáo doanh thu toàn hệ thống, phí hoa hồng và lịch sử giao dịch.</p>
        </div>
        <div className="flex gap-2">
          <button
            className="rm-btn rm-btn-outline"
            onClick={() => onNavigate("commission")}
            title="Điều chỉnh phí hoa hồng"
          >
            <i className="bx bx-percentage"></i> Đổi phí hoa hồng ({financialSummary.currentCommissionRate}%)
          </button>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <section className="admin-stats-grid mb-6">
        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrapper teal">
            <i className="bx bx-dollar-circle"></i>
          </div>
          <div className="admin-stat-details">
            <span className="admin-stat-label">Tổng Doanh Thu</span>
            <span className="admin-stat-value">{formatVND(financialSummary.totalRevenue)}</span>
            <span className="text-xs text-green-600 font-medium">↑ +18.4% so với tháng trước</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrapper orange">
            <i className="bx bx-pie-chart-alt-2"></i>
          </div>
          <div className="admin-stat-details">
            <span className="admin-stat-label">Phí Hoa Hồng Nền Tảng ({financialSummary.currentCommissionRate}%)</span>
            <span className="admin-stat-value">{formatVND(financialSummary.platformCommission)}</span>
            <span className="text-xs text-gray-500">Lợi nhuận ròng sàn</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrapper blue">
            <i className="bx bx-wallet"></i>
          </div>
          <div className="admin-stat-details">
            <span className="admin-stat-label">Chi Trả Cho Chuyên Gia</span>
            <span className="admin-stat-value">{formatVND(financialSummary.expertPayouts)}</span>
            <span className="text-xs text-blue-600 font-medium">85% tổng doanh thu</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrapper red">
            <i className="bx bx-receipt"></i>
          </div>
          <div className="admin-stat-details">
            <span className="admin-stat-label">Tổng Số Giao Dịch</span>
            <span className="admin-stat-value">{financialSummary.totalTransactions}</span>
            <span className="text-xs text-gray-500">Trung bình: {formatVND(financialSummary.avgTransactionValue)}/ca</span>
          </div>
        </div>
      </section>

      {/* Revenue Chart Section */}
      <RevenueGrowthChart
        title="Biểu đồ Tăng trưởng Doanh thu (2026)"
        subtitle="Báo cáo chi tiết tổng doanh thu dịch vụ, phí hoa hồng sàn và mức chi trả cho chuyên gia."
      />

      {/* Transactions Table Section */}
      <div className="admin-panel-card">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <h3 className="admin-dashboard-section-title mb-0">
            <i className="bx bx-list-ul"></i> Lịch sử Giao dịch Dịch vụ ({filteredTransactions.length})
          </h3>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                className="rm-input-field text-xs pl-8 pr-3 py-1.5 w-full"
                placeholder="Tìm mã TXN, tên chuyên gia, người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="bx bx-search absolute left-2.5 top-2.5 text-gray-400 text-sm"></i>
            </div>

            {/* Status Filter */}
            <select
              className="rm-input-field text-xs py-1.5 px-3"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="pending">Đang xử lý</option>
              <option value="refunded">Đã hoàn tiền</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã Giao Dịch</th>
                <th>Chuyên Gia</th>
                <th>Khách Hang</th>
                <th>Dịch Vụ</th>
                <th>Tổng Tiền</th>
                <th>Phí Sàn (15%)</th>
                <th>Thực Nhận CG</th>
                <th>Trạng Thái</th>
                <th>Thời Gian</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t) => (
                <tr key={t.id}>
                  <td className="font-mono text-xs font-bold text-teal-700">{t.id}</td>
                  <td className="font-medium text-gray-900">{t.expertName}</td>
                  <td className="text-gray-700">{t.userName}</td>
                  <td className="text-xs text-gray-600">{t.serviceType}</td>
                  <td className="font-bold text-gray-900">{formatVND(t.amount)}</td>
                  <td className="text-amber-600 font-semibold">{formatVND(t.commissionAmount)}</td>
                  <td className="text-teal-600 font-semibold">{formatVND(t.netPayout)}</td>
                  <td>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        t.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : t.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {t.status === "completed"
                        ? "Thành công"
                        : t.status === "pending"
                        ? "Đang chờ"
                        : "Hoàn tiền"}
                    </span>
                  </td>
                  <td className="text-xs text-gray-500">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
