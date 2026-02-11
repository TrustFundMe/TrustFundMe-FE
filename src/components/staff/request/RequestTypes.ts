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
  expenditureItems: ExpenditureItem[];
  justification: string;
  proofImageUrl?: string;
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

export type TabType = 'CAMPAIGN' | 'EXPENDITURE' | 'USER_VERIFICATION';


