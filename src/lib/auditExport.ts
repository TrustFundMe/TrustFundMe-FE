import * as XLSX from 'xlsx';
import { auditService, AuditLog } from '@/services/auditService';
import { CampaignDto } from '@/types/campaign';

const safeParse = (s: string | undefined | null): Record<string, unknown> => {
  if (!s) return {};
  try {
    return JSON.parse(s) as Record<string, unknown>;
  } catch {
    return {};
  }
};

const fmtDateTime = (v: unknown): string => {
  if (!v) return '';
  try {
    const d = new Date(String(v));
    if (isNaN(d.getTime())) return String(v);
    return d.toLocaleString('vi-VN');
  } catch {
    return String(v);
  }
};

const fmtCurrency = (v: unknown): string => {
  const n = typeof v === 'number' ? v : Number(v);
  if (!isFinite(n)) return '';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
};

const collectAllByEntity = async (entityType: string, campaignId: number): Promise<AuditLog[]> => {
  const all: AuditLog[] = [];
  let page = 0;
  const size = 200;
  // Cap to avoid runaway loops
  while (page < 50) {
    const res = await auditService.getByEntityPaged(entityType, campaignId, page, size);
    const content = res?.content || [];
    all.push(...content);
    if (content.length < size || page + 1 >= (res?.totalPages || 1)) break;
    page++;
  }
  return all;
};

export interface AuditExportInput {
  campaign: CampaignDto;
  ownerName?: string;
}

