# TrustFundMe / Danbox — Functional and Non-Functional Requirements

> **For slides and documentation.** Derived from the codebase: danbox (frontend) and TrustFundMe-BE (backend).

---

## 1. Five Actors

| Number | Actor | Description |
|--------|-------|-------------|
| 1 | **Guest** | A visitor who is not logged in. |
| 2 | **User** | A logged-in user with the role `USER`. |
| 3 | **Fund Owner** | The owner of a fundraising campaign; has the role `FUND_OWNER`. |
| 4 | **Staff** | An operations employee with the role `STAFF`. |
| 5 | **Admin** | A system administrator with the role `ADMIN`. |

---

## 2. Functional Requirements (by Actor)

### 2.1 Guest

| ID | Requirement | API Endpoint or Note |
|----|-------------|----------------------|
| FR-G1 | The system shall allow a guest to register a new account by providing email, password, full name, and phone number. | `POST /api/auth/register` |
| FR-G2 | The system shall allow a guest to sign in with email and password. | `POST /api/auth/login` |
| FR-G3 | The system shall allow a guest to sign in or sign up using a Google account. | `POST /api/auth/google-login` |
| FR-G4 | The system shall send a one-time password (OTP) to the user’s email. This is used both for email verification after registration and for password reset. | `POST /api/auth/send-otp` |
| FR-G5 | The system shall verify the OTP code entered by the user. | `POST /api/auth/verify-otp` |
| FR-G6 | The system shall verify the user’s email address using the token returned after successful OTP verification. | `POST /api/auth/verify-email` |
| FR-G7 | The system shall allow the user to set a new password using the token returned after successful OTP verification. | `POST /api/auth/reset-password` |
| FR-G8 | The system shall allow checking whether an email address is already registered. | `GET /api/users/check-email` |
| FR-G9 | The system shall allow a guest to view the list of all fundraising campaigns. | `GET /api/campaigns` |
| FR-G10 | The system shall allow a guest to view the details of a specific campaign. | `GET /api/campaigns/{id}` |
| FR-G11 | The system shall allow a guest to view all campaigns created by a specific fund owner. | `GET /api/campaigns/fund-owner/{id}` |
| FR-G12 | The system shall allow a guest to view the list of fundraising goals, and the list of goals for a specific campaign. | `GET /api/fundraising-goals` and `GET /api/fundraising-goals/campaign/{id}` |
| FR-G13 | The system shall allow a guest to view the number of followers of a campaign. | `GET /api/campaign-follows/{id}/count` |
| FR-G14 | The system shall allow a guest to view the list of followers of a campaign. | `GET /api/campaign-follows/{id}/followers` |
| FR-G15 | The system shall allow a guest to view all public content: News, Events, Team, FAQ, Contact, and About pages. | Frontend routes: `/news`, `/events`, `/team`, `/faq`, `/contact`, `/about` |

---

### 2.2 User (Logged In)

| ID | Requirement | API Endpoint or Note |
|----|-------------|----------------------|
| FR-U1 | The system shall allow a logged-in user to obtain a new access token using a valid refresh token. | `POST /api/auth/refresh` |
| FR-U2 | The system shall allow a user to view and update their own profile. A user may only access or modify the profile whose user ID matches their own. | `GET /api/users/{id}` and `PUT /api/users/{id}` |
| FR-U3 | The system shall allow a user to update their profile avatar (profile picture). | `POST /api/upload/avatar` and `POST /api/users/profile/avatar` (frontend) |
| FR-U4 | The system shall allow a user to create and link a bank account to their profile. | `POST /api/bank-accounts` |
| FR-U5 | The system shall allow a user to view the list of their own bank accounts. | `GET /api/bank-accounts` |
| FR-U6 | The system shall allow a user to update the status of a bank account. Permissions may depend on the user’s role. | `PATCH /api/bank-accounts/{id}/status` |
| FR-U7 | The system shall allow a user to view their own KYC (Know Your Customer) verification status. | `GET /api/kyc/me` |
| FR-U8 | The system shall allow a user to follow or unfollow a campaign. | `POST /api/campaign-follows/{campaignId}` and `DELETE /api/campaign-follows/{campaignId}` |
| FR-U9 | The system shall allow a user to check whether they are currently following a specific campaign. | `GET /api/campaign-follows/{id}/me` |
| FR-U10 | The system shall allow a user to view the list of campaigns they are following. | `GET /api/campaign-follows/me` |
| FR-U11 | The system shall allow a user to create a new fundraising campaign. | `POST /api/campaigns` |
| FR-U12 | The system shall allow a user to create a new feed post. | `POST /api/feed-posts` |
| FR-U13 | The system shall allow a user to view the feed of posts. Only posts with status ACTIVE are shown, and visibility rules (public, private, followers) are applied. | `GET /api/feed-posts` |
| FR-U14 | The system shall allow a user to view the full details of a specific feed post. | `GET /api/feed-posts/{id}` |
| FR-U15 | The system shall allow the author of a feed post to update its content (title and body). | `PATCH /api/feed-posts/{id}` |
| FR-U16 | The system shall allow the author of a feed post to update its status to DRAFT or ACTIVE. | `PATCH /api/feed-posts/{id}/status` |
| FR-U17 | The system shall allow the author of a feed post to update its visibility to PUBLIC, PRIVATE, or FOLLOWERS. | `PATCH /api/feed-posts/{id}/visibility` |
| FR-U18 | The system shall allow a user to submit a report (flag) against a campaign or a feed post, with a reason. | `POST /api/flags` |
| FR-U19 | The system shall allow a user to upload media files (images, etc.) and associate them with a post or a campaign. | `POST /api/media/upload` |
| FR-U20 | The system shall allow a user to view, update the metadata of, and delete their own media files. | `GET /api/media/{id}`, `PATCH /api/media/{id}`, `DELETE /api/media/{id}` |
| FR-U21 | The system shall allow a user to view their Wallet, Impact (donation history), and the list of campaigns they have created or are involved in. | Frontend: `/account/wallet`, `/account/impact`, `/account/campaigns` |
| FR-U22 | The system shall allow a user to donate to a campaign. The frontend provides a donate form; a dedicated donation API in the backend is planned and not yet implemented. | Frontend: donate form; backend: to be implemented |

