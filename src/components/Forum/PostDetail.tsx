import { useState, useEffect } from "react";
import { ForumPost } from "../../models/ForumPost";
import { ForumController } from "../../controllers/ForumController";
import CommentSection from "./CommentSection";
import "./PostDetail.css";

interface PostDetailProps {
  post: ForumPost;
  onBack: () => void;
  userRole: string;
  onLoginRequired: () => void;
  onPostUpdate: () => void;
}

function PostDetail({ post: initialPost, onBack, userRole, onLoginRequired, onPostUpdate }: PostDetailProps) {
  const [post, setPost] = useState<ForumPost>(initialPost);
  const [commentsCount, setCommentsCount] = useState(0);

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(initialPost.title);
  const [editContent, setEditContent] = useState(initialPost.content);
  const [editTags, setEditTags] = useState(initialPost.tags.join(", "));
  const [editIsAnonymous, setEditIsAnonymous] = useState(initialPost.isAnonymous);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchPostDetails = async () => {
    try {
      const details = await ForumController.getPostDetail(post.id);
      if (details) {
        setPost(details.post);
        setCommentsCount(details.comments.length);
      }
    } catch (err) {
      console.error("Failed to fetch post details:", err);
    }
  };

  useEffect(() => {
    fetchPostDetails();
  }, [post.id]);

  const handleLike = async () => {
    if (userRole === "guest") {
      onLoginRequired();
      return;
    }
    try {
      const updatedPost = await ForumController.toggleLike(post.id);
      setPost(updatedPost);
      onPostUpdate();
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.")) return;
    try {
      await ForumController.deletePost(post.id);
      onPostUpdate(); // Refresh the list
      onBack(); // Go back to the forum list
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("Xóa bài viết thất bại. Vui lòng thử lại.");
    }
  };

  const handleUpdatePost = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert("Tiêu đề và nội dung không được để trống");
      return;
    }
    setIsUpdating(true);
    try {
      const tagsArray = editTags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);
      
      const updatedPost = await ForumController.updatePost(post.id, {
        title: editTitle,
        content: editContent,
        tags: tagsArray,
        isAnonymous: editIsAnonymous,
      });
      setPost(updatedPost);
      setIsEditing(false);
      onPostUpdate();
    } catch (err) {
      console.error("Failed to update post:", err);
      alert("Cập nhật bài viết thất bại.");
    } finally {
      setIsUpdating(false);
    }
  };

  const userStr = localStorage.getItem("user");
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const currentUserId = currentUser ? currentUser._id || currentUser.id : null;
  const isLiked = currentUserId ? post.likedBy.includes(currentUserId) : false;

  return (
    <div className="post-detail">
      {/* Header */}
      <div className="post-detail-header">
        <button className="rm-back-btn" onClick={onBack} title="Quay lại">
          <i className="bx bx-arrow-back"></i>
        </button>
        <span className="post-detail-header-label">Chi tiết bài viết</span>
      </div>

      {/* Content */}
      <div className="post-detail-content">
        <article className="post-detail-article">
          {/* Meta */}
          <div className="post-detail-meta">
            <div className="post-detail-author">
              <i className="bx bxs-user-circle"></i>
              <span>{post.author}</span>
              {post.isAnonymous && (
                <span className="post-detail-anon-badge">
                  <i className="bx bx-hide"></i> Ẩn danh
                </span>
              )}
            </div>
            <span className="post-detail-time">
              {ForumController.formatTimeAgo(post.createdAt)}
            </span>
          </div>

          {post.isMine && !isEditing && (
            <div className="post-detail-owner-actions" style={{ marginBottom: "16px", display: "flex", gap: "8px" }}>
              <button 
                className="rm-btn rm-btn-outline" 
                style={{ padding: "4px 12px", fontSize: "14px", height: "auto" }}
                onClick={() => {
                  setEditTitle(post.title);
                  setEditContent(post.content);
                  setEditTags(post.tags.join(", "));
                  setEditIsAnonymous(post.isAnonymous);
                  setIsEditing(true);
                }}
              >
                <i className="bx bx-edit"></i> Sửa
              </button>
              <button 
                className="rm-btn rm-btn-danger" 
                style={{ padding: "4px 12px", fontSize: "14px", height: "auto" }}
                onClick={handleDeletePost}
              >
                <i className="bx bx-trash"></i> Xóa
              </button>
            </div>
          )}

          {isEditing ? (
            <div className="post-edit-form" style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px", background: "var(--surface-50)", padding: "16px", borderRadius: "8px" }}>
              <input
                className="rm-input-field"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Tiêu đề bài viết"
              />
              <textarea
                className="rm-input-field"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Nội dung bài viết"
                rows={5}
              />
              <input
                className="rm-input-field"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="Thẻ tags (cách nhau bằng dấu phẩy)"
              />
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={editIsAnonymous}
                  onChange={(e) => setEditIsAnonymous(e.target.checked)}
                />
                Đăng ẩn danh
              </label>
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <button className="rm-btn rm-btn-primary" onClick={handleUpdatePost} disabled={isUpdating}>
                  {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <button className="rm-btn rm-btn-outline" onClick={() => setIsEditing(false)} disabled={isUpdating}>
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Title */}
              <h2 className="post-detail-title">{post.title}</h2>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="post-detail-tags">
                  {post.tags.map((tag) => (
                    <span key={tag} className="forum-post-tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Body */}
              <div className="post-detail-body">
                {post.content.split("\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </>
          )}

          {/* Actions */}
          <div className="post-detail-actions">
            <button
              className={`post-action-btn ${isLiked ? "liked" : ""}`}
              onClick={handleLike}
            >
              <i className={`bx ${isLiked ? "bxs-heart" : "bx-heart"}`}></i>
              <span>{post.likes}</span>
            </button>
            <div className="post-action-btn">
              <i className="bx bx-message-rounded-dots"></i>
              <span>{commentsCount}</span>
            </div>
          </div>
        </article>

        {/* Divider */}
        <div className="post-detail-divider"></div>

        {/* Comments */}
        <CommentSection
          postId={post.id}
          userRole={userRole}
          onLoginRequired={onLoginRequired}
        />
      </div>
    </div>
  );
}

export default PostDetail;
