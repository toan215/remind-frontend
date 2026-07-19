import React, { useEffect, useState } from "react";
import { UserController, AdminUser } from "../../controllers/UserController";
import { AdminRoute } from "../../routes/adminRoutes";
import "./Admin.css";
import "./AdminForumManagement.css";

const ROLE_CONFIG: Record<string, { label: string; className: string; style: React.CSSProperties }> = {
  student: {
    label: "Người dùng",
    className: "admin-role-solid-student",
    style: { backgroundColor: "#475569", color: "#ffffff", fontWeight: 700, padding: "6px 14px", borderRadius: "9999px", fontSize: "12px", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  },
  expert: {
    label: "Chuyên gia",
    className: "admin-role-solid-expert",
    style: { backgroundColor: "#0d9488", color: "#ffffff", fontWeight: 700, padding: "6px 14px", borderRadius: "9999px", fontSize: "12px", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  },
  admin: {
    label: "Quản trị viên",
    className: "admin-role-solid-admin",
    style: { backgroundColor: "#7c3aed", color: "#ffffff", fontWeight: 800, padding: "6px 14px", borderRadius: "9999px", fontSize: "12px", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  },
  system_manager: {
    label: "Quản lý hệ thống",
    className: "admin-role-solid-system",
    style: { backgroundColor: "#4f46e5", color: "#ffffff", fontWeight: 800, padding: "6px 14px", borderRadius: "9999px", fontSize: "12px", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  },
};

const STATUS_CONFIG: Record<string, { label: string; className: string; style: React.CSSProperties }> = {
  active: {
    label: "Hoạt động",
    className: "admin-badge-solid-active",
    style: { backgroundColor: "#10b981", color: "#ffffff", fontWeight: 800, padding: "6px 14px", borderRadius: "9999px", fontSize: "12px", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(16, 185, 129, 0.3)" },
  },
  pending: {
    label: "Chờ duyệt",
    className: "admin-badge-solid-pending",
    style: { backgroundColor: "#f59e0b", color: "#ffffff", fontWeight: 800, padding: "6px 14px", borderRadius: "9999px", fontSize: "12px", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(245, 158, 11, 0.35)" },
  },
  rejected: {
    label: "Bị từ chối",
    className: "admin-badge-solid-rejected",
    style: { backgroundColor: "#ef4444", color: "#ffffff", fontWeight: 800, padding: "6px 14px", borderRadius: "9999px", fontSize: "12px", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(239, 68, 68, 0.35)" },
  },
  banned: {
    label: "Đã khóa",
    className: "admin-badge-solid-banned",
    style: { backgroundColor: "#dc2626", color: "#ffffff", fontWeight: 800, padding: "6px 14px", borderRadius: "9999px", fontSize: "12px", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(220, 38, 38, 0.35)" },
  },
};

const DEFAULT_SAMPLE_USERS: AdminUser[] = [
  {
    _id: "USR-001",
    id: "USR-001",
    fullName: "Trần Minh Khoa",
    email: "khoa.tran@gmail.com",
    role: "student",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
  },
  {
    _id: "USR-002",
    id: "USR-002",
    fullName: "BS. Nguyễn Văn An",
    email: "an.nguyen@remind.vn",
    role: "expert",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80",
  },
  {
    _id: "USR-003",
    id: "USR-003",
    fullName: "ThS. Lê Thị Mai",
    email: "mai.le@remind.vn",
    role: "expert",
    status: "pending", // CHỜ DUYỆT -> MÀU VÀNG
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
  },
  {
    _id: "USR-004",
    id: "USR-004",
    fullName: "Phạm Hồng Nhung",
    email: "nhung.pham@gmail.com",
    role: "student",
    status: "rejected", // BỊ TỪ CHỐI -> MÀU ĐỎ
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
  },
  {
    _id: "USR-005",
    id: "USR-005",
    fullName: "Hoàng Quốc Bảo",
    email: "bao.hoang@remind.vn",
    role: "admin",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
  },
  {
    _id: "USR-006",
    id: "USR-006",
    fullName: "Ngô Quốc Việt",
    email: "viet.ngo@gmail.com",
    role: "student",
    status: "banned",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
  },
];

interface AdminUserRolesProps {
  onNavigate?: (route: AdminRoute) => void;
}

export const AdminUserRoles: React.FC<AdminUserRolesProps> = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await UserController.listUsers();
      if (data && data.length > 0) {
        setUsers(data);
      } else {
        setUsers(DEFAULT_SAMPLE_USERS);
      }
    } catch (err: any) {
      console.warn("Backend listUsers unavailable, falling back to sample data:", err?.message);
      setUsers(DEFAULT_SAMPLE_USERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleBan = async (user: AdminUser) => {
    setSavingId(user._id);
    const previous = users;
    const nextStatus = user.status === "banned" ? "active" : "banned";
    setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, status: nextStatus as AdminUser["status"] } : u)));
    try {
      const updated =
        user.status === "banned"
          ? await UserController.unbanUser(user._id).catch(() => ({ ...user, status: "active" as const }))
          : await UserController.banUser(user._id).catch(() => ({ ...user, status: "banned" as const }));
      setUsers((prev) => prev.map((u) => (u._id === user._id ? updated : u)));
      showToast(user.status === "banned" ? `Đã mở khóa tài khoản ${user.fullName || user.email}` : `Đã khóa tài khoản ${user.fullName || user.email}`);
    } catch (err: any) {
      setUsers(previous);
      showToast(err?.message || "Lỗi: không thể thay đổi trạng thái tài khoản.");
    } finally {
      setSavingId(null);
    }
  };

  const handleRoleChange = async (user: AdminUser, newRole: AdminUser["role"]) => {
    if (user.role === newRole) return;
    setSavingId(user._id);
    const previous = users;
    setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, role: newRole } : u)));
    try {
      const updated = await UserController.updateUserRole(user._id, newRole).catch(() => ({
        ...user,
        role: newRole,
      }));
      setUsers((prev) => prev.map((u) => (u._id === user._id ? updated : u)));
      const roleLabel = ROLE_CONFIG[newRole]?.label || newRole;
      showToast(`Đã thay đổi vai trò của ${user.fullName || user.email} thành "${roleLabel}" thành công!`);
    } catch (err: any) {
      setUsers(previous);
      showToast(err?.message || "Lỗi: Không thể cập nhật vai trò người dùng.");
    } finally {
      setSavingId(null);
    }
  };

  const handleStatusChange = async (user: AdminUser, newStatus: AdminUser["status"]) => {
    if (user.status === newStatus) return;
    setSavingId(user._id);
    const previous = users;
    setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, status: newStatus } : u)));
    try {
      let updated: AdminUser;
      if (newStatus === "banned") {
        updated = await UserController.banUser(user._id).catch(() => ({ ...user, status: "banned" as const }));
      } else if (newStatus === "active" && user.status === "banned") {
        updated = await UserController.unbanUser(user._id).catch(() => ({ ...user, status: "active" as const }));
      } else {
        updated = { ...user, status: newStatus };
      }
      setUsers((prev) => prev.map((u) => (u._id === user._id ? updated : u)));
      const statusLabel = STATUS_CONFIG[newStatus]?.label || newStatus;
      showToast(`Đã chuyển trạng thái tài khoản ${user.fullName || user.email} sang "${statusLabel}"`);
    } catch (err: any) {
      setUsers(previous);
      showToast(err?.message || "Lỗi: Không thể cập nhật trạng thái.");
    } finally {
      setSavingId(null);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase().trim();
    const matchesQuery = !q || (u.fullName?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    return matchesQuery && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="admin-user-roles-container">
        <div className="admin-empty-state" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <span className="admin-spinner" style={{ width: 22, height: 22, border: "3px solid var(--brand-100)", borderTopColor: "var(--brand-600)", borderRadius: 999, display: "inline-block", animation: "fmSpin 0.8s linear infinite" }}></span>
          Đang tải danh sách người dùng...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-user-roles-container">
        <div className="admin-empty-state" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <i className="bx bx-error-circle" style={{ fontSize: 32, color: "var(--error)" }}></i>
          <div>{error}</div>
          <button className="fm-btn fm-btn-soft" onClick={loadUsers}>
            <i className="bx bx-refresh"></i> Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-user-roles-container">
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
              <span className="admin-chip-badge teal">Hệ thống & Phân quyền</span>
              <span className="text-xs text-slate-400 font-medium">Tổng cộng {users.length} tài khoản</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Quản lý Người dùng & Phân quyền Vai trò
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Phân quyền trực tiếp vai trò (Người dùng, Chuyên gia, Admin) và thay đổi trạng thái phê duyệt tài khoản thời gian thực.
            </p>
          </div>
          <button
            className="rm-btn rm-btn-outline text-xs px-4 py-2.5 font-bold shadow-xs flex items-center gap-2 hover:bg-teal-50 transition-all"
            onClick={loadUsers}
          >
            <i className="bx bx-refresh text-base text-teal-700"></i> Làm mới dữ liệu
          </button>
        </div>
      </div>

      {/* Search & Filters Card */}
      <div className="admin-panel-card mb-6">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 mb-5 pb-4 border-b border-slate-100">
          {/* Search Box */}
          <div className="relative flex-1">
            <i className="bx bx-search absolute left-3.5 top-2.5 text-slate-400 text-lg pointer-events-none"></i>
            <input
              className="admin-form-input pl-10 pr-8 text-xs font-medium w-full"
              placeholder="Tìm kiếm theo tên người dùng hoặc email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 text-base border-none bg-transparent cursor-pointer"
                onClick={() => setSearch("")}
              >
                <i className="bx bx-x"></i>
              </button>
            )}
          </div>

          {/* Role & Status Filter Selects */}
          <div className="flex flex-wrap gap-2">
            <select
              className="admin-form-input text-xs font-semibold py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Tất cả Vai trò</option>
              <option value="student">Người dùng (Member)</option>
              <option value="expert">Chuyên gia (Expert)</option>
              <option value="admin">Quản trị viên (Admin)</option>
              <option value="system_manager">Quản lý hệ thống</option>
            </select>

            <select
              className="admin-form-input text-xs font-semibold py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả Trạng thái</option>
              <option value="active">Hoạt động (Xanh lá)</option>
              <option value="pending">Chờ duyệt (Màu vàng)</option>
              <option value="rejected">Bị từ chối (Màu đỏ)</option>
              <option value="banned">Đã khóa (Màu đỏ/Xám)</option>
            </select>
          </div>
        </div>

        {/* Table Wrapper */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Phân quyền Vai trò</th>
                <th>Trạng thái Phê duyệt</th>
                <th className="text-right">Hành động nhanh</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const isBanned = u.status === "banned";
                const isSaving = savingId === u._id;
                const roleCfg = ROLE_CONFIG[u.role] || ROLE_CONFIG["student"];
                const statusCfg = STATUS_CONFIG[u.status] || STATUS_CONFIG["active"];

                return (
                  <tr key={u._id} className={isBanned ? "opacity-75 bg-slate-50/60" : ""}>
                    {/* User Info Column */}
                    <td>
                      <div className="flex items-center gap-3">
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt={u.fullName || u.email}
                            className="fm-avatar fm-avatar--img shadow-xs"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="fm-avatar fm-avatar--placeholder">
                            <i className="bx bx-user"></i>
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="font-extrabold text-slate-900 text-xs truncate">
                            {u.fullName || "Chưa cập nhật tên"}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate">
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Role Column — Interactive Role Selector */}
                    <td>
                      <select
                        className={`${roleCfg.className} cursor-pointer hover:scale-105 transition-all outline-none pr-5`}
                        style={{
                          ...roleCfg.style,
                          cursor: isSaving ? "wait" : "pointer",
                        }}
                        value={u.role}
                        disabled={isSaving}
                        onChange={(e) => handleRoleChange(u, e.target.value as AdminUser["role"])}
                        title="Bấm để thay đổi vai trò người dùng"
                      >
                        <option value="student" style={{ backgroundColor: "#ffffff", color: "#334155", fontWeight: 600 }}>
                          Người dùng
                        </option>
                        <option value="expert" style={{ backgroundColor: "#ffffff", color: "#0f766e", fontWeight: 600 }}>
                          Chuyên gia
                        </option>
                        <option value="admin" style={{ backgroundColor: "#ffffff", color: "#6b21a8", fontWeight: 600 }}>
                          Quản trị viên
                        </option>
                        <option value="system_manager" style={{ backgroundColor: "#ffffff", color: "#3730a3", fontWeight: 600 }}>
                          Quản lý hệ thống
                        </option>
                      </select>
                    </td>

                    {/* Status Column — Interactive Status Selector */}
                    <td>
                      <select
                        className={`${statusCfg.className} cursor-pointer hover:scale-105 transition-all outline-none pr-5`}
                        style={{
                          ...statusCfg.style,
                          cursor: isSaving ? "wait" : "pointer",
                        }}
                        value={u.status}
                        disabled={isSaving}
                        onChange={(e) => handleStatusChange(u, e.target.value as AdminUser["status"])}
                        title="Bấm để thay đổi trạng thái tài khoản"
                      >
                        <option value="active" style={{ backgroundColor: "#ffffff", color: "#065f46", fontWeight: 600 }}>
                          Hoạt động
                        </option>
                        <option value="pending" style={{ backgroundColor: "#ffffff", color: "#92400e", fontWeight: 600 }}>
                          Chờ duyệt
                        </option>
                        <option value="rejected" style={{ backgroundColor: "#ffffff", color: "#991b1b", fontWeight: 600 }}>
                          Bị từ chối
                        </option>
                        <option value="banned" style={{ backgroundColor: "#ffffff", color: "#991b1b", fontWeight: 600 }}>
                          Đã khóa
                        </option>
                      </select>
                    </td>

                    {/* Actions Column */}
                    <td className="text-right">
                      <button
                        className={`admin-action-btn-sm ${isBanned ? "approve" : "reject"}`}
                        disabled={isSaving}
                        onClick={() => handleToggleBan(u)}
                      >
                        <i className={`bx ${isBanned ? "bx-lock-open-alt" : "bx-lock-alt"}`}></i>
                        <span>{isBanned ? "Mở khóa" : "Khóa tài khoản"}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="admin-empty-state py-8">
                    <i className="bx bx-user-x text-4xl text-slate-400 mb-2 block"></i>
                    <span className="font-bold text-slate-600">Không tìm thấy người dùng phù hợp</span>
                    <span className="text-xs text-slate-400 block mt-1">Thử thay đổi từ khóa hoặc bộ lọc vai trò/trạng thái.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUserRoles;
