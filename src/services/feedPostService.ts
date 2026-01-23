import { api } from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type {
  FeedPostDto,
  CreateFeedPostRequest,
  UpdateFeedPostRequest,
} from "@/types/feedPost";

export const feedPostService = {
  async getAll(): Promise<FeedPostDto[]> {
    const res = await api.get<FeedPostDto[]>(API_ENDPOINTS.FEED_POSTS.BASE);
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

  async create(payload: CreateFeedPostRequest): Promise<FeedPostDto> {
    const res = await api.post<FeedPostDto>(
      API_ENDPOINTS.FEED_POSTS.BASE,
      payload
    );
    return res.data;
  },

  async update(
    id: number,
    payload: UpdateFeedPostRequest
  ): Promise<FeedPostDto> {
    const res = await api.put<FeedPostDto>(
      API_ENDPOINTS.FEED_POSTS.BY_ID(id),
      payload
    );
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(API_ENDPOINTS.FEED_POSTS.BY_ID(id));
  },
};
