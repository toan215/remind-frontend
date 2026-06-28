import { useState, useEffect } from "react";
import ForumDetail from "./ForumDetail";
import type { ForumType, PostType } from "./types";
import { getForums, getPosts, createPost } from "../../services/forumService";
import "./Forum.css";
import "./ForumModal.css";

interface ForumProps {
  onBack: () => void;
  userRole: string;
  onLoginRequired: () => void;
}

function Forum({ onBack, userRole, onLoginRequired }: ForumProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  
  const [forums, setForums] = useState<ForumType[]>([]);
  const [currentForumId, setCurrentForumId] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTags, setNewPostTags] = useState("");
  
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    const fetchForumsAndPosts = async () => {
      try {
        setLoading(true);
        const fetchedForums = await getForums();
        setForums(fetchedForums);
        if (fetchedForums.length > 0) {
          const firstForumId = fetchedForums[0]._id;
          setCurrentForumId(firstForumId);
          const fetchedPosts = await getPosts(firstForumId);
          setPosts(fetchedPosts);
        }
      } catch (error) {
        console.error("Failed to fetch forums or posts", error);
      } finally {
        setLoading(false);
      }
    };
    fetchForumsAndPosts();
  }, []);

  const handleCreatePostClick = () => {
    if (userRole === "guest") {
      setShowAuthPrompt(true);
      return;
    }
    setIsModalOpen(true);
  };

  const handlePostClick = (postId: string) => {
    if (userRole === "guest") {
      setShowAuthPrompt(true);
      return;
    }
    setSelectedPostId(postId);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewPostTitle("");
    setNewPostContent("");
    setNewPostTags("");
  };

  const handleSubmitPost = async () => {
    if (!currentForumId) return;
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      alert("Vui lòng nhập tiêu đề và nội dung.");
      return;
    }
    try {
      const tagsArray = newPostTags.split(",").map(tag => tag.trim()).filter(Boolean);
      const newPost = await createPost(currentForumId, newPostTitle, newPostContent, tagsArray, 1);
      setPosts([newPost, ...posts]);
      handleCloseModal();
    } catch (error) {
      console.error("Failed to create post", error);
      alert("Có lỗi xảy ra khi tạo bài viết.");
    }
  };

  if (selectedPostId) {
    const post = posts.find(p => p._id === selectedPostId);
    if (post) {
      return (
        <ForumDetail 
          post={post} 
          onBack={() => setSelectedPostId(null)} 
          userRole={userRole} 
          onLoginRequired={onLoginRequired} 
        />
      );
    }
  }

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="forum-screen">
      <header className="forum-header">
        <button className="rm-back-btn" onClick={onBack} title="Quay lại">
          <i className="bx bx-arrow-back"></i>
        </button>
        <h1 className="forum-header-title">Góc Tâm Sự</h1>
      </header>

      <div className="forum-layout">
        <main className="forum-main-feed">
          <div className="forum-intro">
            <h2>Cộng đồng ReMind</h2>
            <p>Nơi chia sẻ, lắng nghe và đồng cảm. Mọi tâm sự đều được trân trọng và ẩn danh tuyệt đối.</p>
          </div>

          <div className="forum-actions-bar">
            <div className="rm-input-wrapper forum-search-wrapper">
              <i className="bx bx-search forum-search-icon" style={{ marginLeft: 12, color: 'var(--ink-500)' }}></i>
              <input 
                type="text" 
                className="rm-input-field" 
                placeholder="Tìm kiếm chủ đề, bài viết..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ padding: '12px 12px 12px 8px' }}
              />
            </div>
            <button 
              className={`rm-btn rm-btn-primary forum-create-btn ${userRole === "guest" ? "disabled" : ""}`} 
              onClick={handleCreatePostClick}
              style={userRole === "guest" ? { opacity: 0.6, cursor: 'pointer' } : {}}
            >
              <i className="bx bx-edit"></i>
              Tạo bài viết
            </button>
          </div>

          <div className="forum-post-list">
            {loading ? (
              <div className="forum-empty">
                <p>Đang tải bài viết...</p>
              </div>
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map(post => (
                <div 
                  key={post._id} 
                  className="forum-post-item" 
                  onClick={() => handlePostClick(post._id)}
                >
                  <div className="forum-post-header">
                    <span className="forum-post-author"><i className="bx bxs-user-circle"></i> {post.publicAuthorName}</span>
                    <span className="forum-post-time">{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="forum-post-title">{post.title}</h3>
                  <div className="forum-post-tags">
                    {post.tags && post.tags.map(tag => (
                      <span key={tag} className="forum-post-tag">#{tag}</span>
                    ))}
                  </div>
                  <div className="forum-post-footer">
                    <div className="forum-post-stats">
                      <span className="forum-stat"><i className="bx bx-heart"></i> {post.likeCount}</span>
                      <span className="forum-stat"><i className="bx bx-message-rounded-dots"></i> {post.commentCount}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="forum-empty">
                <i className="bx bx-search-alt"></i>
                <p>Không tìm thấy bài viết nào phù hợp.</p>
              </div>
            )}
          </div>
        </main>

        <aside className="forum-right-rail">
          <div className="forum-rail-panel">
            <h3 className="forum-rail-title"><i className="bx bxs-star"></i> Bài viết nổi bật</h3>
            <ul className="forum-rail-list">
              {posts.slice(0, 2).map(post => (
                <li className="forum-rail-list-item" key={`featured-${post._id}`}>
                  <a href={`#featured-${post._id}`} onClick={(e) => { e.preventDefault(); handlePostClick(post._id); }}>
                    {post.title}
                  </a>
                  <span className="forum-rail-meta">{post.commentCount} bình luận</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="forum-rail-panel">
            <h3 className="forum-rail-title"><i className="bx bxs-book-heart"></i> Tài liệu hướng dẫn</h3>
            <ul className="forum-rail-list">
              <li className="forum-rail-list-item">
                <a href="#doc-1" onClick={e => e.preventDefault()}>Quy tắc ứng xử trong cộng đồng ReMind</a>
              </li>
              <li className="forum-rail-list-item">
                <a href="#doc-2" onClick={e => e.preventDefault()}>Cách bảo vệ sức khỏe tinh thần mùa thi</a>
              </li>
              <li className="forum-rail-list-item">
                <a href="#doc-3" onClick={e => e.preventDefault()}>Hướng dẫn tìm kiếm chuyên gia tâm lý phù hợp</a>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {isModalOpen && (
        <div className="forum-modal-overlay">
          <div className="forum-modal-content">
            <div className="forum-modal-header">
              <h2>Tạo bài viết mới</h2>
              <button className="forum-modal-close" onClick={handleCloseModal}>&times;</button>
            </div>
            <div className="forum-modal-form">
              <input 
                className="forum-modal-input" 
                placeholder="Tiêu đề bài viết" 
                value={newPostTitle}
                onChange={e => setNewPostTitle(e.target.value)}
              />
              <textarea 
                className="forum-modal-textarea" 
                placeholder="Nội dung bài viết..."
                value={newPostContent}
                onChange={e => setNewPostContent(e.target.value)}
              />
              <input 
                className="forum-modal-input" 
                placeholder="Nhãn (tags), cách nhau bởi dấu phẩy" 
                value={newPostTags}
                onChange={e => setNewPostTags(e.target.value)}
              />
              <div className="forum-modal-footer">
                <button className="rm-btn" onClick={handleCloseModal}>Hủy</button>
                <button className="rm-btn rm-btn-primary" onClick={handleSubmitPost}>Đăng bài</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAuthPrompt && (
        <div className="forum-modal-overlay">
          <div className="forum-modal-content auth-prompt-content">
            <button className="forum-modal-close auth-prompt-close" onClick={() => setShowAuthPrompt(false)}>&times;</button>
            
            <div className="auth-prompt-icon-wrapper">
              <i className="bx bx-lock-alt"></i>
            </div>
            <h3>Yêu cầu đăng nhập</h3>
            <p>
              Vui lòng đăng nhập để xem chi tiết, bình luận và tạo bài viết mới trong Góc Tâm Sự.
            </p>
            <button className="rm-btn rm-btn-primary auth-prompt-btn" onClick={() => { setShowAuthPrompt(false); onLoginRequired(); }}>
              Đăng nhập ngay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Forum;
