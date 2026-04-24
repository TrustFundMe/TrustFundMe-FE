# Step 3 — Migration Guide

> Áp dụng spec ở [`STEP3_REDESIGN.md`](./STEP3_REDESIGN.md) vào file `src/components/campaign/new-campaign-test/steps/Step3Milestones.tsx` mà **không phá** Bước 4 đang chạy.

## File đã build sẵn (không cần code lại)

| File | Vai trò |
|---|---|
| `parts/Field.tsx` | Pattern label + counter + helper + error chuẩn cho mọi input |
| `parts/MilestoneMetaBar.tsx` | 3 chip thay thanh progress tổng cũ |
| `parts/AddMilestoneButton.tsx` | Nút "+ Thêm giai đoạn" với 3 trạng thái |
| `parts/NextStepBridge.tsx` | Note ℹ giải thích "tiền sẽ điền ở Bước 4" |
| `parts/EmptyMilestonesHint.tsx` | Banner gợi ý cho first-run |
| `validation/milestoneValidation.ts` | Pure function validate giai đoạn |
| `types.v2.ts` | Type `MilestoneV2` + adapter `toV2` / `toLegacy` |

---

## 5 chỗ cần sửa trong `Step3Milestones.tsx`

### ✏️ #1 — Header (dòng ~72–75)

**Cũ**
```tsx
<h2 className="...">Bước 3 — Mốc giải ngân</h2>
<p className="...">
  Thiết lập các chặng giải ngân. Chặng cuối tự động nhận phần còn lại.
  Tổng phải bằng mục tiêu quyên góp.
</p>
```

**Mới**
```tsx
<h2 className="text-xl md:text-2xl font-semibold tracking-tight text-gray-900">
  Bước 3 — Các giai đoạn
</h2>
<p className="mt-1 text-sm text-gray-600 leading-relaxed">
  Chia chiến dịch thành các giai đoạn rõ ràng. Mỗi giai đoạn có mục tiêu
  và bằng chứng hoàn thành cụ thể. Phần ngân sách sẽ phân bổ ở Bước 4.
</p>

<MilestoneMetaBar
  count={state.milestones.length}
  valid={validateMilestoneStep(toV2List(state.milestones)).ok}
/>
```

### ✏️ #2 — Xoá block "Tổng giải ngân" (dòng ~77–107)

Xoá toàn bộ:
- `<motion.span>` hiển thị `formatVnd(milestoneTotal) / formatVnd(target) đ`
- Thanh progress tổng `<div ... style={{ transform: scaleX }} />`
- Biến local `barColor`, `scaleX`, `diff`, `milestonesOk`

### ✏️ #3 — Card mỗi milestone (dòng ~123–219)

Bỏ:
- Thanh progress mỏng phía trên card (dòng 132–140).
- Pill `{pct.toFixed(1)}%` (dòng 154–157).
- Cột input số tiền + ký hiệu `đ` (dòng 189–201).
- Footer "Lũy kế: ... đ" (dòng 205–210).
- Cảnh báo "Chặng này chiếm 50% mục tiêu" (dòng 212–216).
- Biến local `effectiveAmount`, `pct`, `cumulative`, `cumulativePct`, `milestoneBarScale`, `autoLastAmount`, `sumBeforeLast`.

Thay phần body card bằng:
```tsx
<Field label="Tên giai đoạn" required>
  {(p) => (
    <input
      {...p}
      className={FIELD_INPUT_CLS + ' font-semibold'}
      value={m.title}
      maxLength={MILESTONE_LIMITS.titleMax}
      onChange={(e) => updateMilestone(m.id, { title: e.target.value })}
    />
  )}
</Field>

<Field
  label="Mục tiêu cụ thể"
  required
  hint="Mô tả ngắn kết quả bạn cam kết đạt được."
  valueLength={m.goal.length}
  maxLength={MILESTONE_LIMITS.goalMax}
>
  {(p) => (
    <textarea
      {...p}
      rows={3}
      className={FIELD_TEXTAREA_CLS}
      value={m.goal}
      maxLength={MILESTONE_LIMITS.goalMax}
      onChange={(e) => updateMilestone(m.id, { goal: e.target.value })}
    />
  )}
</Field>

<Field
  label="Bằng chứng hoàn thành"
  required
  hint="Tài liệu / dữ liệu cần có để giai đoạn này được duyệt qua."
  valueLength={m.evidence.length}
  maxLength={MILESTONE_LIMITS.evidenceMax}
>
  {(p) => (
    <textarea
      {...p}
      rows={2}
      className={FIELD_TEXTAREA_CLS}
      value={m.evidence}
      maxLength={MILESTONE_LIMITS.evidenceMax}
      onChange={(e) => updateMilestone(m.id, { evidence: e.target.value })}
    />
  )}
</Field>

<div className="grid gap-3 sm:grid-cols-2">
  <Field label="Bắt đầu (dự kiến)" hint="Tuỳ chọn">
    {(p) => (
      <input
        {...p}
        type="date"
        className={FIELD_INPUT_CLS}
        value={m.estimatedStart ?? ''}
        onChange={(e) => updateMilestone(m.id, { estimatedStart: e.target.value })}
      />
    )}
  </Field>
  <Field label="Kết thúc (dự kiến)" hint="Tuỳ chọn">
    {(p) => (
      <input
        {...p}
        type="date"
        className={FIELD_INPUT_CLS}
        value={m.estimatedEnd ?? ''}
        onChange={(e) => updateMilestone(m.id, { estimatedEnd: e.target.value })}
      />
    )}
  </Field>
</div>
```

