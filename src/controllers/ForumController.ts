import { ForumPost, Comment, CreatePostData } from "../models/ForumPost";
import { apiHelper } from "../utils/apiHelper";
import { API_ENDPOINTS } from "../utils/constants";

const mapBackendPostToFrontend = (backendPost: any): ForumPost => ({
  id: backendPost._id || backendPost.id,
  title: backendPost.title || "",
  content: backendPost.content || "",
  author: backendPost.publicAuthorName || backendPost.author || "Anonymous",
  tags: backendPost.tags || [],
  likes: backendPost.likeCount !== undefined ? backendPost.likeCount : (backendPost.likes || 0),
  likedBy: (backendPost.likedBy || []).map((id: any) => typeof id === 'object' ? id.toString() : id),
  isAnonymous: backendPost.authorDisplayMode === 1 || !!backendPost.isAnonymous,
  isMine: !!backendPost.isMine,
  createdAt: backendPost.createdAt || new Date().toISOString(),
  updatedAt: backendPost.updatedAt || new Date().toISOString(),
});

const mapBackendCommentToFrontend = (backendComment: any): Comment => ({
  id: backendComment._id || backendComment.id,
  postId: backendComment.postId || "",
  author: backendComment.publicAuthorName || backendComment.author || "Anonymous",
  content: backendComment.content || "",
  parentId: backendComment.parentId || null,
  likes: backendComment.likeCount !== undefined ? backendComment.likeCount : (backendComment.likes || 0),
  isMine: !!backendComment.isMine,
  createdAt: backendComment.createdAt || new Date().toISOString(),
});

export class ForumController {
  // === Forums ===
  static async getDefaultForumId(): Promise<string> {
    try {
      const res = await apiHelper.get(API_ENDPOINTS.FORUMS.LIST_FORUMS);
      if (res && res.forums && res.forums.length > 0) {
        // Return first active forum
        return res.forums[0]._id;
      }
    } catch (err) {
      console.error("Failed to get forums:", err);
    }
    return "";
  }

  // === Posts ===
  static async getPosts(
    page: number = 1,
    limit: number = 10
  ): Promise<{ posts: ForumPost[]; totalPages: number; currentPage: number; totalItems: number }> {
    const url = `${API_ENDPOINTS.FORUMS.LIST_POSTS}?limit=${limit}&page=${page}`;
    const res = await apiHelper.get(url);
    return {
      posts: (res.posts || []).map(mapBackendPostToFrontend),
      totalPages: res.totalPages || 1,
      currentPage: res.currentPage || 1,
      totalItems: res.totalItems || 0,
    };
  }

  static async getPostById(postId: string): Promise<ForumPost | undefined> {
    try {
      const res = await apiHelper.get(API_ENDPOINTS.FORUMS.POST_DETAIL(postId));
      if (res && res.post) {
        return mapBackendPostToFrontend(res.post);
      }
    } catch (err) {
      console.error(`Failed to get post by id ${postId}:`, err);
    }
    return undefined;
  }

  static async getPostDetail(
    postId: string
  ): Promise<{ post: ForumPost; comments: Comment[] } | undefined> {
    try {
      const res = await apiHelper.get(API_ENDPOINTS.FORUMS.POST_DETAIL(postId));
      if (res && res.post) {
        return {
          post: mapBackendPostToFrontend(res.post),
          comments: (res.comments || []).map(mapBackendCommentToFrontend),
        };
      }
    } catch (err) {
      console.error(`Failed to get post detail for id ${postId}:`, err);
    }
    return undefined;
  }

  static async searchPosts(searchTerm: string): Promise<ForumPost[]> {
    if (!searchTerm.trim()) return [];
    try {
      const url = `${API_ENDPOINTS.FORUMS.SEARCH_POSTS}?q=${encodeURIComponent(searchTerm)}`;
      const res = await apiHelper.get(url);
      return (res.posts || []).map(mapBackendPostToFrontend);
    } catch (err) {
      console.error("Failed to search posts:", err);
      return [];
    }
  }

  static async createPost(data: CreatePostData): Promise<ForumPost> {
    const payload = {
      title: data.title.trim(),
      content: data.content.trim(),
      tags: data.tags,
      authorDisplayMode: data.isAnonymous ? 1 : 0,
    };
    const res = await apiHelper.post(API_ENDPOINTS.FORUMS.CREATE_POST, payload);
    return mapBackendPostToFrontend(res.post);
  }

  static async updatePost(postId: string, data: Partial<CreatePostData>): Promise<ForumPost> {
    const payload: any = {};
    if (data.title !== undefined) payload.title = data.title.trim();
    if (data.content !== undefined) payload.content = data.content.trim();
    if (data.tags !== undefined) payload.tags = data.tags;
    if (data.isAnonymous !== undefined) payload.authorDisplayMode = data.isAnonymous ? 1 : 0;
    
    const res = await apiHelper.patch(API_ENDPOINTS.FORUMS.UPDATE_POST(postId), payload);
    return mapBackendPostToFrontend(res.post);
  }

  static async toggleLike(postId: string): Promise<ForumPost> {
    const url = `${API_ENDPOINTS.FORUMS.POST_DETAIL(postId)}/like`;
    const res = await apiHelper.post(url);
    return mapBackendPostToFrontend(res.post);
  }

  static async deletePost(postId: string): Promise<void> {
    await apiHelper.delete(API_ENDPOINTS.FORUMS.DELETE_POST(postId));
  }

  // === Comments ===
  static async getCommentsByPostId(postId: string): Promise<Comment[]> {
    try {
      const res = await apiHelper.get(API_ENDPOINTS.FORUMS.POST_DETAIL(postId));
      return (res.comments || []).map(mapBackendCommentToFrontend);
    } catch (err) {
      console.error(`Failed to get comments for post ${postId}:`, err);
      return [];
    }
  }

  static async createComment(
    postId: string,
    data: { content: string; parentId: string | null; isAnonymous?: boolean }
  ): Promise<Comment> {
    const payload = {
      content: data.content.trim(),
      authorDisplayMode: data.isAnonymous ? 1 : 0,
      parentId: data.parentId || null,
    };
    const res = await apiHelper.post(API_ENDPOINTS.FORUMS.CREATE_COMMENT(postId), payload);
    return mapBackendCommentToFrontend(res.comment);
  }

  static async updateComment(commentId: string, content: string): Promise<Comment> {
    const res = await apiHelper.patch(API_ENDPOINTS.FORUMS.UPDATE_COMMENT(commentId), {
      content: content.trim(),
    });
    return mapBackendCommentToFrontend(res.comment);
  }

  static async deleteComment(commentId: string): Promise<void> {
    await apiHelper.delete(API_ENDPOINTS.FORUMS.DELETE_COMMENT(commentId));
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
