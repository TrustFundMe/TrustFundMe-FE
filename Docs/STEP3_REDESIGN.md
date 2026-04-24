# Bước 3 — Các giai đoạn — Redesign Spec

> **Mục tiêu**: tách bạch *planning* (Bước 3) khỏi *finance* (Bước 4). Bước 3 chỉ kể câu chuyện chiến dịch sẽ diễn ra theo những giai đoạn nào, mỗi giai đoạn cam kết cái gì, kiểm chứng bằng cái gì. **Không nhắc tới tiền.**

---

## 1. Nguyên tắc thiết kế

| Nguyên tắc | Áp dụng |
|---|---|
| **One concept per step** | Bước 3 = milestone storytelling. Tiền chuyển hết sang Bước 4. |
| **Label rõ, placeholder phụ trợ** | Mỗi input có `<label>` thường trực + helper text bên dưới. |
| **Progress phải có nghĩa** | Bỏ thanh progress giả. Chỉ giữ chỉ báo "đã điền đủ tối thiểu" cho mỗi card. |
| **Affordance rõ ràng** | Card có `hover` state, drag handle khi có ≥2 giai đoạn, nút xoá tách biệt khỏi nội dung. |
| **Empty + first-run guidance** | Card đầu tiên có hint mềm "VD: Cứu trợ khẩn cấp 7 ngày đầu". |
| **Không reflow đột ngột** | Dùng `layout` của Framer Motion để swap mượt. |

---

## 2. Information Architecture

### 2.1 Cấu trúc trang

```
┌─ Header ─────────────────────────────────────────────────────┐
│  Bước 3 — Các giai đoạn                                      │
│  Chia chiến dịch thành các giai đoạn rõ ràng. Mỗi giai đoạn  │
│  có mục tiêu và bằng chứng hoàn thành cụ thể.                │
│  Phần ngân sách sẽ phân bổ ở Bước 4.                         │
└──────────────────────────────────────────────────────────────┘

┌─ Meta bar ───────────────────────────────────────────────────┐
│  3 giai đoạn   ·   Khuyến nghị 2–5 giai đoạn   ·   ✓ Hợp lệ  │
└──────────────────────────────────────────────────────────────┘

┌─ Milestone Card 1 ───────────────────────────────────────────┐
│  ⠿  ●1  GIAI ĐOẠN 1                                  [🗑]    │
│ ─────────────────────────────────────────────────────────── │
│  Tên giai đoạn *                                             │
│  [ Cứu trợ khẩn cấp                                       ]  │
│                                                              │
│  Mục tiêu cụ thể *                              0 / 280     │
│  [ Phân phối nhu yếu phẩm cho 200 hộ tại xã X trong 7    ]  │
│  [ ngày đầu sau bão.                                     ]  │
│  Mô tả ngắn kết quả bạn cam kết đạt được.                   │
│                                                              │
│  Bằng chứng hoàn thành *                                     │
│  [ Biên bản nhận hàng có chữ ký trưởng thôn + ảnh.       ]  │
│  Tài liệu/dữ liệu cần có để giai đoạn này được duyệt qua.   │
│                                                              │
│  Thời gian dự kiến (tuỳ chọn)                                │
│  Bắt đầu: [📅 01/05/2026]   Kết thúc: [📅 07/05/2026]       │
└──────────────────────────────────────────────────────────────┘

┌─ Milestone Card 2 ────────────────────────────────────────── ┐
   ...

[ + Thêm giai đoạn ]

ℹ Sau khi xác định các giai đoạn, bạn sẽ phân bổ ngân sách
   cho từng giai đoạn ở Bước 4 — Dự toán.

[ Quay lại ]                                       [ Tiếp tục ]
```

### 2.2 Vùng KHÔNG còn xuất hiện (so với bản cũ)

- ❌ Pill `35.0%` góc phải mỗi card.
- ❌ Thanh progress mỏng phía trên mỗi card.
- ❌ Block "Tổng giải ngân — 1.000.000.000 đ / 1.000.000.000 đ".
- ❌ Cột input số tiền + ký hiệu `đ`.
- ❌ Footer "Lũy kế: ... đ".
- ❌ Cảnh báo "Chặng này chiếm 50% mục tiêu".

