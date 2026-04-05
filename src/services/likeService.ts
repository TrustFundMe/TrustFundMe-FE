import { API_ENDPOINTS } from "@/constants/apiEndpoints";

export interface ToggleLikeResponse {
  liked: boolean;
  likeCount: number;
}

/** BE trả FeedPostResponse: `isLiked`, không phải `liked` — chuẩn hóa một chỗ cho mọi màn. */
function normalizeToggleLikePayload(data: unknown): ToggleLikeResponse {
  const o = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
  const rawLiked = o.liked ?? o.isLiked;
  const rawCount = o.likeCount;
  return {
    liked: rawLiked === true,
    likeCount: typeof rawCount === "number" && !Number.isNaN(rawCount) ? rawCount : Number(rawCount) || 0,
  };
}

export const likeService = {
  async toggleLike(postId: number | string): Promise<ToggleLikeResponse> {
    // Call Next.js proxy so access_token cookie is forwarded (same as flags/media)
    const res = await fetch(API_ENDPOINTS.FEED_POSTS.LIKE(postId), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`toggleLike failed: ${res.status}`);
    return normalizeToggleLikePayload(await res.json());
  },
};
