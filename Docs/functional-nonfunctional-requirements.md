# TrustFundMe / Danbox — Functional & Non-Functional Requirements

> **Dùng cho slide.** Rút gọn theo code: danbox (FE) + TrustFundMe-BE.

---

## 1. Five Actors

| # | Actor | Mô tả |
|---|--------|-------|
| 1 | **Guest** | Chưa đăng nhập |
| 2 | **User** | Đã đăng nhập, role `USER` |
| 3 | **Fund Owner** | Chủ quỹ / người tạo campaign, role `FUND_OWNER` |
| 4 | **Staff** | Nhân viên vận hành, role `STAFF` |
| 5 | **Admin** | Quản trị hệ thống, role `ADMIN` |

---

## 2. Functional Requirements (theo Actor)

### 2.1 Guest

| ID | Mô tả | Ghi chú |
|----|-------|---------|
| FR-G1 | Đăng ký (email, password, fullName, phoneNumber) | `POST /api/auth/register` |
| FR-G2 | Đăng nhập (email, password) | `POST /api/auth/login` |
| FR-G3 | Đăng nhập bằng Google | `POST /api/auth/google-login` |
| FR-G4 | Gửi OTP (verify email / quên mật khẩu) | `POST /api/auth/send-otp` |
| FR-G5 | Xác thực OTP | `POST /api/auth/verify-otp` |
| FR-G6 | Xác thực email (sau OTP) | `POST /api/auth/verify-email` |
| FR-G7 | Đặt lại mật khẩu (sau OTP) | `POST /api/auth/reset-password` |
| FR-G8 | Kiểm tra email đã tồn tại | `GET /api/users/check-email` |
| FR-G9 | Xem danh sách campaigns | `GET /api/campaigns` |
| FR-G10 | Xem chi tiết campaign | `GET /api/campaigns/{id}` |
| FR-G11 | Xem campaigns theo fund owner | `GET /api/campaigns/fund-owner/{id}` |
| FR-G12 | Xem danh sách mục tiêu gây quỹ | `GET /api/fundraising-goals`, `GET /api/fundraising-goals/campaign/{id}` |
| FR-G13 | Xem số followers của campaign | `GET /api/campaign-follows/{id}/count` |
| FR-G14 | Xem danh sách followers của campaign | `GET /api/campaign-follows/{id}/followers` |
| FR-G15 | Xem nội dung public (News, Events, Team, FAQ, Contact, About) | FE: `/news`, `/events`, `/team`, `/faq`, `/contact`, `/about` |

---

### 2.2 User (đã đăng nhập)

| ID | Mô tả | Ghi chú |
|----|-------|---------|
| FR-U1 | Làm mới token | `POST /api/auth/refresh` |
| FR-U2 | Xem / cập nhật profile của mình | `GET/PUT /api/users/{id}` (chỉ `id` = mình) |
| FR-U3 | Cập nhật avatar | `POST /api/upload/avatar`, `/api/users/profile/avatar` (FE) |
| FR-U4 | Tạo bank account | `POST /api/bank-accounts` |
| FR-U5 | Xem bank accounts của mình | `GET /api/bank-accounts` |
| FR-U6 | Cập nhật trạng thái bank account (theo role) | `PATCH /api/bank-accounts/{id}/status` |
| FR-U7 | Xem trạng thái KYC của mình | `GET /api/kyc/me` |
| FR-U8 | Follow / Unfollow campaign | `POST/DELETE /api/campaign-follows/{campaignId}` |
| FR-U9 | Kiểm tra đã follow campaign chưa | `GET /api/campaign-follows/{id}/me` |
| FR-U10 | Xem danh sách campaigns đã follow | `GET /api/campaign-follows/me` |
| FR-U11 | Tạo campaign | `POST /api/campaigns` |
| FR-U12 | Tạo feed post | `POST /api/feed-posts` |
| FR-U13 | Xem feed (ACTIVE, theo visibility) | `GET /api/feed-posts` |
| FR-U14 | Xem chi tiết feed post | `GET /api/feed-posts/{id}` |
| FR-U15 | Cập nhật nội dung feed post (chủ post) | `PATCH /api/feed-posts/{id}` |
| FR-U16 | Cập nhật status (DRAFT/ACTIVE) feed post | `PATCH /api/feed-posts/{id}/status` |
| FR-U17 | Cập nhật visibility (PUBLIC/PRIVATE/FOLLOWERS) | `PATCH /api/feed-posts/{id}/visibility` |
| FR-U18 | Báo cáo (campaign/post) | `POST /api/flags` |
| FR-U19 | Upload media (post/campaign) | `POST /api/media/upload` |
| FR-U20 | Xem / cập nhật / xóa media của mình | `GET/PATCH/DELETE /api/media/{id}` |
| FR-U21 | Xem Wallet, Impact, Campaigns của mình | FE: `/account/wallet`, `/account/impact`, `/account/campaigns` |
| FR-U22 | Gây quỹ (Donate) | FE: form Donate; BE: chưa có API riêng (chức năng dự kiến) |

