# AI / Perplexity Integration Plan — danbox

> Mục tiêu: dùng AI ở những chỗ tăng **tốc độ tạo campaign**, **giảm gian lận**, và **tăng minh bạch**.
> Stack đã có: **Perplexity API** (search + reasoning có dẫn nguồn).
> Có thể bổ sung 1 LLM khác (Claude / GPT-4o) cho task không cần realtime web search (vd. vision, viết lại).

---

## 1. Tier ưu tiên

| Tier | Use case | Lý do dùng AI | Model gợi ý |
|---|---|---|---|
| 🔥 P0 | Trợ lý điền **hồ sơ năng lực / mô tả campaign** | Giảm friction lớn nhất ở Step 3 & Step content | Perplexity `sonar` (cần dẫn nguồn) |
| 🔥 P0 | Phát hiện **campaign trùng lặp / scam** | Bảo vệ donor, tăng trust | Perplexity search + embedding |
| 🟠 P1 | Tóm tắt **sao kê PDF** thành bảng | Giảm công admin duyệt | LLM có vision (Claude / GPT-4o) |
| 🟠 P1 | Gợi ý **expenditure breakdown** từ goal_amount + category | Giúp creator viết phase chi tiêu | LLM thuần |
| 🟡 P2 | Auto-translate campaign sang EN | Mở rộng donor quốc tế | LLM thuần |
| 🟡 P2 | Phân loại / route ticket support | Tiết kiệm CS | LLM nhỏ rẻ |

---

## 2. Áp dụng trực tiếp vào Step 1 (Eligibility)

### 2.1. Verify "tổ chức tồn tại thật" — Perplexity search
**Trigger**: khi `accountHolderName` không trùng KYC và user khai là tổ chức.

**Prompt** (Perplexity sonar):
```
Tổ chức "{holderName}" tại Việt Nam có tồn tại không?
Trả về: tên đầy đủ, mã số thuế (nếu có), website, địa chỉ, năm thành lập.
Chỉ trả nếu tìm được nguồn báo chí / cổng chính phủ.
```

**Action**:
- Hit cao → auto-pass warning, hiển thị info card "Đã tìm thấy {tên} (nguồn: ...)"
- Hit thấp → giữ warning + yêu cầu upload thêm Quyết định thành lập / GPKD.

### 2.2. Tóm tắt sao kê (Section 3)
Khi user upload PDF sao kê, gửi qua AI có vision:
- Trích **số dư đầu/cuối**, **tổng giao dịch**, **dấu hiệu bất thường** (nhiều giao dịch nhỏ liên tiếp giống bot, transfer ra nước ngoài).
- Hiển thị **bảng tóm tắt** trong UI để user/admin review nhanh.

> ⚠️ Sao kê chứa PII → KHÔNG gửi sang Perplexity. Dùng vendor có BAA hoặc OCR on-prem.

### 2.3. Risk score realtime
Composite từ:
- Trùng tên KYC ↔ holder (-)
- Tìm thấy tổ chức trên Perplexity (+)
- Số file kèm chất lượng (OCR đọc được? có chữ ký?) (+)
- KYC level (+)

→ hiển thị thanh "Mức tin cậy hồ sơ: 72/100" cho user **và** cho admin reviewer.

---

## 3. Áp dụng các bước tạo campaign khác

### Step Content (description)
- **Auto-improve writing**: nút "AI chỉnh văn phong" → LLM rewrite thành tone trung tính, có cấu trúc (Hoàn cảnh → Mục tiêu → Kế hoạch → Cam kết minh bạch).
- **Fact-check**: nếu mô tả nhắc đến bệnh viện / bệnh tật / tổ chức cụ thể → Perplexity search verify, gắn `[citation]` vào câu cần dẫn.
- **Plagiarism check**: embed mô tả → so với campaign cũ → flag nếu cosine > 0.85.

### Step Expenditures
- **AI generate phase plan**: input `goal_amount=200tr, category="Phẫu thuật"`, output 3 phase với item gợi ý + giá tham khảo (Perplexity search giá thị trường).
- **Cost sanity check**: "Mì tôm 10 thùng = 10tr" → AI flag "giá thị trường ~3tr, vui lòng xem lại".

### Step Goal & Timeline
- **Suggest realistic goal & deadline** dựa lịch sử campaign cùng category.

---

## 4. Vận hành / kiểm duyệt (BE)

| Use case | Mô tả |
|---|---|
| **Auto-moderation feed post** | Phân loại: spam, kêu gọi ngoài luồng, ảnh nhạy cảm |
| **Comment toxicity** | Chặn bình luận xúc phạm donor / bệnh nhân |
| **KYC document OCR + cross-check** | Đọc CCCD, so với form khai |
| **Fraud cluster detection** | Embedding mô tả + ảnh → cluster ra nhóm campaign giả mạo |
| **Notification copywriting** | Gen subject email A/B test |

---

## 5. Architecture gợi ý

```
[Next.js client]
   │
   │ POST /api/ai/{task}    (rate-limit, auth)
   ▼
[BFF route in danbox] ──► cache (Redis) ──► hit?
   │                                         │
   │ miss                                    │
   ▼                                         ▼
[ai-orchestrator service]                  return cached
   ├─► Perplexity (search/RAG)
   ├─► OpenAI / Claude (writing, vision)
   └─► local embedding (qdrant / pgvector)
```

- **Cache aggressively**: cùng campaign mô tả thì không gọi lại.
- **Streaming**: dùng SSE để hiển thị token-by-token (UX tốt hơn).
- **Cost guard**: mỗi user limit X token/ngày, monitor qua dashboard.

---

## 6. Bad cases / Risk khi dùng AI

| Risk | Mitigation |
|---|---|
| Perplexity trả info sai về tổ chức | Luôn show **nguồn** + bắt admin re-verify trước khi auto-pass |
| LLM hallucinate số tiền / số liệu | Không cho AI **ghi đè** dữ liệu user, chỉ **gợi ý** |
| User dùng AI viết campaign giả cảm động | Phát hiện AI-generated text (perplexity-of-text), gắn nhãn "AI-assisted" |
| Cost spike | Hard cap per-user, alert khi vượt |
| Privacy: gửi sao kê có PII sang Perplexity | **Không gửi**. Sao kê dùng vision LLM enterprise (BAA) hoặc on-prem OCR (PaddleOCR + LayoutLM) |
| Latency làm UX chậm | Background job + push notification khi xong |

---

## 7. Roadmap

- **Sprint 1**: Verify tổ chức (Perplexity) ở Step 1, AI rewrite description ở Step Content.
- **Sprint 2**: Sao kê OCR + tóm tắt, risk score.
- **Sprint 3**: Expenditure plan generator, fact-check citations.
- **Sprint 4**: Moderation pipeline cho feed/chat.
