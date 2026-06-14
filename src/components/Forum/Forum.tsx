import { useState } from "react";
import "./Forum.css";

interface ForumProps {
  onBack: () => void;
  userRole: string;
  onLoginRequired: () => void;
}

const MOCK_POSTS = [
  { id: 1, title: "Làm sao để vượt qua áp lực đồng lứa khi mọi người đều có thành tựu?", author: "Anonymous Bear", tags: ["Áp lực đồng lứa", "Stress"], replies: 12, likes: 45, time: "2 giờ trước" },
  { id: 2, title: "Kỹ năng quản lý thời gian hiệu quả cho sinh viên năm nhất", author: "Studyholic", tags: ["Kỹ năng", "Học tập"], replies: 5, likes: 23, time: "4 giờ trước" },
  { id: 3, title: "Cảm giác kiệt sức sau một tuần dài, có ai muốn tâm sự không?", author: "Sleepy Cat", tags: ["Burnout", "Tâm sự"], replies: 28, likes: 112, time: "Hôm qua" }
];

function Forum({ onBack, userRole, onLoginRequired }: ForumProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleCreatePost = () => {
    if (userRole === "guest") {
      alert("Vui lòng đăng nhập để tạo bài viết mới.");
      onLoginRequired();
      return;
    }
    alert("Tính năng tạo bài viết đang được phát triển!");
  };

  const filteredPosts = MOCK_POSTS.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <p>Nơi chia sẻ, lắng nghe và đồng cảm. Mọi tâm sự đều được trân trọng và ẩn danh tuyệt đối.</p>
        </div>

        <div className="forum-actions-bar">
          <div className="rm-input-wrapper forum-search-wrapper">
            <i className="bx bx-search forum-search-icon"></i>
            <input 
              type="text" 
              className="rm-input-field" 
              placeholder="Tìm kiếm chủ đề, bài viết..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="rm-btn rm-btn-primary forum-create-btn" onClick={handleCreatePost}>
            <i className="bx bx-edit"></i>
            Tạo bài viết
          </button>
        </div>

        <div className="forum-post-list">
          {filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <div key={post.id} className="forum-post-card">
                <div className="forum-post-header">
                  <span className="forum-post-author"><i className="bx bxs-user-circle"></i> {post.author}</span>
                  <span className="forum-post-time">{post.time}</span>
                </div>
                <h3 className="forum-post-title">{post.title}</h3>
                <div className="forum-post-tags">
                  {post.tags.map(tag => (
                    <span key={tag} className="forum-post-tag">#{tag}</span>
                  ))}
                </div>
                <div className="forum-post-footer">
                  <div className="forum-post-stats">
                    <span className="forum-stat"><i className="bx bx-heart"></i> {post.likes}</span>
                    <span className="forum-stat"><i className="bx bx-message-rounded-dots"></i> {post.replies}</span>
                  </div>
                  <button className="rm-btn rm-btn-outline forum-read-btn">Đọc tiếp</button>
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
    </div>
  );
}

export default Forum;