---

### 2.3 Fund Owner

| ID | Mô tả | Ghi chú |
|----|-------|---------|
| FR-F1 | Tất cả quyền **User** | Kế thừa |
| FR-F2 | Cập nhật campaign của mình | `PUT /api/campaigns/{id}` — `@PreAuthorize("FUND_OWNER","STAFF","ADMIN")` |
| FR-F3 | Tạo mục tiêu gây quỹ | `POST /api/fundraising-goals` — `@PreAuthorize("FUND_OWNER","STAFF","ADMIN")` |

---

### 2.4 Staff

| ID | Mô tả | Ghi chú |
|----|-------|---------|
| FR-S1 | Tất cả quyền **User** (trừ logic hạn chế theo “chỉ của mình”) | Kế thừa |
| FR-S2 | Xem danh sách users | `GET /api/users` |
| FR-S3 | Xem / cập nhật / xóa / ban / unban user | `GET/PUT/DELETE /api/users/{id}`, `PUT /api/users/{id}/ban`, `unban` |
| FR-S4 | Xem tất cả bank accounts | `GET /api/bank-accounts/all` |
| FR-S5 | Submit / cập nhật KYC cho user | `POST /api/kyc/users/{userId}`, `PUT /api/kyc/users/{userId}` |
| FR-S6 | Xem KYC theo user / danh sách KYC pending | `GET /api/kyc/user/{id}`, `GET /api/kyc/pending` |
| FR-S7 | Duyệt / từ chối KYC | `PATCH /api/kyc/{id}/status` |
| FR-S8 | Cập nhật campaign bất kỳ | `PUT /api/campaigns/{id}` |
| FR-S9 | Đánh dấu campaign là đã xóa (soft delete) | `PUT /api/campaigns/{id}/mark-deleted` |
| FR-S10 | Tạo / cập nhật / xóa mục tiêu gây quỹ | `POST /api/fundraising-goals`, `PUT/DELETE /api/fundraising-goals/{id}` |
| FR-S11 | Xem danh sách báo cáo pending | `GET /api/flags/pending` |
| FR-S12 | Duyệt báo cáo (RESOLVED/DISMISSED) | `PATCH /api/flags/{id}/review` |

---

### 2.5 Admin

| ID | Mô tả | Ghi chú |
|----|-------|---------|
| FR-A1 | Tất cả quyền **Staff** | Kế thừa |
| FR-A2 | Toàn quyền quản lý user, KYC, campaign, fundraising, moderation | Trong code cùng phạm vi với Staff; tách actor để mở rộng sau (VD: chỉ Admin xóa user) |

---

## 3. Non-Functional Requirements

### 3.1 Bảo mật

