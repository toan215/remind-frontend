export interface ForumType {
  _id: string;
  title: string;
  description: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}

export interface PostType {
  _id: string;
  forumId: string;
  title: string;
  publicAuthorName: string;
  content: string;
  tags: string[];
  likeCount: number;
  commentCount: number;
  status: string;
  createdAt: string;
}

export interface CommentType {
  _id: string;
  postId: string;
  publicAuthorName: string;
  content: string;
  likeCount: number;
  createdAt: string;
}
