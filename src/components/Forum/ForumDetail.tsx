import { useState, useEffect, useRef } from "react";
import { PostType, CommentType } from "./types";
import { getPostDetail, createComment, toggleLike, deletePost, toggleCommentLike } from "../../services/forumService";
import { timeAgo } from "./utils";
import "./ForumDetail.css";

interface ForumDetailProps {
  post: PostType;
  onBack: () => void;
  userRole: string;
  onLoginRequired: () => void;
  onUpdatePost?: (updatedPost: PostType) => void;
  onDeletePost?: (postId: string) => void;
}

const CommentItem = ({ comment, onLike, onReply, onReport }: { comment: CommentType, onLike: () => void, onReply: () => void, onReport: () => void }) => {
  return (
    <div className="forum-comment-item">
      <img 
        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.publicAuthorName}`} 
        alt={comment.publicAuthorName}
        className="forum-comment-avatar"
        style={{ padding: 0 }}
      />
      <div className="forum-comment-body">
        <div className="forum-comment-meta">
          <span className="forum-comment-author">{comment.publicAuthorName}</span>
          <span className="forum-comment-time">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="forum-comment-text">{comment.content}</p>
        <div className="forum-comment-actions" style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
          <button style={{ background: 'none', border: 'none', color: 'var(--ink-500)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={onLike}>
            <i className="bx bx-heart"></i> {comment.likeCount || 0}
          </button>
          <button style={{ background: 'none', border: 'none', color: 'var(--ink-500)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={onReply}>
            <i className="bx bx-reply"></i> Phản hồi
          </button>
          <button style={{ background: 'none', border: 'none', color: 'var(--ink-500)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={onReport}>
            <i className="bx bx-flag"></i> Báo cáo
          </button>
        </div>
      </div>
    </div>
  );
};

function ForumDetail({ post, onBack, userRole, onLoginRequired, onUpdatePost, onDeletePost }: ForumDetailProps) {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleDeletePost = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.")) {
      try {
        await deletePost(post._id);
        alert("Xóa bài viết thành công!");
        if (onDeletePost) onDeletePost(post._id);
        onBack();
      } catch (error) {
        console.error("Failed to delete post", error);
        alert("Có lỗi xảy ra khi xóa bài viết.");
      }
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Đã sao chép liên kết bài viết!");
  };

  const handleReport = () => {
    if (window.confirm("Bạn có chắc chắn muốn báo cáo nội dung này không?")) {
      alert("Cảm ơn bạn đã báo cáo. Quản trị viên sẽ xem xét nội dung này.");
    }
  };

  return (
    <div className="forum-modal-overlay">
      <div className="forum-modal-content new-layout forum-detail-modal">
        <div className="forum-modal-header new-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '18px', margin: 0 }}>Bài viết của {post.publicAuthorName}</h2>
          <button className="forum-modal-close" onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--ink-500)' }}>
            <i className="bx bx-x"></i>
          </button>
        </div>
      <div className="forum-detail-container" style={{ padding: '24px', flex: 1 }}>
        <article className="forum-detail-post" style={{ position: 'relative' }}>
          
          <div className="forum-detail-header" style={{ position: 'relative' }}>
            <div className="post-options-menu" ref={menuRef} style={{ position: 'absolute', top: 0, right: 0 }}>
              <button 
                onClick={() => setShowMenu(!showMenu)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--ink-500)', padding: '4px' }}
              >
                <i className="bx bx-dots-vertical-rounded"></i>
              </button>
              {showMenu && (
                <div style={{ position: 'absolute', top: '30px', right: 0, background: 'white', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '150px', overflow: 'hidden' }}>
                  <button style={{ width: '100%', padding: '10px 16px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', borderBottom: '1px solid var(--border)' }} onClick={() => { setShowMenu(false); alert("Chức năng chỉnh sửa đang được phát triển!"); }}>
                    <i className="bx bx-edit" style={{ marginRight: '8px' }}></i> Chỉnh sửa
                  </button>
                  <button style={{ width: '100%', padding: '10px 16px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#ff4d4f' }} onClick={() => { setShowMenu(false); handleDeletePost(); }}>
                    <i className="bx bx-trash" style={{ marginRight: '8px' }}></i> Xóa bài viết
                  </button>
                </div>
              )}
            </div>

            <h2 className="forum-detail-title" style={{ marginTop: 0, paddingRight: '40px' }}>{post.title}</h2>
            <div className="forum-detail-meta">
              <span className="forum-detail-author">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.publicAuthorName}`} 
                  alt={post.publicAuthorName}
                  style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                />
                {post.publicAuthorName}
              </span>
              <span>{timeAgo(post.createdAt)}</span>
            </div>
          </div>

          <div className="forum-detail-content">
            {post.content}
          </div>

          {post.images && post.images.length > 0 && (
            <div className="forum-post-images">
              {post.images.map((imgUrl, idx) => (
                <img key={idx} src={imgUrl} alt={`Attached ${idx}`} className="forum-post-image" />
              ))}
            </div>
          )}

          <div className="forum-detail-tags">
            {post.tags && post.tags.map(tag => (
              <span key={tag} className="forum-post-tag">#{tag}</span>
            ))}
          </div>

          <div className="forum-detail-footer">
            <button
              className={`forum-detail-action ${isLiked ? 'active' : ''}`}
              onClick={async () => {
                if (userRole === 'guest') {
                  onLoginRequired();
                  return;
                }
                const result = await toggleLike(post._id);
                setIsLiked(result.liked);
                setLikeCount(result.likeCount);
                if (onUpdatePost) onUpdatePost(result.post);
              }}
            >
              <i className={isLiked ? "bx bxs-heart" : "bx bx-heart"}></i>
              {likeCount} Thích
            </button>
            <button className="forum-detail-action" onClick={handleShare}>
              <i className="bx bx-share-alt"></i> Chia sẻ
            </button>
            <button className="forum-detail-action" onClick={handleReport}>
              <i className="bx bx-flag"></i> Báo cáo
            </button>
          </div>
        </article>

        <section className="forum-comments-section">
          <h3 className="forum-comments-header">{comments.length} Bình luận</h3>
          
          {loading ? (
            <div className="forum-comments-list">
              {[1, 2, 3].map(i => (
                <div key={i} className="forum-comment-item">
                  <div className="skeleton-box skeleton-avatar"></div>
                  <div className="forum-comment-body">
                    <div className="skeleton-box skeleton-title"></div>
                    <div className="skeleton-box skeleton-text"></div>
                    <div className="skeleton-box skeleton-text" style={{ width: '80%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="forum-empty-state">
              <i className="bx bx-message-square-dots"></i>
              <p>Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nghĩ của bạn!</p>
            </div>
          ) : (
            <div className="forum-comments-list">
              {comments.map(comment => (
                <CommentItem 
                  key={comment._id}
                  comment={comment}
                  onLike={async () => {
                    if (userRole === "guest") {
                      onLoginRequired();
                      return;
                    }
                    try {
                      const result = await toggleCommentLike(comment._id);
                      setComments(prev => prev.map(c => c._id === comment._id ? result.comment : c));
                    } catch (error) {
                      console.error("Failed to like comment", error);
                    }
                  }}
                  onReply={() => {
                    setCommentText(`@${comment.publicAuthorName} `);
                    document.querySelector('.forum-comment-textarea')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onReport={() => {
                    if (window.confirm("Bạn có chắc chắn muốn báo cáo bình luận này không?")) {
                      alert("Cảm ơn bạn đã báo cáo. Quản trị viên sẽ xem xét.");
                    }
                  }}
                />
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
                <div style={{ position: 'relative' }}>
                  <textarea
                    className={`forum-comment-textarea ${commentText.length > 500 ? 'input-error' : ''}`}
                    placeholder="Viết bình luận của bạn tại đây... (ẩn danh)"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    maxLength={500}
                  ></textarea>
                  <span style={{ position: 'absolute', bottom: '24px', right: '12px', fontSize: '12px', color: commentText.length > 500 ? '#ff4d4f' : 'var(--ink-500)' }}>
                    {commentText.length}/500
                  </span>
                </div>
                <div className="forum-comment-submit">
                  <button 
                    className="rm-btn rm-btn-primary"
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim() || commentText.length > 500}
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
    </div>
  );
}

export default ForumDetail;
