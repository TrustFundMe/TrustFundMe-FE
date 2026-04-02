import { api as axiosInstance } from '@/config/axios';
import { GeneralFundStats, InternalTransaction } from '@/types/internalTransaction';

export const generalFundApi = {
    getStats: async (): Promise<GeneralFundStats> => {
        const response = await axiosInstance.get<GeneralFundStats>('/api/internal-transactions/stats');
        return response.data;
    },

    getHistory: async (): Promise<InternalTransaction[]> => {
        const response = await axiosInstance.get<InternalTransaction[]>('/api/internal-transactions/history');
        return response.data;
    },

    createTransaction: async (data: {
        fromCampaignId?: number;
        toCampaignId?: number;
        amount: number;
        type: string;
        reason?: string;
    }): Promise<InternalTransaction> => {
        const response = await axiosInstance.post<InternalTransaction>('/api/internal-transactions', data);
        return response.data;
    }
};
