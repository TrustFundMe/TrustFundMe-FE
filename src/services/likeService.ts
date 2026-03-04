import { API_ENDPOINTS } from "@/constants/apiEndpoints";

export interface ToggleLikeResponse {
  liked: boolean;
  likeCount: number;
}

export const likeService = {
  async toggleLike(postId: number | string): Promise<ToggleLikeResponse> {
    const res = await fetch(API_ENDPOINTS.FEED_POSTS.LIKE(postId), {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw Object.assign(new Error((err as { message?: string }).message ?? "Like failed"), {
        response: { status: res.status },
      });
    }
    return res.json();
  },
};
