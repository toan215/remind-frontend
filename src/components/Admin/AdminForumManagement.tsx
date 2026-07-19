import React, { useEffect, useState } from "react";
import { apiHelper } from "../../utils/apiHelper";
import { API_ENDPOINTS } from "../../utils/constants";
import { ForumController } from "../../controllers/ForumController";
import { ForumPost, CreatePostData } from "../../models/ForumPost";
import { AdminRoute } from "../../routes/adminRoutes";
import "./Admin.css";

interface ForumThread extends ForumPost {
  _id: string;
}

const MOCK_THREADS: ForumThread[] = [
  {
    _id: "p1", id: "p1", title: "Làm sao vượt qua cơn lo âu mỗi sáng?", content: "Mỗi sáng thức dậy mình lại thấy bồn chồn...", author: "Anon", tags: ["lo âu", "sống kheo"], likes: 12, likedBy: [], isAnonymous: true, createdAt: "2026-07-10T08:00:00Z", updatedAt: "2026-07-10T08:00:00Z",
  },
  {
    _id: "p2", id: "p2", title: "Kinh nghiệm đi khám tâm lý lần đầu", content: "Mình muốn chia sẻ quy trình đi khám...", author: "Minh", tags: ["chia sẻ"], likes: 30, likedBy: [], isAnonymous: false, createdAt: "2026-07-12T10:30:00Z", updatedAt: "2026-07-13T09:00:00Z",
  },
  {
    _id: "p3", id: "p3", title: "Thói quen nhỏ cải thiện giấc ngủ", content: "Tắt màn hình 1 tiếng trước khi ngủ...", author: "Lan", tags: ["giấc ngủ"], likes: 45, likedBy: [], isAnonymous: false, createdAt: "2026-07-14T19:00:00Z", updatedAt: "2026-07-14T19:00:00Z",
  },
];

interface AdminForumManagementProps {
  onNavigate?: (route: AdminRoute) => void;
}

