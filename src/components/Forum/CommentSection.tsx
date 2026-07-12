import { useState, useEffect } from "react";
import { Comment as CommentType } from "../../models/ForumPost";
import { ForumController } from "../../controllers/ForumController";
import "./CommentSection.css";

interface CommentSectionProps {
  postId: string;
  userRole: string;
  onLoginRequired: () => void;
}

function CommentSection({ postId, userRole, onLoginRequired }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(true);

  // Edit Comment States
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchComments = async () => {
    try {
      const list = await ForumController.getCommentsByPostId(postId);
      setComments(list);
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmitComment = async () => {
    if (userRole === "guest") {
      onLoginRequired();
      return;
    }
    if (!newComment.trim()) return;

    try {
      await ForumController.createComment(postId, {
        content: newComment,
        parentId: null,
      });
      setNewComment("");
      await fetchComments();
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (userRole === "guest") {
      onLoginRequired();
      return;
    }
    if (!replyContent.trim()) return;

    try {
      await ForumController.createComment(postId, {
        content: replyContent,
        parentId,
      });
      setReplyContent("");
      setReplyingTo(null);
      await fetchComments();
    } catch (err) {
      console.error("Failed to post reply:", err);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editCommentContent.trim()) return;
    setIsUpdating(true);
    try {
      await ForumController.updateComment(commentId, editCommentContent);
      setEditingCommentId(null);
      setEditCommentContent("");
      await fetchComments();
    } catch (err) {
      console.error("Failed to update comment:", err);
      alert("Cập nhật bình luận thất bại.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác.")) return;
    try {
      await ForumController.deleteComment(commentId);
      await fetchComments();
    } catch (err) {
      console.error("Failed to delete comment:", err);
      alert("Xóa bình luận thất bại.");
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    type: "comment" | "reply",
    parentId?: string
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (type === "comment") {
        handleSubmitComment();
      } else if (parentId !== undefined) {
        handleSubmitReply(parentId);
      }
    }
  };

  // Build threaded comments: top-level comments with their replies
  const topLevelComments = comments.filter((c) => c.parentId === null);
  const getReplies = (commentId: string) =>
    comments.filter((c) => c.parentId === commentId);

  return (
    <div className="comment-section">
      <h3 className="comment-section-title">
        <i className="bx bx-message-rounded-dots"></i>
        Bình luận ({comments.length})
      </h3>

      {/* Comment Input */}
      <div className="comment-input-area">
        {userRole === "guest" ? (
          <div className="comment-login-prompt" onClick={onLoginRequired}>
            <i className="bx bx-lock-alt"></i>
            <span>Đăng nhập để bình luận</span>
          </div>
        ) : (
          <div className="comment-input-box">
            <div className="comment-avatar">
              <i className="bx bxs-user-circle"></i>
            </div>
            <div className="comment-input-wrapper">
              <textarea
                className="comment-textarea"
                placeholder="Viết bình luận của bạn..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, "comment")}
                rows={2}
              />
              <button
                className="rm-btn rm-btn-primary comment-send-btn"
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
              >
                <i className="bx bx-send"></i>
                Gửi
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="comment-list">
        {loading ? (
          <div className="comment-empty">
            <p>Đang tải bình luận...</p>
          </div>
        ) : topLevelComments.length === 0 ? (
          <div className="comment-empty">
            <i className="bx bx-chat"></i>
            <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
          </div>
        ) : (
          topLevelComments.map((comment) => (
            <div key={comment.id} className="comment-thread">
              {/* Top-level comment */}
              <div className="comment-item">
                <div className="comment-item-avatar">
                  <i className="bx bxs-user-circle"></i>
                </div>
                <div className="comment-item-body">
                  <div className="comment-item-header">
                    <span className="comment-item-author">{comment.author}</span>
                    <span className="comment-item-time">
                      {ForumController.formatTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                  
                  {editingCommentId === comment.id ? (
                    <div className="reply-input-box" style={{ marginTop: "8px" }}>
                      <textarea
                        className="comment-textarea reply-textarea"
                        value={editCommentContent}
                        onChange={(e) => setEditCommentContent(e.target.value)}
                        rows={2}
                        autoFocus
                      />
                      <div className="reply-input-actions">
                        <button
                          className="rm-btn rm-btn-outline reply-cancel-btn"
                          onClick={() => setEditingCommentId(null)}
                          disabled={isUpdating}
                        >
                          Hủy
                        </button>
                        <button
                          className="rm-btn rm-btn-primary reply-send-btn"
                          onClick={() => handleUpdateComment(comment.id)}
                          disabled={!editCommentContent.trim() || isUpdating}
                        >
                          {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="comment-item-content">{comment.content}</p>
                  )}

                  <div className="comment-item-actions">
                    <button
                      className="comment-action-btn"
                      onClick={() => {
                        if (userRole === "guest") {
                          onLoginRequired();
                          return;
                        }
                        setReplyingTo(replyingTo === comment.id ? null : comment.id);
                        setReplyContent("");
                      }}
                    >
                      <i className="bx bx-reply"></i>
                      Trả lời
                    </button>
                    {comment.isMine && (
                      <>
                        <button
                          className="comment-action-btn"
                          onClick={() => {
                            setEditingCommentId(comment.id);
                            setEditCommentContent(comment.content);
                            setReplyingTo(null);
                          }}
                        >
                          <i className="bx bx-edit"></i> Sửa
                        </button>
                        <button
                          className="comment-action-btn"
                          style={{ color: "#ff4d4f" }}
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <i className="bx bx-trash"></i> Xóa
                        </button>
                      </>
                    )}
                    <span className="comment-action-likes">
                      <i className="bx bx-heart"></i> {comment.likes}
                    </span>
                  </div>

                  {/* Reply Input */}
                  {replyingTo === comment.id && (
                    <div className="reply-input-box">
                      <textarea
                        className="comment-textarea reply-textarea"
                        placeholder={`Trả lời ${comment.author}...`}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, "reply", comment.id)}
                        rows={2}
                        autoFocus
                      />
                      <div className="reply-input-actions">
                        <button
                          className="rm-btn rm-btn-outline reply-cancel-btn"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyContent("");
                          }}
                        >
                          Hủy
                        </button>
                        <button
                          className="rm-btn rm-btn-primary reply-send-btn"
                          onClick={() => handleSubmitReply(comment.id)}
                          disabled={!replyContent.trim()}
                        >
                          <i className="bx bx-send"></i>
                          Gửi
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Replies */}
              {getReplies(comment.id).map((reply) => (
                <div key={reply.id} className="comment-item comment-reply">
                  <div className="comment-item-avatar reply-avatar">
                    <i className="bx bxs-user-circle"></i>
                  </div>
                  <div className="comment-item-body">
                    <div className="comment-item-header">
                      <span className="comment-item-author">{reply.author}</span>
                      <span className="comment-item-time">
                        {ForumController.formatTimeAgo(reply.createdAt)}
                      </span>
                    </div>

                    {editingCommentId === reply.id ? (
                      <div className="reply-input-box" style={{ marginTop: "8px" }}>
                        <textarea
                          className="comment-textarea reply-textarea"
                          value={editCommentContent}
                          onChange={(e) => setEditCommentContent(e.target.value)}
                          rows={2}
                          autoFocus
                        />
                        <div className="reply-input-actions">
                          <button
                            className="rm-btn rm-btn-outline reply-cancel-btn"
                            onClick={() => setEditingCommentId(null)}
                            disabled={isUpdating}
                          >
                            Hủy
                          </button>
                          <button
                            className="rm-btn rm-btn-primary reply-send-btn"
                            onClick={() => handleUpdateComment(reply.id)}
                            disabled={!editCommentContent.trim() || isUpdating}
                          >
                            {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="comment-item-content">{reply.content}</p>
                    )}

                    <div className="comment-item-actions">
                      {reply.isMine && (
                        <>
                          <button
                            className="comment-action-btn"
                            onClick={() => {
                              setEditingCommentId(reply.id);
                              setEditCommentContent(reply.content);
                              setReplyingTo(null);
                            }}
                          >
                            <i className="bx bx-edit"></i> Sửa
                          </button>
                          <button
                            className="comment-action-btn"
                            style={{ color: "#ff4d4f" }}
                            onClick={() => handleDeleteComment(reply.id)}
                          >
                            <i className="bx bx-trash"></i> Xóa
                          </button>
                        </>
                      )}
                      <span className="comment-action-likes">
                        <i className="bx bx-heart"></i> {reply.likes}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CommentSection;
