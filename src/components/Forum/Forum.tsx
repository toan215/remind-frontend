import { useState } from "react";
import { ForumPost } from "../../models/ForumPost";
import { ForumController } from "../../controllers/ForumController";
import PostDetail from "./PostDetail";
import CreatePostModal from "./CreatePostModal";
import "./Forum.css";

interface ForumProps {
  onBack: () => void;
  userRole: string;
  onLoginRequired: () => void;
}

function Forum({ onBack, userRole, onLoginRequired }: ForumProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  const handleCreatePost = () => {
    if (userRole === "guest") {
      alert("Vui lòng đăng nhập để tạo bài viết mới.");
      onLoginRequired();
      return;
    }
    setShowCreateModal(true);
  };

  const handleLike = (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (userRole === "guest") {
      onLoginRequired();
      return;
    }
    const userId = userRole === "admin" ? "admin-user" : "current-user";
    ForumController.toggleLike(postId, userId);
    refresh();
  };

  // Force re-read from localStorage on refreshKey change
  void refreshKey;
  const allPosts = ForumController.getPosts();
  const filteredPosts = searchTerm.trim()
    ? ForumController.searchPosts(searchTerm)
    : allPosts;

  const currentUserId = userRole === "admin" ? "admin-user" : "current-user";

  // If viewing a post detail, re-fetch fresh data
  if (selectedPost) {
    const freshPost = ForumController.getPostById(selectedPost.id);
    if (!freshPost) {
      setSelectedPost(null);
      return null;
    }

    return (
      <div className="forum-screen">
        <PostDetail
          post={freshPost}
          onBack={() => {
            setSelectedPost(null);
            refresh();
          }}
          userRole={userRole}
          onLoginRequired={onLoginRequired}
          onPostUpdate={refresh}
        />
      </div>
    );
  }

  return (
    <div className="forum-screen">
      <header className="forum-header">
        <button className="rm-back-btn" onClick={onBack} title="Quay lại">
          <i className="bx bx-arrow-back"></i>
        </button>
        <h1 className="forum-header-title">Góc tâm sự</h1>
      </header>

      <main className="forum-container">
        <div className="forum-intro">
          <h2>Cộng đồng ReMind</h2>
          <p>
            Nơi chia sẻ, lắng nghe và đồng cảm. Mọi tâm sự đều được trân
            trọng và ẩn danh tuyệt đối.
          </p>
        </div>

        <div className="forum-actions-bar">
          <div className="rm-input-wrapper forum-search-wrapper">
            <i className="bx bx-search forum-search-icon"></i>
            <input
              type="text"
              className="rm-input-field"
              placeholder="Tìm kiếm chủ đề, bài viết..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="rm-btn rm-btn-primary forum-create-btn"
            onClick={handleCreatePost}
          >
            <i className="bx bx-edit"></i>
            Tạo bài viết
          </button>
        </div>

        <div className="forum-post-list">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => {
              const commentCount = ForumController.getCommentCount(post.id);
              const isLiked = post.likedBy.includes(currentUserId);

              return (
                <div
                  key={post.id}
                  className="forum-post-card"
                  onClick={() => setSelectedPost(post)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="forum-post-header">
                    <span className="forum-post-author">
                      <i className="bx bxs-user-circle"></i> {post.author}
                    </span>
                    <span className="forum-post-time">
                      {ForumController.formatTimeAgo(post.createdAt)}
                    </span>
                  </div>
                  <h3 className="forum-post-title">{post.title}</h3>
                  <p className="forum-post-preview">
                    {post.content.length > 120
                      ? post.content.substring(0, 120) + "..."
                      : post.content}
                  </p>
                  <div className="forum-post-tags">
                    {post.tags.map((tag) => (
                      <span key={tag} className="forum-post-tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="forum-post-footer">
                    <div className="forum-post-stats">
                      <button
                        className={`forum-stat forum-like-btn ${isLiked ? "liked" : ""}`}
                        onClick={(e) => handleLike(post.id, e)}
                      >
                        <i className={`bx ${isLiked ? "bxs-heart" : "bx-heart"}`}></i>{" "}
                        {post.likes}
                      </button>
                      <span className="forum-stat">
                        <i className="bx bx-message-rounded-dots"></i>{" "}
                        {commentCount}
                      </span>
                    </div>
                    <button
                      className="rm-btn rm-btn-outline forum-read-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPost(post);
                      }}
                    >
                      Đọc tiếp
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="forum-empty">
              <i className="bx bx-search-alt"></i>
              <p>Không tìm thấy bài viết nào phù hợp.</p>
            </div>
          )}
        </div>
      </main>

      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onPostCreated={refresh}
        />
      )}
    </div>
  );
}

export default Forum;
