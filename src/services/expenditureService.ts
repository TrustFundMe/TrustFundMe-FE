import { Expenditure, CreateExpenditureRequest, ExpenditureItem, CreateExpenditureItemRequest } from '@/types/expenditure';
import { api as axiosInstance } from '@/config/axios';

export const expenditureService = {
    getByCampaignId: async (campaignId: string | number): Promise<Expenditure[]> => {
        const response = await axiosInstance.get(`/api/expenditures/campaign/${campaignId}`);
        return response.data;
    },

    getById: async (id: string | number): Promise<Expenditure> => {
        const response = await axiosInstance.get(`/api/expenditures/${id}`);
        return response.data;
    },

    create: async (data: CreateExpenditureRequest): Promise<Expenditure> => {
        const response = await axiosInstance.post('/api/expenditures', data);
        return response.data;
    },

    getItems: async (id: string | number): Promise<ExpenditureItem[]> => {
        const response = await axiosInstance.get(`/api/expenditures/${id}/items`);
        return response.data;
    },

    updateStatus: async (id: string | number, status: string, staffId?: number, reasonReject?: string): Promise<Expenditure> => {
        const response = await axiosInstance.put(`/api/expenditures/${id}/status`, {
            status,
            staffId,
            reasonReject
        });
        return response.data;
    },

    updateActuals: async (id: string | number, items: { id: number; actualQuantity: number; price: number; }[]): Promise<Expenditure> => {
        const response = await axiosInstance.put(`/api/expenditures/${id}/actuals`, { items });
        return response.data;
    },
    requestWithdrawal: async (id: string | number, evidenceDueAt?: string): Promise<Expenditure> => {
        const response = await axiosInstance.post(`/api/expenditures/${id}/request-withdrawal`, null, {
            params: evidenceDueAt ? { evidenceDueAt } : {}
        });
        return response.data;
    },

    addItems: async (id: string | number, items: CreateExpenditureItemRequest[]): Promise<Expenditure> => {
        const response = await axiosInstance.post(`/api/expenditures/${id}/items`, items);
        return response.data;
    },

    deleteItem: async (itemId: string | number): Promise<void> => {
        await axiosInstance.delete(`/api/expenditures/items/${itemId}`);
    }
};
