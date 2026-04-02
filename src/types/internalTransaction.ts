export type InternalTransactionType = 'RECOVERY' | 'SUPPORT' | 'INITIAL';

export interface InternalTransaction {
    id: number;
    fromCampaignId?: number;
    toCampaignId?: number;
    amount: number;
    type: InternalTransactionType;
    reason?: string;
    createdAt: string;
}

export interface GeneralFundStats {
    balance: number;
    outcome: number;
    income: number;
}
