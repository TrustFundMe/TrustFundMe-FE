import type { FeedPost, FeedPostDto } from "@/types/feedPost";

export type FeedPostDtoFromApi = FeedPostDto;

/** Jackson có thể serialize Boolean isPinned thành JSON key "pinned" — gom cả hai. */
function coalesceBool(
  dto: object,
  primary: keyof FeedPostDtoFromApi,
  ...aliases: string[]
): boolean {
  const o = dto as Record<string, unknown>;
  const a = o[primary as string];
  if (typeof a === "boolean") return a;
  for (const key of aliases) {
    const v = o[key];
    if (typeof v === "boolean") return v;
  }
  return false;
}

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
    liked: coalesceBool(dto, "isLiked", "liked"),
    likeCount: dto.likeCount ?? 0,
    flagged: false,
    flagCount: dto.flagCount ?? 0,
    comments: [],
    campaignId: dto.campaignId ?? null,
    expenditureId: dto.expenditureId ?? null,
    // Target: links post to expenditure or campaign
    targetId: dto.targetId ?? null,
    targetType: dto.targetType ?? null,
    targetName: dto.targetName ?? null,
    category: dto.category ?? (dto.categoryId != null ? String(dto.categoryId) : null),
    categoryId: dto.categoryId ?? null,
    replyCount: Math.max(dto.commentCount ?? 0, dto.replyCount ?? 0),
    viewCount: dto.viewCount ?? 0,
    isPinned: coalesceBool(dto, "isPinned", "pinned"),
    isLocked: coalesceBool(dto, "isLocked", "locked"),
    hasRevisions: dto.hasRevisions === true,
    attachments: dto.attachments?.map((att) => {
      // Backend attachment maps use "mediaType" key (from MediaFileResponse),
      // not "type". Fall back through all possible field names.
      const raw = (att as Record<string, unknown>);
      const rawType = (raw["mediaType"] ?? raw["type"] ?? "") as string;
      const t = rawType.toLowerCase();
      const isImage = t === "image" || t === "photo" || t === "video";
      return {
        id: att.id ?? (raw["id"] as number | undefined),
        type: (isImage ? "image" : "file") as "image" | "file",
        url: att.url,
        name: att.fileName ?? (raw["fileName"] as string | undefined),
      };
    }),
  };
}
