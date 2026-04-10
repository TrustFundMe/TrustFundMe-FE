import { api } from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

export interface TrustScoreConfig {
  id: number;
  ruleKey: string;
  ruleName: string;
  points: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTrustScoreConfigPayload {
  ruleName?: string;
  description?: string;
  points: number;
  isActive?: boolean;
}

export const trustScoreService = {
  async getConfigs(): Promise<TrustScoreConfig[]> {
    const res = await api.get<TrustScoreConfig[]>(API_ENDPOINTS.TRUST_SCORE.CONFIG);
    return res.data;
  },

  async updateConfig(
    ruleKey: string,
    payload: UpdateTrustScoreConfigPayload
  ): Promise<TrustScoreConfig> {
    const res = await api.put<TrustScoreConfig>(
      API_ENDPOINTS.TRUST_SCORE.CONFIG_BY_KEY(ruleKey),
      payload
    );
    return res.data;
  },
};