---

## 3. Component Spec

### 3.1 `<MilestoneStepHeader />`

| Element | Spec |
|---|---|
| Title | `text-xl md:text-2xl font-semibold tracking-tight text-gray-900` — "Bước 3 — Các giai đoạn" |
| Subtitle | `mt-1 text-sm text-gray-600 leading-relaxed` |
| **Không** có thanh progress tổng |

### 3.2 `<MilestoneMetaBar />` (mới)

```
[ 3 giai đoạn ]   [ Khuyến nghị 2–5 ]   [ ✓ Hợp lệ ]
```

- Container: `mt-3 flex flex-wrap items-center gap-2 text-xs`
- Chip "X giai đoạn": `rounded-full bg-orange-50 text-brand ring-1 ring-orange-200 px-2.5 py-1 font-semibold`
- Chip khuyến nghị: `rounded-full bg-gray-50 text-gray-600 ring-1 ring-gray-200 px-2.5 py-1`
- Chip trạng thái:
  - Hợp lệ: `bg-emerald-50 text-emerald-700 ring-emerald-200` + icon ✓
  - Cần chỉnh: `bg-amber-50 text-amber-700 ring-amber-200` + icon ⚠

### 3.3 `<MilestoneCard />`

#### Container
```
group relative rounded-2xl border border-gray-200 bg-white
shadow-sm transition hover:border-gray-300 hover:shadow
focus-within:border-brand focus-within:ring-2 focus-within:ring-orange-100
```
- Bỏ `bg-gray-50/80` cũ — dùng white để contrast tốt hơn với label.
- `focus-within:` để toàn card sáng lên khi đang edit → tốt cho concentration.

#### Header row (top of card, padding 16px)
```
[⠿ Drag]  [●1]  GIAI ĐOẠN 1                        [🗑 Xoá]
```
- Drag handle (`⠿`): chỉ hiện khi `milestones.length >= 2`. Class `cursor-grab text-gray-300 hover:text-gray-500`.
- Số thứ tự: `flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-brand`
- Eyebrow "GIAI ĐOẠN N": `text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500`
- Trash button: `rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600`. Disable khi chỉ còn 1 giai đoạn.

#### Body fields (padding 16px, gap-4)

Mỗi field theo pattern `<Field>` chuẩn:

```tsx
<div className="space-y-1.5">
  <div className="flex items-baseline justify-between">
    <label
      htmlFor={fieldId}
      className="text-xs font-semibold text-gray-800"
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {showCounter && (
      <span className="text-[11px] tabular-nums text-gray-400">
        {value.length} / {max}
      </span>
    )}
  </div>
  <Input id={fieldId} ... />
  {hint && (
    <p className="text-[11px] leading-snug text-gray-500">{hint}</p>
  )}
  {error && (
    <p className="text-[11px] font-medium text-red-600">{error}</p>
  )}
</div>
```

Class input chuẩn (đổi từ `inCls` cũ — to hơn, dễ chạm):
```
w-full rounded-xl border border-gray-200 bg-white
px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400
outline-none transition
hover:border-gray-300
focus:border-brand focus:ring-2 focus:ring-orange-100
```

Textarea:
```
w-full resize-none rounded-xl border border-gray-200 bg-white
px-3.5 py-2.5 text-sm leading-relaxed ...
```

#### Danh sách field

| # | Label | Required | Component | Helper text | Counter |
|---|---|---|---|---|---|
| 1 | **Tên giai đoạn** | ✓ | `<input>` | — | — |
| 2 | **Mục tiêu cụ thể** | ✓ | `<textarea rows={3}>` | "Mô tả ngắn kết quả bạn cam kết đạt được." | 280 |
| 3 | **Bằng chứng hoàn thành** | ✓ | `<textarea rows={2}>` | "Tài liệu / dữ liệu cần có để giai đoạn này được duyệt qua." | 200 |
| 4 | **Thời gian dự kiến** | – | 2 × `<input type="date">` | "Tuỳ chọn — giúp tăng độ tin cậy." | — |

