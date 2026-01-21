import { api } from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type { CampaignDto, CreateCampaignRequest, UpdateCampaignRequest } from "@/types/campaign";

export const campaignService = {
  async getAll(): Promise<CampaignDto[]> {
    const res = await api.get<CampaignDto[]>(API_ENDPOINTS.CAMPAIGNS.BASE);
    return res.data;
  },

  async getById(id: number): Promise<CampaignDto> {
    const res = await api.get<CampaignDto>(API_ENDPOINTS.CAMPAIGNS.BY_ID(id));
    return res.data;
  },

  async getByFundOwner(fundOwnerId: number): Promise<CampaignDto[]> {
    const res = await api.get<CampaignDto[]>(API_ENDPOINTS.CAMPAIGNS.BY_FUND_OWNER(fundOwnerId));
    return res.data;
  },

  async create(payload: CreateCampaignRequest): Promise<CampaignDto> {
    const res = await api.post<CampaignDto>(API_ENDPOINTS.CAMPAIGNS.BASE, payload);
    return res.data;
  },

  async update(id: number, payload: UpdateCampaignRequest): Promise<CampaignDto> {
    const res = await api.put<CampaignDto>(API_ENDPOINTS.CAMPAIGNS.BY_ID(id), payload);
    return res.data;
  },
};
