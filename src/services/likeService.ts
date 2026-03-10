import { API_ENDPOINTS } from "@/constants/apiEndpoints";

export interface ToggleLikeResponse {
  liked: boolean;
  likeCount: number;
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
    return res.json();
  },
};
