export interface CampaignDto {
  id: number;
  fundOwnerId: number;
  approvedByStaff?: boolean | null;
  approvedAt?: string | null;
  thankMessage?: string | null;
  balance?: number | null;
  title: string;
  description?: string | null;
  coverImage?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CreateCampaignRequest {
  fundOwnerId: number;
  title: string;
  description?: string;
  coverImage?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  thankMessage?: string;
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
  approvedByStaff?: boolean;
  approvedAt?: string;
}
