export type FeedPostDto = {
  id: number;
  campaignId?: number | null;
  expenditureId?: number | null;
  authorId: number;
  authorName?: string | null;
  authorAvatar?: string | null;
  type: string;
  visibility: string;
  title: string | null;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  // enriched fields from FeedPostResponse
  category?: string | null;
  replyCount?: number;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  isLiked?: boolean;
  isPinned?: boolean;
  isLocked?: boolean;
  attachments?: { id?: number; type?: string; url: string; fileName?: string; fileSize?: number; mimeType?: string; displayOrder?: number }[];
};

export type FeedPostAuthor = {
  id: string;
  name: string;
  avatar: string;
  isActive?: boolean;
};

export type FeedPostComment = {
  id: string;
  userId?: string;
  user: FeedPostAuthor;
  content: string;
  createdAt: string;
  liked?: boolean;
  likeCount?: number;
  parentCommentId?: string | null;
  replies?: FeedPostComment[];
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
  /** Images fetched from media-service by postId */
  attachments?: FeedPostAttachment[];
  liked: boolean;
  likeCount: number;
  flagged: boolean;
  comments: FeedPostComment[];
  campaignId?: number | null;
  expenditureId?: number | null;
  category?: string | null;
  parentPostId?: number | null;
  replyCount: number;
  viewCount: number;
  isPinned: boolean;
  isLocked: boolean;
};

export type CreateFeedPostRequest = {
  campaignId?: number | null;
  expenditureId?: number | null;
  category?: string | null;
  type: string;
  visibility: string;
  title?: string | null;
  content: string;
  status?: string;
};

export type UpdateFeedPostRequest = {
  campaignId?: number | null;
  expenditureId?: number | null;
  category?: string | null;
  type?: string;
  visibility?: string;
  title?: string | null;
  content?: string;
  status?: string;
};
