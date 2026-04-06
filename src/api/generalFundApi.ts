import { api as axiosInstance } from '@/config/axios';
import { GeneralFundStats, InternalTransaction } from '@/types/internalTransaction';
import { InternalTransactionStatus } from '@/types/internalTransaction';

export const generalFundApi = {
    // GET /api/internal-transactions
    getAll: async (): Promise<InternalTransaction[]> => {
        const response = await axiosInstance.get<InternalTransaction[]>('/api/internal-transactions');
        return response.data;
    },

    // GET /api/internal-transactions/{id}
    getById: async (id: number): Promise<InternalTransaction> => {
        const response = await axiosInstance.get<InternalTransaction>(`/api/internal-transactions/${id}`);
        return response.data;
    },

    // GET /api/internal-transactions/stats
    getStats: async (): Promise<GeneralFundStats> => {
        const response = await axiosInstance.get<GeneralFundStats>('/api/internal-transactions/stats');
        return response.data;
    },

    // GET /api/internal-transactions/history
    getHistory: async (): Promise<InternalTransaction[]> => {
        const response = await axiosInstance.get<InternalTransaction[]>('/api/internal-transactions/history');
        return response.data;
    },

    // POST /api/internal-transactions
    createTransaction: async (data: {
        fromCampaignId?: number;
        toCampaignId?: number;
        amount: number;
        type: string;
        reason?: string;
        createdByStaffId?: number;
        evidenceImageId?: number;
        status?: string;
    }): Promise<InternalTransaction> => {
        const response = await axiosInstance.post<InternalTransaction>('/api/internal-transactions', data);
        return response.data;
    },

    // PUT /api/internal-transactions/{id}/status
    updateStatus: async (id: number, status: InternalTransactionStatus): Promise<InternalTransaction> => {
        const response = await axiosInstance.put<InternalTransaction>(
            `/api/internal-transactions/${id}/status`,
            null,
            { params: { status } }
        );
        return response.data;
    },

    // DELETE /api/internal-transactions/{id}
    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/api/internal-transactions/${id}`);
    },

    // PUT /api/internal-transactions/{id}/evidence
    updateEvidence: async (id: number, evidenceImageId: number): Promise<InternalTransaction> => {
        const response = await axiosInstance.put<InternalTransaction>(
            `/api/internal-transactions/${id}/evidence`,
            null,
            { params: { evidenceImageId } }
        );
        return response.data;
    },

    // PUT /api/campaigns/{id}/update-balance (Dedicated Balance Update)
    updateCampaignBalance: async (id: number, amount: number): Promise<void> => {
        await axiosInstance.put(`/api/campaigns/${id}/update-balance`, null, {
            params: { amount }
        });
    },
};
