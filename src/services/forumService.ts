import api from "../utils/apiHelper";
import { API_ENDPOINTS } from "../utils/constants";
import { ForumType, PostType, CommentType } from "../components/Forum/types";

export const getForums = async (): Promise<ForumType[]> => {
  const response = await api.get(API_ENDPOINTS.FORUMS.LIST_FORUMS);
  return response.data.forums;
};

export const getPosts = async (): Promise<PostType[]> => {
  const response = await api.get(API_ENDPOINTS.FORUMS.LIST_POSTS);
  return response.data.posts;
};

export const getPostDetail = async (postId: string): Promise<{ post: PostType; comments: CommentType[] }> => {
  const response = await api.get(API_ENDPOINTS.FORUMS.POST_DETAIL(postId));
  return response.data;
};

export const createPost = async (title: string, content: string, tags: string[], authorDisplayMode: number = 1): Promise<PostType> => {
  const response = await api.post(API_ENDPOINTS.FORUMS.CREATE_POST, {
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

export const searchPosts = async (query: string): Promise<PostType[]> => {
  const response = await api.get(`${API_ENDPOINTS.FORUMS.SEARCH_POSTS}?q=${encodeURIComponent(query)}`);
  return response.data.posts;
};
