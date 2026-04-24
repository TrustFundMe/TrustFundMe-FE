/**
 * types.v2.ts — đề xuất shape mới cho Milestone (Bước 3 redesign).
 *
 * KHÔNG thay thế `types.ts` ngay — file này là "đích đến" để
 * migrate dần. Bước 4 vẫn đọc tiền từ `budgetLines` (đã có sẵn).
 *
 * Migration plan: xem `Docs/STEP3_MIGRATION.md`.
 */

export interface MilestoneV2 {
  id: string;
  /** Tên giai đoạn — VD "Đợt 1 — Cứu trợ khẩn cấp". */
  title: string;
  /** Mục tiêu cụ thể (renamed từ `description`). */
  goal: string;
  /** Bằng chứng / tiêu chí hoàn thành (renamed từ `releaseCondition`). */
  evidence: string;
  /** ISO date `YYYY-MM-DD`, optional. */
  estimatedStart?: string;
  /** ISO date `YYYY-MM-DD`, optional. */
  estimatedEnd?: string;
  // ❌ KHÔNG còn `plannedAmount`. Tiền chỉ tồn tại ở `budgetLines`.
}

/** Adapter: chuyển từ Milestone (v1) → MilestoneV2. */
export function toV2(legacy: {
  id: string;
  title: string;
  description: string;
  releaseCondition: string;
  plannedAmount?: number;
}): MilestoneV2 {
  return {
    id: legacy.id,
    title: legacy.title,
    goal: legacy.description ?? '',
    evidence: legacy.releaseCondition ?? '',
  };
}

/** Adapter: chuyển ngược lại để vẫn write được vào shape cũ trong khi migrate. */
export function toLegacy(
  v2: MilestoneV2,
  prevPlannedAmount = 0,
): {
  id: string;
  title: string;
  description: string;
  releaseCondition: string;
  plannedAmount: number;
} {
  return {
    id: v2.id,
    title: v2.title,
    description: v2.goal,
    releaseCondition: v2.evidence,
    plannedAmount: prevPlannedAmount,
  };
}
