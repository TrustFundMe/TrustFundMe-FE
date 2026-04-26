export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISBURSED' | 'WITHDRAWAL_REQUESTED' | 'DISABLED';

export type StaffRequestBase = {
  id: string;
  createdAt: string;
  status: RequestStatus;
};

export type CampaignRequestType =
  | 'WITHDRAWAL'
  | 'SUSPEND_CAMPAIGN'
  | 'RESUME_CAMPAIGN'
  | 'CREATE_VOTING'
  | 'APPROVE_CAMPAIGN';

export type CampaignRequest = StaffRequestBase & {
  type: CampaignRequestType;
  campaignId: number;
  campaignTitle: string;
  requesterName: string;
  amount?: number;
  note?: string;
  description?: string;
  category?: string;
  rejectionReason?: string;
  kycVerified?: boolean;
  bankVerified?: boolean;
  fundOwnerId: number;
  newFlowData?: NewFlowCampaignData;
};

export type ExpenditureItem = {
  description: string;
  quantity: number;
  price: number;
};

export type ExpenditureRequest = StaffRequestBase & {
  type: 'EXPENDITURE';
  campaignId: number;
  campaignTitle: string;
  requesterName: string;
  totalAmount: number;
  totalExpectedAmount?: number;
  expenditureItems: ExpenditureItem[];
  justification: string;
  proofImageUrl?: string;
  disbursementProofUrl?: string;
  disbursedAt?: string;
  bankCode?: string;
  accountNumber?: string;
  accountHolderName?: string;
  transactions?: any[];
};

export type KycRequest = StaffRequestBase & {
  type: 'KYC_VERIFICATION';
  userId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  idType: string;
  idNumber: string;
  issueDate: string;
  expiryDate: string;
  issuePlace: string;
  idImageFront: string;
  idImageBack: string;
  selfieImage: string;
};

export type BankRequest = StaffRequestBase & {
  type: 'BANK_VERIFICATION';
  userId: number;
  bankCode: string;
  accountNumber: string;
  accountHolderName: string;
  isVerified: boolean;
};

export type UnverifiedOwnerRequest = StaffRequestBase & {
  type: 'UNVERIFIED_OWNER';
  userId: number;
  fullName: string; // derived from campaign requesterName or fetched
  email?: string;
  kycVerified: boolean;
  bankVerified: boolean;
};

export type EvidenceRequest = StaffRequestBase & {
  type: 'EVIDENCE';
  expenditureId: number;
  campaignId: number;
  campaignTitle: string;
  requesterName: string;
  plan: string;
  totalAmount: number;
  evidenceStatus: string;
  evidencePhotos: string[];
  phoneNumber?: string; // Để staff gọi điện xác nhận
};

export type SupportRequest = StaffRequestBase & {
  type: 'SUPPORT';
  fromCampaignId?: number;
  toCampaignId?: number;
  amount: number;
  reason?: string;
  createdByStaffId?: number;
  evidenceImageId?: number;
};

export type TabType = 'CAMPAIGN' | 'EXPENDITURE' | 'EVIDENCE' | 'USER_VERIFICATION';

export type NewFlowEligibility = {
  kycStatus: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  kycFullName: string;
  bankInfo: {
    bankCode: string;
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
  };
  credibilityFiles: { id: string; name: string; sizeKb: number }[];
  credibilityPitch: string;
};

export type NewFlowMilestone = {
  id: string;
  title: string;
  description: string;
  plannedAmount: number;
  releaseCondition: string;
};

export type NewFlowAcknowledgements = {
  legalRead: boolean;
  slaAccepted: boolean;
  overfundPolicyAccepted: boolean;
  termsAccepted: boolean;
  transparencyAccepted: boolean;
  legalLiabilityAccepted: boolean;
};

export type NewFlowCampaignData = {
  eligibility: NewFlowEligibility;
  campaignImages: { id: string; url: string }[];
  coverImageId: string;
  objective: string;
  targetAmount: number;
  startDate: string;
  endDate: string;
  region: string;
  beneficiaryType: string;
  thankMessage: string;
  milestones: NewFlowMilestone[];
  acknowledgements: NewFlowAcknowledgements;
  otpSigned: boolean;
};
