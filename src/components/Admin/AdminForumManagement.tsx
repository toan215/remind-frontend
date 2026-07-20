import React, { useEffect, useState } from "react";
import { apiHelper } from "../../utils/apiHelper";
import { API_ENDPOINTS } from "../../utils/constants";
import { ForumController } from "../../controllers/ForumController";
import { ForumPost, CreatePostData } from "../../models/ForumPost";
import { AdminRoute } from "../../routes/adminRoutes";
import "./Admin.css";
import "./AdminForumManagement.css";

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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

  if (loading) {
    return (
      <div className="forum-mgmt">
        <div className="fm-loading">
          <span className="fm-spinner"></span>
          Đang tải bài viết diễn đàn...
        </div>
      </div>
    );
  }

  return (
    <div className="forum-mgmt">
      <div className="fm-header">
        <div className="fm-header-title">
          <div className="fm-header-icon">
            <i className="bx bx-conversation"></i>
          </div>
          <div>
            <h2 className="fm-title">Quản lý Diễn đàn</h2>
            <p className="fm-subtitle">
              Tạo và cập nhật chủ đề, câu hỏi trên diễn đàn cộng đồng. Chỉ hỗ trợ thêm &amp; sửa, không xóa.
            </p>
          </div>
        </div>
        <button className="fm-btn fm-btn-primary" onClick={openCreate}>
          <i className="bx bx-plus"></i> Tạo bài viết
        </button>
      </div>

      {usingMock && (
        <div className="fm-banner">
          <i className="bx bx-info-circle"></i>
          <span>
            Đang dùng dữ liệu mẫu (mock). Backend chưa có endpoint <code>POST /api/admin/forums</code> hoặc đang gặp lỗi tải.
          </span>
        </div>
      )}

      <div className="fm-toolbar">
        <div className="fm-search">
          <i className="bx bx-search"></i>
          <input
            placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="fm-toolbar-meta">
          <strong>{filtered.length}</strong> / {threads.length} bài viết
        </div>
      </div>

      <div className="fm-table-wrap">
        <table className="fm-table">
          <thead>
            <tr>
              <th>Bài viết</th>
              <th>Thẻ</th>
              <th>Lượt thích</th>
              <th>Cập nhật</th>
              <th style={{ textAlign: "right" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t._id}>
                <td>
                  <h4 className="fm-thread-title">{t.title}</h4>
                  <p className="fm-thread-excerpt">{t.content}</p>
                  <span className="fm-thread-author">
                    {t.isAnonymous ? (
                      <>
                        <span className="fm-anon-dot"></span> Ẩn danh
                      </>
                    ) : (
                      <>
                        <span className="fm-anon-dot" style={{ background: "var(--brand-500)" }}></span>
                        {t.author}
                      </>
                    )}
                  </span>
                </td>
                <td>
                  <div className="fm-tags">
                    {t.tags.map((tag) => (
                      <span key={tag} className="fm-tag">{tag}</span>
                    ))}
                  </div>
                </td>
                <td>
                  <span className="fm-likes">
                    <i className="bx bxs-heart"></i> {t.likes}
                  </span>
                </td>
                <td>
                  <span className="fm-date">{formatTime(t.updatedAt)}</span>
                </td>
                <td>
                  <div className="fm-actions">
                    <button className="fm-icon-btn" onClick={() => openEdit(t)} title="Chỉnh sửa">
                      <i className="bx bx-pencil"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <div className="fm-empty">
                    <div className="fm-empty-icon">
                      <i className="bx bx-search"></i>
                    </div>
                    <div className="fm-empty-text">Không tìm thấy bài viết phù hợp.</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fm-overlay" onClick={() => !saving && setModalOpen(false)}>
          <div className="fm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fm-modal-head">
              <h3>
                <span className="fm-modal-badge">
                  <i className={`bx ${editing ? "bx-edit" : "bx-plus-circle"}`}></i>
                </span>
                {editing ? "Cập nhật bài viết" : "Tạo bài viết mới"}
              </h3>
              <button className="fm-modal-close" onClick={() => setModalOpen(false)} disabled={saving}>
                <i className="bx bx-x"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="fm-modal-body">
              <div className="fm-field">
                <label>Tiêu đề</label>
                <input
                  className={`fm-input ${errors.title ? "error" : ""}`}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Nhập tiêu đề..."
                />
                {errors.title && <span className="fm-error-text">{errors.title}</span>}
              </div>

              <div className="fm-field">
                <label>Nội dung</label>
                <textarea
                  className={`fm-textarea ${errors.content ? "error" : ""}`}
                  rows={5}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Nhập nội dung..."
                />
                {errors.content && <span className="fm-error-text">{errors.content}</span>}
              </div>

              <div className="fm-field">
                <label>Thẻ (tags)</label>
                <div className="fm-tag-editor">
                  <input
                    className="fm-input"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addTag(); }
                    }}
                    placeholder="Thêm thẻ rồi nhấn Enter"
                  />
                  <button type="button" className="fm-btn fm-btn-soft fm-tag-add" onClick={addTag}>
                    Thêm
                  </button>
                </div>
                <div className="fm-tag-list">
                  {form.tags.map((tag) => (
                    <span key={tag} className="fm-tag-pill">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>
                        <i className="bx bx-x"></i>
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="fm-field">
                <label className="fm-check">
                  <input
                    type="checkbox"
                    checked={form.isAnonymous}
                    onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })}
                  />
                  <span>Đăng ẩn danh</span>
                </label>
              </div>
            </form>

            <div className="fm-modal-foot">
              <button type="button" className="fm-btn fm-btn-ghost" onClick={() => setModalOpen(false)} disabled={saving}>
                Hủy
              </button>
              <button type="button" className="fm-btn fm-btn-primary" disabled={saving} onClick={() => handleSubmit()}>
                {saving ? "Đang lưu..." : editing ? "Cập nhật" : "Tạo mới"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fm-toast">
          <i className="bx bx-check-circle"></i> {toast}
        </div>
      )}
    </div>
  );
};

export default AdminForumManagement;
