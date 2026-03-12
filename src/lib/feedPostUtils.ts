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
    campaignId: dto.campaignId ?? null,
    expenditureId: dto.expenditureId ?? null,
    category: dto.category ?? null,
    replyCount: Math.max(dto.commentCount ?? 0, dto.replyCount ?? 0),
    viewCount: dto.viewCount ?? 0,
    isPinned: dto.isPinned ?? false,
    isLocked: dto.isLocked ?? false,
  };
}
