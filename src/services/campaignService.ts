import { api } from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type { CampaignDto, CreateCampaignRequest, UpdateCampaignRequest, FundraisingGoal } from "@/types/campaign";
import { PaginatedResponse } from "@/types/pagination";

export const campaignService = {
  async getAll(page: number = 0, size: number = 10): Promise<PaginatedResponse<CampaignDto>> {
    const res = await api.get<PaginatedResponse<CampaignDto>>(API_ENDPOINTS.CAMPAIGNS.BASE, {
      params: { page, size }
    });
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

  async getUserCampaignsPaginated(userId: number, page: number = 0, size: number = 6): Promise<{
    content: CampaignDto[];
    totalPages: number;
    totalElements: number;
    number: number;
  }> {
    const res = await api.get(API_ENDPOINTS.CAMPAIGNS.BY_FUND_OWNER_PAGINATED(userId), {
      params: { page, size }
    });
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

  async getGoalsByCampaignId(campaignId: number): Promise<FundraisingGoal[]> {
    const res = await api.get<FundraisingGoal[]>(API_ENDPOINTS.FUNDRAISING_GOALS.BY_CAMPAIGN(campaignId));
    return res.data;
  },

  async getActiveGoalByCampaignId(campaignId: number): Promise<FundraisingGoal | null> {
    const goals = await this.getGoalsByCampaignId(campaignId);
    return goals.find(g => g.isActive) || null;
  },

  async getByStatus(status: string): Promise<CampaignDto[]> {
    const res = await api.get<CampaignDto[]>(API_ENDPOINTS.CAMPAIGNS.BY_STATUS(status));
    return res.data;
  },

  async getByCategory(categoryId: number | string): Promise<CampaignDto[]> {
    const res = await api.get<CampaignDto[]>(API_ENDPOINTS.CAMPAIGNS.BY_CATEGORY(categoryId));
    return res.data;
  },

  async getExpendituresByCampaignId(campaignId: number): Promise<any[]> {
    const res = await api.get<any[]>(API_ENDPOINTS.EXPENDITURES.BY_CAMPAIGN(campaignId));
    return res.data;
  },

  async reviewCampaign(id: number, status: 'APPROVED' | 'REJECTED' | 'DISABLED', rejectionReason?: string): Promise<CampaignDto> {
    const res = await api.put<CampaignDto>(API_ENDPOINTS.CAMPAIGNS.REVIEW(id), {
      status,
      rejectionReason
    });
    return res.data;
  },

  async disableCampaign(id: number, reason: string): Promise<CampaignDto> {
    return this.reviewCampaign(id, 'DISABLED', reason);
  },

  async updateDisbursementProof(id: number, proofUrl: string): Promise<any> {
    const res = await api.put(`${API_ENDPOINTS.EXPENDITURES.BASE}/${id}/disbursement-proof`, {
      proofUrl
    });
    return res.data;
  },

  // Follow/Unfollow campaigns
  async followCampaign(id: number): Promise<any> {
    const res = await api.post(API_ENDPOINTS.CAMPAIGN_FOLLOWS.FOLLOW(id));
    return res.data;
  },

  async unfollowCampaign(id: number): Promise<any> {
    const res = await api.delete(API_ENDPOINTS.CAMPAIGN_FOLLOWS.UNFOLLOW(id));
    return res.data;
  },

  // Get followers
  async getFollowers(campaignId: number): Promise<any[]> {
    const res = await api.get<any[]>(API_ENDPOINTS.CAMPAIGN_FOLLOWS.FOLLOWERS(campaignId));
    return res.data;
  },

  // Check if following
  async isFollowing(campaignId: number): Promise<boolean> {
    const res = await api.get<{ following: boolean }>(API_ENDPOINTS.CAMPAIGN_FOLLOWS.IS_FOLLOWING(campaignId));
    return res.data.following;
  },

  // Get follower count
  async getFollowerCount(campaignId: number): Promise<number> {
    const res = await api.get<{ count: number }>(API_ENDPOINTS.CAMPAIGN_FOLLOWS.COUNT(campaignId));
    return res.data.count;
  },

  async getTasksByStaff(staffId: number): Promise<any[]> {
    try {
      const res = await api.get<any[]>(API_ENDPOINTS.TASKS.BY_STAFF(staffId));
      return res.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        console.warn(`Access forbidden for staff tasks (StaffId: ${staffId}).`);
        return [];
      }

      // Fallback for environments where staff-task endpoint is unstable (500).
      console.log('Attempting fallback to total tasks list for staff:', staffId);
      try {
        const allRes = await api.get<any[]>(API_ENDPOINTS.TASKS.BASE);
        const allTasks = allRes.data ?? [];
        return allTasks.filter((task) => {
          const candidateIds = [
            task.staffId,
            task.assignedStaffId,
            task.assigneeId,
            task.assignee?.id,
            task.staff?.id,
            task.assignedTo?.id,
          ];
          return candidateIds.some((id) => Number(id) === Number(staffId));
        });
      } catch (fallbackError) {
        console.error('Fallback failed:', fallbackError);
        return [];
      }
    }
  },

  async getAllTasks(): Promise<any[]> {
    const res = await api.get<any[]>(API_ENDPOINTS.TASKS.BASE);
    return res.data;
  },

  async reassignTask(taskId: number, newStaffId: number): Promise<any> {
    const res = await api.put(API_ENDPOINTS.TASKS.REASSIGN(taskId), null, {
      params: { newStaffId }
    });
    return res.data;
  },

  async getTaskByCampaign(campaignId: number | string): Promise<any | null> {
    try {
      const res = await api.get(API_ENDPOINTS.TASKS.BY_CAMPAIGN(campaignId));
      return res.data;
    } catch {
      return null;
    }
  },

  async updateBalance(id: number, amount: number): Promise<void> {
    await api.put(API_ENDPOINTS.CAMPAIGNS.UPDATE_BALANCE(id), null, {
      params: { amount }
    });
  },

  async pauseCampaign(id: number): Promise<CampaignDto> {
    const res = await api.put<CampaignDto>(API_ENDPOINTS.CAMPAIGNS.PAUSE(id));
    return res.data;
  },

  async closeCampaign(id: number): Promise<CampaignDto> {
    const res = await api.put<CampaignDto>(API_ENDPOINTS.CAMPAIGNS.CLOSE(id));
    return res.data;
  },
};
