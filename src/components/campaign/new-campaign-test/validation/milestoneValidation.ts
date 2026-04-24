/**
 * Milestone validation — pure functions, không phụ thuộc UI.
 *
 * Chỉ validate phần planning (Bước 3): tên, mục tiêu, bằng chứng, ngày dự kiến.
 * KHÔNG validate tiền — đó là việc của Bước 4.
 */

export interface MilestoneInput {
  id: string;
  title: string;
  /** Mục tiêu cụ thể của giai đoạn (renamed từ `description`). */
  goal: string;
  /** Bằng chứng / tiêu chí hoàn thành (renamed từ `releaseCondition`). */
  evidence: string;
  /** ISO date `YYYY-MM-DD`, optional. */
  estimatedStart?: string;
  /** ISO date `YYYY-MM-DD`, optional. */
  estimatedEnd?: string;
}

export interface MilestoneFieldErrors {
  title?: string;
  goal?: string;
  evidence?: string;
  dateRange?: string;
}

export const MILESTONE_LIMITS = {
  titleMin: 4,
  titleMax: 80,
  goalMin: 20,
  goalMax: 280,
  evidenceMin: 8,
  evidenceMax: 200,
  recommendedMin: 2,
  recommendedMax: 5,
  hardMax: 8,
} as const;

/** Validate 1 giai đoạn. Trả về object errors — empty object nghĩa là OK. */
export function validateMilestone(m: MilestoneInput): MilestoneFieldErrors {
  const errs: MilestoneFieldErrors = {};
  const t = m.title.trim();
  const g = m.goal.trim();
  const e = m.evidence.trim();

  if (!t) errs.title = 'Bắt buộc nhập tên giai đoạn';
  else if (t.length < MILESTONE_LIMITS.titleMin) errs.title = `Tên ngắn quá (≥ ${MILESTONE_LIMITS.titleMin} ký tự)`;
  else if (t.length > MILESTONE_LIMITS.titleMax) errs.title = `Tên quá dài (≤ ${MILESTONE_LIMITS.titleMax} ký tự)`;

  if (!g) errs.goal = 'Bắt buộc mô tả mục tiêu';
  else if (g.length < MILESTONE_LIMITS.goalMin) errs.goal = `Mô tả cụ thể hơn (≥ ${MILESTONE_LIMITS.goalMin} ký tự)`;
  else if (g.length > MILESTONE_LIMITS.goalMax) errs.goal = `Mô tả quá dài (≤ ${MILESTONE_LIMITS.goalMax} ký tự)`;

  if (!e) errs.evidence = 'Bắt buộc ghi rõ bằng chứng cần có';
  else if (e.length < MILESTONE_LIMITS.evidenceMin) errs.evidence = `Bằng chứng quá ngắn (≥ ${MILESTONE_LIMITS.evidenceMin} ký tự)`;
  else if (e.length > MILESTONE_LIMITS.evidenceMax) errs.evidence = `Bằng chứng quá dài (≤ ${MILESTONE_LIMITS.evidenceMax} ký tự)`;

  if (m.estimatedStart && m.estimatedEnd && m.estimatedStart > m.estimatedEnd) {
    errs.dateRange = 'Ngày bắt đầu phải trước ngày kết thúc';
  }

  return errs;
}

/** True nếu giai đoạn không có lỗi nào. */
export function isMilestoneValid(m: MilestoneInput): boolean {
  const e = validateMilestone(m);
  return !e.title && !e.goal && !e.evidence && !e.dateRange;
}

/**
 * Validate cả Bước 3.
 *
 * @returns `{ ok, count, perItem }` — `ok=true` khi mọi giai đoạn valid VÀ
 *          số lượng nằm trong [1, hardMax].
 */
export function validateMilestoneStep(milestones: MilestoneInput[]): {
  ok: boolean;
  count: number;
  perItem: Record<string, MilestoneFieldErrors>;
} {
  const perItem: Record<string, MilestoneFieldErrors> = {};
  for (const m of milestones) perItem[m.id] = validateMilestone(m);
  const allItemsOk = milestones.every((m) => isMilestoneValid(m));
  const countOk = milestones.length >= 1 && milestones.length <= MILESTONE_LIMITS.hardMax;
  return { ok: allItemsOk && countOk, count: milestones.length, perItem };
}

/**
 * Detect chồng chéo thời gian giữa các giai đoạn (warning, không block).
 *
 * @returns Array các cặp `[i, j]` chồng chéo (i < j).
 */
export function findDateOverlaps(milestones: MilestoneInput[]): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (let i = 0; i < milestones.length; i++) {
    const a = milestones[i];
    if (!a.estimatedStart || !a.estimatedEnd) continue;
    for (let j = i + 1; j < milestones.length; j++) {
      const b = milestones[j];
      if (!b.estimatedStart || !b.estimatedEnd) continue;
      if (a.estimatedStart <= b.estimatedEnd && b.estimatedStart <= a.estimatedEnd) {
        out.push([i, j]);
      }
    }
  }
  return out;
}
