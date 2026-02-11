import { api } from '@/config/axios';
import type { BankAccountResponse, BankAccountStatus } from '@/types/bank';

export const bankService = {
    async getAll() {
        const res = await api.get<BankAccountResponse[]>('/api/bank-accounts/all');
        return res.data;
    },

    async updateStatus(id: number, status: BankAccountStatus, remarks?: string) {
        const res = await api.patch<BankAccountResponse>(`/api/bank-accounts/${id}/status`, {
            status,
            remarks
        });
        return res.data;
    },

    async submit(userId: number | string, payload: any) {
        const res = await api.post<BankAccountResponse>(`/api/bank-accounts/users/${userId}`, payload);
        return res.data;
    },

    async getPending(page = 0, size = 10) {
        const res = await api.get<any>('/api/bank-accounts/pending', {
            params: { page, size, sort: 'createdAt,desc' }
        });
        return res.data;
    }
};
