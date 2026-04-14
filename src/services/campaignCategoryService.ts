import { api } from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type { CampaignCategory } from "@/types/campaign";

export const campaignCategoryService = {
    async getAll(): Promise<CampaignCategory[]> {
        const res = await api.get<CampaignCategory[]>(API_ENDPOINTS.CAMPAIGN_CATEGORIES.BASE);
        return res.data;
    },

    async getById(id: number | string): Promise<CampaignCategory> {
        const res = await api.get<CampaignCategory>(API_ENDPOINTS.CAMPAIGN_CATEGORIES.BY_ID(id));
        return res.data;
    },

    async create(data: Partial<CampaignCategory>): Promise<CampaignCategory> {
        const res = await api.post<CampaignCategory>(API_ENDPOINTS.CAMPAIGN_CATEGORIES.BASE, data);
        return res.data;
    },

    async update(id: number | string, data: Partial<CampaignCategory>): Promise<CampaignCategory> {
        const res = await api.put<CampaignCategory>(API_ENDPOINTS.CAMPAIGN_CATEGORIES.BY_ID(id), data);
        return res.data;
    },

    async delete(id: number | string): Promise<void> {
        await api.delete(API_ENDPOINTS.CAMPAIGN_CATEGORIES.BY_ID(id));
    }
};
