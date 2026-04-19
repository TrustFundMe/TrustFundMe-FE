import { describe, it, vi, beforeEach, expect } from 'vitest';
import { campaignService } from '@/services/campaignService';
import { api } from '@/config/axios';

vi.mock('@/config/axios');

describe('campaignService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── getAll ────────────────────────────────────────────────
  it('calls GET /api/campaigns with pagination params', async () => {
    const mockData = {
      content: [{ id: 1, title: 'Campaign A' }],
      totalPages: 1,
      totalElements: 1,
      size: 10,
      number: 0,
      first: true,
      last: true,
      empty: false,
    };
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockData });

    const result = await campaignService.getAll(0, 10);

    expect(api.get).toHaveBeenCalledWith('/api/campaigns', {
      params: { page: 0, size: 10 },
    });
    expect(result).toEqual(mockData);
  });

  it('defaults to page 0, size 10 when called without args', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { content: [], totalPages: 0, totalElements: 0, size: 10, number: 0, first: true, last: true, empty: true },
    });

    await campaignService.getAll();

    expect(api.get).toHaveBeenCalledWith('/api/campaigns', {
      params: { page: 0, size: 10 },
    });
  });

  // ─── getById ──────────────────────────────────────────────
  it('calls GET /api/campaigns/:id', async () => {
    const mockCampaign = { id: 5, title: 'Campaign B' };
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockCampaign });

    const result = await campaignService.getById(5);

    expect(api.get).toHaveBeenCalledWith('/api/campaigns/5');
    expect(result).toEqual(mockCampaign);
  });

  // ─── create ───────────────────────────────────────────────
  it('posts payload to /api/campaigns and returns created campaign', async () => {
    const payload = {
      title: 'New Campaign',
      description: 'Test description',
      goalAmount: 1000000,
    };
    const mockCreated = { id: 10, ...payload, status: 'PENDING' };
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockCreated });

    const result = await campaignService.create(payload as any);

    expect(api.post).toHaveBeenCalledWith('/api/campaigns', payload);
    expect(result).toEqual(mockCreated);
  });

  // ─── update ───────────────────────────────────────────────
  it('puts updated payload to /api/campaigns/:id', async () => {
    const payload = { title: 'Updated Title' };
    const mockUpdated = { id: 5, ...payload };
    (api.put as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockUpdated });

    const result = await campaignService.update(5, payload as any);

    expect(api.put).toHaveBeenCalledWith('/api/campaigns/5', payload);
    expect(result).toEqual(mockUpdated);
  });

  // ─── reviewCampaign ───────────────────────────────────────
  it('calls PUT /api/campaigns/:id/review with status and optional reason', async () => {
    const mockReviewed = { id: 3, status: 'APPROVED' };
    (api.put as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockReviewed });

    const result = await campaignService.reviewCampaign(3, 'APPROVED', 'Looks good');

    expect(api.put).toHaveBeenCalledWith('/api/campaigns/3/review', {
      status: 'APPROVED',
      rejectionReason: 'Looks good',
    });
    expect(result).toEqual(mockReviewed);
  });

  it('reviewCampaign without rejectionReason', async () => {
    const mockReviewed = { id: 3, status: 'REJECTED' };
    (api.put as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockReviewed });

    await campaignService.reviewCampaign(3, 'REJECTED');

    expect(api.put).toHaveBeenCalledWith('/api/campaigns/3/review', {
      status: 'REJECTED',
      rejectionReason: undefined,
    });
  });

  // ─── followCampaign / unfollowCampaign ───────────────────
  it('followCampaign posts to correct endpoint', async () => {
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { success: true } });

    await campaignService.followCampaign(7);

    expect(api.post).toHaveBeenCalledWith('/api/campaign-follows/7');
  });

  it('unfollowCampaign deletes from correct endpoint', async () => {
    (api.delete as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { success: true } });

    await campaignService.unfollowCampaign(7);

    expect(api.delete).toHaveBeenCalledWith('/api/campaign-follows/7');
  });

  // ─── isFollowing ──────────────────────────────────────────
  it('isFollowing returns true when API returns following:true', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { following: true } });

    const result = await campaignService.isFollowing(7);

    expect(api.get).toHaveBeenCalledWith('/api/campaign-follows/7/me');
    expect(result).toBe(true);
  });

  it('isFollowing returns false when API returns following:false', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { following: false } });

    const result = await campaignService.isFollowing(7);

    expect(result).toBe(false);
  });

  // ─── getActiveGoalByCampaignId ────────────────────────────
  it('getActiveGoalByCampaignId returns goal with isActive=true', async () => {
    const goals = [
      { id: 1, isActive: false },
      { id: 2, isActive: true },
    ];
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: goals });

    const result = await campaignService.getActiveGoalByCampaignId(4);

    expect(result).toEqual({ id: 2, isActive: true });
  });

  it('getActiveGoalByCampaignId returns null when no active goal', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [{ id: 1, isActive: false }] });

    const result = await campaignService.getActiveGoalByCampaignId(4);

    expect(result).toBeNull();
  });

  // ─── getFollowerCount ────────────────────────────────────
  it('getFollowerCount returns the count from API', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { count: 42 } });

    const result = await campaignService.getFollowerCount(9);

    expect(api.get).toHaveBeenCalledWith('/api/campaign-follows/9/count');
    expect(result).toBe(42);
  });

  // ─── Error handling ───────────────────────────────────────
  it('rethrows error from API on create failure', async () => {
    const error = new Error('Server error');
    (api.post as ReturnType<typeof vi.fn>).mockRejectedValue(error);

    await expect(campaignService.create({} as any)).rejects.toThrow('Server error');
  });
});