export const AdminForumManagement: React.FC<AdminForumManagementProps> = () => {
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ForumThread | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState<CreatePostData>({
    title: "",
    content: "",
    author: "ReMind Admin",
    tags: [],
    isAnonymous: false,
  });
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const loadThreads = async () => {
    setLoading(true);
    try {
      const res = await ForumController.getPosts(1, 50);
      const list = res.posts.map((p) => ({ ...p, _id: p.id })) as ForumThread[];
      setThreads(list);
      setUsingMock(false);
    } catch (err) {
      setThreads(MOCK_THREADS);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThreads();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", content: "", author: "ReMind Admin", tags: [], isAnonymous: false });
    setTagInput("");
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (thread: ForumThread) => {
    setEditing(thread);
    setForm({
      title: thread.title,
      content: thread.content,
      author: thread.author,
      tags: thread.tags || [],
      isAnonymous: thread.isAnonymous,
    });
    setTagInput("");
    setErrors({});
    setModalOpen(true);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, t] }));
    }
    setTagInput("");
  };

  const removeTag = (t: string) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((x) => x !== t) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = ForumController.validate(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSaving(true);
    try {
      if (editing) {
        const updated = await apiHelper.patch<{ post: ForumPost }>(
          API_ENDPOINTS.ADMIN.POST_BY_ID(editing._id),
          {
            title: form.title.trim(),
            content: form.content.trim(),
            tags: form.tags,
            authorDisplayMode: form.isAnonymous ? 1 : 0,
          }
        );
        showToast("Đã cập nhật bài viết.");
        setThreads((prev) =>
          prev.map((t) =>
            t._id === editing._id ? { ...t, ...updated.post, _id: editing._id } : t
          )
        );
      } else {
        const created = await apiHelper.post<{ post: ForumPost }>(
          API_ENDPOINTS.ADMIN.CREATE_FORUM,
          {
            title: form.title.trim(),
            content: form.content.trim(),
            tags: form.tags,
            authorDisplayMode: form.isAnonymous ? 1 : 0,
          }
        );
        showToast("Đã tạo bài viết mới.");
        const newThread = { ...created.post, _id: created.post.id } as ForumThread;
        setThreads((prev) => [newThread, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      // Fallback: update local mock state
      if (editing) {
        setThreads((prev) =>
          prev.map((t) =>
            t._id === editing._id
              ? { ...t, title: form.title, content: form.content, tags: form.tags, isAnonymous: form.isAnonymous, updatedAt: new Date().toISOString() }
              : t
          )
        );
      } else {
        const newThread: ForumThread = {
          _id: `p${Date.now()}`, id: `p${Date.now()}`, title: form.title, content: form.content,
          author: form.author, tags: form.tags, likes: 0, likedBy: [], isAnonymous: form.isAnonymous,
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        };
        setThreads((prev) => [newThread, ...prev]);
      }
      showToast(usingMock ? "Đã lưu (chế độ mock)." : "Lưu cục bộ (backend chưa sẵn sàng).");
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const filtered = threads.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.content.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });

  if (loading) return <div className="admin-empty-state">Đang tải bài viết diễn đàn...</div>;

  return (
    <div className="admin-dashboard-container">
      <div className="admin-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h2 className="admin-page-title">Quản lý Diễn đàn</h2>
          <p className="admin-page-subtitle">
            Tạo và cập nhật chủ đề/câu hỏi trên diễn đàn cộng đồng (chỉ thêm &amp; sửa, không xóa).
          </p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openCreate} style={{ flexShrink: 0 }}>
          <i className="bx bx-plus"></i> Tạo bài viết
        </button>
      </div>

      {usingMock && (
        <div className="admin-mock-banner">
          <i className="bx bx-info-circle"></i>
          Đang dùng dữ liệu mẫu (mock). Backend chưa có endpoint <code>POST /api/admin/forums</code> hoặc lỗi tải.
        </div>
      )}

      <div className="admin-search-bar" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <i className="bx bx-search" style={{ fontSize: 18, color: "var(--ink-500)", flexShrink: 0 }}></i>
        <input
          className="admin-form-input"
          placeholder="Tìm kiếm bài viết..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, marginBottom: 0 }}
        />
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Thẻ</th>
              <th>Lượt thích</th>
              <th>Cập nhật</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t._id}>
                <td>
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--ink-900)", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-500)", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.content}</div>
                </td>
                <td>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {t.tags.map((tag) => (
                      <span key={tag} className="admin-tag-chip">{tag}</span>
                    ))}
                  </div>
                </td>
                <td style={{ fontWeight: 600, color: "var(--ink-700)" }}>{t.likes}</td>
                <td style={{ fontSize: 12, color: "var(--ink-500)" }}>{formatTime(t.updatedAt)}</td>
                <td>
                  <button className="admin-action-btn-sm approve" onClick={() => openEdit(t)}>
                    Sửa
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-empty-state">
                  Không tìm thấy bài viết phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => !saving && setModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>
                <span style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: "linear-gradient(135deg, var(--brand-100), var(--brand-050))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, color: "var(--brand-700)",
                }}>
                  <i className={`bx ${editing ? "bx-edit" : "bx-plus-circle"}`}></i>
                </span>
                {editing ? "Cập nhật bài viết" : "Tạo bài viết mới"}
              </h3>
              <button className="admin-modal-close" onClick={() => setModalOpen(false)} disabled={saving}>
                <i className="bx bx-x"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal-body">
              <div className="admin-form-group">
                <label>Tiêu đề</label>
                <input
                  className={`admin-form-input ${errors.title ? "error" : ""}`}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Nhập tiêu đề..."
                />
                {errors.title && <span className="admin-form-error">{errors.title}</span>}
              </div>

              <div className="admin-form-group">
                <label>Nội dung</label>
                <textarea
                  className={`admin-form-input ${errors.content ? "error" : ""}`}
                  rows={5}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Nhập nội dung..."
                />
                {errors.content && <span className="admin-form-error">{errors.content}</span>}
              </div>

              <div className="admin-form-group">
                <label>Thẻ (tags)</label>
                <div className="flex gap-2">
                  <input
                    className="admin-form-input"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addTag(); }
                    }}
                    placeholder="Thêm thẻ rồi nhấn Enter"
                  />
                  <button type="button" className="rm-btn rm-btn-outline" onClick={addTag}>
                    Thêm
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.tags.map((tag) => (
                    <span key={tag} className="admin-tag-chip">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>
                        <i className="bx bx-x"></i>
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="admin-form-group" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <label className="flex items-center gap-2 cursor-pointer" style={{ cursor: "pointer", userSelect: "none", textTransform: "none", letterSpacing: 0 }}>
                  <input
                    type="checkbox"
                    checked={form.isAnonymous}
                    onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: "var(--brand-600)", cursor: "pointer" }}
                  />
                  <span style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink-700)" }}>Đăng ẩn danh</span>
                </label>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="rm-btn rm-btn-outline" onClick={() => setModalOpen(false)} disabled={saving}>
                  Hủy
                </button>
                <button type="submit" className="rm-btn rm-btn-primary" disabled={saving}>
                  {saving ? "Đang lưu..." : editing ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="admin-toast">{toast}</div>}
    </div>
  );
};

export default AdminForumManagement;
