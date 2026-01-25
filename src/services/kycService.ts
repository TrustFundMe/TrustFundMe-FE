import { api } from '@/config/axios';
import type { SubmitKycRequest } from '@/types/kyc';

export const kycService = {
  async submit(userId: number | string, payload: SubmitKycRequest) {
    const res = await api.post(`/api/kyc/users/${userId}`, payload);
    return res.data;
  },
  async update(userId: number | string, payload: SubmitKycRequest) {
    const res = await api.put(`/api/kyc/users/${userId}`, payload);
    return res.data;
  },
};