| ID | Mô tả |
|----|-------|
| NFR-1 | Xác thực JWT: Access token (ngắn hạn) + Refresh token (dài hạn). |
| NFR-2 | Lưu token: **httpOnly, secure, SameSite** (cookie hoặc chuẩn tương đương); không lưu access/refresh trong `localStorage`. |
| NFR-3 | API Gateway validate JWT trước khi route tới microservice. |
| NFR-4 | Phân quyền theo role: `USER`, `FUND_OWNER`, `STAFF`, `ADMIN`; `@PreAuthorize` tại controller. |
| NFR-5 | Mật khẩu hash bằng BCrypt. |
| NFR-6 | OTP dùng cho verify email và reset password; token từ verify-otp dùng 1 lần, có hạn. |

### 3.2 Hiệu năng & Khả năng mở rộng

| ID | Mô tả |
|----|-------|
| NFR-7 | Kiến trúc microservices: Discovery (Eureka), API Gateway, Identity, Campaign, Feed, Media, Moderation. |
| NFR-8 | Database tách theo service (DB per service). |
| NFR-9 | Feed post: phân trang (`page`, `size`, `sort`). |
| NFR-10 | Media: upload lên Supabase Storage; metadata lưu DB. |

### 3.3 Khả dụng & Vận hành

| ID | Mô tả |
|----|-------|
| NFR-11 | Stateless API (session không lưu server). |
| NFR-12 | Swagger/OpenAPI cho tài liệu API. |
| NFR-13 | `GlobalExceptionHandler` thống nhất; trả về JSON lỗi rõ ràng. |
| NFR-14 | Có thể chạy bằng Docker Compose (Discovery, Gateway, Identity, v.v.). |

### 3.4 Trải nghiệm người dùng (FE)

| ID | Mô tả |
|----|-------|
| NFR-15 | Responsive (mobile-first, Tailwind). |
| NFR-16 | Loading / skeleton cho dữ liệu bất đồng bộ. |
| NFR-17 | Thông báo lỗi rõ ràng (toast, inline). |

---

## 4. Tóm tắt ma trận Actor × Nhóm chức năng (slide)

| Nhóm chức năng | Guest | User | Fund Owner | Staff | Admin |
|----------------|:-----:|:----:|:----------:|:-----:|:-----:|
| Auth (register, login, OTP, reset, Google) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Xem campaigns, goals, followers (public) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Profile, avatar, bank account, KYC (của mình) | — | ✓ | ✓ | ✓ | ✓ |
| Follow campaign, feed post (CRUD của mình) | — | ✓ | ✓ | ✓ | ✓ |
| Flag (báo cáo) | — | ✓ | ✓ | ✓ | ✓ |
| Media upload | — | ✓ | ✓ | ✓ | ✓ |
| Tạo campaign | — | ✓ | ✓ | ✓ | ✓ |
| Sửa campaign, tạo goal | — | — | ✓ | ✓ | ✓ |
| Xóa campaign (soft), sửa/xóa goal | — | — | — | ✓ | ✓ |
| Quản lý user (list, ban, unban, delete) | — | — | — | ✓ | ✓ |
| KYC (submit, duyệt, pending) | — | — | — | ✓ | ✓ |
| Bank accounts (all) | — | — | — | ✓ | ✓ |
| Moderation (pending flags, review) | — | — | — | ✓ | ✓ |

---

## 5. Ghi chú slide

- **Slide 1:** Tên dự án, 5 actors (bảng 1).
- **Slide 2–3:** Functional: Guest + User (bảng 2.1, 2.2) — có thể rút 2–3 ý tiêu biểu/actor.
- **Slide 4:** Functional: Fund Owner, Staff, Admin (bảng 2.3–2.5).
- **Slide 5:** Non-Functional (bảng 3) — nhóm: Security, Performance, Operations, UX.
- **Slide 6:** Ma trận Actor × Chức năng (bảng 4).

File markdown gốc: `Docs/functional-nonfunctional-requirements.md`.
