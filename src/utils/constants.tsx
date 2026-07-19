export const BASE_URL =
  import.meta.env.VITE_LOCAL_API_URL ||
  "https://remind-backend-wdv3.onrender.com";
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
    GOOGLE: `${API_BASE_URL}/auth/google`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  },

  // User profile and settings endpoints
  USERS: {
    PROFILE: `${API_BASE_URL}/users/profile`,
    CHANGE_PASSWORD: `${API_BASE_URL}/users/change-password`,
    AVATAR: `${API_BASE_URL}/users/avatar`,
    LIST: `${API_BASE_URL}/admin/users`,
    UPDATE_ROLE: (id: string | number) => `${API_BASE_URL}/admin/users/${id}/role`,
    BAN: (id: string | number) => `${API_BASE_URL}/admin/users/${id}/ban`,
    UNBAN: (id: string | number) => `${API_BASE_URL}/admin/users/${id}/unban`,
  },

  // Admin moderation and management endpoints
  ADMIN: {
    // Forums management
    CREATE_FORUM: `${API_BASE_URL}/admin/forums`,
    FORUM_BY_ID: (forumId: string) => `${API_BASE_URL}/admin/forums/${forumId}`,
    POST_BY_ID: (postId: string) =>
      `${API_BASE_URL}/admin/forums/posts/${postId}`,
    COMMENT_BY_ID: (commentId: string) =>
      `${API_BASE_URL}/admin/forums/comments/${commentId}`,

    // Expert profile approvals
    PENDING_EXPERTS: `${API_BASE_URL}/admin/experts/pending`,
    EXPERT_CREDENTIAL: (id: string | number, fileId: string | number) =>
      `${API_BASE_URL}/admin/experts/${id}/credential/${fileId}`,
    APPROVE_EXPERT: (expertId: string | number) =>
      `${API_BASE_URL}/admin/experts/${expertId}/approve`,
    REJECT_EXPERT: (expertId: string | number) =>
      `${API_BASE_URL}/admin/experts/${expertId}/reject`,

    // Content reports
    REPORTS: `${API_BASE_URL}/admin/reports`,
    RESOLVE_REPORT: (reportId: string | number) =>
      `${API_BASE_URL}/admin/reports/${reportId}/resolve`,

    DASHBOARD_STATS: `${API_BASE_URL}/admin/dashboard/stats`,
    ACTIVITY_LOG: `${API_BASE_URL}/admin/dashboard/activity-log`,

    // Expert Management by Admin
    LIST_EXPERTS: `${API_BASE_URL}/admin/experts`,
    CREATE_EXPERT: `${API_BASE_URL}/admin/experts`,
    UPDATE_EXPERT: (id: number | string) => `${API_BASE_URL}/admin/experts/${id}`,
    DELETE_EXPERT: (id: number | string) => `${API_BASE_URL}/admin/experts/${id}`,
    SUSPEND_EXPERT: (expertId: string | number) =>
      `${API_BASE_URL}/admin/experts/${expertId}/suspend`,
  },

  // Expert and public expert endpoints
  EXPERTS: {
    DASHBOARD: `${API_BASE_URL}/experts/me/dashboard`,
    SETTINGS: `${API_BASE_URL}/experts/me/settings`,
    LIST_APPROVED: `${API_BASE_URL}/experts`,
    CREDENTIALS: `${API_BASE_URL}/experts/me/credentials`,
  },

  // Public forum and interaction endpoints
  FORUMS: {
    LIST_FORUMS: `${API_BASE_URL}/forums`,
    SEARCH_POSTS: `${API_BASE_URL}/forums/search`,

    // Forum posts
    POST_DETAIL: (postId: string) => `${API_BASE_URL}/forums/posts/${postId}`,
    UPDATE_POST: (postId: string) => `${API_BASE_URL}/forums/posts/${postId}`,
    DELETE_POST: (postId: string) => `${API_BASE_URL}/forums/posts/${postId}`,
    CREATE_POST: `${API_BASE_URL}/forums/posts`,
    LIST_POSTS: `${API_BASE_URL}/forums/posts`,

    // Forum comments
    COMMENTS: `${API_BASE_URL}/forums/comments`,
    UPDATE_COMMENT: (commentId: string) =>
      `${API_BASE_URL}/forums/comments/${commentId}`,
    DELETE_COMMENT: (commentId: string) =>
      `${API_BASE_URL}/forums/comments/${commentId}`,
    CREATE_COMMENT: (postId: string) =>
      `${API_BASE_URL}/forums/posts/${postId}/comments`,
  },

  // AI chat endpoints
  AI: {
    CHAT: `${API_BASE_URL}/ai/chat`,
  },

  // Expert chat endpoints
  CHATS: {
    LIST: `${API_BASE_URL}/chats`,
    ROOM: (roomId: string) => `${API_BASE_URL}/chats/${roomId}`,
    MESSAGES: (roomId: string) => `${API_BASE_URL}/chats/${roomId}/messages`,
  },

  // Notification endpoints
  NOTIFICATIONS: {
    LIST: `${API_BASE_URL}/notifications`,
    MARK_READ: (id: string) => `${API_BASE_URL}/notifications/${id}/read`,
    MARK_ALL_READ: `${API_BASE_URL}/notifications/read-all`,
  },

  // Appointment endpoints
  APPOINTMENTS: {
    BOOK: `${API_BASE_URL}/appointments/book`,
    MINE: `${API_BASE_URL}/appointments/mine`,
    EXPERT: `${API_BASE_URL}/appointments/expert`,
    CANCEL: (id: string) => `${API_BASE_URL}/appointments/${id}/cancel`,
    START: (id: string) => `${API_BASE_URL}/appointments/${id}/start`,
    END: (id: string) => `${API_BASE_URL}/appointments/${id}/end`,
  },

  // Payment endpoints
  PAYMENTS: {
    PRODUCTS: `${API_BASE_URL}/payments/products`,
    CREATE: `${API_BASE_URL}/payments/payos`,
    LIST: `${API_BASE_URL}/payments`,
    WALLET: `${API_BASE_URL}/payments/wallet`,
    APPOINTMENT: `${API_BASE_URL}/payments/appointment`,
  },
};
