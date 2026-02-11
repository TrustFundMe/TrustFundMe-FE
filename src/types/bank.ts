export type BankAccountStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface BankAccountResponse {
    id: number;
    userId: number;
    bankCode: string;
    accountNumber: string;
    accountHolderName: string;
    isVerified: boolean;
    status: BankAccountStatus;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateBankAccountStatusRequest {
    status: BankAccountStatus;
    remarks?: string;
}
