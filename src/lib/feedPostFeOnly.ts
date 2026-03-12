import type { FeedPost } from "@/types/feedPost";

type CreateData = {
  title?: string | null;
  content: string;
  type: string;
  visibility: string;
  status?: string;
  expenditureId?: number | null;
};

type UserLike = { id?: string | number; fullName?: string | null; avatarUrl?: string | null };

/**
 * Tạo post giả khi BE không chạy (FE-only). Dùng để test/create thử.
 * Post chỉ tồn tại trong session; refresh sẽ mất.
 */
export function createPostFeOnly(data: CreateData, user: UserLike | null): FeedPost {
  const uid = user?.id != null ? String(user.id) : "anon";

  return {
    id: `fe-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    author: {
      id: uid,
      name: user?.fullName?.trim() || "You",
      avatar: user?.avatarUrl || "",
    },
    title: data.title?.trim() || null,
    content: data.content,
    type: data.type,
    visibility: data.visibility,
    status: data.status || "PUBLISHED",
    createdAt: new Date().toISOString(),
    updatedAt: null,
    liked: false,
    likeCount: 0,
    flagged: false,
    comments: [],
    expenditureId: data.expenditureId ?? null,
    replyCount: 0,
    viewCount: 0,
    isPinned: false,
    isLocked: false,
  };
}

export type UpdateData = {
  title?: string | null;
  content?: string;
  type?: string;
  visibility?: string;
  status?: string;
  expenditureId?: number | null;
};

/**
 * Cập nhật post giả (FE-only).
 */
export function updatePostFeOnly(original: FeedPost, data: UpdateData): FeedPost {
  return {
    ...original,
    title: data.title !== undefined ? (data.title?.trim() || null) : original.title,
    content: data.content !== undefined ? data.content : original.content,
    type: data.type !== undefined ? data.type : original.type,
    visibility: data.visibility !== undefined ? data.visibility : original.visibility,
    status: data.status !== undefined ? data.status : original.status,
    expenditureId: data.expenditureId !== undefined ? (data.expenditureId ?? null) : original.expenditureId,
    updatedAt: new Date().toISOString(),
  };
}
