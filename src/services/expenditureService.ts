import { Expenditure, CreateExpenditureRequest, ExpenditureItem, CreateExpenditureItemRequest } from '@/types/expenditure';
import { api as axiosInstance } from '@/config/axios';
import axios from 'axios';

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
    getItemsByCampaignId: async (campaignId: string | number): Promise<ExpenditureItem[]> => {
        const response = await axiosInstance.get(`/api/expenditures/campaign/${campaignId}/items`);
        return response.data;
    },

    updateStatus: async (id: string | number, status: string, staffId?: number, reasonReject?: string, proofUrl?: string): Promise<Expenditure> => {
        const response = await axiosInstance.put(`/api/expenditures/${id}/status`, {
            status,
            staffId,
            reasonReject,
            proofUrl
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
    },
    updateEvidenceStatus: async (id: string | number, status: string): Promise<Expenditure> => {
        const response = await axiosInstance.patch(`/api/expenditures/${id}/evidence-status`, null, {
            params: { status }
        });
        return response.data;
    },

    createRefund: async (expenditureId: string | number, amount: number, proofUrl: string, userId?: number): Promise<any> => {
        const response = await axiosInstance.post(`/api/expenditures/${expenditureId}/refund`, {
            amount,
            proofUrl
        }, {
            headers: userId ? { 'X-User-Id': userId } : {}
        });
        return response.data;
    },

    /** Xuất Excel hạng mục chi tiêu theo campaignId */
    exportItemsToExcel: async (campaignId: string | number): Promise<Blob> => {
        const feOrigin = typeof window !== 'undefined' ? window.location.origin : '';
        const response = await axios.get(`${feOrigin}/api/expenditures/campaign/${campaignId}/export`, {
            responseType: 'blob',
        });
        return response.data;
    },

    /** Nhập hạng mục chi tiêu từ Excel – trả về danh sách items */
    importItemsFromExcel: async (file: File): Promise<{
        success: boolean;
        message?: string;
        data?: CreateExpenditureItemRequest[];
        error?: string;
    }> => {
        const formData = new FormData();
        formData.append('file', file);

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        try {
            const response = await axios.post(`http://localhost:8080/api/expenditures/import`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            return {
                success: true,
                message: response.data?.message,
                data: response.data?.data,
            };
        } catch (error: any) {
            const status = error?.response?.status;
            const data = error?.response?.data;
            let msg = 'Lỗi khi nhập dữ liệu từ Excel';
            if (status === 400) msg = data?.error || 'File không hợp lệ, vui lòng dùng đúng file mẫu';
            else if (status === 500) msg = 'Lỗi máy chủ khi xử lý file';
            else msg = data?.error || error?.message || msg;
            return { success: false, error: msg };
        }
    },

    /** Tải file mẫu Excel */
    downloadTemplate: async (): Promise<Blob> => {
        const feOrigin = typeof window !== 'undefined' ? window.location.origin : '';
        const response = await axios.get(`${feOrigin}/api/expenditures/import/template`, {
            responseType: 'blob',
        });
        return response.data;
    },
};
