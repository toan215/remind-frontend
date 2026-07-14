export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  tags: string[];
  likes: number;
  likedBy: string[];
  isAnonymous: boolean;
  isMine?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  author: string;
  content: string;
  parentId: string | null;
  likes: number;
  isMine?: boolean;
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
  postId: string;
  author: string;
  content: string;
  parentId: string | null;
}