### 3.4 `<AddMilestoneButton />`

```
+ Thêm giai đoạn
```
- Khi `milestones.length < 5`: nổi bật cam.
- Khi `>= 5`: đổi sang xám + tooltip "Khuyến nghị tối đa 5 giai đoạn. Cân nhắc gộp lại."
- Khi `>= 8`: disable hẳn.

### 3.5 `<NextStepBridge />`

Note nhỏ trước nút Tiếp tục:
```
ℹ  Sau bước này, bạn sẽ phân bổ ngân sách cho từng giai đoạn
    ở Bước 4 — Dự toán.
```
Class: `mt-4 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-3.5 py-2.5 text-xs text-blue-900`

---

## 4. Validation logic

### 4.1 Per-card validation
```ts
function validateMilestone(m: Milestone): MilestoneErrors {
  return {
    title: !m.title.trim()
      ? 'Bắt buộc'
      : m.title.length < 4 ? 'Tên ngắn quá' : '',
    goal: !m.goal.trim()
      ? 'Bắt buộc'
      : m.goal.length < 20 ? 'Mô tả cụ thể hơn (≥ 20 ký tự)' : '',
    evidence: !m.evidence.trim() ? 'Bắt buộc' : '',
    dateRange: m.estimatedStart && m.estimatedEnd && m.estimatedStart > m.estimatedEnd
      ? 'Ngày bắt đầu phải trước ngày kết thúc' : '',
  };
}
```

### 4.2 Step-level
```ts
const step3CanNext =
  state.milestones.length >= 1 &&
  state.milestones.length <= 8 &&
  state.milestones.every(m => {
    const e = validateMilestone(m);
    return !e.title && !e.goal && !e.evidence && !e.dateRange;
  });
```

### 4.3 Validation display
- Lazy: chỉ show error sau khi user **blur** field hoặc bấm "Tiếp tục" lần đầu.
- Tránh "error fatigue" như Step 1 hiện đang dính ("Cần ít nhất một tệp" đỏ rực ngay đầu).

---

## 5. Type changes

```ts
// types.ts
export interface Milestone {
  id: string;
  title: string;
  goal: string;            // (đổi tên từ `description`)
  evidence: string;        // (đổi tên từ `releaseCondition`)
  estimatedStart?: string; // ISO date, mới
  estimatedEnd?: string;   // ISO date, mới
  // ❌ plannedAmount — XOÁ khỏi entity Milestone
}
```

`plannedAmount` chuyển thành quan hệ riêng (`BudgetAllocation` / `budgetLines`) — đúng theo ERD ngày trước (`Expenditure` ↔ `Donation`/`Payout`).

---

## 6. Drag & Drop (P1, optional)

- Library gợi ý: `@dnd-kit/core` + `@dnd-kit/sortable` (đã hỗ trợ keyboard a11y).
- Drag handle là icon `⠿` bên trái số thứ tự, **không** drag toàn bộ card (tránh chọn text bị conflict).
- Khi drop xong: re-render thứ tự + cập nhật label "GIAI ĐOẠN N" theo index mới.

---

## 7. Empty / First-run state

Khi `milestones.length === 1` và card mặc định còn trống:
```
┌─ Suggestion banner (above card) ────────────────────────────┐
│  💡 Một chiến dịch tốt thường có 2–5 giai đoạn rõ ràng.    │
│     Ví dụ: Khẩn cấp → Mở rộng → Ổn định → Tổng kết.        │
└─────────────────────────────────────────────────────────────┘
```
Class: `mb-4 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50/60 px-3.5 py-2.5 text-xs text-amber-900`

Auto-dismiss khi user thêm giai đoạn thứ 2 hoặc đã điền xong card 1.

---

## 8. Mobile breakpoint (< 640px)

- Card padding giảm từ 16px → 14px.
- 2 input date ngày → stack dọc thay vì grid 2 cột.
- Drag handle ẩn (touch không drag tốt) → thay bằng button "↑" / "↓" nhỏ trong menu kebab.
- Eyebrow + trash trên cùng một row, label "GIAI ĐOẠN N" rút gọn còn `GĐ N`.

