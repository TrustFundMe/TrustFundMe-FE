import { Expenditure, CreateExpenditureRequest, ExpenditureItem, ExpenditureCatology, CreateExpenditureItemRequest, ExpenditureTransaction } from '@/types/expenditure';
import { api as axiosInstance } from '@/config/axios';
import axios from 'axios';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';

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

    getCategories: async (id: string | number): Promise<ExpenditureCatology[]> => {
        const response = await axiosInstance.get(`/api/expenditures/${id}/categories`);
        return response.data;
    },
    getItemsByCampaignId: async (campaignId: string | number): Promise<ExpenditureItem[]> => {
        const response = await axiosInstance.get(`/api/expenditures/campaign/${campaignId}/items`);
        return response.data;
    },

    getApprovedItemsByCampaign: async (campaignId: string | number): Promise<ExpenditureItem[]> => {
        const response = await axiosInstance.get(`/api/expenditures/campaign/${campaignId}/items/approved`);
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

    updateActuals: async (id: string | number, items: { id: number; actualQuantity: number; price: number; actualPurchaseLink?: string; }[]): Promise<Expenditure> => {
        const response = await axiosInstance.put(`/api/expenditures/${id}/actuals`, { items });
        return response.data;
    },
    requestWithdrawal: async (id: string | number, evidenceDueAt?: string, withdrawAmount?: number): Promise<Expenditure> => {
        const response = await axiosInstance.post(`/api/expenditures/${id}/request-withdrawal`, null, {
            params: {
                ...(evidenceDueAt ? { evidenceDueAt } : {}),
                ...(withdrawAmount != null ? { withdrawAmount } : {})
            }
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
        const response = await axiosInstance.patch(`/api/expenditures/${id}/evidence-status?status=${status}`);
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

    /** Nhập toàn bộ mốc và hạng mục chi tiêu từ Excel */
    importBulkFromExcel: async (file: File): Promise<{
        success: boolean;
        message?: string;
        data?: any[];
        error?: string;
    }> => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axiosInstance.post(`/api/expenditures/import-bulk`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
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

    importItemsFromExcel: async (file: File): Promise<{
        success: boolean;
        message?: string;
        data?: CreateExpenditureItemRequest[];
        error?: string;
    }> => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axiosInstance.post(`/api/expenditures/import`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
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

    /** Kiểm toán chi tiêu bằng hệ thống AI Perplexity (Backend) */
    analyzeWithAI: async (campaign: any, expenditure: any, items: any[]): Promise<any> => {
        const response = await axiosInstance.post(`/api/expenditures/${expenditure.id}/audit`);
        const data = response.data;

        const mappedDetectedItems = (data.items || []).map((item: any, index: number) => ({
            name: item.itemName,
            plannedCategory: item.itemName,
            quantity: item.quantity || 1,
            unitPrice: item.marketPrice,
            total: (item.marketPrice || 0) * (item.quantity || 1),
            matchStatus: item.isSuspicious ? 'MISMATCHED' : 'MATCHED',
            marketPriceRange: item.evidenceUrls && item.evidenceUrls.length > 0
                ? 'Nguồn đối chứng minh bạch: ' : '',
            evidenceUrls: item.evidenceUrls || [],
            isLinkMatched: item.isLinkMatched,
            linkType: item.linkType,
            statusMessage: item.statusMessage,
            expectedPurchaseLink: items[index]?.expectedPurchaseLink
        }));

        return {
            expenditureId: expenditure.id,
            riskScore: data.requiresAttention ? 85 : 15,
            riskLevel: data.requiresAttention ? 'HIGH' : 'LOW',
            summary: data.summary,
            recommendation: data.requiresAttention
                ? 'Phân tích AI phát hiện nghi vấn kê khống hoặc chênh lệch giá lớn so với thị trường.'
                : 'Mức giá hợp lý, phù hợp với số liệu giá cả thực tế trên thị trường.',
            redFlags: data.requiresAttention
                ? ['Hệ thống AI (Perplexity) phát hiện báo giá bất thường.']
                : [],
            spendingAnalysis: [],
            confidence: 'HIGH',
            vendorInfo: {
                name: 'Thẩm định tự động hoá bằng AI (Perplexity)'
            },
            detectedItems: mappedDetectedItems
        };
    },

    /** Lấy tất cả ExpenditureTransaction (PAYOUT + REFUND) */
    getAllTransactions: async (): Promise<ExpenditureTransaction[]> => {
        const response = await axiosInstance.get('/api/expenditures/transactions');
        return response.data;
    },

    getTotalDisbursed: async (fundOwnerId: string | number): Promise<number> => {
        const response = await axiosInstance.get(API_ENDPOINTS.EXPENDITURES.PAYOUT_SUM(fundOwnerId));
        return response.data;
    },

    getByStatus: async (status: string): Promise<Expenditure[]> => {
        try {
            const response = await axiosInstance.get(`/api/expenditures/status/${status}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch expenditures by status:', error);
            // Fallback to query param if path variable fails (legacy/diff environments)
            try {
                const response = await axiosInstance.get(`/api/expenditures/status`, { params: { status } });
                return response.data;
            } catch (innerError) {
                return [];
            }
        }
    },
    getPendingEvidenceByUser: async (userId: string | number): Promise<any[]> => {
        const response = await axiosInstance.get(`/api/expenditures/user/${userId}/pending-evidence`);
        return response.data;
    },
};
