import { api } from '@/config/axios';
import type { KycResponse, KYCStatus, SubmitKycRequest } from '@/types/kyc';

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const kycService = {
  async submit(userId: number | string, payload: SubmitKycRequest) {
    const res = await api.post<KycResponse>(`/api/kyc/users/${userId}`, payload);
    return res.data;
  },
  async update(userId: number | string, payload: SubmitKycRequest) {
    const res = await api.put<KycResponse>(`/api/kyc/users/${userId}`, payload);
    return res.data;
  },
  async getPending(page = 0, size = 10) {
    const res = await api.get<Page<KycResponse>>('/api/kyc/pending', {
      params: { page, size, sort: 'createdAt,desc' }
    });
    return res.data;
  },
  async getAll(page = 0, size = 10) {
    const res = await api.get<Page<KycResponse>>('/api/kyc', {
      params: { page, size, sort: 'createdAt,desc' }
    });
    return res.data;
  },
  async updateStatus(kycId: number, status: KYCStatus, rejectionReason?: string) {
    const res = await api.patch<KycResponse>(`/api/kyc/${kycId}/status`, {
      status,
      rejectionReason
    });
    return res.data;
  },
  async getByUserId(userId: number | string) {
    try {
      const res = await api.get<KycResponse>(`/api/kyc/user/${userId}`);
      return res.data;
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 404 || status === 500 || status === 403) {
        return null;
      }
      throw error;
    }
  },
  async getMyKyc(): Promise<KycResponse | null> {
    try {
      const res = await api.get<KycResponse>('/api/kyc/me');
      return res.data;
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 404 || status === 500 || status === 403) {
        return null;
      }
      throw error;
    }
  },
  async getStats() {
    const res = await api.get<{ total: number; approved: number; pending: number; rejected: number }>('/api/kyc/stats');
    return res.data;
  }
};
