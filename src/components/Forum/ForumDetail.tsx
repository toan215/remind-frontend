import { useState, useEffect } from "react";
import { PostType, CommentType } from "./types";
import { getPostDetail, createComment } from "../../services/forumService";
import "./ForumDetail.css";

interface ForumDetailProps {
  post: PostType;
  onBack: () => void;
  userRole: string;
  onLoginRequired: () => void;
}

function ForumDetail({ post, onBack, userRole, onLoginRequired }: ForumDetailProps) {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await getPostDetail(post._id);
        setComments(data.comments);
      } catch (error) {
        console.error("Failed to fetch post detail", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [post._id]);

  const handleSubmitComment = async () => {
    if (userRole === "guest") {
      alert("Vui lòng đăng nhập để bình luận.");
      onLoginRequired();
      return;
    }
    
    if (!commentText.trim()) return;

    try {
      const newComment = await createComment(post._id, commentText, 1);
      setComments([...comments, newComment]);
      setCommentText("");
    } catch (error) {
      console.error("Failed to create comment", error);
      alert("Có lỗi xảy ra khi gửi bình luận.");
    }
  };

  return (
    <div className="forum-screen">
      <header className="forum-header">
        <button className="rm-back-btn" onClick={onBack} title="Quay lại">
          <i className="bx bx-arrow-back"></i>
        </button>
        <h1 className="forum-header-title">Chi tiết bài viết</h1>
      </header>

      <div className="forum-detail-container">
        <article className="forum-detail-post">
          <div className="forum-detail-header">
            <h2 className="forum-detail-title">{post.title}</h2>
            <div className="forum-detail-meta">
              <span className="forum-detail-author">
                <i className="bx bxs-user-circle"></i> {post.publicAuthorName}
              </span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="forum-detail-content">
            {post.content}
          </div>

          <div className="forum-detail-tags">
            {post.tags && post.tags.map(tag => (
              <span key={tag} className="forum-post-tag">#{tag}</span>
            ))}
          </div>

          <div className="forum-detail-footer">
            <button 
              className={`forum-detail-action ${isLiked ? 'active' : ''}`}
              onClick={() => setIsLiked(!isLiked)}
            >
              <i className={isLiked ? "bx bxs-heart" : "bx bx-heart"}></i>
              {post.likeCount + (isLiked ? 1 : 0)} Thích
            </button>
            <button className="forum-detail-action">
              <i className="bx bx-share-alt"></i> Chia sẻ
            </button>
            <button className="forum-detail-action">
              <i className="bx bx-flag"></i> Báo cáo
            </button>
          </div>
        </article>

        <section className="forum-comments-section">
          <h3 className="forum-comments-header">{comments.length} Bình luận</h3>
          
          {loading ? (
            <div className="forum-empty"><p>Đang tải bình luận...</p></div>
          ) : (
            <div className="forum-comments-list">
              {comments.map(comment => (
                <div key={comment._id} className="forum-comment-item">
                  <div className="forum-comment-avatar">
                    <i className="bx bx-user"></i>
                  </div>
                  <div className="forum-comment-body">
                    <div className="forum-comment-meta">
                      <span className="forum-comment-author">{comment.publicAuthorName}</span>
                      <span className="forum-comment-time">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="forum-comment-text">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="forum-comment-input-area">
            {userRole === "guest" ? (
              <div className="forum-empty" style={{ padding: '24px' }}>
                <p>Bạn cần đăng nhập để tham gia thảo luận.</p>
                <button 
                  className="rm-btn rm-btn-primary" 
                  style={{ marginTop: '16px' }}
                  onClick={onLoginRequired}
                >
                  Đăng nhập ngay
                </button>
              </div>
            ) : (
              <>
                <textarea
                  className="forum-comment-textarea"
                  placeholder="Viết bình luận của bạn tại đây... (ẩn danh)"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                ></textarea>
                <div className="forum-comment-submit">
                  <button 
                    className="rm-btn rm-btn-primary"
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim()}
                  >
                    Gửi bình luận
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ForumDetail;
