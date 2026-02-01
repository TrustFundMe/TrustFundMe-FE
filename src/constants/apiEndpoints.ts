export const API_ENDPOINTS = {
  CAMPAIGNS: {
    BASE: "/api/campaigns",
    BY_ID: (id: number | string) => `/api/campaigns/${id}`,
    BY_FUND_OWNER: (fundOwnerId: number | string) =>
      `/api/campaigns/fund-owner/${fundOwnerId}`,
  },
  FEED_POSTS: {
    BASE: "/api/feed-posts",
    BY_ID: (id: number | string) => `/api/feed-posts/${id}`,
    BY_AUTHOR: (authorId: number | string) =>
      `/api/feed-posts/author/${authorId}`,
  },
  CHAT: {
    CONVERSATIONS: "/api/chat/conversations",
    MESSAGES: (id: string | number) => `/api/chat/conversations/${id}/messages`,
  },
  USERS: {
    BY_ID: (id: number | string) => `/api/users/${id}`,
  },
} as const;
