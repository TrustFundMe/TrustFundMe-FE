import { describe, it, vi, beforeEach, expect } from 'vitest';
import { paymentService } from '@/services/paymentService';
import { api } from '@/config/axios';

vi.mock('@/config/axios');

describe('paymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── createPayment ────────────────────────────────────────
  it('posts donation payload to /api/payments/create', async () => {
    const payload = {
      donorId: 1,
      campaignId: 5,
      donationAmount: 100000,
      tipAmount: 5000,
      description: 'Test donation',
      isAnonymous: false,
      items: [],
    };
    const mockResponse = {
      paymentUrl: 'https://payos.example.com/checkout/123',
      qrCode: 'data:image/png;base64,...',
      paymentLinkId: 'PL123',
      donationId: 99,
    };
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockResponse });

    const result = await paymentService.createPayment(payload as any);

    expect(api.post).toHaveBeenCalledWith('/api/payments/create', payload);
    expect(result).toEqual(mockResponse);
  });

  it('createPayment throws on API error', async () => {
    (api.post as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Payment failed'));

    await expect(
      paymentService.createPayment({ campaignId: 1, donationAmount: 100, tipAmount: 0, description: '', isAnonymous: false, donorId: null, items: [] })
    ).rejects.toThrow('Payment failed');
  });

  // ─── getDonation ──────────────────────────────────────────
  it('fetches donation details by donation ID', async () => {
    const mockDonation = { donationId: 10, status: 'PAID', totalAmount: 105000 };
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockDonation });

    const result = await paymentService.getDonation(10);

    expect(api.get).toHaveBeenCalledWith('/api/payments/donation/10');
    expect(result).toEqual(mockDonation);
  });

  // ─── verifyPayment ─────────────────────────────────────────
  it('verifies donation status without throwing on failure', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: {} });

    // Should not throw
    await expect(paymentService.verifyPayment(10)).resolves.toBeUndefined();
    expect(api.get).toHaveBeenCalledWith('/api/payments/donation/10/verify');
  });

  // ─── checkExpenditureItemLimit ────────────────────────────
  it('passes quantity param when provided', async () => {
    const mockLimit = { canDonateMore: true, currentTotal: 50, quantityLeft: 50, message: 'OK', checkSuccessful: true };
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockLimit });

    const result = await paymentService.checkExpenditureItemLimit(3, 5);

    expect(api.get).toHaveBeenCalledWith('/api/payments/expenditure-item/3/check', {
      params: { quantity: 5 },
    });
    expect(result).toEqual(mockLimit);
  });

  it('uses default quantity 1 when not provided', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { canDonateMore: true, currentTotal: 0, quantityLeft: 100, message: 'OK', checkSuccessful: true } });

    await paymentService.checkExpenditureItemLimit(3);

    expect(api.get).toHaveBeenCalledWith('/api/payments/expenditure-item/3/check', {
      params: { quantity: undefined },
    });
  });

  // ─── getCampaignProgress ──────────────────────────────────
  it('fetches campaign progress data', async () => {
    const mockProgress = {
      campaignId: 7,
      raisedAmount: 500000,
      goalAmount: 1000000,
      progressPercentage: 50,
      donorCount: 25,
    };
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockProgress });

    const result = await paymentService.getCampaignProgress(7);

    expect(api.get).toHaveBeenCalledWith('/api/payments/campaign/7/progress');
    expect(result).toEqual(mockProgress);
  });

  // ─── getRecentDonors ──────────────────────────────────────
  it('passes limit param to recent donations endpoint', async () => {
    const mockDonors = [
      { donationId: 1, donorId: 10, donorName: 'John', donorAvatar: null, amount: 50000, createdAt: '2026-01-01', anonymous: false },
    ];
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockDonors });

    const result = await paymentService.getRecentDonors(5, 3);

    expect(api.get).toHaveBeenCalledWith('/api/payments/campaign/5/recent-donations', {
      params: { limit: 3 },
    });
    expect(result).toEqual(mockDonors);
  });

  // ─── getMyPaidDonations ──────────────────────────────────
  it('fetches user paid donations with default limit 50', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [] });

    await paymentService.getMyPaidDonations();

    expect(api.get).toHaveBeenCalledWith('/api/payments/my-donations', {
      params: { limit: 50 },
    });
  });

  // ─── getUserDonationCount ─────────────────────────────────
  it('fetches donation count for a specific user', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: 12 });

    const result = await paymentService.getUserDonationCount(42);

    expect(api.get).toHaveBeenCalledWith('/api/payments/user/42/donation-count');
    expect(result).toBe(12);
  });

  it('returns 0 on error in getUserDonationCount', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

    const result = await paymentService.getUserDonationCount(42);

    expect(result).toBe(0);
  });

  // ─── getDonorsByItem ──────────────────────────────────────
  it('fetches donors for an expenditure item', async () => {
    const mockDonors = [{ donationId: 1, donorName: 'Jane', amount: 200000, createdAt: '2026-01-01', anonymous: false }];
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockDonors });

    const result = await paymentService.getDonorsByItem(8);

    expect(api.get).toHaveBeenCalledWith('/api/payments/expenditure-item/8/donors');
    expect(result).toEqual(mockDonors);
  });
});
