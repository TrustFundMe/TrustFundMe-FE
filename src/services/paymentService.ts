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
}

export interface CampaignProgress {
    campaignId: number;
    raisedAmount: number;
    goalAmount: number;
    progressPercentage: number;
}

export interface RecentDonor {
    donationId: number;
    donorId: number | null;
    donorName: string;
    donorAvatar: string | null;
    amount: number;
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
    }
};

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
    approvedAt: string;
    chartData: ChartPoint[];
}
