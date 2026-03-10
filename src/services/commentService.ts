import { api } from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

export interface CommentDto {
  id: number;
  postId: number;
  userId: number;
  parentCommentId: number | null;
  content: string;
  likeCount: number;
  isLiked: boolean;
  authorName: string | null;
  authorAvatar: string | null;
  createdAt: string;
  updatedAt: string | null;
  replies?: CommentDto[];
}

export interface CommentPageResponse {
  content: CommentDto[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export const commentService = {
  async getComments(postId: number | string, page = 0, size = 20): Promise<CommentDto[]> {
    const res = await fetch(
      `${API_ENDPOINTS.FEED_POSTS.COMMENTS(postId)}?page=${page}&size=${size}`,
      { credentials: "include" }
    );
    if (!res.ok) return [];
    const data: CommentPageResponse | CommentDto[] = await res.json();
    if (Array.isArray(data)) return data;
    return data.content ?? [];
  },

  async createComment(
    postId: number | string,
    content: string,
    parentCommentId?: number | null
  ): Promise<CommentDto> {
    const res = await fetch(API_ENDPOINTS.FEED_POSTS.COMMENTS(postId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content, parentCommentId: parentCommentId ?? null }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw Object.assign(new Error((err as { message?: string }).message ?? "Comment failed"), {
        response: { status: res.status },
      });
    }
    return res.json();
  },

  async updateComment(commentId: number | string, content: string): Promise<CommentDto> {
    const res = await fetch(API_ENDPOINTS.FEED_POSTS.COMMENT_BY_ID(commentId), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw Object.assign(new Error((err as { message?: string }).message ?? "Update failed"), {
        response: { status: res.status },
      });
    }
    return res.json();
  },

  async deleteComment(commentId: number | string): Promise<void> {
    const res = await fetch(API_ENDPOINTS.FEED_POSTS.COMMENT_BY_ID(commentId), {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw Object.assign(new Error((err as { message?: string }).message ?? "Delete failed"), {
        response: { status: res.status },
      });
    }
  },

  async toggleCommentLike(
    commentId: number | string
  ): Promise<{ likeCount: number; isLiked: boolean }> {
    // Use api axios instance — automatically adds Authorization: Bearer <token> from localStorage
    const res = await api.post<CommentDto>(API_ENDPOINTS.FEED_POSTS.COMMENT_LIKE(commentId));
    const data = res.data;
    return { likeCount: data.likeCount ?? 0, isLiked: data.isLiked ?? false };
  },
};