---

### 2.3 Fund Owner

| ID | Requirement | API Endpoint or Note |
|----|-------------|----------------------|
| FR-F1 | A fund owner has all the functional requirements of a User. | Inherited from User. |
| FR-F2 | The system shall allow a fund owner to update the campaigns they own. This is restricted to users with role FUND_OWNER, STAFF, or ADMIN. | `PUT /api/campaigns/{id}` — `@PreAuthorize("FUND_OWNER","STAFF","ADMIN")` |
| FR-F3 | The system shall allow a fund owner to create a new fundraising goal for a campaign. This is restricted to users with role FUND_OWNER, STAFF, or ADMIN. | `POST /api/fundraising-goals` — `@PreAuthorize("FUND_OWNER","STAFF","ADMIN")` |

---

### 2.4 Staff

| ID | Requirement | API Endpoint or Note |
|----|-------------|----------------------|
| FR-S1 | A staff member has all the functional requirements of a User, except where the requirement is limited to “own data only”; staff may access data of other users when explicitly allowed. | Inherited from User. |
| FR-S2 | The system shall allow staff to view the list of all users in the system. | `GET /api/users` |
| FR-S3 | The system shall allow staff to view, update, delete, ban, and unban any user account. | `GET /api/users/{id}`, `PUT /api/users/{id}`, `DELETE /api/users/{id}`, `PUT /api/users/{id}/ban`, `PUT /api/users/{id}/unban` |
| FR-S4 | The system shall allow staff to view all bank accounts in the system. | `GET /api/bank-accounts/all` |
| FR-S5 | The system shall allow staff to submit or update KYC information on behalf of a user. | `POST /api/kyc/users/{userId}` and `PUT /api/kyc/users/{userId}` |
| FR-S6 | The system shall allow staff to view the KYC record of any user and to view the list of all pending KYC requests. | `GET /api/kyc/user/{id}` and `GET /api/kyc/pending` |
| FR-S7 | The system shall allow staff to approve or reject a KYC request by updating its status. | `PATCH /api/kyc/{id}/status` |
| FR-S8 | The system shall allow staff to update any campaign, not only those they own. | `PUT /api/campaigns/{id}` |
| FR-S9 | The system shall allow staff to mark a campaign as deleted (soft delete). | `PUT /api/campaigns/{id}/mark-deleted` |
| FR-S10 | The system shall allow staff to create, update, and delete fundraising goals. | `POST /api/fundraising-goals`, `PUT /api/fundraising-goals/{id}`, `DELETE /api/fundraising-goals/{id}` |
| FR-S11 | The system shall allow staff to view the list of all reports (flags) that are in PENDING status. | `GET /api/flags/pending` |
| FR-S12 | The system shall allow staff to resolve or dismiss a report by updating its status to RESOLVED or DISMISSED. | `PATCH /api/flags/{id}/review` |

---

### 2.5 Admin

| ID | Requirement | API Endpoint or Note |
|----|-------------|----------------------|
| FR-A1 | An admin has all the functional requirements of a Staff member. | Inherited from Staff. |
| FR-A2 | An admin has full authority over user management, KYC, campaigns, fundraising goals, and content moderation. In the current implementation, the scope is the same as Staff; the Admin role is kept separate so that in the future certain actions (for example, permanently deleting a user) may be restricted to Admin only. | Same endpoints as Staff; role kept for future differentiation |

