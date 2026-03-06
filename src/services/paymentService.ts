import { api } from "@/config/axios";

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
    totalAmount?: number;
    status: string;
}

export interface CheckItemLimitResponse {
    canDonateMore: boolean;
    currentTotal: number;
    quantityLeft: number;
    message: string;
}

export const paymentService = {
    async createPayment(payload: CreatePaymentRequest): Promise<PaymentResponse> {
        console.log("📤 [Payment] Sending request:", payload);
        try {
            const res = await api.post<PaymentResponse>("/api/payments/create", payload);
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
            const res = await api.get<PaymentResponse>(`/api/payments/donation/${id}`);
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
            await api.get(`/api/payments/donation/${id}/verify`);
            console.log("✅ [Payment] Status verified and synced");
        } catch (err: any) {
            console.error("❌ [Payment] Verification Error:", err);
            // We don't necessarily want to throw here, as the page can still try to show details
        }
    },
    async checkExpenditureItemLimit(id: number, quantity?: number): Promise<CheckItemLimitResponse> {
        console.log(`🔍 [Payment] Checking limit for Item ID ${id}, requested: ${quantity || 1}`);
        try {
            const res = await api.get<CheckItemLimitResponse>(`/api/payments/expenditure-item/${id}/check`, {
                params: { quantity }
            });
            return res.data;
        } catch (err: any) {
            console.error("❌ [Payment] Check Limit Error:", err);
            throw err;
        }
    }
};
