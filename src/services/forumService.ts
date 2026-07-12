import api from "../utils/apiHelper";
import { API_ENDPOINTS } from "../utils/constants";
import { ForumType, PostType, CommentType } from "../components/Forum/types";

export const getForums = async (): Promise<ForumType[]> => {
  const response = await api.get(API_ENDPOINTS.FORUMS.LIST_FORUMS);
  return response.data.forums;
};

export const getPosts = async (
  page: number = 1,
  limit: number = 10
): Promise<{ posts: PostType[]; totalPages: number; currentPage: number; totalItems: number }> => {
  const url = `${API_ENDPOINTS.FORUMS.LIST_POSTS}?limit=${limit}&page=${page}`;
  const response = await api.get(url);
  return response.data;
};

export const getPostDetail = async (postId: string): Promise<{ post: PostType; comments: CommentType[] }> => {
  const response = await api.get(API_ENDPOINTS.FORUMS.POST_DETAIL(postId));
  return response.data;
};

export const createPost = async (forumId: string, title: string, content: string, tags: string[], authorDisplayMode: number): Promise<PostType> => {
  const response = await api.post(API_ENDPOINTS.FORUMS.CREATE_POST, {
    forumId,
    title,
    content,
    tags,
    authorDisplayMode
  });
  return response.data.post;
};

export const updatePost = async (postId: string, title: string, content: string, tags: string[], authorDisplayMode: number): Promise<PostType> => {
  const response = await api.patch(API_ENDPOINTS.FORUMS.POST_DETAIL(postId), {
    title,
    content,
    tags,
    authorDisplayMode
  });
  return response.data.post;
};

export const deletePost = async (postId: string): Promise<void> => {
  await api.delete(API_ENDPOINTS.FORUMS.POST_DETAIL(postId));
};

export const createComment = async (postId: string, content: string, authorDisplayMode: number = 1): Promise<CommentType> => {
  const response = await api.post(API_ENDPOINTS.FORUMS.CREATE_COMMENT(postId), {
    content,
    authorDisplayMode
  });
  return response.data.comment;
};

export const updateComment = async (commentId: string, content: string): Promise<CommentType> => {
  const response = await api.patch(API_ENDPOINTS.FORUMS.UPDATE_COMMENT(commentId), {
    content
  });
  return response.data.comment;
};

export const deleteComment = async (commentId: string): Promise<void> => {
  await api.delete(`${API_ENDPOINTS.FORUMS.COMMENTS}/${commentId}`);
};

export const toggleLike = async (postId: string): Promise<{ liked: boolean; likeCount: number; post: PostType }> => {
  const url = `${API_ENDPOINTS.FORUMS.LIST_POSTS}/${postId}/like`;
  const response = await api.post(url);
  return {
    liked: response.data.liked,
    likeCount: response.data.post.likeCount,
    post: response.data.post
  };
};

export const toggleCommentLike = async (commentId: string): Promise<{ liked: boolean; likeCount: number; comment: CommentType }> => {
  const url = `${API_ENDPOINTS.FORUMS.COMMENTS}/${commentId}/like`;
  const response = await api.post(url);
  return {
    liked: response.data.liked,
    likeCount: response.data.comment.likeCount,
    comment: response.data.comment
  };
};

export const searchPosts = async (query: string): Promise<PostType[]> => {
  const response = await api.get(`${API_ENDPOINTS.FORUMS.SEARCH_POSTS}?q=${encodeURIComponent(query)}`);
  return response.data.posts;
};
