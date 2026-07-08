import { useState, useEffect, useRef } from "react";
import ForumDetail from "./ForumDetail";
import type { PostType } from "./types";
import { getForums, getPosts, createPost, searchPosts } from "../../services/forumService";
import type { ForumType } from "./types";
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

  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);

  // Search states
  const [searchResults, setSearchResults] = useState<PostType[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Forum selector
  const [forums, setForums] = useState<ForumType[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedForumId, setSelectedForumId] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTags, setNewPostTags] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [errors, setErrors] = useState({ title: false, forum: false, content: false });

  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [fallbackPost, setFallbackPost] = useState<PostType | null>(null);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  const fetchInitialPosts = async () => {
    try {
      setLoading(true);
      const res = await getPosts(undefined, 10);
      setPosts(res.posts);
      setNextCursor(res.nextCursor);
      setHasNext(res.hasNext);
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMorePosts = async () => {
    if (loadingMore || !hasNext || !nextCursor) return;
    try {
      setLoadingMore(true);
      const res = await getPosts(nextCursor, 10);
      setPosts((prev) => [...prev, ...res.posts]);
      setNextCursor(res.nextCursor);
      setHasNext(res.hasNext);
    } catch (error) {
      console.error("Failed to fetch more posts", error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchInitialPosts();
    getForums().then(setForums).catch(() => {});
  }, []);

  // Debounced search logic
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await searchPosts(searchTerm);
        setSearchResults(results);
      } catch (error) {
        console.error("Failed to search posts", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    if (!hasNext || loading || loadingMore || searchTerm.trim()) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasNext, loading, loadingMore, nextCursor, searchTerm]);

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
    setSelectedForumId("");
    setNewPostTitle("");
    setNewPostContent("");
    setNewPostTags("");
    setIsAnonymous(false);
    setErrors({ title: false, forum: false, content: false });
  };

  const handleSubmitPost = async () => {
    const hasError = {
      title: !newPostTitle.trim(),
      forum: !selectedForumId,
      content: !newPostContent.trim(),
    };

    if (hasError.title || hasError.forum || hasError.content) {
      setErrors(hasError);
      setToastMessage({ type: 'error', text: 'Vui lòng điền đầy đủ các thông tin bắt buộc (*)' });
      setTimeout(() => setToastMessage(null), 5000);
      return;
    }

    setErrors({ title: false, forum: false, content: false });
    setIsPosting(true);
    try {
      const tagsArray = newPostTags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);

      const newPost = await createPost(
        selectedForumId,
        newPostTitle,
        newPostContent,
        tagsArray,
        isAnonymous ? 1 : 0, // 1 is anonymous, 0 is real name
      );
      setPosts([newPost, ...posts]);
      handleCloseModal();
      setToastMessage({ type: 'success', text: 'Bạn vừa đăng bài thành công!' });
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      console.error(err);
      setToastMessage({ type: 'error', text: 'Đã có lỗi xảy ra khi đăng bài.' });
      setTimeout(() => setToastMessage(null), 5000);
    } finally {
      setIsPosting(false);
    }
  };

  // Fetch post detail when clicked from search results (not in local arrays)
  useEffect(() => {
    if (!selectedPostId) { setFallbackPost(null); return; }
    const inPosts = posts.find((p) => p._id === selectedPostId);
    const inSearch = searchResults.find((p) => p._id === selectedPostId);
    if (!inPosts && !inSearch) {
      import("../../services/forumService").then(({ getPostDetail }) =>
        getPostDetail(selectedPostId).then((data) => setFallbackPost(data.post))
      ).catch(() => {});
    }
  }, [selectedPostId, posts, searchResults]);

  const selectedPost = selectedPostId ? (posts.find((p) => p._id === selectedPostId)
    ?? searchResults.find((p) => p._id === selectedPostId)
    ?? fallbackPost) : null;

  const displayPosts = searchTerm.trim() ? searchResults : posts;
  const isFeedLoading = searchTerm.trim() ? isSearching : loading;

  // Process forums to get distinct categories
  const groupedForums = forums.reduce((acc, f) => {
    let cleanTitle = f.title;
    if (cleanTitle.includes('-')) {
      cleanTitle = cleanTitle.split('-').pop()?.trim() || cleanTitle;
    } else if (cleanTitle.includes('#')) {
      cleanTitle = cleanTitle.replace(/Forum Topic #\d+/i, '').trim();
    }
    if (!acc[cleanTitle]) acc[cleanTitle] = f._id;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="forum-screen">
      {toastMessage && (
        <div className={`forum-toast ${toastMessage.type}`}>
          <div className="forum-toast-content">
            {toastMessage.type === 'success' ? (
              <i className="bx bx-check-circle" style={{ color: '#52c41a', fontSize: '20px' }}></i>
            ) : (
              <i className="bx bx-error-circle" style={{ color: '#ff4d4f', fontSize: '20px' }}></i>
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button className="forum-toast-close" onClick={() => setToastMessage(null)}>
            <i className="bx bx-x"></i>
          </button>
        </div>
      )}


      <div className="forum-layout">
        <main className="forum-main-feed">
          <div className="forum-intro">
            <h2>Cộng đồng ReMind</h2>
            <p>
              Nơi chia sẻ, lắng nghe và đồng cảm. Mọi tâm sự đều được trân trọng
              và ẩn danh tuyệt đối.
            </p>
          </div>
          <div className="forum-actions-bar">
            <div className="rm-input-wrapper forum-search-wrapper">
              <i
                className="bx bx-search forum-search-icon"
                style={{ marginLeft: 12, color: "var(--ink-500)" }}
              ></i>
              <input
                type="text"
                className="rm-input-field"
                placeholder="Tìm kiếm chủ đề, bài viết..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: "12px 12px 12px 8px" }}
              />
            </div>
            <button
              className={`rm-btn rm-btn-primary forum-create-btn ${userRole === "guest" ? "disabled" : ""}`}
              onClick={handleCreatePostClick}
              style={
                userRole === "guest" ? { opacity: 0.6, cursor: "pointer" } : {}
              }
            >
              <i className="bx bx-edit"></i>
              Tạo bài viết
            </button>
          </div>

          <div className="forum-post-list">
            {isFeedLoading ? (
              <div className="forum-empty">
                <p>Đang tải bài viết...</p>
              </div>
            ) : displayPosts.length > 0 ? (
              <>
                {displayPosts.map((post) => (
                  <div
                    key={post._id}
                    className="forum-post-item"
                    onClick={() => handlePostClick(post._id)}
                  >
                    <div className="forum-post-header">
                      <span className="forum-post-author">
                        <i className="bx bxs-user-circle"></i>{" "}
                        {post.publicAuthorName}
                      </span>
                      <span className="forum-post-time">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="forum-post-title">{post.title}</h3>
                    <div className="forum-post-tags">
                      {post.tags &&
                        post.tags.map((tag) => (
                          <span key={tag} className="forum-post-tag">
                            #{tag}
                          </span>
                        ))}
                    </div>
                    <div className="forum-post-footer">
                      <div className="forum-post-stats">
                        <span className="forum-stat">
                          <i className="bx bx-heart"></i> {post.likeCount}
                        </span>
                        <span className="forum-stat">
                          <i className="bx bx-message-rounded-dots"></i>{" "}
                          {post.commentCount}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {!searchTerm.trim() && hasNext && (
                  <div ref={loaderRef} className="forum-loading-more">
                    {loadingMore ? "Đang tải thêm bài viết..." : "Cuộn để tải thêm"}
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

        <aside className="forum-right-rail">
          <div className="forum-rail-panel">
            <h3 className="forum-rail-title">
              <i className="bx bxs-star"></i> Bài viết nổi bật
            </h3>
            <ul className="forum-rail-list">
              {posts.slice(0, 2).map((post) => (
                <li
                  className="forum-rail-list-item"
                  key={`featured-${post._id}`}
                >
                  <a
                    href={`#featured-${post._id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePostClick(post._id);
                    }}
                  >
                    {post.title}
                  </a>
                  <span className="forum-rail-meta">
                    {post.commentCount} bình luận
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="forum-rail-panel">
            <h3 className="forum-rail-title">
              <i className="bx bxs-book-heart"></i> Tài liệu hướng dẫn
            </h3>
            <ul className="forum-rail-list">
              <li className="forum-rail-list-item">
                <a href="#doc-1" onClick={(e) => e.preventDefault()}>
                  Quy tắc ứng xử trong cộng đồng ReMind
                </a>
              </li>
              <li className="forum-rail-list-item">
                <a href="#doc-2" onClick={(e) => e.preventDefault()}>
                  Cách bảo vệ sức khỏe tinh thần mùa thi
                </a>
              </li>
              <li className="forum-rail-list-item">
                <a href="#doc-3" onClick={(e) => e.preventDefault()}>
                  Hướng dẫn tìm kiếm chuyên gia tâm lý phù hợp
                </a>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {isModalOpen && (
        <div className="forum-modal-overlay">
          <div className="forum-modal-content new-layout">
            <div className="forum-modal-header new-header">
              <button className="forum-modal-close" onClick={handleCloseModal}>
                <i className="bx bx-x"></i>
              </button>
              <h2>Tạo bài viết mới</h2>
              <button
                className="rm-btn rm-btn-primary header-submit-btn"
                onClick={handleSubmitPost}
                disabled={isPosting}
              >
                {isPosting ? <i className="bx bx-loader-alt bx-spin"></i> : null}
                {isPosting ? " Đang đăng..." : "Đăng"}
              </button>
            </div>
            <div className="forum-modal-form new-body">
              <div className="new-modal-field">
                <label>Tiêu đề <span style={{color: '#ff4d4f'}}>*</span></label>
                <input
                  className={`forum-modal-input ${errors.title ? 'input-error' : ''}`}
                  placeholder="Nhập tiêu đề bài viết..."
                  value={newPostTitle}
                  onChange={(e) => {
                    setNewPostTitle(e.target.value);
                    if (errors.title) setErrors({ ...errors, title: false });
                  }}
                />
                {errors.title && <span className="forum-error-msg">Vui lòng nhập tiêu đề bài viết</span>}
              </div>

              <div className="new-modal-field">
                <label>Chọn chuyên mục <span style={{color: '#ff4d4f'}}>*</span></label>
                <div className={`new-modal-chips ${errors.forum ? 'chips-error' : ''}`}>
                  {Object.entries(groupedForums).map(([category, forumId]) => (
                    <button
                      key={forumId}
                      className={`new-modal-chip ${selectedForumId === forumId ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedForumId(forumId);
                        if (errors.forum) setErrors({ ...errors, forum: false });
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                {errors.forum && <span className="forum-error-msg">Vui lòng chọn chuyên mục</span>}
              </div>

              <div className="new-modal-field">
                <label>Nội dung <span style={{color: '#ff4d4f'}}>*</span></label>
                <textarea
                  className={`forum-modal-textarea ${errors.content ? 'input-error' : ''}`}
                  placeholder="Chia sẻ suy nghĩ của bạn..."
                  value={newPostContent}
                  onChange={(e) => {
                    setNewPostContent(e.target.value);
                    if (errors.content) setErrors({ ...errors, content: false });
                  }}
                />
                {errors.content && <span className="forum-error-msg">Vui lòng nhập nội dung bài viết</span>}
              </div>

              <div className="new-modal-anon-box">
                <div className="new-modal-anon-info">
                  <span className="anon-title">Đăng ẩn danh</span>
                  <span className="anon-desc">Tên của bạn sẽ được ẩn đi trong cộng đồng</span>
                </div>
                <label className="new-modal-switch">
                  <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAuthPrompt && (
        <div className="forum-modal-overlay">
          <div className="forum-modal-content auth-prompt-content">
            <button
              className="forum-modal-close auth-prompt-close"
              onClick={() => setShowAuthPrompt(false)}
            >
              &times;
            </button>

            <div className="auth-prompt-icon-wrapper">
              <i className="bx bx-lock-alt"></i>
            </div>
            <h3>Yêu cầu đăng nhập</h3>
            <p>
              Vui lòng đăng nhập để xem chi tiết, bình luận và tạo bài viết mới
              trong Góc Tâm Sự.
            </p>
            <button
              className="rm-btn rm-btn-primary auth-prompt-btn"
              onClick={() => {
                setShowAuthPrompt(false);
                onLoginRequired();
              }}
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      )}
      
      {selectedPost && (
        <ForumDetail
          post={selectedPost}
          onBack={() => { setSelectedPostId(null); setFallbackPost(null); }}
          userRole={userRole}
          onLoginRequired={onLoginRequired}
        />
      )}
    </div>
  );
}

export default Forum;
