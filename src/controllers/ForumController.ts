import { ForumPost, Comment, CreatePostData, CreateCommentData } from "../models/ForumPost";

const POSTS_KEY = "remind_forum_posts";
const COMMENTS_KEY = "remind_forum_comments";

const DEFAULT_POSTS: ForumPost[] = [
  {
    id: 1,
    title: "Làm sao để vượt qua áp lực đồng lứa khi mọi người đều có thành tựu?",
    content:
      "Mình là sinh viên năm 3, xung quanh bạn bè ai cũng đã có việc làm part-time, đi thực tập, hoặc đạt được những thành tựu đáng kể. Mình cảm thấy mình đang bị tụt lại phía sau và áp lực rất lớn.\n\nMỗi khi lướt mạng xã hội, thấy mọi người khoe thành tích, mình lại cảm thấy tự ti hơn. Mình biết so sánh là không tốt nhưng thật sự không thể kiểm soát được cảm xúc.\n\nCó ai từng trải qua giai đoạn này không? Làm sao để vượt qua?",
    author: "Anonymous Bear",
    tags: ["Áp lực đồng lứa", "Stress"],
    likes: 45,
    likedBy: [],
    isAnonymous: true,
    createdAt: "2026-06-27T09:00:00Z",
    updatedAt: "2026-06-27T09:00:00Z",
  },
  {
    id: 2,
    title: "Kỹ năng quản lý thời gian hiệu quả cho sinh viên năm nhất",
    content:
      "Chào mọi người! Mình muốn chia sẻ một số kỹ năng quản lý thời gian mà mình đã áp dụng thành công trong suốt năm nhất:\n\n1. **Pomodoro Technique**: Làm việc 25 phút, nghỉ 5 phút. Sau 4 pomodoro thì nghỉ dài 15-30 phút.\n\n2. **Eisenhower Matrix**: Phân loại công việc theo mức độ quan trọng và khẩn cấp.\n\n3. **Time Blocking**: Chia ngày thành các block thời gian cố định cho từng hoạt động.\n\n4. **2-Minute Rule**: Nếu việc gì có thể làm trong 2 phút, hãy làm ngay.\n\nHy vọng những chia sẻ này hữu ích cho các bạn!",
    author: "Studyholic",
    tags: ["Kỹ năng", "Học tập"],
    likes: 23,
    likedBy: [],
    isAnonymous: false,
    createdAt: "2026-06-27T07:00:00Z",
    updatedAt: "2026-06-27T07:00:00Z",
  },
  {
    id: 3,
    title: "Cảm giác kiệt sức sau một tuần dài, có ai muốn tâm sự không?",
    content:
      "Tuần này mình cảm thấy kiệt sức cả về thể chất lẫn tinh thần. Deadline chồng deadline, bài tập nhóm không ai chịu làm, rồi còn phải đi làm thêm nữa.\n\nMình không biết phải ưu tiên cái gì trước. Đôi khi mình chỉ muốn nằm xuống và không làm gì cả. Có ai cũng đang cảm thấy như vậy không?\n\nMình nghĩ đôi khi chúng ta cần một không gian an toàn để tâm sự, không phán xét, không so sánh. Nếu ai muốn nói chuyện, mình luôn sẵn lòng lắng nghe.",
    author: "Sleepy Cat",
    tags: ["Burnout", "Tâm sự"],
    likes: 112,
    likedBy: [],
    isAnonymous: true,
    createdAt: "2026-06-26T15:00:00Z",
    updatedAt: "2026-06-26T15:00:00Z",
  },
];

const DEFAULT_COMMENTS: Comment[] = [
  {
    id: 1,
    postId: 1,
    author: "Gentle Owl",
    content: "Mình cũng từng trải qua giai đoạn này. Điều quan trọng là hãy tập trung vào hành trình của chính mình, đừng so sánh với người khác. Mỗi người có một tốc độ phát triển riêng.",
    parentId: null,
    likes: 12,
    createdAt: "2026-06-27T09:30:00Z",
  },
  {
    id: 2,
    postId: 1,
    author: "Calm River",
    content: "Mình khuyên bạn nên hạn chế lướt mạng xã hội. Thay vào đó, hãy dành thời gian để phát triển bản thân theo cách riêng của mình.",
    parentId: null,
    likes: 8,
    createdAt: "2026-06-27T10:00:00Z",
  },
  {
    id: 3,
    postId: 1,
    author: "Anonymous Bear",
    content: "Cảm ơn bạn nhiều! Mình sẽ cố gắng áp dụng. Đúng là mình cần ngừng so sánh.",
    parentId: 1,
    likes: 5,
    createdAt: "2026-06-27T10:15:00Z",
  },
  {
    id: 4,
    postId: 3,
    author: "Warm Sun",
    content: "Ôm bạn thật chặt! Burnout là điều rất phổ biến ở sinh viên. Bạn không cô đơn đâu. Hãy cho phép mình nghỉ ngơi khi cần thiết nhé.",
    parentId: null,
    likes: 20,
    createdAt: "2026-06-26T16:00:00Z",
  },
  {
    id: 5,
    postId: 3,
    author: "Healing Moon",
    content: "Mình cũng đang ở trong tình trạng tương tự. Chúng mình không phải máy, cần thời gian để nạp năng lượng. 💙",
    parentId: null,
    likes: 15,
    createdAt: "2026-06-26T17:30:00Z",
  },
  {
    id: 6,
    postId: 2,
    author: "Fresh Start",
    content: "Pomodoro Technique thật sự hiệu quả! Mình đã dùng app Forest để thực hiện và kết quả rất tốt.",
    parentId: null,
    likes: 6,
    createdAt: "2026-06-27T08:00:00Z",
  },
];

