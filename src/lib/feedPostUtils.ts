import type { FeedPost, FeedPostDto } from "@/types/feedPost";

/** API response shape (FeedPostResponse) may include extra fields */
export type FeedPostDtoFromApi = FeedPostDto & {
  categoryId?: number | null;
  replyCount?: number;
  viewCount?: number;
  isPinned?: boolean;
  isLocked?: boolean;
  attachments?: { url?: string; name?: string; fileName?: string; type?: string }[];
};

/** Map API response (authorId, no author) to FeedPost for display */
export function dtoToFeedPost(dto: FeedPostDtoFromApi): FeedPost {
  return {
    id: String(dto.id),
    author: {
      id: String(dto.authorId),
      name: `Thành viên #${dto.authorId}`,
      avatar: "",
    },
    title: dto.title ?? null,
    content: dto.content,
    type: dto.type,
    visibility: dto.visibility,
    status: dto.status,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt ?? null,
    liked: false,
    likeCount: 0,
    flagged: false,
    comments: [],
    budgetId: dto.budgetId ?? null,
    categoryId: dto.categoryId ?? null,
    replyCount: dto.replyCount ?? 0,
    viewCount: dto.viewCount ?? 0,
    isPinned: dto.isPinned ?? false,
    isLocked: dto.isLocked ?? false,
    attachments: dto.attachments?.map((a) => ({
      type: (a.type?.toLowerCase() === "file" ? "file" : "image") as "image" | "file",
      url: a.url ?? "",
      name: a.name ?? a.fileName,
    })),
  };
}
