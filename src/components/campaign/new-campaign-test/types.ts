export type KycStatus = 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';

export type CredibilityStatus = 'NOT_SUBMITTED' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

export type FundMode = 'TRANSPARENT_TARGET' | 'FLEXIBLE_CASH';

export type BudgetCategory =
  | 'DIRECT_AID'
  | 'LOGISTICS'
  | 'OPERATIONS'
  | 'COMPLIANCE_AUDIT'
  | 'COMMUNICATION';

export interface CredibilityFile {
  id: string;
  name: string;
  sizeKb: number;
}

export interface CampaignImage {
  id: string;
  url: string;
}

export interface CampaignCore {
  title: string;
  objective: string;
  targetAmount: number;
  startDate: string;
  endDate: string;
  category: string;
  region: string;
  beneficiaryType: string;
  thankMessage: string;
  /** URL ảnh bìa đang chọn (đồng bộ với `coverImageId`) — dùng cho preview nhanh */
  coverImageUrl: string;
  /** Nhiều ảnh chiến dịch; một ảnh được gắn làm bìa qua `coverImageId` */
  campaignImages: CampaignImage[];
  coverImageId: string;
}

export interface BudgetLine {
  id: string;
  category: BudgetCategory;
  title: string;
  plannedAmount: number;
  /** 1 = ưu tiên cao nhất, tăng dần */
  priority: number;
  notes: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  plannedAmount: number;
  releaseCondition: string;
}

export interface BankInfo {
  /** Mã ngân hàng nội bộ (UI combobox) */
  bankCode: string;
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  branch: string;
}

export interface Acknowledgements {
  legalRead: boolean;
  slaAccepted: boolean;
  overfundPolicyAccepted: boolean;
  termsAccepted: boolean;
  transparencyAccepted: boolean;
  legalLiabilityAccepted: boolean;
}

export interface NewCampaignTestState {
  kycStatus: KycStatus;
  kycFullName: string;
  kycRejectReason: string;
  credibilityStatus: CredibilityStatus;
  credibilityReason: string;
  credibilityPitch: string;
  credibilityFiles: CredibilityFile[];
  fundMode: FundMode;
  campaignCore: CampaignCore;
  budgetLines: BudgetLine[];
  milestones: Milestone[];
  bankInfo: BankInfo;
  bankProofFiles: CredibilityFile[];
  acknowledgements: Acknowledgements;
}