export class ForumController {
  // === Posts ===

  static getPosts(): ForumPost[] {
    const data = localStorage.getItem(POSTS_KEY);
    if (!data) {
      localStorage.setItem(POSTS_KEY, JSON.stringify(DEFAULT_POSTS));
      return DEFAULT_POSTS;
    }
    return JSON.parse(data);
  }

  static savePosts(posts: ForumPost[]): void {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  }

  static getPostById(postId: number): ForumPost | undefined {
    return this.getPosts().find((p) => p.id === postId);
  }

  static searchPosts(searchTerm: string): ForumPost[] {
    const posts = this.getPosts();
    if (!searchTerm.trim()) return posts;

    const term = searchTerm.toLowerCase();
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(term) ||
        post.tags.some((tag) => tag.toLowerCase().includes(term)) ||
        post.content.toLowerCase().includes(term)
    );
  }

  static createPost(data: CreatePostData): ForumPost {
    const posts = this.getPosts();
    const newId = posts.length > 0 ? Math.max(...posts.map((p) => p.id)) + 1 : 1;

    const now = new Date().toISOString();
    const newPost: ForumPost = {
      id: newId,
      title: data.title.trim(),
      content: data.content.trim(),
      author: data.isAnonymous ? data.author || "Ẩn danh" : data.author,
      tags: data.tags,
      likes: 0,
      likedBy: [],
      isAnonymous: data.isAnonymous,
      createdAt: now,
      updatedAt: now,
    };

    posts.unshift(newPost);
    this.savePosts(posts);
    return newPost;
  }

  static toggleLike(postId: number, userId: string): ForumPost | undefined {
    const posts = this.getPosts();
    const index = posts.findIndex((p) => p.id === postId);
    if (index === -1) return undefined;

    const post = posts[index];
    const likeIndex = post.likedBy.indexOf(userId);

    if (likeIndex === -1) {
      post.likedBy.push(userId);
    } else {
      post.likedBy.splice(likeIndex, 1);
    }
    post.likes = post.likedBy.length;

    posts[index] = post;
    this.savePosts(posts);
    return post;
  }

  static deletePost(postId: number): void {
    const posts = this.getPosts().filter((p) => p.id !== postId);
    this.savePosts(posts);
    // Also delete all comments for this post
    const comments = this.getComments().filter((c) => c.postId !== postId);
    this.saveComments(comments);
  }

  // === Comments ===

  static getComments(): Comment[] {
    const data = localStorage.getItem(COMMENTS_KEY);
    if (!data) {
      localStorage.setItem(COMMENTS_KEY, JSON.stringify(DEFAULT_COMMENTS));
      return DEFAULT_COMMENTS;
    }
    return JSON.parse(data);
  }

  static saveComments(comments: Comment[]): void {
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
  }

  static getCommentsByPostId(postId: number): Comment[] {
    return this.getComments()
      .filter((c) => c.postId === postId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  static getCommentCount(postId: number): number {
    return this.getComments().filter((c) => c.postId === postId).length;
  }

  static createComment(data: CreateCommentData): Comment {
    const comments = this.getComments();
    const newId = comments.length > 0 ? Math.max(...comments.map((c) => c.id)) + 1 : 1;

    const newComment: Comment = {
      id: newId,
      postId: data.postId,
      author: data.author || "Ẩn danh",
      content: data.content.trim(),
      parentId: data.parentId,
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    comments.push(newComment);
    this.saveComments(comments);
    return newComment;
  }

  static deleteComment(commentId: number): void {
    let comments = this.getComments();
    // Delete the comment and all its replies
    comments = comments.filter(
      (c) => c.id !== commentId && c.parentId !== commentId
    );
    this.saveComments(comments);
  }

  // === Utilities ===

  static formatTimeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  }

  static validate(data: CreatePostData): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!data.title.trim()) errors.title = "Tiêu đề không được để trống";
    if (!data.content.trim()) errors.content = "Nội dung không được để trống";
    if (data.title.length > 200) errors.title = "Tiêu đề không quá 200 ký tự";
    return errors;
  }
}
