import { API_ENDPOINTS } from "@/constants/apiEndpoints";

/**
 * Uses fetch with credentials: "include" so the access_token cookie is forwarded.
 * Matches the pattern used by likeService and flagService.
 */

export const seenService = {
  /**
   * Mark a single post as seen by the current user.
   * Returns { new: true } if this was a new view, { new: false } if already seen.
   */
  async markSeen(postId: number): Promise<{ new: boolean }> {
    const res = await fetch(API_ENDPOINTS.USER_POST_SEEN.BASE, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
    if (!res.ok) throw new Error(`markSeen failed: ${res.status}`);
    const data = await res.json().catch(() => ({ new: false }));
    return { new: data.new === true };
  },

  /**
   * Batch mark multiple posts as seen.
   * Sends up to 50 IDs per request to keep the payload reasonable.
   */
  async markSeenBatch(postIds: number[]): Promise<void> {
    if (!postIds.length) return;
    const BATCH = 50;
    for (let i = 0; i < postIds.length; i += BATCH) {
      const slice = postIds.slice(i, i + BATCH);
      const res = await fetch(API_ENDPOINTS.USER_POST_SEEN.BASE, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postIds: slice }),
      });
      if (!res.ok) throw new Error(`markSeenBatch failed: ${res.status}`);
    }
  },

  /**
   * Get all post IDs the current authenticated user has seen.
   * Returns an empty array for anonymous users (backend returns empty set).
   */
  async getSeenPostIds(): Promise<Set<number>> {
    const res = await fetch(API_ENDPOINTS.USER_POST_SEEN.BASE, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`getSeenPostIds failed: ${res.status}`);
    const data: number[] = await res.json();
    return new Set(Array.isArray(data) ? data : []);
  },
};
