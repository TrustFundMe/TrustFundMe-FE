export type FeedPostDto = {
  id: number;
  budgetId: number | null;
  authorId: number;
  type: string;
  visibility: string;
  title: string | null;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
};

export type FeedPostAuthor = {
  id: string;
  name: string;
  avatar: string;
};

export type FeedPostComment = {
  id: string;
  user: FeedPostAuthor;
  content: string;
  createdAt: string;
  liked?: boolean;
  likeCount?: number;
  replies?: FeedPostComment[]; // Nested comments
};

export type FeedPostAttachment = {
  type: "image" | "file";
  url: string;
  name?: string;
};

export type FeedPost = {
  id: string;
  author: FeedPostAuthor;
  title?: string | null;
  content: string;
  type: string;
  visibility: string;
  status: string;
  createdAt: string;
  updatedAt?: string | null;
  attachments?: FeedPostAttachment[];
  liked: boolean;
  likeCount: number;
  flagged: boolean;
  comments: FeedPostComment[];
  budgetId?: number | null;
};

export type CreateFeedPostRequest = {
  budgetId?: number | null;
  type: string;
  visibility: string;
  title?: string | null;
  content: string;
  status?: string;
};

export type UpdateFeedPostRequest = {
  budgetId?: number | null;
  type?: string;
  visibility?: string;
  title?: string | null;
  content?: string;
  status?: string;
};
