export interface FundraisingGoal {
  id: number;
  campaignId: number;
  targetAmount: number;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CampaignCategory {
  id: number;
  name: string;
  description?: string;
  icon?: number;
  iconUrl?: string | null;
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
  category?: string | null;
  coverImage?: number | null;
  coverImageUrl?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
  categoryIconUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status: string;
  rejectionReason?: string | null;
  type?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  activeGoal?: FundraisingGoal | null; // We can enrich this in frontend or fetch separately
  kycVerified?: boolean;
  bankVerified?: boolean;
}

export interface CreateCampaignRequest {
  fundOwnerId: number;
  title: string;
  description?: string;
  coverImage?: number;
  startDate?: string;
  endDate?: string;
  categoryId: number;
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
  coverImage?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  thankMessage?: string;
  categoryId?: number;
  balance?: number;
  approvedByStaff?: number | null;
  approvedAt?: string | null;
}

export interface TransactionItem {
  id: string;
  type: 'DONATION' | 'INTERNAL_TRANSFER' | 'EXPENDITURE' | 'REFUND';
  description: string;
  amount: number;
  date: string;
  balanceAfter: number;
  relatedCampaignId?: number;
  expenditureId?: number;
}
