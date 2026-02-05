export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type StaffRequestBase = {
  id: string;
  createdAt: string;
  status: RequestStatus;
};

export type CampaignRequestType =
  | 'WITHDRAWAL'
  | 'SUSPEND_CAMPAIGN'
  | 'RESUME_CAMPAIGN'
  | 'CREATE_VOTING';

export type CampaignRequest = StaffRequestBase & {
  type: CampaignRequestType;
  campaignId: number;
  campaignTitle: string;
  requesterName: string;
  amount?: number;
  note?: string;
};

export type FlagTargetType = 'POST' | 'CAMPAIGN' | 'COMMENT';

export type FlagRequest = StaffRequestBase & {
  targetType: FlagTargetType;
  targetId: string;
  reason: string;
  reporterName: string;
  previewText?: string;
};

