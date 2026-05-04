export interface ExpenditureTransaction {
    id: number;
    expenditureId: number;
    campaignId?: number;
    fromUserId?: number;
    toUserId?: number;
    amount: number;
    fromBankCode?: string;
    fromAccountNumber?: string;
    fromAccountHolderName?: string;
    toBankCode?: string;
    toAccountNumber?: string;
    toAccountHolderName?: string;
    type: string;
    status: string;
    proofUrl?: string;
    createdAt?: string;
}

export interface ExpenditureItem {
    id: number;
    expenditureId: number;
    name: string;
    expectedQuantity?: number;
    actualQuantity?: number;
    expectedPrice: number;
    actualPrice?: number;
    expectedNote?: string;
    catologyId?: number;
    catologyName?: string;
    expectedUnit?: string;
    unit?: string;
    expectedBrand?: string;
    actualBrand?: string;
    expectedPurchaseLocation?: string;
    createdAt?: string;
    updatedAt?: string;
    /** Hình ảnh minh chứng cho item này (loaded separately) */
    media?: { id: number; url: string; description?: string; mediaType: string }[];
}

export interface ExpenditureEvidence {
    id: number;
    expenditureId: number;
    campaignId: number;
    cassoTransactionId?: string;
    amount: number;
    description?: string;
    proofUrl: string;
    status: string;
    dueAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Expenditure {
    id: number;
    campaignId: number;
    evidenceDueAt?: string;
    evidenceStatus?: string;
    evidenceSubmittedAt?: string;
    totalAmount: number;
    totalExpectedAmount: number;
    totalReceivedAmount?: number;
    variance: number;
    isWithdrawalRequested: boolean;
    plan?: string;
    status: string;
    staffReviewId?: number;
    rejectReason?: string;
    disbursementProofUrl?: string;
    disbursedAt?: string;
    bankCode?: string;
    accountNumber?: string;
    accountHolderName?: string;
    items?: ExpenditureItem[];
    transactions?: ExpenditureTransaction[];
    evidences?: ExpenditureEvidence[];
    createdAt?: string;
    updatedAt?: string;
    proofUrl?: string;
}

export interface CreateExpenditureItemRequest {
    name: string;
    expectedQuantity: number;
    expectedPrice: number;
    actualPrice?: number;
    actualQuantity?: number;
    expectedNote?: string;
    expectedBrand?: string;
    actualBrand?: string;
    expectedUnit?: string;
    expectedPurchaseLocation?: string;
}

export interface CreateExpenditureCatologyRequest {
    name: string;
    description?: string;
    withdrawalCondition?: string;
    items: CreateExpenditureItemRequest[];
}

export interface ExpenditureCatology {
    id: number;
    expenditureId: number;
    name: string;
    description?: string;
    expectedAmount: number;
    actualAmount: number;
    withdrawalCondition?: string;
    items: ExpenditureItem[];
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateExpenditureRequest {
    campaignId: number;
    evidenceDueAt?: string;
    evidenceStatus?: string;
    plan?: string;
    startDate?: string;
    endDate?: string;
    items?: CreateExpenditureItemRequest[];
    categories?: CreateExpenditureCatologyRequest[];
}
