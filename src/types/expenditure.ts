export interface ExpenditureItem {
    id: number;
    expenditureId: number;
    category: string;
    quantity: number;
    actualQuantity?: number;
    price: number;
    expectedPrice: number;
    note?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Expenditure {
    id: number;
    campaignId: number;
    evidenceDueAt?: string;
    evidenceStatus?: string;
    totalAmount: number;
    totalExpectedAmount: number;
    variance: number;
    isWithdrawalRequested: boolean;
    plan?: string;
    status: string;
    items?: ExpenditureItem[];
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateExpenditureItemRequest {
    category: string;
    quantity: number;
    price: number;
    expectedPrice: number;
    note?: string;
}

export interface CreateExpenditureRequest {
    campaignId: number;
    evidenceDueAt?: string;
    evidenceStatus?: string;
    plan?: string;
    items: CreateExpenditureItemRequest[];
}
