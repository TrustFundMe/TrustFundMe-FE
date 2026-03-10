import { api } from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FlagDto {
  id: number;
  postId: number | null;
  campaignId: number | null;
  userId: number;
  reason: string;
  /** PENDING | RESOLVED | DISMISSED */
  status: "PENDING" | "RESOLVED" | "DISMISSED";
  reviewedBy: number | null;
  createdAt: string;
}

export interface SubmitFlagRequest {
  postId?: number | null;
  campaignId?: number | null;
  reason: string;
}

export interface PagedFlagResponse {
  content: FlagDto[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const flagService = {
  /**
   * Submit a flag/report for a campaign or post.
   * Available to any authenticated user (DONOR, FUND_OWNER, etc.)
   */
  async submitFlag(request: SubmitFlagRequest): Promise<FlagDto> {
    const res = await api.post<FlagDto>(API_ENDPOINTS.FLAGS.BASE, request);
    return res.data;
  },

  /**
   * Get a specific flag by ID. (ADMIN / STAFF only)
   */
  async getById(id: number | string): Promise<FlagDto> {
    const res = await api.get<FlagDto>(API_ENDPOINTS.FLAGS.BY_ID(id));
    return res.data;
  },

  /**
   * Get all flags (with optional status filter). (ADMIN / STAFF only)
   */
  async getAllFlags(
    status?: string,
    page = 0,
    size = 20
  ): Promise<PagedFlagResponse> {
    const res = await api.get<PagedFlagResponse>(API_ENDPOINTS.FLAGS.BASE, {
      params: { status, page, size },
    });
    return res.data;
  },

  /**
   * Get all PENDING flags. (ADMIN / STAFF only)
   */
  async getPendingFlags(page = 0, size = 10): Promise<PagedFlagResponse> {
    return flagService.getAllFlags("PENDING", page, size);
  },

  /**
   * Get all flags for a specific campaign. (ADMIN / STAFF only)
   */
  async getFlagsByCampaign(
    campaignId: number | string,
    page = 0,
    size = 10
  ): Promise<PagedFlagResponse> {
    const res = await api.get<PagedFlagResponse>(
      API_ENDPOINTS.FLAGS.BY_CAMPAIGN(campaignId),
      { params: { page, size } }
    );
    return res.data;
  },

  /**
   * Get all flags for a specific feed post. (ADMIN / STAFF only)
   */
  async getFlagsByPost(
    postId: number | string,
    page = 0,
    size = 10
  ): Promise<PagedFlagResponse> {
    const res = await api.get<PagedFlagResponse>(
      API_ENDPOINTS.FLAGS.BY_POST(postId),
      { params: { page, size } }
    );
    return res.data;
  },

  /**
   * Get the current user's own submitted flags.
   */
  async getMyFlags(page = 0, size = 20): Promise<FlagDto[]> {
    const res = await fetch(`/api/flags/me?page=${page}&size=${size}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error(`getMyFlags failed: ${res.status}`);
    const data: PagedFlagResponse | FlagDto[] = await res.json();
    if (Array.isArray(data)) return data;
    return (data as PagedFlagResponse).content ?? [];
  },

  /**
   * Review (resolve or dismiss) a flag. (ADMIN / STAFF only)
   * Backend accepts status as a query param, not in body.
   */
  async reviewFlag(
    flagId: number | string,
    status: "RESOLVED" | "DISMISSED"
  ): Promise<FlagDto> {
    const res = await api.patch<FlagDto>(API_ENDPOINTS.FLAGS.REVIEW(flagId), null, {
      params: { status },
    });
    return res.data;
  },

  // ─── Convenience helpers ─────────────────────────────────────────────────────

  /** Flag a campaign with a reason */
  async flagCampaign(campaignId: number, reason: string): Promise<FlagDto> {
    return flagService.submitFlag({ campaignId, reason });
  },

  /** Flag a feed post with a reason */
  async flagPost(postId: number, reason: string): Promise<FlagDto> {
    return flagService.submitFlag({ postId, reason });
  },
};
