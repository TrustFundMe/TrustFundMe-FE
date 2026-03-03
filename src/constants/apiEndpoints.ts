export const API_ENDPOINTS = {
  CAMPAIGNS: {
    BASE: "/api/campaigns",
    BY_ID: (id: number | string) => `/api/campaigns/${id}`,
    BY_FUND_OWNER: (fundOwnerId: number | string) =>
      `/api/campaigns/fund-owner/${fundOwnerId}`,
    BY_STATUS: (status: string) => `/api/campaigns/status/${status}`,
    BY_CATEGORY: (categoryId: number | string) => `/api/campaigns/category/${categoryId}`,
    REVIEW: (id: number | string) => `/api/campaigns/${id}/review`,
  },
  CAMPAIGN_FOLLOWS: {
    BASE: "/api/campaign-follows",
    FOLLOW: (id: number | string) => `/api/campaign-follows/${id}`,
    UNFOLLOW: (id: number | string) => `/api/campaign-follows/${id}`,
    FOLLOWERS: (id: number | string) => `/api/campaign-follows/${id}/followers`,
    COUNT: (id: number | string) => `/api/campaign-follows/${id}/count`,
    IS_FOLLOWING: (id: number | string) => `/api/campaign-follows/${id}/me`,
    MY_FOLLOWS: "/api/campaign-follows/me",
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
    BY_CAMPAIGN: (campaignId: string | number) => `/api/chat/conversations/campaign/${campaignId}`,
    MESSAGES: (id: string | number) => `/api/chat/conversations/${id}/messages`,
  },
  USERS: {
    BASE: "/api/users",
    BY_ID: (id: number | string) => `/api/users/${id}`,
    BAN: (id: number | string) => `/api/users/${id}/ban`,
    UNBAN: (id: number | string) => `/api/users/${id}/unban`,
    UPGRADE_TO_FUND_OWNER: (id: number | string) => `/api/users/${id}/upgrade-role`,
    UPGRADE_TO_FUND_DONOR: (id: number | string) => `/api/users/${id}/upgrade-to-fund-donor`,
  },
  GOALS: {
    BASE: "/api/fundraising-goals",
    BY_ID: (id: number | string) => `/api/fundraising-goals/${id}`,
    BY_CAMPAIGN: (campaignId: number | string) =>
      `/api/fundraising-goals/campaign/${campaignId}`,
  },
  BANK_ACCOUNTS: {
    BASE: "/api/bank-accounts",
    BY_ID: (id: number | string) => `/api/bank-accounts/${id}`,
    BY_USER: (userId: number | string) => `/api/bank-accounts/user/${userId}`,
    MY_ACCOUNTS: "/api/bank-accounts",
  },
  EXPENDITURES: {
    BASE: "/api/expenditures",
    BY_CAMPAIGN: (campaignId: number | string) => `/api/expenditures/campaign/${campaignId}`,
    BY_ID: (id: number | string) => `/api/expenditures/${id}`,
    ITEMS: (id: number | string) => `/api/expenditures/${id}/items`,
    UPDATE_STATUS: (id: number | string) => `/api/expenditures/${id}/status`,
  },
  APPOINTMENTS: {
    BASE: "/api/appointments",
    BY_ID: (id: number | string) => `/api/appointments/${id}`,
    BY_DONOR: (donorId: number | string) => `/api/appointments/donor/${donorId}`,
    BY_STAFF: (staffId: number | string) => `/api/appointments/staff/${staffId}`,
    UPDATE_STATUS: (id: number | string) => `/api/appointments/${id}/status`,
  },
  CAMPAIGN_CATEGORIES: {
    BASE: "/api/campaign-categories",
    BY_ID: (id: number | string) => `/api/campaign-categories/${id}`,
  },
} as const;
