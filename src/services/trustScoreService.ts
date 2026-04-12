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

export interface TrustScoreLog {
  id: number;
  userId: number;
  userFullName: string;
  userAvatarUrl: string;
  ruleKey: string;
  ruleName: string;
  pointsChange: number;
  referenceId: number;
  referenceType: string;
  description: string;
  createdAt: string;
}

export interface UserTrustScore {
  userId: number;
  userFullName: string;
  userAvatarUrl: string;
  totalScore: number;
}

export interface LeaderboardEntry {
  userId: number;
  userFullName: string;
  userAvatarUrl: string;
  totalScore: number;
  rank: number;
}

export interface LogsParams {
  userId?: number;
  ruleKey?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export const trustScoreService = {
  // Config
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

  // Logs
  async getLogs(params: LogsParams = {}): Promise<any> {
    const res = await api.get(API_ENDPOINTS.TRUST_SCORE.LOGS, { params });
    return res.data;
  },

  async getUserScore(userId: number): Promise<UserTrustScore> {
    const res = await api.get<UserTrustScore>(API_ENDPOINTS.TRUST_SCORE.USER(userId));
    return res.data;
  },

  async getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    const res = await api.get<LeaderboardEntry[]>(API_ENDPOINTS.TRUST_SCORE.LEADERBOARD, {
      params: { limit },
    });
    return res.data;
  },
};
