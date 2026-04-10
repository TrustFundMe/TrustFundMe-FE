export type FeedPostDto = {
  id: number;
  campaignId?: number | null;
  expenditureId?: number | null;
  // Target: links post to expenditure or campaign
  targetId?: number | null;
  targetType?: string | null;
  targetName?: string | null;
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
  // Optional numeric category id (if backend returns it)
  categoryId?: number | null;
  replyCount?: number;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  flagCount?: number;
  isLiked?: boolean;
  isPinned?: boolean;
  isLocked?: boolean;
  /** True when the post has at least one revision snapshot (edited after feature launch). Use this — NOT updatedAt vs createdAt — to show the "Đã chỉnh sửa" label. */
  hasRevisions?: boolean;
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
  id?: number;
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
  flagCount?: number;
  comments: FeedPostComment[];
  campaignId?: number | null;
  expenditureId?: number | null;
  targetId?: number | null;
  targetType?: string | null;
  targetName?: string | null;
  category?: string | null;
  categoryId?: number | null;
  parentPostId?: number | null;
  replyCount: number;
  viewCount: number;
  isPinned: boolean;
  isLocked: boolean;
  /** True when the post has at least one revision snapshot (edited after feature launch). */
  hasRevisions?: boolean;
};

export type CreateFeedPostRequest = {
  // Target: links post to expenditure or campaign
  targetId?: number | null;
  targetType?: string | null;
  categoryId?: number | null;
  // Legacy/compat (some screens may still send these)
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
  // Target: links post to expenditure or campaign
  targetId?: number | null;
  targetType?: string | null;
  categoryId?: number | null;
  // Legacy/compat
  campaignId?: number | null;
  expenditureId?: number | null;
  category?: string | null;
  type?: string;
  visibility?: string;
  title?: string | null;
  content?: string;
  status?: string;
};

/** One item from media_snapshot_json */
export type RevisionMediaItem = {
  mediaId?: number;
  url: string;
  mediaType?: string;
  sortOrder?: number;
};

/** Revision snapshot — state of post BEFORE an edit */
export type FeedPostRevisionDto = {
  id: number;
  postId: number;
  revisionNo: number;
  title: string | null;
  content: string;
  status: string;
  mediaSnapshot: RevisionMediaItem[];
  editedBy: number;
  editedByName: string | null;
  editNote: string | null;
  createdAt: string;
};

export type RevisionPage = {
  content: FeedPostRevisionDto[];
  totalElements: number;
  totalPages: number;
};
