import { api } from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type { FundraisingGoalDto, CreateFundraisingGoalRequest } from "@/types/campaign";

export const fundraisingGoalService = {
    async getAll(): Promise<FundraisingGoalDto[]> {
        const res = await api.get<FundraisingGoalDto[]>(API_ENDPOINTS.GOALS.BASE);
        return res.data;
    },

    async getById(id: number): Promise<FundraisingGoalDto> {
        const res = await api.get<FundraisingGoalDto>(API_ENDPOINTS.GOALS.BY_ID(id));
        return res.data;
    },

    async getByCampaignId(campaignId: number): Promise<FundraisingGoalDto[]> {
        const res = await api.get<FundraisingGoalDto[]>(API_ENDPOINTS.GOALS.BY_CAMPAIGN(campaignId));
        return res.data;
    },

    async create(payload: CreateFundraisingGoalRequest): Promise<FundraisingGoalDto> {
        const res = await api.post<FundraisingGoalDto>(API_ENDPOINTS.GOALS.BASE, payload);
        return res.data;
    },

    async update(id: number, payload: any): Promise<FundraisingGoalDto> {
        const res = await api.put<FundraisingGoalDto>(API_ENDPOINTS.GOALS.BY_ID(id), payload);
        return res.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(API_ENDPOINTS.GOALS.BY_ID(id));
    },
};
