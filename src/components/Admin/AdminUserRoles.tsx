import React, { useEffect, useState } from "react";
import { UserController, AdminUser, UserRoleType } from "../../controllers/UserController";
import { AdminRoute } from "../../routes/adminRoutes";
import "./Admin.css";

const ROLE_OPTIONS: { value: UserRoleType; label: string; color: string }[] = [
  { value: "student", label: "Student", color: "#3b82f6" },
  { value: "expert", label: "Expert", color: "#14b8a6" },
  { value: "admin", label: "Admin", color: "#f59e0b" },
  { value: "system_manager", label: "System Manager", color: "#8b5cf6" },
];

const ROLE_LABELS: Record<UserRoleType, string> = {
  student: "Sinh viên",
  expert: "Chuyên gia",
  admin: "Quản trị viên",
  system_manager: "Quản lý hệ thống",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Hoạt động",
  pending: "Chờ duyệt",
  rejected: "Bị từ chối",
  banned: "Đã khóa",
};

const MOCK_USERS: AdminUser[] = [
  { _id: "u1", id: "u1", email: "nguyen.an@remind.vn", fullName: "Nguyễn Văn An", role: "student", status: "active", createdAt: "2026-05-12T08:00:00Z" },
  { _id: "u2", id: "u2", email: "le.mai@remind.vn", fullName: "Lê Thị Mai", role: "expert", status: "active", createdAt: "2026-04-02T08:00:00Z" },
  { _id: "u3", id: "u3", email: "admin@remind.vn", fullName: "Admin Moderator", role: "admin", status: "active", createdAt: "2026-01-01T08:00:00Z" },
  { _id: "u4", id: "u4", email: "tran.tuan@remind.vn", fullName: "Trần Tuấn", role: "student", status: "banned", createdAt: "2026-03-20T08:00:00Z" },
  { _id: "u5", id: "u5", email: "pham.hoa@remind.vn", fullName: "Phạm Hòa", role: "system_manager", status: "active", createdAt: "2026-02-15T08:00:00Z" },
];

interface AdminUserRolesProps {
  onNavigate?: (route: AdminRoute) => void;
}

export const AdminUserRoles: React.FC<AdminUserRolesProps> = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await UserController.listUsers();
      setUsers(data);
      setUsingMock(false);
    } catch (err) {
      // Backend endpoint may not be implemented yet -> use mock data
      setUsers(MOCK_USERS);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (user: AdminUser, role: UserRoleType) => {
    if (user.role === role) return;
    setSavingId(user._id);
    const previous = users;
    setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, role } : u)));
    try {
      const updated = await UserController.updateUserRole(user._id, role);
      setUsers((prev) => prev.map((u) => (u._id === user._id ? updated : u)));
      showToast(`Đã cập nhật vai trò của ${user.fullName || user.email} thành ${ROLE_LABELS[role]}`);
    } catch (err) {
      setUsers(previous);
      showToast("Lỗi: không thể cập nhật vai trò (backend chưa sẵn sàng).");
    } finally {
      setSavingId(null);
    }
  };

  const handleToggleBan = async (user: AdminUser) => {
    setSavingId(user._id);
    const previous = users;
    const nextStatus = user.status === "banned" ? "active" : "banned";
    setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, status: nextStatus as AdminUser["status"] } : u)));
    try {
      const updated =
        user.status === "banned"
          ? await UserController.unbanUser(user._id)
          : await UserController.banUser(user._id);
      setUsers((prev) => prev.map((u) => (u._id === user._id ? updated : u)));
      showToast(user.status === "banned" ? `Đã mở khóa ${user.fullName || user.email}` : `Đã khóa ${user.fullName || user.email}`);
    } catch (err) {
      setUsers(previous);
      showToast("Lỗi: không thể thay đổi trạng thái (backend chưa sẵn sàng).");
    } finally {
      setSavingId(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="admin-empty-state">Đang tải danh sách người dùng...</div>;

  return (
    <div className="admin-dashboard-container">
      <div className="admin-page-header flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Quản lý Vai trò & Quyền người dùng</h2>
          <p className="text-sm text-gray-500">
            Phân quyền vai trò (student, expert, admin, system_manager) và khóa/mở tài khoản.
          </p>
        </div>
      </div>

      {usingMock && (
        <div className="admin-mock-banner">
          <i className="bx bx-info-circle"></i>
          Đang dùng dữ liệu mẫu (mock). Backend chưa có endpoint <code>GET /api/admin/users</code>.
        </div>
      )}

      <div className="admin-panel-card mb-6">
        <div className="flex items-center gap-3 mb-4">
          <i className="bx bx-search" style={{ fontSize: 18, color: "var(--ink-500)" }}></i>
          <input
            className="rm-input-field"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u._id}>
                  <td className="font-medium">{u.fullName || "—"}</td>
                  <td className="text-gray-500">{u.email}</td>
                  <td>
                    <select
                      className="rm-input-field"
                      value={u.role}
                      disabled={savingId === u._id}
                      onChange={(e) => handleRoleChange(u, e.target.value as UserRoleType)}
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {ROLE_LABELS[r.value]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span
                      className={`admin-status-badge ${
                        u.status === "active"
                          ? "green"
                          : u.status === "banned"
                          ? "red"
                          : u.status === "pending"
                          ? "amber"
                          : "gray"
                      }`}
                    >
                      {STATUS_LABELS[u.status] || u.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`admin-action-btn-sm ${u.status === "banned" ? "approve" : "reject"}`}
                      disabled={savingId === u._id}
                      onClick={() => handleToggleBan(u)}
                    >
                      {u.status === "banned" ? "Mở khóa" : "Khóa"}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="admin-empty-state">
                    Không tìm thấy người dùng phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <div className="admin-toast">{toast}</div>}
    </div>
  );
};

export default AdminUserRoles;
