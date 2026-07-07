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
