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

  async create(payload: CreateFeedPostRequest): Promise<FeedPostDto> {
    const url = "/api/feed-posts";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw Object.assign(new Error(err.message ?? "Create post failed"), {
        response: { status: res.status, data: err },
      });
    }
    return res.json();
  },

  async update(
    id: number,
    payload: UpdateFeedPostRequest
  ): Promise<FeedPostDto> {
    const url = `/api/feed-posts/${id}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw Object.assign(new Error(err.message ?? "Update post failed"), {
        response: { status: res.status, data: err },
      });
    }
    return res.json();
  },

  async delete(id: number): Promise<void> {
    const res = await fetch(`/api/feed-posts/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw Object.assign(new Error((err as { message?: string }).message ?? "Delete failed"), {
        response: { status: res.status, data: err },
      });
    }
  },

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/media/upload", {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw Object.assign(new Error(err.message ?? "Upload failed"), {
        response: { status: res.status, data: err },
      });
    }
    const data = await res.json();
    return data.url ?? "";
  },
};
