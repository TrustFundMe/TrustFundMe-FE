import { api } from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type {
  FeedPostDto,
  CreateFeedPostRequest,
  UpdateFeedPostRequest,
} from "@/types/feedPost";

/** Backend returns Page<FeedPostResponse> = { content, totalElements, totalPages, ... } */
function unwrapPage<T>(data: T[] | { content?: T[] }): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray((data as { content?: T[] }).content)) {
    return (data as { content: T[] }).content;
  }
  return [];
}

export const feedPostService = {
  async getAll(): Promise<FeedPostDto[]> {
    const res = await api.get<FeedPostDto[] | { content: FeedPostDto[] }>(
      API_ENDPOINTS.FEED_POSTS.BASE
    );
    return unwrapPage(res.data);
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

  /**
   * Creates a new feed post using the authenticated axios instance.
   * Status defaults to 'ACTIVE' so the post is immediately visible on the feed.
   */
  async create(payload: CreateFeedPostRequest): Promise<FeedPostDto> {
    const body = { ...payload, status: payload.status ?? "ACTIVE" };
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

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post<{ url?: string }>("/api/media/upload", formData, {
      headers: { "Content-Type": undefined },
      transformRequest: [(data) => data],
    });
    return res.data.url ?? "";
  },
};
