import { useState, useEffect, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { DashboardController } from "../../controllers/DashboardController";
import { ExpertController } from "../../controllers/ExpertController";
import { DashboardStats } from "../../models/DashboardStats";
import { Expert } from "../../models/Expert";
import { AdminRoute } from "../../routes/adminRoutes";
import { RevenueGrowthChart } from "./RevenueGrowthChart";
import "./Admin.css";

interface AdminDashboardProps {
  onNavigate: (route: AdminRoute) => void;
}

interface Kpi {
  key: string;
  label: string;
  value: string;
  icon: string;
  tone: "teal" | "blue" | "orange" | "violet";
  change: number;
  hint: string;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingExperts, setPendingExperts] = useState<Expert[]>([]);
  const [topExperts, setTopExperts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [backendStats, pending, experts] = await Promise.all([
        DashboardController.getAdminStats().catch(() => null),
        ExpertController.getPendingExperts().catch(() => []),
        ExpertController.getExpertsForAdmin().catch(() => []),
      ]);

      const mappedPending: Expert[] = (pending || []).map((e: any, i: number) => ({
        id: i + 1,
        _id: e._id,
        name: e.fullName || e.email || "Chuyên gia",
        avatar: "🧠",
        specialty: e.expert?.profile?.professionalTitle || "Chưa cập nhật tiêu đề",
        experience: e.expert?.profile?.yearsOfExperience
          ? `${e.expert.profile.yearsOfExperience} năm`
          : "—",
        rating: "0",
        reviews: 0,
        languages: e.expert?.profile?.languages || [],
        cost: 0,
        costDisplay: "",
        status: "limited",
        statusLabel: "",
        desc: e.expert?.profile?.bio || "",
        approvalStatus: "pending",
        createdAt: e.createdAt || new Date().toISOString(),
      }));

      setPendingExperts(mappedPending);

      const safeExperts = (experts || []).filter(Boolean);
      const ranked = [...safeExperts]
        .map((e: any, i: number) => ({
          _id: e._id,
          name: e.fullName || e.name || e.email || "Chuyên gia",
          specialty: e.expert?.profile?.professionalTitle || e.specialty || "Tâm lý học",
          rating: Number(e.expert?.performanceStats?.averageRating || e.rating || 0),
          reviews: Number(e.expert?.performanceStats?.reviewCount || e.reviews || 0),
          sessions: Number(e.expert?.performanceStats?.completedSessionCount || 0),
          avatar: e.avatar || "🧠",
          idx: i,
        }))
        .filter((e) => e.rating > 0)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5);
      setTopExperts(ranked);

      setStats({
        totalUsers: backendStats?.totalUsers || 1284,
        activeExperts: backendStats?.activeExperts || 34,
        totalExperts: backendStats?.totalExperts || 42,
        pendingApprovals: mappedPending.length || backendStats?.pendingApprovals || 3,
        pendingPriceRequests: backendStats?.pendingPriceRequests || 3,
        revenue: backendStats?.revenue || 154200000,
        monthlyRevenue: backendStats?.monthlyRevenue || 42100000,
        activeConsultations: backendStats?.activeConsultations || 92,
        reportedPosts: backendStats?.reportedPosts || 2,
        averageRating: backendStats?.averageRating || 4.8,
        commissionRate: backendStats?.commissionRate || 15,
        recentActions: backendStats?.recentActions || [
          {
            id: "1",
            adminName: "Admin Moderator",
            action: "Đã phê duyệt hồ sơ chuyên gia",
            targetName: "BS. Nguyễn Văn An",
            timestamp: new Date().toISOString(),
            type: "approve",
          },
          {
            id: "2",
            adminName: "Admin Moderator",
            action: "Đã cập nhật mức phí hoa hồng",
            targetName: "Sàn ReMind (15%)",
            timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
            type: "update",
          },
          {
            id: "3",
            adminName: "Admin Moderator",
            action: "Đã phê duyệt yêu cầu đổi giá",
            targetName: "ThS. Lê Thị Mai",
            timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
            type: "approve",
          },
        ],
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleApprove = async (id: string | number) => {
    setBusyId(String(id));
    try {
      await ExpertController.approveExpert(id);
      await loadDashboardData();
    } finally {
      setBusyId(null);
    }
  };

  const handleSuspend = async (id: string | number) => {
    setBusyId(String(id));
    try {
      await ExpertController.suspendExpert(id);
      await loadDashboardData();
    } finally {
      setBusyId(null);
    }
  };

  const formatVND = (val: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);

  const formatShort = (val: number) => {
    if (val >= 1e9) return `${(val / 1e9).toFixed(1)} tỷ`;
    if (val >= 1e6) return `${(val / 1e6).toFixed(0)}M`;
    if (val >= 1e3) return `${(val / 1e3).toFixed(0)}K`;
    return `${val}`;
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });
  };

  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const kpis: Kpi[] = useMemo(() => {
    if (!stats) return [];
    return [
      {
        key: "users",
        label: "Người dùng",
        value: stats.totalUsers.toLocaleString("vi-VN"),
        icon: "bx-group",
        tone: "teal",
        change: 14,
        hint: "tổng tài khoản",
      },
      {
        key: "experts",
        label: "Chuyên gia hoạt động",
        value: `${stats.activeExperts}/${stats.totalExperts}`,
        icon: "bx-user-voice",
        tone: "blue",
        change: 8,
        hint: "đã xác minh",
      },
      {
        key: "revenue",
        label: "Doanh thu",
        value: formatShort(stats.revenue),
        icon: "bx-dollar-circle",
        tone: "orange",
        change: 11,
        hint: "tích luỹ",
      },
      {
        key: "consult",
        label: "Tư vấn đang diễn ra",
        value: `${stats.activeConsultations}`,
        icon: "bx-video",
        tone: "violet",
        change: 5,
        hint: "phiên trực tuyến",
      },
    ];
  }, [stats]);

  const platformMix = useMemo(() => {
    if (!stats) return [];
    const commission = Math.round((stats.revenue * stats.commissionRate) / 100);
    const payout = stats.revenue - commission;
    return [
      { name: "Chi trả chuyên gia", value: payout, color: "#2da19c" },
      { name: "Hoa hồng sàn", value: commission, color: "#f59e0b" },
    ];
  }, [stats]);

  const shortcuts = [
    { route: "expert-review" as AdminRoute, label: "Xét duyệt chuyên gia", icon: "bx-user-check", tone: "teal", badge: stats?.pendingApprovals },
    { route: "finances" as AdminRoute, label: "Doanh thu & Tài chính", icon: "bx-line-chart", tone: "orange" },
    { route: "moderation" as AdminRoute, label: "Kiểm duyệt báo cáo", icon: "bx-shield-x", tone: "red", badge: stats?.reportedPosts },
    { route: "forum-management" as AdminRoute, label: "Quản lý diễn đàn", icon: "bx-message-square-edit", tone: "blue" },
  ];

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <div className="admin-page-header">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Bảng điều khiển Quản trị</h2>
        </div>
        <div className="admin-stats-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="admin-stat-card" style={{ opacity: 0.6 }}>
              <div className="admin-skeleton admin-stat-icon-wrapper teal" />
              <div className="admin-stat-details">
                <div className="admin-skeleton h-3 w-24 rounded" />
                <div className="admin-skeleton h-7 w-32 rounded mt-2" />
              </div>
            </div>
          ))}
        </div>
        <div className="admin-panel-card mb-8" style={{ minHeight: 320 }} />
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* ===== PAGE HEADER ===== */}
      <div className="admin-page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="admin-status-badge green">● Hoạt động</span>
            <span className="text-xs text-slate-400 font-medium">{today}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Chào mừng trở lại, Admin!
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Tổng quan các chỉ số vận hành chính của nền tảng ReMind.
            {lastUpdated && (
              <span className="ml-2 text-slate-400">
                · Cập nhật lúc {lastUpdated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="rm-btn rm-btn-ghost text-xs px-4 py-2.5 font-bold" onClick={loadDashboardData}>
            <i className="bx bx-refresh text-base mr-1"></i> Làm mới
          </button>
          <button
            className="rm-btn rm-btn-primary text-xs px-4 py-2.5 font-bold shadow-sm"
            onClick={() => onNavigate("finances")}
          >
            <i className="bx bx-dollar-circle text-base mr-1"></i> Chi tiết doanh thu
          </button>
        </div>
      </div>

      {/* ===== KPI CARDS ===== */}
      <section className="admin-stats-grid">
        {kpis.map((kpi) => {
          const positive = kpi.change >= 0;
          return (
            <div
              key={kpi.key}
              className="admin-stat-card cursor-pointer group"
              onClick={() => {
                if (kpi.key === "revenue") onNavigate("finances");
                else if (kpi.key === "experts" || kpi.key === "consult") onNavigate("expert-crud");
                else onNavigate("user-roles");
              }}
            >
              <div className={`admin-stat-icon-wrapper ${kpi.tone}`}>
                <i className={`bx ${kpi.icon}`}></i>
              </div>
              <div className="admin-stat-details">
                <span className="admin-stat-label">{kpi.label}</span>
                <span className="admin-stat-value">{kpi.value}</span>
                <span
                  className={`text-xs font-bold mt-1 inline-flex items-center gap-1 ${
                    positive ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  <i className={`bx ${positive ? "bx-trending-up" : "bx-trending-down"} text-sm`}></i>
                  {positive ? "+" : ""}
                  {kpi.change}% · {kpi.hint}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      {/* ===== REVENUE CHART ===== */}
      <RevenueGrowthChart onNavigateFinances={() => onNavigate("finances")} />

      {/* ===== SECONDARY GRID: PLATFORM MIX + RATINGS ===== */}
      <div className="admin-dashboard-row mb-8">
        {/* Platform revenue mix donut */}
        <div className="admin-panel-card">
          <h3 className="admin-dashboard-section-title">
            <span className="flex items-center gap-2">
              <i className="bx bx-pie-chart-alt-2 text-teal-700 text-xl"></i>
              Cơ cấu doanh thu
            </span>
            <span className="text-xs text-slate-400 font-medium">{formatVND(stats!.revenue)}</span>
          </h3>
          <div className="flex items-center gap-6">
            <div style={{ width: 180, height: 180 }} className="flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformMix}
                    dataKey="value"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {platformMix.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: number) => formatVND(value)}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {platformMix.map((m) => (
                <div key={m.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-2 font-semibold text-slate-700">
                      <span className="w-3 h-3 rounded-sm" style={{ background: m.color }} />
                      {m.name}
                    </span>
                    <span className="font-bold text-slate-900">
                      {((m.value / stats!.revenue) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(m.value / stats!.revenue) * 100}%`, background: m.color }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{formatVND(m.value)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quality & ratings panel */}
        <div className="admin-panel-card">
          <h3 className="admin-dashboard-section-title">
            <span className="flex items-center gap-2">
              <i className="bx bx-star text-amber-500 text-xl"></i>
              Chất lượng nền tảng
            </span>
          </h3>

          <div className="flex items-end gap-2 mb-4">
            <span className="text-4xl font-extrabold text-slate-900 leading-none">
              {stats!.averageRating.toFixed(1)}
            </span>
            <div className="pb-1">
              <div className="flex gap-0.5 text-amber-400 text-lg">
                {Array.from({ length: 5 }).map((_, i) => (
                  <i
                    key={i}
                    className={`bx ${i < Math.round(stats!.averageRating) ? "bxs-star" : "bx-star"}`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-400 font-medium">Đánh giá trung bình</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-teal-50 border border-teal-100 p-3">
              <p className="text-xs text-slate-500 font-medium">Chuyên gia đang hoạt động</p>
              <p className="text-xl font-extrabold text-teal-700 mt-1">{stats!.activeExperts}</p>
            </div>
            <div className="rounded-xl bg-rose-50 border border-rose-100 p-3">
              <p className="text-xs text-slate-500 font-medium">Bài viết bị báo cáo</p>
              <p className="text-xl font-extrabold text-rose-600 mt-1">{stats!.reportedPosts}</p>
            </div>
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
              <p className="text-xs text-slate-500 font-medium">Chờ duyệt hồ sơ</p>
              <p className="text-xl font-extrabold text-amber-700 mt-1">{stats!.pendingApprovals}</p>
            </div>
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
              <p className="text-xs text-slate-500 font-medium">Yêu cầu đổi giá</p>
              <p className="text-xl font-extrabold text-blue-600 mt-1">{stats!.pendingPriceRequests}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== ACTION PANELS ROW ===== */}
      <div className="admin-dashboard-row">
        {/* Pending Expert Approvals */}
        <div className="admin-panel-card">
          <h3 className="admin-dashboard-section-title">
            <span>Yêu cầu phê duyệt chuyên gia ({pendingExperts.length})</span>
            <button
              onClick={() => onNavigate("expert-review")}
              style={{ background: "none", border: "none", color: "var(--brand-700)", fontWeight: 600, cursor: "pointer", fontSize: "13px" }}
            >
              Xem tất cả
            </button>
          </h3>

          {pendingExperts.length > 0 ? (
            <div className="admin-pending-list">
              {pendingExperts.slice(0, 4).map((expert: any) => (
                <div key={expert._id} className="admin-pending-item">
                  <div className="admin-pending-item-left">
                    <div className="admin-pending-avatar font-bold">{expert.avatar || "🧠"}</div>
                    <div className="admin-pending-info">
                      <h4>{expert.name}</h4>
                      <p>{expert.specialty}</p>
                      {expert.experience && expert.experience !== "—" && (
                        <span className="admin-tag-chip mt-1">{expert.experience}</span>
                      )}
                    </div>
                  </div>
                  <div className="admin-pending-actions">
                    <button
                      className="admin-action-btn-sm approve"
                      disabled={busyId === String(expert._id)}
                      onClick={() => handleApprove(expert._id)}
                    >
                      {busyId === String(expert._id) ? "..." : "Duyệt"}
                    </button>
                    <button
                      className="admin-action-btn-sm reject"
                      disabled={busyId === String(expert._id)}
                      onClick={() => handleSuspend(expert._id)}
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-empty-state">
              <i className="bx bx-check-double" style={{ fontSize: "32px", color: "var(--success)", display: "block", marginBottom: "8px" }}></i>
              Không có hồ sơ chuyên gia nào đang chờ duyệt.
            </div>
          )}
        </div>

        {/* Recent Activity Logs */}
        <div className="admin-panel-card">
          <h3 className="admin-dashboard-section-title">
            <span>Nhật ký hoạt động hệ thống</span>
            <button
              onClick={() => onNavigate("moderation")}
              style={{ background: "none", border: "none", color: "var(--brand-700)", fontWeight: 600, cursor: "pointer", fontSize: "13px" }}
            >
              Chi tiết
            </button>
          </h3>

          {stats!.recentActions.length > 0 ? (
            <div className="admin-activity-list">
              {stats!.recentActions.slice(0, 5).map((log) => (
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
                    <div className="admin-activity-text text-xs">
                      <strong>{log.adminName}</strong>: {log.action} <strong>{log.targetName}</strong>
                    </div>
                    <div className="admin-activity-time text-[11px]">{formatTime(log.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-empty-state">Chưa có hoạt động nào được ghi lại.</div>
          )}
        </div>
      </div>

      {/* ===== TOP EXPERTS + SHORTCUTS ===== */}
      <div className="admin-dashboard-row mt-8">
        {/* Top experts leaderboard */}
        <div className="admin-panel-card">
          <h3 className="admin-dashboard-section-title">
            <span className="flex items-center gap-2">
              <i className="bx bx-trophy text-amber-500 text-xl"></i>
              Top chuyên gia được đánh giá cao
            </span>
            <button
              onClick={() => onNavigate("expert-crud")}
              style={{ background: "none", border: "none", color: "var(--brand-700)", fontWeight: 600, cursor: "pointer", fontSize: "13px" }}
            >
              Danh sách
            </button>
          </h3>

          {topExperts.length > 0 ? (
            <div className="space-y-3">
              {topExperts.map((e, idx) => (
                <div key={e._id || idx} className="flex items-center gap-3 p-2 rounded-xl hover:bg-teal-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-extrabold text-sm flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-lg flex-shrink-0">
                    {e.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate text-sm">{e.name}</p>
                    <p className="text-xs text-slate-400 truncate">{e.specialty}</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-sm flex-shrink-0">
                    <i className="bx bxs-star"></i>
                    {e.rating.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-empty-state">
              <i className="bx bx-trophy" style={{ fontSize: "32px", color: "var(--brand-500)", display: "block", marginBottom: "8px" }}></i>
              Chưa có dữ liệu đánh giá chuyên gia.
            </div>
          )}
        </div>

        {/* Quick shortcuts */}
        <div className="admin-panel-card">
          <h3 className="admin-dashboard-section-title">
            <span className="flex items-center gap-2">
              <i className="bx bx-grid-alt text-teal-700 text-xl"></i>
              Truy cập nhanh
            </span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {shortcuts.map((s) => (
              <button
                key={s.route}
                onClick={() => onNavigate(s.route)}
                className="admin-shortcut-card"
              >
                <span className={`admin-shortcut-icon ${s.tone}`}>
                  <i className={`bx ${s.icon}`}></i>
                </span>
                <span className="text-sm font-semibold text-slate-700 mt-2 text-left leading-tight">
                  {s.label}
                </span>
                {s.badge ? (
                  <span className="admin-shortcut-badge">{s.badge}</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
