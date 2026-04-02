export type InternalTransactionType = 'RECOVERY' | 'SUPPORT';
export type InternalTransactionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export interface InternalTransaction {
    id: number;
    fromCampaignId?: number;
    toCampaignId?: number;
    amount: number;
    type: InternalTransactionType;
    reason?: string;
    createdByStaffId?: number;
    evidenceImageId?: number;
    status: InternalTransactionStatus;
    createdAt: string;
    updatedAt?: string;
}


export interface GeneralFundStats {
    balance: number;
    outcome: number;
    income: number;
}
