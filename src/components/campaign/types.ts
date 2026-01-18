export type User = {
  id: string;
  name: string;
  avatar: string;
};

export type CampaignPostComment = {
  id: string;
  user: User;
  content: string;
  createdAt: string;
};

export type CampaignPostAttachment = {
  type: "image" | "file";
  url: string;
  name?: string;
};

export type CampaignPost = {
  id: string;
  author: User;
  content?: string;
  createdAt: string;
  attachments?: CampaignPostAttachment[];
  liked: boolean;
  likeCount: number;
  flagged: boolean;
  comments: CampaignPostComment[];
};

export type CampaignPlan = {
  id: string;
  title: string;
  amount: number;
  description: string;
  date: string;
};

export type Campaign = {
  id: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
  galleryImages?: string[];
  goalAmount: number;
  raisedAmount: number;
  creator: User;
  followers: User[];
  liked: boolean;
  followed: boolean;
  flagged: boolean;
  likeCount: number;
  followerCount: number;
  commentCount: number;
};