> **Lưu ý**: Khi rename field, mình **không** cần đổi `types.ts` ngay. Có thể dùng adapter:
> ```tsx
> // ở component:
> const goal = m.description;       // legacy field name
> const evidence = m.releaseCondition;
> // hoặc viết adapter ở đầu file để giảm noise.
> ```

### ✏️ #4 — Nút "Thêm mốc giải ngân" (dòng ~224–230)

**Cũ**
```tsx
<button onClick={addMilestone} className="...">+ Thêm mốc giải ngân</button>
```

**Mới**
```tsx
<AddMilestoneButton
  count={state.milestones.length}
  onAdd={addMilestone}
/>
```

### ✏️ #5 — Trước nút điều hướng (dòng ~232)

Thêm:
```tsx
<NextStepBridge />
```

---

## Step-level validation (file `page.tsx`)

Tìm `step3CanNext` và đổi:

**Cũ** (giả định)
```ts
const step3CanNext = milestoneTotal === state.campaignCore.targetAmount && state.milestones.length > 0;
```

**Mới**
```ts
import { validateMilestoneStep } from '@/components/campaign/new-campaign-test/validation/milestoneValidation';
import { toV2 } from '@/components/campaign/new-campaign-test/types.v2';

const step3CanNext = validateMilestoneStep(state.milestones.map(toV2)).ok;
```

---

## Bước 4 vẫn nhận tiền như cũ

`Step4BudgetPerMilestone` đọc từ `state.budgetLines` (đã có sẵn). **KHÔNG đụng**. Tiền chỉ tồn tại ở `budgetLines`, không ở `milestones`.

Nếu trước đây Bước 4 dùng `m.plannedAmount`, sau migration:
- Mỗi milestone có 1 `BudgetLine` "tổng" với `milestoneId = m.id`, `amount = m.plannedAmount` (cũ).
- Hoặc giữ `plannedAmount` là **derived** từ `sum(budgetLines.where(milestoneId == m.id))`.

Khuyến nghị: **derived** — single source of truth.

---

## Roll-out (an toàn nhất)

1. **Commit 1** — Tạo các file mới (xong rồi). Không gì breaks.
2. **Commit 2** — Sửa `Step3Milestones.tsx` theo 5 chỗ trên.
3. **Commit 3** — Sửa `step3CanNext` ở `page.tsx`.
4. **Commit 4** (sau khi test) — Rename field trong `types.ts` (`description → goal`, `releaseCondition → evidence`), bỏ `plannedAmount`, migrate Bước 4.

Mỗi commit chạy `npm run build` + `npm run test` trước khi push.

---

## Acceptance test thủ công

1. Vào `/new-campaign-test`, đến Bước 3.
2. ✅ Không thấy bất kỳ con số tiền nào trên trang.
3. ✅ Thấy 3 chip ở meta bar: số giai đoạn, khuyến nghị, trạng thái hợp lệ.
4. ✅ Mỗi input có label thường trực + helper text bên dưới.
5. ✅ Counter ký tự ở textarea "Mục tiêu" + "Bằng chứng".
6. ✅ Nút "+ Thêm giai đoạn" đổi màu khi vượt 5 (cảnh báo) và disable khi >= 8.
7. ✅ Note xanh "tiền sẽ điền ở Bước 4" hiện trước nút Tiếp tục.
8. ✅ Sang Bước 4, các giai đoạn hiển thị đúng để phân bổ tiền.
9. ✅ Quay lại Bước 3, dữ liệu đã nhập vẫn còn.
