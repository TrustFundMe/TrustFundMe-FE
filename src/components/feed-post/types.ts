export type FeedPostComponentProps = {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  title?: string | null;
  content: string;
  type: string;
  visibility: string;
  status: string;
  createdAt: string;
  updatedAt?: string | null;
  attachments?: Array<{
    type: "image" | "file";
    url: string;
    name?: string;
  }>;
  liked: boolean;
  likeCount: number;
  flagged: boolean;
  comments: Array<{
    id: string;
    user: {
      id: string;
      name: string;
      avatar: string;
    };
    content: string;
    createdAt: string;
  }>;
  budgetId?: number | null;
};
