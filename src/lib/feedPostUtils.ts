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
    comments: [],
    budgetId: dto.budgetId ?? null,
    categoryId: dto.categoryId ?? null,
    replyCount: Math.max(dto.commentCount ?? 0, dto.replyCount ?? 0),
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
