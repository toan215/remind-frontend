import { useState } from "react";
import { CreatePostData } from "../../models/ForumPost";
import { ForumController } from "../../controllers/ForumController";
import "./CreatePostModal.css";

interface CreatePostModalProps {
  onClose: () => void;
  onPostCreated: () => void;
}

const ANONYMOUS_NAMES = [
  "Anonymous Bear",
  "Gentle Owl",
  "Calm River",
  "Sleepy Cat",
  "Warm Sun",
  "Healing Moon",
  "Quiet Star",
  "Brave Fox",
  "Kind Deer",
  "Soft Cloud",
];

function CreatePostModal({ onClose, onPostCreated }: CreatePostModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async () => {
    const randomName =
      ANONYMOUS_NAMES[Math.floor(Math.random() * ANONYMOUS_NAMES.length)];

    const postData: CreatePostData = {
      title,
      content,
      author: isAnonymous ? randomName : "Bạn",
      tags,
      isAnonymous,
    };

    const validationErrors = ForumController.validate(postData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await ForumController.createPost(postData);
      onPostCreated();
      onClose();
    } catch (err) {
      console.error("Failed to create post:", err);
      alert("Đã xảy ra lỗi khi đăng bài viết.");
    }
  };

  return (
    <div className="rm-modal-overlay" onClick={onClose}>
      <div
        className="rm-modal create-post-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "640px" }}
      >
        {/* Header */}
        <div className="rm-modal-header">
          <h3 className="rm-modal-title">
            <i className="bx bx-edit"></i> Tạo bài viết mới
          </h3>
          <button className="rm-modal-close" onClick={onClose}>
            <i className="bx bx-x"></i>
          </button>
        </div>

        {/* Body */}
        <div className="rm-modal-body create-post-body">
          {/* Title */}
          <div className="create-post-field">
            <label className="create-post-label">Tiêu đề *</label>
            <div className={`rm-input-wrapper ${errors.title ? "input-error" : ""}`}>
              <input
                type="text"
                className="rm-input-field"
                placeholder="Nhập tiêu đề bài viết..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors({ ...errors, title: "" });
                }}
                maxLength={200}
              />
            </div>
            {errors.title && (
              <span className="create-post-error">{errors.title}</span>
            )}
            <span className="create-post-char-count">{title.length}/200</span>
          </div>

          {/* Content */}
          <div className="create-post-field">
            <label className="create-post-label">Nội dung *</label>
            <textarea
              className={`create-post-textarea ${errors.content ? "input-error" : ""}`}
              placeholder="Chia sẻ suy nghĩ, cảm xúc của bạn..."
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (errors.content) setErrors({ ...errors, content: "" });
              }}
              rows={6}
            />
            {errors.content && (
              <span className="create-post-error">{errors.content}</span>
            )}
          </div>

          {/* Tags */}
          <div className="create-post-field">
            <label className="create-post-label">
              Thẻ tag <span className="create-post-optional">(tối đa 5)</span>
            </label>
            <div className="create-post-tags-input">
              <div className="create-post-tags-list">
                {tags.map((tag) => (
                  <span key={tag} className="create-post-tag-chip">
                    #{tag}
                    <button
                      className="create-post-tag-remove"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <i className="bx bx-x"></i>
                    </button>
                  </span>
                ))}
              </div>
              {tags.length < 5 && (
                <div className="rm-input-wrapper create-post-tag-input-wrapper">
                  <input
                    type="text"
                    className="rm-input-field"
                    placeholder="Nhập tag rồi Enter..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                  />
                  <button
                    className="create-post-tag-add-btn"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                  >
                    <i className="bx bx-plus"></i>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Anonymous toggle */}
          <label className="create-post-anon-toggle">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            <span className="create-post-anon-checkmark"></span>
            <span className="create-post-anon-label">
              <i className="bx bx-hide"></i>
              Đăng ẩn danh
            </span>
            <span className="create-post-anon-hint">
              Tên của bạn sẽ được thay bằng biệt danh ngẫu nhiên
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="rm-modal-footer">
          <button className="rm-btn rm-btn-outline" onClick={onClose}>
            Hủy
          </button>
          <button className="rm-btn rm-btn-primary" onClick={handleSubmit}>
            <i className="bx bx-send"></i>
            Đăng bài
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreatePostModal;
