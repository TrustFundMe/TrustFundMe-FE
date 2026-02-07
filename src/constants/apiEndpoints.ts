export const API_ENDPOINTS = {
  CAMPAIGNS: {
    BASE: "/api/campaigns",
    BY_ID: (id: number | string) => `/api/campaigns/${id}`,
    BY_FUND_OWNER: (fundOwnerId: number | string) =>
      `/api/campaigns/fund-owner/${fundOwnerId}`,
  },
  FUNDRAISING_GOALS: {
    BASE: "/api/fundraising-goals",
    BY_CAMPAIGN: (campaignId: number | string) => `/api/fundraising-goals/campaign/${campaignId}`,
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
    BASE: "/api/users",
    BY_ID: (id: number | string) => `/api/users/${id}`,
    BAN: (id: number | string) => `/api/users/${id}/ban`,
    UNBAN: (id: number | string) => `/api/users/${id}/unban`,
  },
} as const;