---

## 3. Non-Functional Requirements

### 3.1 Security

| ID | Requirement |
|----|-------------|
| NFR-1 | The system shall use JWT-based authentication with two types of tokens: a short-lived access token and a long-lived refresh token. |
| NFR-2 | Tokens shall be stored in a secure manner. The use of httpOnly, secure, and SameSite attributes (or equivalent when using cookies) is required. Access and refresh tokens shall not be stored in browser localStorage, to reduce exposure to XSS. |
| NFR-3 | The API Gateway shall validate the JWT before routing the request to the appropriate microservice. |
| NFR-4 | The system shall enforce role-based access control. The supported roles are USER, FUND_OWNER, STAFF, and ADMIN. Authorization shall be enforced at the controller level using mechanisms such as `@PreAuthorize`. |
| NFR-5 | User passwords shall be hashed using BCrypt before storage. |
| NFR-6 | OTP shall be used for email verification and for password reset. The token returned after successful OTP verification shall be single-use and shall have an expiration time. |

### 3.2 Performance and Scalability

| ID | Requirement |
|----|-------------|
| NFR-7 | The backend shall follow a microservices architecture. The services include: Discovery Server (Eureka), API Gateway, Identity Service, Campaign Service, Feed Service, Media Service, and Moderation Service. |
| NFR-8 | Each microservice shall have its own database. The database-per-service pattern shall be used. |
| NFR-9 | The feed post list shall support pagination. The API shall accept parameters for page number, page size, and sort order. |
| NFR-10 | Media files shall be uploaded to Supabase Storage. Metadata (such as post ID, campaign ID, description) shall be stored in the Media Service database. |

### 3.3 Reliability and Operations

| ID | Requirement |
|----|-------------|
| NFR-11 | The API shall be stateless. Session data shall not be stored on the server. |
| NFR-12 | API documentation shall be provided via Swagger or OpenAPI. |
| NFR-13 | The system shall use a unified global exception handler. Error responses shall be returned in JSON format with a clear structure and message. |
| NFR-14 | The system shall be deployable using Docker Compose, including the Discovery Server, API Gateway, Identity Service, and other microservices. |

### 3.4 User Experience (Frontend)

| ID | Requirement |
|----|-------------|
| NFR-15 | The frontend shall be responsive and shall follow a mobile-first approach using Tailwind CSS. |
| NFR-16 | The frontend shall show loading indicators or skeleton screens when fetching data asynchronously. |
| NFR-17 | The frontend shall display error messages clearly to the user, using toasts or inline messages as appropriate. |

---

## 4. Summary: Actor vs. Capability Matrix (for Slides)

| Capability | Guest | User | Fund Owner | Staff | Admin |
|------------|:-----:|:----:|:----------:|:-----:|:-----:|
| Authentication (register, login, OTP, reset password, Google login) | Yes | Yes | Yes | Yes | Yes |
| View campaigns, fundraising goals, and followers (public data) | Yes | Yes | Yes | Yes | Yes |
| Profile, avatar, bank account, and KYC (own data only) | No | Yes | Yes | Yes | Yes |
| Follow or unfollow campaigns; create, read, update, and delete own feed posts | No | Yes | Yes | Yes | Yes |
| Submit a report (flag) against a campaign or post | No | Yes | Yes | Yes | Yes |
| Upload media | No | Yes | Yes | Yes | Yes |
| Create a campaign | No | Yes | Yes | Yes | Yes |
| Update a campaign; create a fundraising goal | No | No | Yes | Yes | Yes |
| Soft-delete a campaign; update or delete a fundraising goal | No | No | No | Yes | Yes |
| User management (list all users, ban, unban, delete) | No | No | No | Yes | Yes |
| KYC (submit, approve, reject, view pending) | No | No | No | Yes | Yes |
| View all bank accounts | No | No | No | Yes | Yes |
| Moderation (view pending reports, resolve or dismiss) | No | No | No | Yes | Yes |

---

## 5. Slide Outline

- **Slide 1:** Project name and the five actors (Table in Section 1).
- **Slide 2–3:** Functional requirements for Guest and User (Sections 2.1 and 2.2). You may highlight two or three items per actor.
- **Slide 4:** Functional requirements for Fund Owner, Staff, and Admin (Sections 2.3–2.5).
- **Slide 5:** Non-functional requirements (Section 3): Security, Performance, Operations, and User Experience.
- **Slide 6:** Actor vs. Capability matrix (Table in Section 4).

---

*Source: `Docs/functional-nonfunctional-requirements-en.md`*