export const exportCampaignAudit = async ({ campaign, ownerName }: AuditExportInput): Promise<void> => {
  if (!campaign?.id) throw new Error('Thiếu thông tin chiến dịch');

  // Pull all relevant audit logs (entityId == campaignId for these types)
  const [withdrawalLogs, transactionLogs, evidenceLogs] = await Promise.all([
    collectAllByEntity('EXPENDITURE_WITHDRAWAL', campaign.id),
    collectAllByEntity('DONATION_TRANSACTION', campaign.id),
    collectAllByEntity('EVIDENCE_SUBMISSION', campaign.id),
  ]);

  const sortByDateAsc = (a: AuditLog, b: AuditLog) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

  withdrawalLogs.sort(sortByDateAsc);
  transactionLogs.sort(sortByDateAsc);
  evidenceLogs.sort(sortByDateAsc);

  // ── Sheet 1: Campaign info + Expenditure withdrawals ────────────────────
  const campaignHeader: Array<Array<string | number>> = [
    ['BÁO CÁO KIỂM TOÁN CHIẾN DỊCH'],
    [],
    ['Mã chiến dịch', campaign.id],
    ['Tên chiến dịch', campaign.title || ''],
    ['Loại chiến dịch', campaign.type || ''],
    ['Danh mục', campaign.categoryName || campaign.category || ''],
    ['Trạng thái', campaign.status || ''],
    ['Chủ chiến dịch', ownerName || `User #${campaign.fundOwnerId}`],
    ['Mã chủ chiến dịch', campaign.fundOwnerId],
    ['Số dư hiện tại', fmtCurrency(campaign.balance)],
    ['Mục tiêu gây quỹ', fmtCurrency(campaign.activeGoal?.targetAmount)],
    ['Mô tả', (campaign.description || '').replace(/\s+/g, ' ').trim()],
    ['Ngày tạo', fmtDateTime(campaign.createdAt)],
    ['Ngày bắt đầu', fmtDateTime(campaign.startDate)],
    ['Ngày kết thúc', fmtDateTime(campaign.endDate)],
    ['Ngày xuất báo cáo', new Date().toLocaleString('vi-VN')],
    [],
    ['── CÁC ĐỢT CHI TIÊU (EXPENDITURE_WITHDRAWAL) ──'],
    [],
    [
      'STT',
      'Mã đợt chi',
      'Mã chiến dịch',
      'Hành động',
      'Số tiền rút',
      'Trạng thái',
      'Hạn nộp minh chứng',
      'Người thực hiện',
      'Mã hash (auditHash)',
      'Hash trước đó',
      'Thời điểm ghi nhận',
    ],
  ];

  const expenditureRows = withdrawalLogs.map((log, idx) => {
    const snap = safeParse(log.dataSnapshot);
    return [
      idx + 1,
      (snap['expenditureId'] as string | number | undefined) ?? '',
      (snap['campaignId'] as string | number | undefined) ?? log.entityId,
      log.action,
      fmtCurrency(snap['withdrawAmount']),
      (snap['status'] as string | undefined) ?? '',
      fmtDateTime(snap['evidenceDueAt']),
      log.actorName || '',
      log.auditHash,
      log.previousHash || '',
      fmtDateTime(log.createdAt),
    ];
  });

  const sheet1Data = [...campaignHeader, ...expenditureRows];
  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
  ws1['!cols'] = [
    { wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 22 }, { wch: 18 },
    { wch: 16 }, { wch: 22 }, { wch: 22 }, { wch: 70 }, { wch: 70 }, { wch: 22 },
  ];

  // ── Sheet 2: Donations + bank transactions (in/out) ─────────────────────
  const transactionRows = transactionLogs.map((log, idx) => {
    const snap = safeParse(log.dataSnapshot);
    const amountNum = Number(snap['amount']);
    const direction = isFinite(amountNum) ? (amountNum >= 0 ? 'TIỀN VÀO' : 'TIỀN RA') : '';
    return [
      idx + 1,
      (snap['tid'] as string | undefined) ?? '',
      log.action,
      direction,
      fmtCurrency(snap['amount']),
      (snap['counterAccountName'] as string | undefined) ?? log.actorName ?? '',
      (snap['counterAccountNumber'] as string | undefined) ?? '',
      (snap['accountNumber'] as string | undefined) ?? '',
      ((snap['description'] as string | undefined) || '').toString(),
      fmtDateTime(snap['transactionDate'] || log.createdAt),
      log.auditHash,
      log.previousHash || '',
      fmtDateTime(log.createdAt),
    ];
  });

  const sheet2Data: Array<Array<string | number>> = [
    [`GIAO DỊCH KIỂM TOÁN — Chiến dịch #${campaign.id} (${campaign.title || ''})`],
    [],
    [
      'STT',
      'Mã giao dịch (TID)',
      'Hành động',
      'Loại',
      'Số tiền',
      'Tên đối tác',
      'STK đối tác',
      'STK chiến dịch',
      'Nội dung chuyển khoản',
      'Ngày giao dịch',
      'Mã hash (auditHash)',
      'Hash trước đó',
      'Thời điểm ghi nhận',
    ],
    ...transactionRows,
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
  ws2['!cols'] = [
    { wch: 5 }, { wch: 18 }, { wch: 22 }, { wch: 12 }, { wch: 18 },
    { wch: 26 }, { wch: 18 }, { wch: 18 }, { wch: 40 }, { wch: 22 },
    { wch: 70 }, { wch: 70 }, { wch: 22 },
  ];

  // ── Sheet 3: Evidence submissions ───────────────────────────────────────
  const evidenceRows = evidenceLogs.map((log, idx) => {
    const snap = safeParse(log.dataSnapshot);
    return [
      idx + 1,
      (snap['evidenceId'] as string | number | undefined) ?? '',
      (snap['campaignId'] as string | number | undefined) ?? log.entityId,
      log.action,
      fmtCurrency(snap['amount']),
      ((snap['description'] as string | undefined) || '').toString(),
      (snap['proofUrl'] as string | undefined) ?? '',
      (snap['status'] as string | undefined) ?? '',
      log.actorName || '',
      log.auditHash,
      log.previousHash || '',
      fmtDateTime(log.createdAt),
    ];
  });

  const sheet3Data: Array<Array<string | number>> = [
    [`MINH CHỨNG ĐÃ NỘP — Chiến dịch #${campaign.id} (${campaign.title || ''})`],
    [],
    [
      'STT',
      'Mã minh chứng',
      'Mã chiến dịch',
      'Hành động',
      'Số tiền',
      'Mô tả',
      'Đường dẫn minh chứng',
      'Trạng thái',
      'Người nộp',
      'Mã hash (auditHash)',
      'Hash trước đó',
      'Thời điểm ghi nhận',
    ],
    ...evidenceRows,
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(sheet3Data);
  ws3['!cols'] = [
    { wch: 5 }, { wch: 14 }, { wch: 14 }, { wch: 22 }, { wch: 18 },
    { wch: 40 }, { wch: 50 }, { wch: 16 }, { wch: 22 },
    { wch: 70 }, { wch: 70 }, { wch: 22 },
  ];

  // ── Build workbook ──────────────────────────────────────────────────────
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, 'Chiến dịch & Đợt chi');
  XLSX.utils.book_append_sheet(wb, ws2, 'Giao dịch');
  XLSX.utils.book_append_sheet(wb, ws3, 'Minh chứng');

  const safeTitle = (campaign.title || `campaign-${campaign.id}`)
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 60);
  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `KiemToan_${safeTitle}_${today}.xlsx`);
};
