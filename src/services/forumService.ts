import api from "../utils/apiHelper";
import { API_ENDPOINTS } from "../utils/constants";
import { ForumType, PostType, CommentType } from "../components/Forum/types";

export const getForums = async (): Promise<ForumType[]> => {
  const response = await api.get(API_ENDPOINTS.FORUMS.LIST_FORUMS);
  return response.data.forums;
};

export const getPosts = async (
  cursor?: string,
  limit: number = 10
): Promise<{ posts: PostType[]; nextCursor: string | null; hasNext: boolean }> => {
  let url = `${API_ENDPOINTS.FORUMS.LIST_POSTS}?limit=${limit}`;
  if (cursor) {
    url += `&cursor=${cursor}`;
  }
  const response = await api.get(url);
  return response.data;
};

export const getPostDetail = async (postId: string): Promise<{ post: PostType; comments: CommentType[] }> => {
  const response = await api.get(API_ENDPOINTS.FORUMS.POST_DETAIL(postId));
  return response.data;
};

export const createPost = async (forumId: string, title: string, content: string, tags: string[], authorDisplayMode: number = 1): Promise<PostType> => {
  const response = await api.post(API_ENDPOINTS.FORUMS.CREATE_POST, {
    forumId,
    title,
    content,
    tags,
    authorDisplayMode
  });
  return response.data.post;
};

export const createComment = async (postId: string, content: string, authorDisplayMode: number = 1): Promise<CommentType> => {
  const response = await api.post(API_ENDPOINTS.FORUMS.CREATE_COMMENT(postId), {
    content,
    authorDisplayMode
  });
  return response.data.comment;
};

export const toggleLike = async (postId: string): Promise<{ liked: boolean; likeCount: number }> => {
  const response = await api.post(`${API_ENDPOINTS.FORUMS.POST_DETAIL(postId)}/like`);
  return { liked: response.data.liked ?? false, likeCount: response.data.post?.likeCount ?? 0 };
};

export const searchPosts = async (query: string): Promise<PostType[]> => {
  const response = await api.get(`${API_ENDPOINTS.FORUMS.SEARCH_POSTS}?q=${encodeURIComponent(query)}`);
  return response.data.posts;
};
