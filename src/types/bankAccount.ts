export interface BankAccountDto {
    id: number;
    userId: number;
    bankCode: string;
    accountNumber: string;
    accountHolderName: string;
    isVerified: boolean;
    status: string;
    createdAt: string;
    updatedAt: string;
    webhookKey?: string;
    campaignId?: number;
}

export interface CreateBankAccountRequest {
    bankCode: string;
    accountNumber: string;
    accountHolderName: string;
    webhookKey?: string;
    campaignId?: number;
}

export interface UpdateBankAccountRequest {
    bankCode: string;
    accountNumber: string;
    accountHolderName: string;
    webhookKey?: string;
    campaignId?: number;
}
