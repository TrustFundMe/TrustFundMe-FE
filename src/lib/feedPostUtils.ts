import type { FeedPost, FeedPostDto } from "@/types/feedPost";

export type FeedPostDtoFromApi = FeedPostDto;

/** Map API response (authorId, no author) to FeedPost for display */
export function dtoToFeedPost(dto: FeedPostDtoFromApi): FeedPost {
  return {
    id: String(dto.id),
    author: {
      id: String(dto.authorId),
      name: dto.authorName ?? `Thành viên #${dto.authorId}`,
      avatar: dto.authorAvatar ?? "",
    },
    title: dto.title ?? null,
    content: dto.content,
    type: dto.type,
    visibility: dto.visibility,
    status: dto.status,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt ?? null,
    liked: dto.isLiked ?? false,
    likeCount: dto.likeCount ?? 0,
    flagged: false,
    flagCount: dto.flagCount ?? 0,
    comments: [],
    campaignId: dto.campaignId ?? null,
    // Backend uses budgetId to store expenditureId for campaign-linked posts.
    expenditureId: dto.expenditureId ?? dto.budgetId ?? null,
    category: dto.category ?? (dto.categoryId != null ? String(dto.categoryId) : null),
    budgetId: dto.budgetId ?? null,
    categoryId: dto.categoryId ?? null,
    replyCount: Math.max(dto.commentCount ?? 0, dto.replyCount ?? 0),
    viewCount: dto.viewCount ?? 0,
    isPinned: dto.isPinned ?? false,
    isLocked: dto.isLocked ?? false,
    attachments: dto.attachments?.map((att) => ({
      type: (att.type?.toLowerCase() === "image" ? "image" : "file") as "image" | "file",
      url: att.url,
      name: att.fileName ?? undefined,
    })),
  };
}
