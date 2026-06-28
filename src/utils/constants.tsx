export const BASE_URL = "http://localhost:4000";
export const API_BASE_URL = `${BASE_URL}/api`;

export const API_ENDPOINTS = {
  // Health check endpoint
  HEALTH: `${BASE_URL}/health`,

  // Authentication endpoints
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
  },

  // Admin moderation and management endpoints
  ADMIN: {
    // Forums management
    CREATE_FORUM: `${API_BASE_URL}/admin/forums`,
    FORUM_BY_ID: (forumId: string) => `${API_BASE_URL}/admin/forums/${forumId}`,
    POST_BY_ID: (postId: string) => `${API_BASE_URL}/admin/forums/posts/${postId}`,
    COMMENT_BY_ID: (commentId: string) => `${API_BASE_URL}/admin/forums/comments/${commentId}`,

    // Expert profile approvals
    PENDING_EXPERTS: `${API_BASE_URL}/admin/experts/pending`,
    APPROVE_EXPERT: (expertId: string | number) => `${API_BASE_URL}/admin/experts/${expertId}/approve`,
    REJECT_EXPERT: (expertId: string | number) => `${API_BASE_URL}/admin/experts/${expertId}/reject`,

    // Content reports
    REPORTS: `${API_BASE_URL}/admin/reports`,
    RESOLVE_REPORT: (reportId: string | number) => `${API_BASE_URL}/admin/reports/${reportId}/resolve`,
  },

  // Public forum and interaction endpoints
  FORUMS: {
    LIST_FORUMS: `${API_BASE_URL}/forums`,
    SEARCH_POSTS: `${API_BASE_URL}/forums/search`,
    
    // Forum posts
    POST_DETAIL: (postId: string) => `${API_BASE_URL}/forums/posts/${postId}`,
    UPDATE_POST: (postId: string) => `${API_BASE_URL}/forums/posts/${postId}`,
    DELETE_POST: (postId: string) => `${API_BASE_URL}/forums/posts/${postId}`,
    CREATE_POST: (forumId: string) => `${API_BASE_URL}/forums/${forumId}/posts`,
    LIST_POSTS: (forumId: string) => `${API_BASE_URL}/forums/${forumId}/posts`,

    // Forum comments
    UPDATE_COMMENT: (commentId: string) => `${API_BASE_URL}/forums/comments/${commentId}`,
    DELETE_COMMENT: (commentId: string) => `${API_BASE_URL}/forums/comments/${commentId}`,
    CREATE_COMMENT: (postId: string) => `${API_BASE_URL}/forums/posts/${postId}/comments`,
  },
};
