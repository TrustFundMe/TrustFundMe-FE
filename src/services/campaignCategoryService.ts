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
    }
};
