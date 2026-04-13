import { api } from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type {
  FeedPostDto,
  CreateFeedPostRequest,
  UpdateFeedPostRequest,
  FeedPostRevisionDto,
  RevisionPage,
} from "@/types/feedPost";
import { mediaService } from "@/services/mediaService";

/** Backend returns Page<FeedPostResponse> = { content, totalElements, totalPages, ... } */
function unwrapPage<T>(data: T[] | { content?: T[] }): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray((data as { content?: T[] }).content)) {
    return (data as { content: T[] }).content;
  }
  return [];
}

export const feedPostService = {
  async getAll(params?: { page?: number; size?: number; sort?: string }): Promise<FeedPostDto[]> {
    const res = await api.get<FeedPostDto[] | { content: FeedPostDto[] }>(
      API_ENDPOINTS.FEED_POSTS.BASE,
      { params }
    );
    return unwrapPage(res.data);
  },

  /** Paginated feed — returns page metadata for infinite scroll */
  async getPage(params?: { page?: number; size?: number }): Promise<{
    content: FeedPostDto[];
    totalElements: number;
    totalPages: number;
  }> {
    const res = await api.get<{ content: FeedPostDto[]; totalElements: number; totalPages: number }>(
      API_ENDPOINTS.FEED_POSTS.BASE,
      { params: { page: params?.page ?? 0, size: params?.size ?? 5 } }
    );
    if (Array.isArray(res.data)) {
      return { content: res.data, totalElements: res.data.length, totalPages: 1 };
    }
    return res.data;
  },

  async getByCampaignId(
    campaignId: number,
    params?: { page?: number; size?: number }
  ): Promise<{ content: FeedPostDto[]; totalElements: number; totalPages: number }> {
    const res = await api.get<{ content: FeedPostDto[]; totalElements: number; totalPages: number }>(
      API_ENDPOINTS.FEED_POSTS.BASE,
      { params: { campaignId, page: params?.page ?? 0, size: params?.size ?? 10 } }
    );
    if (Array.isArray(res.data)) {
      return { content: res.data, totalElements: res.data.length, totalPages: 1 };
    }
    return res.data;
  },

  async getById(id: number): Promise<FeedPostDto> {
    const res = await api.get<FeedPostDto>(API_ENDPOINTS.FEED_POSTS.BY_ID(id));
    return res.data;
  },

  async getByAuthor(authorId: number): Promise<FeedPostDto[]> {
    const res = await api.get<FeedPostDto[]>(
      API_ENDPOINTS.FEED_POSTS.BY_AUTHOR(authorId)
    );
    return res.data;
  },

  async getMyPage(params?: { status?: string; page?: number; size?: number }): Promise<{
    content: FeedPostDto[];
    totalElements: number;
    totalPages: number;
  }> {
    const res = await api.get<{ content: FeedPostDto[]; totalElements: number; totalPages: number }>(
      API_ENDPOINTS.FEED_POSTS.MY,
      {
        params: {
          status: params?.status ?? "ALL",
          page: params?.page ?? 0,
          size: params?.size ?? 10,
        },
      }
    );
    if (Array.isArray(res.data)) {
      return { content: res.data, totalElements: res.data.length, totalPages: 1 };
    }
    return res.data;
  },

  /**
   * Creates a new feed post using the authenticated axios instance.
   * Status defaults to 'PUBLISHED' so the post is immediately visible on the feed.
   */
  async create(payload: CreateFeedPostRequest): Promise<FeedPostDto> {
    const body = { ...payload, status: payload.status ?? "PUBLISHED" };
    const res = await api.post<FeedPostDto>("/api/feed-posts", body);
    return res.data;
  },

  async update(
    id: number,
    payload: UpdateFeedPostRequest
  ): Promise<FeedPostDto> {
    const res = await api.put<FeedPostDto>(`/api/feed-posts/${id}`, payload);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/feed-posts/${id}`);
  },

  async getByTarget(targetId: number, targetType: string): Promise<FeedPostDto[]> {
    const res = await api.get<FeedPostDto[] | { content: FeedPostDto[] }>(API_ENDPOINTS.FEED_POSTS.BASE, {
      params: { targetId, targetType },
    });
    return unwrapPage(res.data);
  },

  async updateStatus(id: number, status: string): Promise<FeedPostDto> {
    const res = await api.patch<FeedPostDto>(`/api/feed-posts/${id}/status`, { status });
    return res.data;
  },

  async uploadImage(file: File, postId?: number): Promise<{ url: string; mediaId: number }> {
    const result = await mediaService.uploadMedia(file, undefined, postId, undefined, undefined, "PHOTO");
    if (!result.url) throw new Error("Upload thất bại: không nhận được URL từ media service.");
    return { url: result.url, mediaId: result.id ?? 0 };
  },

  async lockPost(id: number): Promise<FeedPostDto> {
    const res = await api.patch<FeedPostDto>(API_ENDPOINTS.FEED_POSTS.ADMIN_LOCK(id));
    return res.data;
  },

  /** Paginated revision history for a post. No auth required for PUBLISHED posts. */
  async getRevisions(postId: number, params?: { page?: number; size?: number }): Promise<RevisionPage> {
    const requestedSize = params?.size ?? 10;
    const size = Math.min(Math.max(requestedSize, 1), 50);
    const res = await api.get<RevisionPage>(`/api/feed-posts/${postId}/revisions`, {
      params: { page: params?.page ?? 0, size },
    });
    if (Array.isArray(res.data)) {
      return { content: res.data as FeedPostRevisionDto[], totalElements: (res.data as FeedPostRevisionDto[]).length, totalPages: 1 };
    }
    return res.data;
  },

  /** Single revision detail */
  async getRevisionById(postId: number, revisionId: number): Promise<FeedPostRevisionDto> {
    const res = await api.get<FeedPostRevisionDto>(`/api/feed-posts/${postId}/revisions/${revisionId}`);
    return res.data;
  },
};
