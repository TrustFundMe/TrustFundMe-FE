import { api } from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

export interface DonationItemRequest {
    expenditureItemId: number;
    quantity: number;
    amount: number;
}

export interface CreatePaymentRequest {
    donorId: number | null;
    campaignId: number;
    donationAmount: number;
    tipAmount: number;
    description: string;
    isAnonymous: boolean;
    items: DonationItemRequest[];
}

export interface PaymentResponse {
    paymentUrl: string;
    qrCode?: string;
    paymentLinkId: string;
    donationId?: number;
    campaignId?: number;
    donationAmount?: number;
    totalAmount?: number;
    status: string;
}

export interface CheckItemLimitResponse {
    canDonateMore: boolean;
    currentTotal: number;
    quantityLeft: number;
    message: string;
    checkSuccessful: boolean;
}

export interface CampaignProgress {
    campaignId: number;
    raisedAmount: number;
    goalAmount: number;
    progressPercentage: number;
    donorCount: number;
}

export interface RecentDonor {
    donationId: number;
    donorId: number | null;
    donorName: string;
    donorAvatar: string | null;
    amount: number;
    quantity?: number;
    createdAt: string;
    anonymous: boolean;
}

export const paymentService = {
    async createPayment(payload: CreatePaymentRequest): Promise<PaymentResponse> {
        console.log("📤 [Payment] Sending request:", payload);
        try {
            const res = await api.post<PaymentResponse>(API_ENDPOINTS.PAYMENTS.CREATE, payload);
            console.log("✅ [Payment] Success:", res.data);
            return res.data;
        } catch (err: any) {
            const detail = err?.response?.data;
            console.error("❌ [Payment] Error:", {
                status: err?.response?.status,
                error: detail?.error,
                message: detail?.message,
                cause: detail?.cause,
                raw: detail,
            });
            throw err;
        }
    },
    async getDonation(id: number): Promise<PaymentResponse> {
        console.log("🔍 [Payment] Fetching donation details for ID:", id);
        try {
            const res = await api.get<PaymentResponse>(API_ENDPOINTS.PAYMENTS.BY_DONATION_ID(id));
            console.log("✅ [Payment] Details fetched:", res.data);
            return res.data;
        } catch (err: any) {
            console.error("❌ [Payment] Fetch Error:", err);
            throw err;
        }
    },
    async verifyPayment(id: number): Promise<void> {
        console.log("🔄 [Payment] Verifying status for Donation ID:", id);
        try {
            await api.get(API_ENDPOINTS.PAYMENTS.VERIFY(id));
            console.log("✅ [Payment] Status verified and synced");
        } catch (err: any) {
            console.error("❌ [Payment] Verification Error:", err);
            // We don't necessarily want to throw here, as the page can still try to show details
        }
    },
    async checkExpenditureItemLimit(id: number, quantity?: number): Promise<CheckItemLimitResponse> {
        console.log(`🔍 [Payment] Checking limit for Item ID ${id}, requested: ${quantity || 1}`);
        try {
            const res = await api.get<CheckItemLimitResponse>(API_ENDPOINTS.PAYMENTS.CHECK_ITEM_LIMIT(id), {
                params: { quantity }
            });
            return res.data;
        } catch (err: any) {
            console.error("❌ [Payment] Check Limit Error:", err);
            throw err;
        }
    },
    async syncQuantity(donationId: number): Promise<void> {
        console.log(`🔄 [Payment] Syncing quantity for donation: ${donationId}`);
        try {
            await api.post(API_ENDPOINTS.PAYMENTS.SYNC_QUANTITY(donationId));
            console.log(`✅ [Payment] Quantity synced for donation ${donationId}`);
        } catch (err: any) {
            console.error(`❌ [Payment] Sync Quantity Error for donation ${donationId}:`, err);
        }
    },
    async syncBalance(donationId: number): Promise<void> {
        console.log(`🔄 [Payment] Syncing balance for donation: ${donationId}`);
        try {
            await api.post(API_ENDPOINTS.PAYMENTS.SYNC_BALANCE(donationId));
            console.log(`✅ [Payment] Balance synced for donation ${donationId}`);
        } catch (err: any) {
            console.error(`❌ [Payment] Sync Balance Error for donation ${donationId}:`, err);
        }
    },
    async getCampaignProgress(campaignId: number): Promise<CampaignProgress> {
        console.log("📊 [Payment] Fetching progress for campaign:", campaignId);
        try {
            const res = await api.get<CampaignProgress>(API_ENDPOINTS.PAYMENTS.CAMPAIGN_PROGRESS(campaignId));
            console.log("📊 [Payment] Progress Data received:", res.data);
            return res.data;
        } catch (err: any) {
            console.error("❌ [Payment] Progress Error:", err);
            throw err;
        }
    },
    async getRecentDonors(campaignId: number, limit = 3): Promise<RecentDonor[]> {
        console.log(`👥 [Payment] Fetching recent ${limit} donors for campaign:`, campaignId);
        try {
            const res = await api.get<RecentDonor[]>(API_ENDPOINTS.PAYMENTS.CAMPAIGN_RECENT_DONATIONS(campaignId), {
                params: { limit }
            });
            console.log("👥 [Payment] Recent Donors received:", res.data);
            return res.data;
        } catch (err: any) {
            console.error("❌ [Payment] Recent Donors Error:", err);
            throw err;
        }
    },
    async getCampaignAnalytics(campaignId: number, period: string = 'Tháng'): Promise<CampaignAnalyticsResponse> {
        console.log(`📈 [Payment] Fetching analytics for campaign: ${campaignId}, period: ${period}`);
        try {
            const res = await api.get<CampaignAnalyticsResponse>(API_ENDPOINTS.PAYMENTS.CAMPAIGN_ANALYTICS(campaignId), {
                params: { period }
            });
            return res.data;
        } catch (err: any) {
            console.error("❌ [Payment] Analytics Error:", err);
            throw err;
        }
    },
    async getDonationSummary(expenditureItemIds: number[]): Promise<DonationItemSummary[]> {
        console.log(`📋 [Payment] Fetching donation summary for items:`, expenditureItemIds);
        try {
            const res = await api.get<DonationItemSummary[]>(API_ENDPOINTS.PAYMENTS.DONATION_SUMMARY, {
                params: { expenditureItemIds: expenditureItemIds.join(',') }
            });
            return res.data;
        } catch (err: any) {
            console.error("❌ [Payment] Donation Summary Error:", err);
            return [];
        }
    },
    async getDonorsByItem(itemId: number): Promise<RecentDonor[]> {
        console.log(`📋 [Payment] Fetching donors for item:`, itemId);
        try {
            const res = await api.get<RecentDonor[]>(API_ENDPOINTS.PAYMENTS.DONORS_BY_ITEM(itemId));
            return res.data;
        } catch (err: any) {
            console.error(`❌ [Payment] Donors By Item Error for ${itemId}:`, err);
            return [];
        }
    },
    async getMyPaidDonations(limit: number = 50): Promise<MyDonationImpactResponse[]> {
        console.log(`🔍 [Payment] Fetching my paid donations with limit:`, limit);
        try {
            const res = await api.get<MyDonationImpactResponse[]>(API_ENDPOINTS.PAYMENTS.MY_DONATIONS, {
                params: { limit }
            });
            return res.data;
        } catch (err: any) {
            console.error("❌ [Payment] My Paid Donations Error:", err);
            throw err;
        }
    },
    async getCassoTransactionsByCampaign(campaignId: number | string): Promise<CassoTransaction[]> {
        const res = await api.get<CassoTransaction[]>(API_ENDPOINTS.PAYMENTS.CASSO_TRANSACTIONS_BY_CAMPAIGN(campaignId));
        return res.data;
    },
    async getUserDonationCount(userId: number | string): Promise<number> {
        console.log(`🔍 [Payment] Fetching donation count for User ID: ${userId}`);
        try {
            const res = await api.get<number>(API_ENDPOINTS.PAYMENTS.USER_DONATION_COUNT(userId));
            return res.data;
        } catch (err: any) {
            console.error("❌ [Payment] User Donation Count Error:", err);
            return 0;
        }
    }
};

export interface CassoTransaction {
    id: number;
    tid: string;
    accountNumber: string;
    bankName: string;
    bankAbbreviation: string;
    campaignId: number;
    amount: number;
    description: string;
    transactionDate: string;
    counterAccountName: string;
    counterAccountNumber: string;
    counterAccountBankName: string;
    counterAccountBankId: string;
    donorName?: string;
    createdAt: string;
}

export interface DonationItemSummary {
    expenditureItemId: number;
    donatedQuantity: number;
}

export interface MyDonationImpactResponse {
    donationId: number;
    donorId: number | null;
    campaignId: number | null;
    campaignTitle: string | null;
    donationAmount: number;
    tipAmount: number;
    totalAmount: number;
    status: string;
    anonymous: boolean;
    createdAt: string;
}

export interface ChartPoint {
    date: string;
    balanceGreen: number | null;
    balanceRed: number | null;
}

export interface CampaignAnalyticsResponse {
    campaignId: number;
    totalReceived: number;
    totalSpent: number;
    currentBalance: number;
    targetAmount: number;
    receivedFromGeneralFund: number;
    approvedAt: string;
    chartData: ChartPoint[];
}
