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
}

export interface CreateBankAccountRequest {
    bankCode: string;
    accountNumber: string;
    accountHolderName: string;
}

export interface UpdateBankAccountRequest {
    bankCode: string;
    accountNumber: string;
    accountHolderName: string;
}