---

## 9. A11y checklist

- [ ] Mỗi `<input>` / `<textarea>` có `id` + `<label htmlFor>`.
- [ ] Helper text liên kết qua `aria-describedby`.
- [ ] Error text có `role="alert"` khi xuất hiện.
- [ ] Drag handle có `aria-label="Kéo để sắp xếp lại giai đoạn N"`.
- [ ] Trash button có `aria-label="Xoá giai đoạn N"`.
- [ ] Counter ký tự **không** đọc bằng screen reader (set `aria-hidden`).
- [ ] Khi xoá giai đoạn → focus về card kế tiếp (hoặc nút "Thêm giai đoạn").

---

## 10. Bad cases

| Case | Xử lý |
|---|---|
| User xoá tất cả → còn 1 giai đoạn | Disable nút xoá khi `length === 1`. |
| User thêm > 8 giai đoạn | Disable nút "Thêm giai đoạn" + show hint "Tối đa 8 giai đoạn." |
| User paste mô tả 2000 ký tự | Hard cap 280, cắt phần dư + toast "Đã rút gọn còn 280 ký tự." |
| Date range chồng chéo giữa các giai đoạn | Warning vàng (không block): "Giai đoạn 2 và 3 có thời gian chồng chéo." |
| User bấm "Tiếp tục" khi còn lỗi | Scroll tới card đầu tiên có lỗi + focus field lỗi đầu tiên. |
| User refresh giữa chừng | Persist via `localStorage` draft key (xử lý ở `page.tsx`, không phải step). |

---

## 11. Visual contrast — bảng so sánh

| Phần | Trước | Sau |
|---|---|---|
| Tổng quan | 1 thanh progress lớn + số tiền | Bỏ. Chỉ chip "3 giai đoạn / Hợp lệ" |
| Card progress | Thanh cam mỏng vô nghĩa | Bỏ |
| Pill % | `35.0%` cam | Bỏ |
| Input | Placeholder làm label | `<label>` thường trực + counter + helper |
| Trường tiền | Có | Bỏ — chuyển Bước 4 |
| Lũy kế | Có | Bỏ |
| Cảnh báo % | Có (vô nghĩa) | Bỏ |
| Thuật ngữ | "Mốc giải ngân" | **"Giai đoạn"** |
| "Điều kiện giải ngân" | Có | Đổi thành **"Bằng chứng hoàn thành"** |
| Drag-drop | Không | Có (P1) |
| Date range | Không | Có (optional) |
| Char counter | Không | Có |
| Lazy validation | Không | Có |
| Empty state guide | Không | Có |
| Bridge tới Bước 4 | Không | Có note ℹ |

---

## 12. Acceptance criteria

- [ ] Trang không còn hiển thị bất kỳ con số tiền tệ nào.
- [ ] Mỗi field có `<label>` đọc được khi cả input đã điền.
- [ ] Có thể tạo 1–8 giai đoạn, < 1 hoặc > 8 đều bị chặn ở UI.
- [ ] Bước 3 → Bước 4: state `milestones` chứa `{title, goal, evidence, estimatedStart?, estimatedEnd?}`, **không** chứa `plannedAmount`.
- [ ] Bước 4 nhận `milestones` và render lại các giai đoạn để phân bổ tiền.
- [ ] Lighthouse a11y ≥ 95 trên trang này.

---

## 13. Implementation order (gợi ý PR)

1. **PR 1 — Type & state**: rename `Milestone.description → goal`, `releaseCondition → evidence`, bỏ `plannedAmount`. Migrate Step 4 đọc tiền từ `budgetLines` (đã có sẵn).
2. **PR 2 — UI cleanup**: bỏ progress tổng, pill %, cột tiền, lũy kế trên Step 3.
3. **PR 3 — Label refactor**: convert tất cả input sang pattern `<Field>` với label thường trực.
4. **PR 4 — Date range + counter + validation**: bổ sung field thời gian + char counter + lazy validation.
5. **PR 5 — Drag & drop** (optional, P1).
6. **PR 6 — Empty state + meta bar + bridge**.
