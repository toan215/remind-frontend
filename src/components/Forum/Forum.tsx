import { useState, useEffect } from "react";
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
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Pagination states
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const refresh = () => {
    setRefreshKey((k) => k + 1);
  };

  // 1. Fetch initial posts when searching, or on manual refresh
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        if (searchTerm.trim()) {
          const searchResults = await ForumController.searchPosts(searchTerm);
          setPosts(searchResults);
          setHasNext(false);
          setCursor(null);
        } else {
          const result = await ForumController.getPosts(10);
          setPosts(result.posts);
          setCursor(result.nextCursor);
          setHasNext(result.hasNext);
        }
      } catch (err) {
        console.error("Failed to load forum posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [searchTerm, refreshKey]);

  // 2. Load more posts for infinite scroll
  const loadMorePosts = async () => {
    if (!hasNext || loadingMore || searchTerm.trim()) return;

    setLoadingMore(true);
    try {
      const result = await ForumController.getPosts(10, cursor || undefined);
      setPosts((prev) => [...prev, ...result.posts]);
      setCursor(result.nextCursor);
      setHasNext(result.hasNext);
    } catch (err) {
      console.error("Failed to load more posts:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // 3. Scroll listener for infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      const threshold = 150; // px from bottom
      const totalHeight = document.documentElement.scrollHeight;
      const scrollPosition = window.innerHeight + window.scrollY;

      if (totalHeight - scrollPosition <= threshold) {
        loadMorePosts();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasNext, loadingMore, cursor, searchTerm]);

  // 4. Handle like action on main post card
  const handleLike = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (userRole === "guest") {
      onLoginRequired();
      return;
    }
    try {
      const updatedPost = await ForumController.toggleLike(postId);
      // Update post like states immediately in the posts list
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post.id === postId ? updatedPost : post))
      );
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  const handleCreatePost = () => {
    if (userRole === "guest") {
      alert("Vui lòng đăng nhập để tạo bài viết mới.");
      onLoginRequired();
      return;
    }
    setShowCreateModal(true);
  };

  const userStr = localStorage.getItem("user");
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const currentUserId = currentUser ? currentUser._id || currentUser.id : null;

  // If viewing a post detail, render it
  if (selectedPost) {
    return (
      <div className="forum-screen">
        <PostDetail
          post={selectedPost}
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
          {loading && posts.length === 0 ? (
            <div className="forum-empty">
              <p>Đang tải bài viết...</p>
            </div>
          ) : posts.length > 0 ? (
            <>
              {posts.map((post) => {
                const displayCommentCount = (post as any).commentCount !== undefined ? (post as any).commentCount : 0;
                const isLiked = currentUserId ? post.likedBy.includes(currentUserId) : false;

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
                          {displayCommentCount}
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
              })}
              {loadingMore && (
                <div className="forum-empty" style={{ padding: "16px", border: "none" }}>
                  <p>Đang tải thêm bài viết...</p>
                </div>
              )}
            </>
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
