import { useState, useEffect } from "react";
import ForumDetail from "./ForumDetail";
import type { PostType, ForumType } from "./types";
import { getForums, getPosts, createPost, searchPosts } from "../../services/forumService";
import "./Forum.css";
import "./ForumModal.css";

interface ForumProps {
  onBack: () => void;
  userRole: string;
  onLoginRequired: () => void;
}

function Forum({ userRole, onLoginRequired }: ForumProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [gotoPageInput, setGotoPageInput] = useState("");

  // Search states
  const [searchResults, setSearchResults] = useState<PostType[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"latest" | "popular" | "oldest">("latest");
  const [filterType, setFilterType] = useState<"all" | "anonymous" | "public">("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

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
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [errors, setErrors] = useState({ title: false, forum: false, content: false });

  const [fallbackPost, setFallbackPost] = useState<PostType | null>(null);

  const fetchPostsByPage = async (page: number, cat: string = selectedCategory) => {
    try {
      setLoading(true);
      const res = await getPosts(page, 10, cat);
      setPosts(res.posts);
      setCurrentPage(res.currentPage);
      setTotalPages(res.totalPages);
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
    fetchPostsByPage(1, catId);
  };

  useEffect(() => {
    fetchPostsByPage(1);
    getForums().then(setForums).catch(() => {});
  }, []);

  useEffect(() => {
    const postId = new URLSearchParams(window.location.search).get("post");
    if (postId) setSelectedPostId(postId);
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

  const handleCreatePostClick = () => {
    if (userRole === "guest") {
      onLoginRequired();
      return;
    }
    setIsModalOpen(true);
  };

  const handlePostClick = (postId: string) => {
    if (userRole === "guest") {
      onLoginRequired();
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
      setToastMessage({ type: "error", text: "Vui lòng điền đầy đủ các thông tin bắt buộc (*)" });
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
        isAnonymous ? 1 : 0
      );
      setPosts([newPost, ...posts]);
      handleCloseModal();
      setToastMessage({ type: "success", text: "Bạn vừa đăng bài thành công!" });
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      console.error(err);
      setToastMessage({ type: "error", text: "Đã có lỗi xảy ra khi đăng bài." });
      setTimeout(() => setToastMessage(null), 5000);
    } finally {
      setIsPosting(false);
    }
  };

  const handleGotoPageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(gotoPageInput.trim(), 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      fetchPostsByPage(pageNum);
      setGotoPageInput("");
    }
  };

  // Helper to generate visible page numbers (max 5 buttons)
  const getVisiblePageNumbers = (current: number, total: number) => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Fetch post detail when clicked from search results (not in local arrays)
  useEffect(() => {
    if (!selectedPostId) {
      setFallbackPost(null);
      return;
    }
    const inPosts = posts.find((p) => p._id === selectedPostId);
    const inSearch = searchResults.find((p) => p._id === selectedPostId);
    if (!inPosts && !inSearch) {
      import("../../services/forumService")
        .then(({ getPostDetail }) =>
          getPostDetail(selectedPostId).then((data) => setFallbackPost(data.post))
        )
        .catch(() => {});
    }
  }, [selectedPostId, posts, searchResults]);

  const selectedPost = selectedPostId
    ? posts.find((p) => p._id === selectedPostId) ??
      searchResults.find((p) => p._id === selectedPostId) ??
      fallbackPost
    : null;

  const rawDisplayPosts = searchTerm.trim() ? searchResults : posts;
  const isFeedLoading = searchTerm.trim() ? isSearching : loading;

  // Process forums to get distinct categories
  const groupedForums = forums.reduce((acc, f) => {
    let cleanTitle = f.title;
    if (cleanTitle.includes("-")) {
      cleanTitle = cleanTitle.split("-").pop()?.trim() || cleanTitle;
    } else if (cleanTitle.includes("#")) {
      cleanTitle = cleanTitle.replace(/Forum Topic #\d+/i, "").trim();
    }
    if (!acc[cleanTitle]) acc[cleanTitle] = f._id;
    return acc;
  }, {} as Record<string, string>);

  // Map forumId to category title
  const forumIdToTitleMap = Object.entries(groupedForums).reduce((acc, [title, id]) => {
    acc[id] = title;
    return acc;
  }, {} as Record<string, string>);

  // Popular tags extracted dynamically
  const popularTags = Array.from(
    new Set(posts.flatMap((p) => p.tags || []))
  ).filter(Boolean).slice(0, 10);

  // Filtered & Sorted Posts
  const filteredPosts = rawDisplayPosts
    .filter((post) => {
      if (selectedCategory !== "all" && post.forumId !== selectedCategory) {
        return false;
      }
      if (filterType === "anonymous" && !post.isAnonymous) return false;
      if (filterType === "public" && post.isAnonymous) return false;
      if (selectedTag !== "all" && (!post.tags || !post.tags.includes(selectedTag))) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "popular") {
        const scoreA = (a.likeCount || 0) + (a.commentCount || 0);
        const scoreB = (b.likeCount || 0) + (b.commentCount || 0);
        return scoreB - scoreA;
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const hasActiveFilters =
    selectedCategory !== "all" ||
    sortBy !== "latest" ||
    filterType !== "all" ||
    selectedTag !== "all" ||
    searchTerm.trim() !== "";

  const handleResetFilters = () => {
    setSearchTerm("");
    setSortBy("latest");
    setFilterType("all");
    setSelectedTag("all");
    handleCategorySelect("all");
  };

  return (
    <div className="forum-screen">
      {toastMessage && (
        <div className={`forum-toast ${toastMessage.type}`}>
          <div className="forum-toast-content">
            {toastMessage.type === "success" ? (
              <i className="bx bx-check-circle" style={{ color: "#52c41a", fontSize: "20px" }}></i>
            ) : (
              <i className="bx bx-error-circle" style={{ color: "#ff4d4f", fontSize: "20px" }}></i>
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button className="forum-toast-close" onClick={() => setToastMessage(null)}>
            <i className="bx bx-x"></i>
          </button>
        </div>
      )}

      {/* Main Forum Container aligned with design padding */}
      <div className="forum-container">
        {/* Mobile Filter Bar */}
        <div className="forum-mobile-filter-bar">
          <button
            className="forum-mobile-filter-btn"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          >
            <i className="bx bx-filter-alt"></i>
            {mobileFilterOpen ? "Ẩn bộ lọc" : "Bộ lọc & Tìm kiếm"}
            {hasActiveFilters && <span className="forum-filter-badge-dot"></span>}
          </button>
          <button
            className={`rm-btn rm-btn-primary forum-create-btn-sm ${userRole === "guest" ? "disabled" : ""}`}
            onClick={handleCreatePostClick}
          >
            <i className="bx bx-plus"></i> Đăng bài
          </button>
        </div>

        <div className="forum-layout">
          {/* LEFT SIDE: Floating Filter Sidebar */}
          <aside className={`forum-filter-sidebar ${mobileFilterOpen ? "open" : ""}`}>
            <div className="forum-sidebar-card">
              {/* Header / Create Post Button */}
              <div className="forum-sidebar-top">
                <button
                  className={`rm-btn rm-btn-primary forum-sidebar-create-btn ${userRole === "guest" ? "disabled" : ""}`}
                  onClick={handleCreatePostClick}
                  style={userRole === "guest" ? { opacity: 0.85, cursor: "pointer" } : {}}
                >
                  <i className="bx bx-edit-alt"></i>
                  <span>Tạo bài viết mới</span>
                </button>
              </div>

              {/* 1. Large Search Box */}
              <div className="forum-filter-group">
                <label className="forum-filter-label">
                  <i className="bx bx-search-alt"></i> Tìm kiếm
                </label>
                <div className="rm-input-wrapper forum-search-wrapper large">
                  <i className="bx bx-search forum-search-icon large-icon"></i>
                  <input
                    type="text"
                    className="rm-input-field forum-search-input-lg"
                    placeholder="Tìm kiếm chủ đề, bài viết..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      className="forum-search-clear large-clear"
                      onClick={() => setSearchTerm("")}
                      title="Xóa tìm kiếm"
                    >
                      <i className="bx bx-x"></i>
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Topics / Categories Filter */}
              <div className="forum-filter-group">
                <label className="forum-filter-label">
                  <i className="bx bx-category-alt"></i> Chủ đề thảo luận
                </label>
                <div className="forum-filter-options vertical">
                  <button
                    className={`forum-filter-chip ${selectedCategory === "all" ? "active" : ""}`}
                    onClick={() => handleCategorySelect("all")}
                  >
                    <span className="chip-text">Tất cả chủ đề</span>
                  </button>
                  {Object.entries(groupedForums).map(([category, forumId]) => (
                    <button
                      key={forumId}
                      className={`forum-filter-chip ${selectedCategory === forumId ? "active" : ""}`}
                      onClick={() => handleCategorySelect(forumId)}
                    >
                      <span className="chip-text">{category}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Sort Filter */}
              <div className="forum-filter-group">
                <label className="forum-filter-label">
                  <i className="bx bx-sort-alt-2"></i> Sắp xếp bài viết
                </label>
                <div className="forum-filter-options horizontal">
                  <button
                    className={`forum-sort-btn ${sortBy === "latest" ? "active" : ""}`}
                    onClick={() => setSortBy("latest")}
                  >
                    Mới nhất
                  </button>
                  <button
                    className={`forum-sort-btn ${sortBy === "popular" ? "active" : ""}`}
                    onClick={() => setSortBy("popular")}
                  >
                    Sôi nổi
                  </button>
                  <button
                    className={`forum-sort-btn ${sortBy === "oldest" ? "active" : ""}`}
                    onClick={() => setSortBy("oldest")}
                  >
                    Cũ nhất
                  </button>
                </div>
              </div>

              {/* 4. Post Mode Filter */}
              <div className="forum-filter-group">
                <label className="forum-filter-label">
                  <i className="bx bx-user-pin"></i> Chế độ bài viết
                </label>
                <div className="forum-filter-options vertical">
                  <button
                    className={`forum-filter-chip ${filterType === "all" ? "active" : ""}`}
                    onClick={() => setFilterType("all")}
                  >
                    <i className="bx bx-grid-alt"></i> Tất cả bài viết
                  </button>
                  <button
                    className={`forum-filter-chip ${filterType === "anonymous" ? "active" : ""}`}
                    onClick={() => setFilterType("anonymous")}
                  >
                    <i className="bx bxs-mask"></i> Bài viết ẩn danh
                  </button>
                  <button
                    className={`forum-filter-chip ${filterType === "public" ? "active" : ""}`}
                    onClick={() => setFilterType("public")}
                  >
                    <i className="bx bxs-user"></i> Bài viết công khai
                  </button>
                </div>
              </div>

              {/* 5. Popular Tags */}
              {popularTags.length > 0 && (
                <div className="forum-filter-group">
                  <label className="forum-filter-label">
                    <i className="bx bx-hash"></i> Thẻ phổ biến
                  </label>
                  <div className="forum-tag-cloud">
                    {popularTags.map((tag) => (
                      <button
                        key={tag}
                        className={`forum-tag-pill ${selectedTag === tag ? "active" : ""}`}
                        onClick={() => setSelectedTag(selectedTag === tag ? "all" : tag)}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Reset Button */}
              {hasActiveFilters && (
                <button className="forum-reset-filters-btn" onClick={handleResetFilters}>
                  <i className="bx bx-refresh"></i> Đặt lại bộ lọc
                </button>
              )}
            </div>
          </aside>

          {/* RIGHT SIDE: Posts Feed in Grid Layout */}
          <main className="forum-main-feed">
            {/* Header Intro Banner */}
            <div className="forum-feed-header">
              <div className="forum-feed-intro">
                <h2>Góc Tâm Sự ReMind</h2>
                <p>
                  Nơi chia sẻ, lắng nghe và đồng cảm. Mọi tâm sự đều được trân trọng và giữ gìn an toàn.
                </p>
              </div>

              {/* Active Filter Summary Bar */}
              <div className="forum-results-summary">
                <span className="forum-results-count">
                  Hiển thị <strong>{filteredPosts.length}</strong> bài viết
                </span>
                {hasActiveFilters && (
                  <div className="forum-active-tags">
                    {selectedCategory !== "all" && (
                      <span className="forum-active-badge">
                        Chủ đề: {forumIdToTitleMap[selectedCategory] || selectedCategory}
                        <i className="bx bx-x" onClick={() => handleCategorySelect("all")}></i>
                      </span>
                    )}
                    {filterType !== "all" && (
                      <span className="forum-active-badge">
                        Chế độ: {filterType === "anonymous" ? "Ẩn danh" : "Công khai"}
                        <i className="bx bx-x" onClick={() => setFilterType("all")}></i>
                      </span>
                    )}
                    {selectedTag !== "all" && (
                      <span className="forum-active-badge">
                        #{selectedTag}
                        <i className="bx bx-x" onClick={() => setSelectedTag("all")}></i>
                      </span>
                    )}
                    {searchTerm.trim() !== "" && (
                      <span className="forum-active-badge">
                        Từ khóa: "{searchTerm}"
                        <i className="bx bx-x" onClick={() => setSearchTerm("")}></i>
                      </span>
                    )}
                    <button className="forum-clear-all-link" onClick={handleResetFilters}>
                      Xóa bộ lọc
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Posts Grid Container */}
            {isFeedLoading ? (
              <div className="forum-empty">
                <i className="bx bx-loader-alt bx-spin" style={{ fontSize: "36px", color: "var(--brand-700)" }}></i>
                <p style={{ marginTop: "12px" }}>Đang tải danh sách bài viết...</p>
              </div>
            ) : filteredPosts.length > 0 ? (
              <>
                <div className="forum-posts-grid">
                  {filteredPosts.map((post) => {
                    const categoryName = forumIdToTitleMap[post.forumId] || "Thảo luận";
                    return (
                      <div
                        key={post._id}
                        className="forum-grid-card"
                        onClick={() => handlePostClick(post._id)}
                      >
                        <div className="forum-card-top">
                          <div className="forum-card-author">
                            <div className={`forum-author-avatar ${post.isAnonymous ? "anon" : ""}`}>
                              <i className={`bx ${post.isAnonymous ? "bxs-mask" : "bxs-user"}`}></i>
                            </div>
                            <div className="forum-author-info">
                              <span className="forum-author-name">{post.publicAuthorName}</span>
                              <span className="forum-post-date">
                                {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                              </span>
                            </div>
                          </div>
                          <span className="forum-category-badge">{categoryName}</span>
                        </div>

                        <h3 className="forum-card-title">{post.title}</h3>

                        {post.content && (
                          <p className="forum-card-excerpt">
                            {post.content.replace(/<[^>]*>?/gm, "")}
                          </p>
                        )}

                        {post.tags && post.tags.length > 0 && (
                          <div className="forum-card-tags">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="forum-card-tag">
                                #{tag}
                              </span>
                            ))}
                            {post.tags.length > 3 && (
                              <span className="forum-card-tag-more">+{post.tags.length - 3}</span>
                            )}
                          </div>
                        )}

                        <div className="forum-card-footer">
                          <div className="forum-card-stats">
                            <span className="forum-stat-item">
                              <i className="bx bx-heart"></i> {post.likeCount || 0}
                            </span>
                            <span className="forum-stat-item">
                              <i className="bx bx-message-rounded-dots"></i> {post.commentCount || 0}
                            </span>
                          </div>
                          <span className="forum-card-readmore">
                            Xem chi tiết <i className="bx bx-chevron-right"></i>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Custom Image-matched Pagination Bar */}
                {!searchTerm.trim() && totalPages > 1 && (
                  <div className="forum-pagination">
                    <button
                      className="forum-page-arrow"
                      disabled={currentPage === 1 || loading}
                      onClick={() => fetchPostsByPage(1)}
                      title="Trang đầu"
                    >
                      &laquo;
                    </button>
                    <button
                      className="forum-page-arrow"
                      disabled={currentPage === 1 || loading}
                      onClick={() => fetchPostsByPage(currentPage - 1)}
                      title="Trang trước"
                    >
                      &lsaquo;
                    </button>

                    <div className="forum-page-numbers">
                      {getVisiblePageNumbers(currentPage, totalPages).map((pageNum) => (
                        <button
                          key={pageNum}
                          className={`forum-page-num ${currentPage === pageNum ? "active" : ""}`}
                          onClick={() => fetchPostsByPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      className="forum-page-arrow"
                      disabled={currentPage === totalPages || loading}
                      onClick={() => fetchPostsByPage(currentPage + 1)}
                      title="Trang sau"
                    >
                      &rsaquo;
                    </button>
                    <button
                      className="forum-page-arrow"
                      disabled={currentPage === totalPages || loading}
                      onClick={() => fetchPostsByPage(totalPages)}
                      title="Trang cuối"
                    >
                      &raquo;
                    </button>

                    <div className="forum-page-divider"></div>

                    <form className="forum-goto-page" onSubmit={handleGotoPageSubmit}>
                      <span className="forum-goto-label">Đi tới trang</span>
                      <input
                        type="number"
                        min={1}
                        max={totalPages}
                        className="forum-goto-input"
                        value={gotoPageInput}
                        onChange={(e) => setGotoPageInput(e.target.value)}
                        placeholder=""
                      />
                    </form>
                  </div>
                )}
              </>
            ) : (
              <div className="forum-empty">
                <i className="bx bx-search-alt"></i>
                <h3>Không tìm thấy bài viết phù hợp</h3>
                <p>Thử điều chỉnh từ khóa tìm kiếm hoặc chọn lại chủ đề khác ở thanh bộ lọc.</p>
                {hasActiveFilters && (
                  <button className="rm-btn rm-btn-outline" onClick={handleResetFilters} style={{ marginTop: "16px" }}>
                    Xóa bộ lọc tìm kiếm
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
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
                <label>Tiêu đề <span style={{ color: "#ff4d4f" }}>*</span></label>
                <input
                  className={`forum-modal-input ${errors.title ? "input-error" : ""}`}
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
                <label>Chọn chuyên mục <span style={{ color: "#ff4d4f" }}>*</span></label>
                <div className={`new-modal-chips ${errors.forum ? "chips-error" : ""}`}>
                  {Object.entries(groupedForums).map(([category, forumId]) => (
                    <button
                      key={forumId}
                      className={`new-modal-chip ${selectedForumId === forumId ? "selected" : ""}`}
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
                <label>Nội dung <span style={{ color: "#ff4d4f" }}>*</span></label>
                <textarea
                  className={`forum-modal-textarea ${errors.content ? "input-error" : ""}`}
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

      {selectedPost && (
        <ForumDetail
          post={selectedPost}
          onBack={() => {
            setSelectedPostId(null);
            setFallbackPost(null);
          }}
          userRole={userRole}
          onLoginRequired={onLoginRequired}
          onUpdatePost={(updatedPost) => {
            setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
          }}
          onDeletePost={(postId) => {
            setPosts((prev) => prev.filter((p) => p._id !== postId));
          }}
        />
      )}
    </div>
  );
}

export default Forum;
