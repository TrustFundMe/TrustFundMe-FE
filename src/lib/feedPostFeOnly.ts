import type { FeedPost, FeedPostAttachment } from "@/types/feedPost";

type CreateData = {
  title?: string | null;
  content: string;
  type: string;
  visibility: string;
  status?: string;
  budgetId?: number | null;
  attachments?: { type: "image"; url: string }[];
};

type UserLike = { id?: string | number; fullName?: string | null; avatarUrl?: string | null };

/**
 * Tạo post giả khi BE không chạy (FE-only). Dùng để test/create thử.
 * Post chỉ tồn tại trong session; refresh sẽ mất (ảnh blob URL cũng mất).
 */
export function createPostFeOnly(data: CreateData, user: UserLike | null): FeedPost {
  const uid = user?.id != null ? String(user.id) : "anon";
  const atts: FeedPostAttachment[] = (data.attachments || []).map((a) => ({
    type: "image",
    url: a.url,
  }));

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
    attachments: atts.length ? atts : undefined,
    liked: false,
    likeCount: 0,
    flagged: false,
    comments: [],
    budgetId: data.budgetId ?? null,
  };
}

export type UpdateData = {
  title?: string | null;
  content?: string;
  type?: string;
  visibility?: string;
  status?: string;
  budgetId?: number | null;
  attachments?: { type: "image"; url: string }[];
};

/**
 * Cập nhật post giả (FE-only).
 */
export function updatePostFeOnly(original: FeedPost, data: UpdateData): FeedPost {
  const atts: FeedPostAttachment[] | undefined = data.attachments
    ? data.attachments.map((a) => ({ type: "image", url: a.url }))
    : original.attachments;

  return {
    ...original,
    title: data.title !== undefined ? (data.title?.trim() || null) : original.title,
    content: data.content !== undefined ? data.content : original.content,
    type: data.type !== undefined ? data.type : original.type,
    visibility: data.visibility !== undefined ? data.visibility : original.visibility,
    status: data.status !== undefined ? data.status : original.status,
    budgetId: data.budgetId !== undefined ? (data.budgetId ?? null) : original.budgetId,
    updatedAt: new Date().toISOString(),
    attachments: atts,
  };
}
