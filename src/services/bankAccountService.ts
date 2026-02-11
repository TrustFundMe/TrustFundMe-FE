import { api } from '@/config/axios';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { BankAccountDto, CreateBankAccountRequest, UpdateBankAccountRequest } from '@/types/bankAccount';

export const bankAccountService = {
    async getMyBankAccounts(): Promise<BankAccountDto[]> {
        const res = await api.get<BankAccountDto[]>(API_ENDPOINTS.BANK_ACCOUNTS.MY_ACCOUNTS);
        return res.data;
    },

    async getById(id: number): Promise<BankAccountDto> {
        const res = await api.get<BankAccountDto>(API_ENDPOINTS.BANK_ACCOUNTS.BY_ID(id));
        return res.data;
    },

    async getByUserId(userId: number): Promise<BankAccountDto[]> {
        const res = await api.get<BankAccountDto[]>(API_ENDPOINTS.BANK_ACCOUNTS.BY_USER(userId));
        return res.data;
    },

    async create(payload: CreateBankAccountRequest): Promise<BankAccountDto> {
        const res = await api.post<BankAccountDto>(API_ENDPOINTS.BANK_ACCOUNTS.BASE, payload);
        return res.data;
    },

    async update(id: number, payload: UpdateBankAccountRequest): Promise<BankAccountDto> {
        const res = await api.put<BankAccountDto>(API_ENDPOINTS.BANK_ACCOUNTS.BY_ID(id), payload);
        return res.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(API_ENDPOINTS.BANK_ACCOUNTS.BY_ID(id));
    },
};
