import type { CampaignRequest, FlagRequest } from './RequestTypes';

export const mockCampaignRequests: CampaignRequest[] = [
  {
    id: 'CR_0001',
    createdAt: '2026-01-24 10:12',
    status: 'PENDING',
    type: 'WITHDRAWAL',
    campaignId: 101,
    campaignTitle: 'Warm Meals for Students',
    requesterName: 'Fund Owner #12',
    amount: 1200,
    note: 'Need payout for recent expenses',
  },
  {
    id: 'CR_0002',
    createdAt: '2026-01-23 16:40',
    status: 'PENDING',
    type: 'SUSPEND_CAMPAIGN',
    campaignId: 88,
    campaignTitle: 'Flood Relief Fund',
    requesterName: 'System',
    note: 'Suspicious activity detected by risk engine',
  },
  {
    id: 'CR_0003',
    createdAt: '2026-01-22 09:05',
    status: 'APPROVED',
    type: 'CREATE_VOTING',
    campaignId: 145,
    campaignTitle: 'Community Clinic Support',
    requesterName: 'Fund Owner #41',
    note: 'Create voting for new plan',
  },
  {
    id: 'CR_0004',
    createdAt: '2026-01-21 20:18',
    status: 'REJECTED',
    type: 'RESUME_CAMPAIGN',
    campaignId: 88,
    campaignTitle: 'Flood Relief Fund',
    requesterName: 'Fund Owner #7',
    note: 'Resume after review',
  },
];

export const mockFlagRequests: FlagRequest[] = [
  {
    id: 'FR_0101',
    createdAt: '2026-01-24 13:02',
    status: 'PENDING',
    targetType: 'POST',
    targetId: 'P_551',
    reporterName: 'User #328',
    reason: 'Spam / misleading content',
    previewText: 'Donate now!!! guaranteed 10x return...',
  },
  {
    id: 'FR_0102',
    createdAt: '2026-01-23 08:44',
    status: 'PENDING',
    targetType: 'CAMPAIGN',
    targetId: 'C_88',
    reporterName: 'User #19',
    reason: 'Possible fraud / unverifiable claims',
    previewText: 'Raising funds for emergency supplies...',
  },
  {
    id: 'FR_0103',
    createdAt: '2026-01-22 19:33',
    status: 'APPROVED',
    targetType: 'COMMENT',
    targetId: 'CM_771',
    reporterName: 'User #77',
    reason: 'Harassment / abusive language',
    previewText: 'You are a liar and scammer...',
  },
];

