export interface FundraisingGoal {
  id: number;
  campaignId: number;
  targetAmount: number;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CampaignDto {
  id: number;
  fundOwnerId: number;
  approvedByStaff?: number | null;
  approvedAt?: string | null;
  thankMessage?: string | null;
  balance: number;
  title: string;
  description?: string | null;
  coverImage?: string | null;
  category?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  activeGoal?: FundraisingGoal | null; // We can enrich this in frontend or fetch separately
}

export interface CreateCampaignRequest {
  fundOwnerId: number;
  title: string;
  description?: string;
  coverImage?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  type?: string;
  status?: string;
  thankMessage?: string;
  attachments?: { id?: number; type: string; url: string; name?: string }[];
}

export interface FundraisingGoalDto {
  id: number;
  campaignId: number;
  targetAmount: number;
  description?: string;
  isActive: boolean;
}

export interface CreateFundraisingGoalRequest {
  campaignId: number;
  targetAmount: number;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCampaignRequest {
  title?: string;
  description?: string;
  coverImage?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  thankMessage?: string;
  balance?: number;
  approvedByStaff?: number | null;
  approvedAt?: string | null;
}
