export interface ForumPost {
  id: number;
  title: string;
  content: string;
  author: string;
  tags: string[];
  likes: number;
  likedBy: string[];
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  postId: number;
  author: string;
  content: string;
  parentId: number | null;
  likes: number;
  createdAt: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  author: string;
  tags: string[];
  isAnonymous: boolean;
}

export interface CreateCommentData {
  postId: number;
  author: string;
  content: string;
  parentId: number | null;
}
