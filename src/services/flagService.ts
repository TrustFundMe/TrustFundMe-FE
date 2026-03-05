import { API_ENDPOINTS } from "@/constants/apiEndpoints";

export interface FlagDto {
  id: number;
  postId: number | null;
  campaignId: number | null;
  userId: number;
  reason: string;
  status: "PENDING" | "RESOLVED" | "DISMISSED";
  reviewedBy: number | null;
  createdAt: string;
}

export interface SubmitFlagRequest {
  postId?: number | null;
  campaignId?: number | null;
  reason: string;
}

export interface ReviewFlagRequest {
  status: "RESOLVED" | "DISMISSED";
}

export const flagService = {
  async submitFlag(request: SubmitFlagRequest): Promise<FlagDto> {
    const res = await fetch(API_ENDPOINTS.FLAGS.BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw Object.assign(new Error((err as { message?: string }).message ?? "Flag failed"), {
        response: { status: res.status },
      });
    }
    return res.json();
  },

  async getPendingFlags(): Promise<FlagDto[]> {
    const res = await fetch(API_ENDPOINTS.FLAGS.PENDING, { credentials: "include" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.content ?? []);
  },

  async getFlagsByPost(postId: number | string): Promise<FlagDto[]> {
    const res = await fetch(API_ENDPOINTS.FLAGS.BY_POST(postId), { credentials: "include" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.content ?? []);
  },

  async getMyFlags(): Promise<FlagDto[]> {
    const res = await fetch(API_ENDPOINTS.FLAGS.MY_FLAGS, { credentials: "include" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.content ?? []);
  },

  async reviewFlag(flagId: number | string, status: "RESOLVED" | "DISMISSED"): Promise<FlagDto> {
    const res = await fetch(API_ENDPOINTS.FLAGS.REVIEW(flagId), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw Object.assign(new Error((err as { message?: string }).message ?? "Review failed"), {
        response: { status: res.status },
      });
    }
    return res.json();
  },
};
