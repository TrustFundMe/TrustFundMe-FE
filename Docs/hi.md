### III. Software Requirements Specification — Staff & Admin Functions (3.21, 3.23–3.27)

> Format follows the Planbook template: Function trigger, Actor, Function description, Picture (Screen), User Input, Action, System Validation, Application Scope, Business Rules.

---

## 3.23 Manage Staff Dashboard

### 3.23.1 View Dashboard

**Function trigger:** Admin needs to see system overview and key metrics.

**Actor:** Admin

**Function description:**  
This function displays an overview dashboard for the admin, including key statistics about campaigns, donations, users, and system health. It serves as the entry point for the Admin module.

**Screen layout:** Picture – Admin Dashboard (cards + charts for KPIs)

**Function details:**

- **User Input:**
  - `View dashboard` (default when Admin logs into Admin module).
  - Click on **KPI cards** (e.g. Total Active Campaigns, Total Donations, Pending Withdrawals, New Users, Pending KYC).
  - Optional: Change **time range filter** (Today / 7 days / 30 days / Custom).
- **Action:**
  - Admin opens Admin module → system loads dashboard by default.
  - Admin clicks KPI cards to **navigate** to the corresponding detail list (e.g. campaigns list, withdrawal requests list, verification requests list).

**System Validation:**

- **Success:**
  - System loads and displays dashboard metrics, such as:
    - Total number of campaigns (Active / Suspended / Completed).
    - Total donations amount in selected period.
    - Number of pending withdrawal requests.
    - Number of pending fund-owner verification requests.
    - Number of active users, new signups in selected period.
  - Clicking a card navigates to the relevant management screen with pre-applied filter (e.g. "Pending withdrawals").
- **Fail:**
  - If data cannot be loaded, system shows:
    - A generic error message (e.g. “Cannot load dashboard data. Please try again.”).
    - If partial data is available, show partial metrics and mark affected cards with an error state or placeholder.

**Application Scope:** TrustFundMe web application — Admin module (Admin Dashboard).

**Business Rules:**

- **BR-3.23.1-01:** Only users with Admin role can access the Admin Dashboard.
- **BR-3.23.1-02:** All KPIs are calculated from the latest committed data in the backend.
- **BR-3.23.1-03:** Default time range is the last 30 days; Admin can change it where supported.

---

## 3.22 Manage Chatting

### 3.22.1 Chat With Customer

**Function trigger:** Staff needs to communicate with customers (donors or fund-owners) via chat.

**Actor:** Staff

**Function description:**  
This function allows staff to view and participate in chat conversations with customers (donors or fund-owners) for support, clarification, or dispute resolution.

**Screen layout:** Picture – Staff Chat Screen (conversation list + message window)

**Function details:**

- **User Input:**
  - Select a **conversation** from conversation list (by customer name, campaign, ticket ID, etc.).
  - Type **message content** into text input (required when sending).
  - Optional:
    - Attach **image / file** (if supported).
    - Use **search** to filter conversations (by name, campaign, status).
- **Action:**
  - Staff opens Staff Chat screen → system displays list of recent conversations.
  - Staff clicks a conversation → system loads message history.
  - Staff types message and clicks **Send** to respond.
  - Optionally, staff starts a new conversation from other screens (e.g. from campaign, verification, or support ticket detail).

**System Validation:**

- **Success:**
  - System loads conversation list and history for selected conversation.
  - Sending message:
    - System saves message and delivers it to target customer.
    - UI shows new message in timeline; optionally updates “last message” preview in conversation list.
- **Fail:**
  - If conversation cannot be loaded, system shows error message and does not display messages.
  - If message send fails, system shows error (e.g. “Message could not be sent. Please try again.”) and does not mark message as delivered.

**Application Scope:** TrustFundMe web application — Staff / Admin module: Chat with Customer.

**Business Rules:**

- **BR-3.22.1-01:** Only Staff/Admin accounts can access the staff chat interface.
- **BR-3.22.1-02:** Chat history is persisted and can be audited by Admin (for compliance).
- **BR-3.22.1-03:** Staff cannot impersonate customers; messages are clearly labeled as “Staff”.

---

## 3.23 Manage Fund-Owner Campaign

### 3.23.1 View Campaigns List

**Function trigger:** Staff/Admin needs to view all campaigns created by fund-owners.

**Actor:** Staff / Admin

**Function description:**  
Displays a list of campaigns with key information and filters for review, monitoring, and moderation.

**Screen layout:** Picture – Campaigns List (table with filters)

**Function details:**

- **User Input:**
  - Filters: status (Pending, Active, Suspended, Completed), fund-owner, date range, category.
  - Search by campaign name, ID, or fund-owner name.
  - Pagination controls (page number, page size).
- **Action:**
  - Staff opens Campaigns List screen.
  - Staff applies filters or search and navigates through pages.
  - Staff clicks a campaign row to open campaign detail.

**System Validation:**

- **Success:** System displays filtered campaign list with columns such as Campaign ID, Name, Fund-owner, Status, Total Donations, Created Date.
- **Fail:** On failure to retrieve data, show error message and empty table.

**Application Scope:** TrustFundMe — Staff/Admin module, Campaigns List screen.

**Business Rules:**

- **BR-3.23.1-01:** Only Staff/Admin can access full campaigns list; fund-owners see only their own campaigns in fund-owner module.
- **BR-3.23.1-02:** Default list shows campaigns sorted by newest created date.

---

### 3.23.2 View Campaign Detail

**Function trigger:** Staff selects a campaign from the list to review.

**Actor:** Staff / Admin

**Function description:**  
Shows detailed information of a single campaign including story, target amount, progress, status, fund-owner information, and key metrics.

**Screen layout:** Picture – Campaign Detail (Staff view)

**Function details:**

- **User Input:** None required besides selection; optional navigation tabs (Overview, Donations, Withdrawals, Evidence, Activity).
- **Action:** Staff clicks a campaign → system loads detail with tabs.

**System Validation:**

- **Success:** System displays campaign details, including:
  - Basic info: title, description, category, target amount, raised amount.
  - Timeline: start date, end date.
  - Fund-owner profile & verification status.
- **Fail:** If campaign not found or access denied, show appropriate message.

**Application Scope:** TrustFundMe — Staff/Admin Campaign Detail.

**Business Rules:**

- **BR-3.23.2-01:** Staff can view all campaigns; Admin may see additional internal data (e.g. audit logs).

---

### 3.23.3 View Withdrawal Requests List

**Function trigger:** Staff needs to review fund withdrawal requests for campaigns.

**Actor:** Staff / Admin

**Function description:**  
Displays a list of withdrawal requests submitted by fund-owners.

**Screen layout:** Picture – Withdrawal Requests List

**Function details:**

- **User Input:**
  - Filters: status (Pending, Approved, Rejected), campaign, fund-owner, date range.
  - Search by withdrawal ID or campaign name.
- **Action:** Staff opens list, applies filters, and clicks a request to see details.

**System Validation:**

- **Success:** List displays withdrawal ID, campaign, amount, status, requested date, requester.
- **Fail:** On error loading data, show error message.

**Application Scope:** TrustFundMe — Staff/Admin Withdrawal Requests List.

**Business Rules:**

- **BR-3.23.3-01:** Only Staff/Admin can access withdrawal requests list.
- **BR-3.23.3-02:** Pending requests should be clearly highlighted.

---

### 3.23.4 View Withdrawal Requests Detail

**Function trigger:** Staff selects a specific withdrawal request.

**Actor:** Staff / Admin

**Function description:**  
Displays full details of a withdrawal request for decision-making.

**Screen layout:** Picture – Withdrawal Request Detail

**Function details:**

- **User Input:** None required; optional notes field for Staff decision.
- **Action:** Staff clicks a specific request from the list → system shows:
  - Campaign info.
  - Requested amount and remaining balance.
  - Reason provided by fund-owner.
  - Attached evidence (if any).

**System Validation:**

- **Success:** Full withdrawal request data is displayed correctly.
- **Fail:** If record is missing or inaccessible, show appropriate error.

**Application Scope:** TrustFundMe — Staff/Admin Withdrawal Detail.

**Business Rules:**

- **BR-3.23.4-01:** Only Staff/Admin assigned with finance/moderation rights can approve/reject.

---

### 3.23.5 Approve Withdrawal Request

**Function trigger:** Staff decides to approve a pending withdrawal request.

**Actor:** Staff / Admin (with appropriate role)

**Function description:**  
Allows Staff to approve a withdrawal, updating campaign financial state and triggering payout flow.

**Screen layout:** Picture – Withdrawal Request Detail with Approve button

**Function details:**

- **User Input:**
  - Click **Approve** button.
  - Optional: Add internal note/comment.
- **Action:** Staff confirms approval; system validates that:
  - Request is still in Pending status.
  - Campaign has enough available balance.

**System Validation:**

- **Success:**
  - Request status changes to Approved.
  - Campaign balance is updated.
  - System may trigger payout process (integration with payment provider).
- **Fail:**
  - If validation fails (e.g. insufficient balance, already processed), show error message and do not approve.

**Application Scope:** TrustFundMe — Staff/Admin Withdrawal Detail.

**Business Rules:**

- **BR-3.23.5-01:** Only Staff with authorization can approve.
- **BR-3.23.5-02:** A withdrawal request can be approved only once.

---

### 3.23.6 Reject Withdrawal Request

**Function trigger:** Staff decides to reject a pending withdrawal request.

**Actor:** Staff / Admin

**Function description:**  
Allows Staff to reject a withdrawal with a reason.

**Screen layout:** Picture – Withdrawal Request Detail with Reject button

**Function details:**

- **User Input:**
  - Click **Reject** button.
  - Required **Rejection reason** text.
- **Action:** Staff submits rejection; system validates that request is still Pending.

**System Validation:**

- **Success:** Status changes to Rejected and reason is stored; fund-owner is notified.
- **Fail:** If invalid state, show error message.

**Application Scope:** TrustFundMe — Staff/Admin Withdrawal Detail.

**Business Rules:**

- **BR-3.23.6-01:** Rejection reason is mandatory.
- **BR-3.23.6-02:** Rejected requests cannot be approved later (new request must be created).

---

### 3.23.7 View Donation & Fund Usage Summary

**Function trigger:** Staff wants to see financial overview per campaign.

**Actor:** Staff / Admin

**Function description:**  
Shows summarized information about total donations received and funds used for a campaign.

**Screen layout:** Picture – Donation & Fund Usage Summary tab

**Function details:**

- **User Input:** Select campaign (from list or detail screen) and optional time range.
- **Action:** Staff opens Summary tab; system fetches aggregate data.

**System Validation:**

- **Success:** System shows:
  - Total donations.
  - Total approved withdrawals.
  - Remaining balance.
  - Optional charts (timeline of donations, withdrawals).
- **Fail:** If data load fails, show error message and blank summary.

**Application Scope:** TrustFundMe — Campaign Financial Summary (Staff/Admin).

**Business Rules:**

- **BR-3.23.7-01:** Numbers must match underlying transaction records.

---

### 3.23.8 View Fund Usage Evidence

**Function trigger:** Staff wants to verify how withdrawn funds are used.

**Actor:** Staff / Admin

**Function description:**  
Displays uploaded evidence (images, documents) for fund usage related to a campaign and its withdrawals.

**Screen layout:** Picture – Evidence Gallery/List

**Function details:**

- **User Input:** Select campaign and/or withdrawal; click evidence item to view.
- **Action:** Staff opens Evidence tab or section; system shows thumbnails/list and allows viewing full evidence.

**System Validation:**

- **Success:** System loads and displays associated evidence items; Staff can open each in detail view.
- **Fail:** If evidence not available or cannot be loaded, show appropriate message.

**Application Scope:** TrustFundMe — Staff/Admin Evidence View.

**Business Rules:**

- **BR-3.23.8-01:** Only evidence approved/attached to the campaign is displayed.
- **BR-3.23.8-02:** Original media must be stored securely and not modifiable by Staff.

---

### 3.23.9 Suspend Campaign

**Function trigger:** Staff detects issues or policy violations and needs to suspend a campaign.

**Actor:** Staff / Admin

**Function description:**  
Allows Staff to suspend a campaign, preventing new donations while preserving data.

**Screen layout:** Picture – Campaign Detail with Suspend button

**Function details:**

- **User Input:**
  - Click **Suspend campaign**.
  - Required **reason** text.
- **Action:** Staff confirms suspension; system checks that campaign is Active.

**System Validation:**

- **Success:**
  - Campaign status changes to Suspended.
  - Campaign is no longer open for new donations.
  - Fund-owner and possibly followers are notified.
- **Fail:** If campaign cannot be suspended (already ended or suspended), show error.

**Application Scope:** TrustFundMe — Staff/Admin Campaign Detail.

**Business Rules:**

- **BR-3.23.9-01:** Only Admin or authorized moderator can suspend campaigns.
- **BR-3.23.9-02:** Suspension reason is logged for audit.

---

### 3.23.10 Resume Campaign

**Function trigger:** Conditions causing suspension are resolved; Staff wants to re-open campaign.

**Actor:** Staff / Admin

**Function description:**  
Allows Staff to resume a suspended campaign, allowing donations again.

**Screen layout:** Picture – Campaign Detail with Resume button

**Function details:**

- **User Input:** Click **Resume campaign**; optional note.
- **Action:** Staff confirms; system validates that campaign is Suspended and still within valid time period.

**System Validation:**

- **Success:** Status changes from Suspended back to Active; donations are allowed again.
- **Fail:** If campaign cannot be resumed (e.g. already ended), system shows message.

**Application Scope:** TrustFundMe — Staff/Admin Campaign Detail.

**Business Rules:**

- **BR-3.23.10-01:** Only authorized Staff/Admin can resume a campaign.
- **BR-3.23.10-02:** All status changes are audited.

---

## 3.24 Manage Feed Post (Staff)

### 3.24.1 View Feed Post List

**Function trigger:** Staff needs to review all feed posts in the system.

**Actor:** Staff / Admin

**Function description:**  
Displays list of feed posts for moderation and support (including those reported or hidden).

**Screen layout:** Picture – Feed Post List (Staff view)

**Function details:**

- **User Input:**
  - Filters: status (Visible, Hidden), report status (Reported / Not reported), campaign, fund-owner.
  - Search by post ID, title/summary, or campaign.
- **Action:** Staff opens Feed Post List; applies filters; clicks post to view details.

**System Validation:**

- **Success:** System shows list with key fields (Post ID, Campaign, Author, Status, Report count, Created date).
- **Fail:** If load fails, show error.

**Application Scope:** TrustFundMe — Staff/Admin Feed Post List.

**Business Rules:**

- **BR-3.24.1-01:** Only Staff/Admin can access this management list.

---

### 3.24.2 View Feed Post Details

**Function trigger:** Staff selects a specific feed post.

**Actor:** Staff / Admin

**Function description:**  
Shows full content of a feed post, including images, comments summary, and report history.

**Screen layout:** Picture – Feed Post Detail (Staff moderation view)

**Function details:**

- **User Input:** None required; optional navigation for related campaign and reports.
- **Action:** Staff clicks from list; system loads and shows the full post.

**System Validation:**

- **Success:** System displays post text, images, author, campaign, visibility, and report info.
- **Fail:** If post not found, show message.

**Application Scope:** TrustFundMe — Staff/Admin Feed Post Detail.

**Business Rules:**

- **BR-3.24.2-01:** Staff can see posts even if hidden from public.

---

### 3.24.3 Hide Feed Post

**Function trigger:** Staff decides to hide a problematic feed post from public view.

**Actor:** Staff / Admin

**Function description:**  
Allows Staff to change feed post status to Hidden, making it invisible to normal users while keeping it for audit.

**Screen layout:** Picture – Feed Post Detail with Hide button

**Function details:**

- **User Input:**
  - Click **Hide** button.
  - Required **reason** for hiding.
- **Action:** System validates current status (must be Visible) and updates post to Hidden.

**System Validation:**

- **Success:** Post status becomes Hidden; post no longer appears to normal users; audit log is updated.
- **Fail:** If already Hidden or cannot be updated, show error.

**Application Scope:** TrustFundMe — Staff/Admin Feed Post Detail.

**Business Rules:**

- **BR-3.24.3-01:** Only authorized Staff/Admin can hide posts.
- **BR-3.24.3-02:** Reason must be stored for moderation history.

---

### 3.24.4 Restore Feed Post

**Function trigger:** Staff decides to restore a previously hidden feed post.

**Actor:** Staff / Admin

**Function description:**  
Allows Staff to set a Hidden post back to Visible when issue is resolved.

**Screen layout:** Picture – Feed Post Detail with Restore button

**Function details:**

- **User Input:** Click **Restore**; optional note.
- **Action:** System validates status (must be Hidden) and updates to Visible.

**System Validation:**

- **Success:** Post is visible again to users according to its visibility rules.
- **Fail:** If status change is invalid, show error.

**Application Scope:** TrustFundMe — Staff/Admin Feed Post Detail.

**Business Rules:**

- **BR-3.24.4-01:** All restore actions are logged.

---

## 3.25 Fund-owner Verification

### 3.25.1 View Fund-owner Verification Requests

**Function trigger:** Staff wants to see all pending/processed KYC/verification requests from fund-owners.

**Actor:** Staff / Admin

**Function description:**  
Shows list of verification requests submitted by fund-owners for identity and eligibility checks.

**Screen layout:** Picture – Fund-owner Verification Requests List

**Function details:**

- **User Input:**
  - Filters: status (Pending, Approved, Rejected), date range.
  - Search by fund-owner name, email, or request ID.
- **Action:** Staff opens list, filters/searches, and clicks request to view details.

**System Validation:**

- **Success:** System displays requests with main info: Fund-owner, type (individual/organization), status, submission date.
- **Fail:** If load fails, show error.

**Application Scope:** TrustFundMe — Staff/Admin Fund-owner Verification List.

**Business Rules:**

- **BR-3.25.1-01:** Only Staff responsible for verification can access this list.

---

### 3.25.2 View Donor KYC Details

**Function trigger:** Staff selects a verification request.

**Actor:** Staff / Admin

**Function description:**  
Displays detailed KYC information and documents from the fund-owner/donor to support verification decisions.

**Screen layout:** Picture – KYC Detail Screen

**Function details:**

- **User Input:** None required; optional internal notes.
- **Action:** Staff opens KYC detail; system shows personal info fields and uploaded documents (ID, bank account, certificates).

**System Validation:**

- **Success:** All submitted information and media files are displayed clearly.
- **Fail:** If documents cannot be loaded, system shows appropriate warnings.

**Application Scope:** TrustFundMe — Staff/Admin KYC Detail.

**Business Rules:**

- **BR-3.25.2-01:** Sensitive data must be displayed only to authorized Staff and handled according to privacy regulations.

---

### 3.25.3 Approve Fund-owner KYC Verification

**Function trigger:** Staff decides to approve a KYC request.

**Actor:** Staff / Admin

**Function description:**  
Approves fund-owner verification, upgrading their status to allow creating or managing campaigns.

**Screen layout:** Picture – KYC Detail with Approve button

**Function details:**

- **User Input:**
  - Click **Approve**.
  - Optional approval note.
- **Action:** System validates that request is Pending and updates fund-owner status to Verified.

**System Validation:**

- **Success:** Status changes to Approved; fund-owner account updated; notification sent.
- **Fail:** If already processed or invalid, show error and prevent re-approval.

**Application Scope:** TrustFundMe — Staff/Admin KYC Detail.

**Business Rules:**

- **BR-3.25.3-01:** Only authorized Staff/Admin can approve KYC.
- **BR-3.25.3-02:** Approval logs must capture approver and timestamp.

---

### 3.25.4 Reject Fund-owner KYC Verification

**Function trigger:** Staff decides to reject a KYC request.

**Actor:** Staff / Admin

**Function description:**  
Rejects a fund-owner verification request, preventing them from creating campaigns until resubmission.

**Screen layout:** Picture – KYC Detail with Reject button

**Function details:**

- **User Input:**
  - Click **Reject**.
  - Required **rejection reason**.
- **Action:** System validates that request is Pending and updates status to Rejected.

**System Validation:**

- **Success:** Status becomes Rejected; fund-owner is notified with reason.
- **Fail:** If not in Pending state, system shows error.

**Application Scope:** TrustFundMe — Staff/Admin KYC Detail.

**Business Rules:**

- **BR-3.25.4-01:** Rejection reason is mandatory and must be recorded.
- **BR-3.25.4-02:** Rejected fund-owner may submit new verification in the future with updated documents.

---

## 3.21 Manage Schedule

### 3.21.1 Create Appointment Schedule

**Function trigger:** Staff/Admin wants to create appointment slots (e.g. for calls, meetings, verification sessions).

**Actor:** Staff / Admin

**Function description:**  
Allows Staff to create schedules/appointments with fund-owners or other stakeholders.

**Screen layout:** Picture – Schedule Calendar / Appointment Form

**Function details:**

- **User Input:**
  - Date and time (start, end).
  - Participant (fund-owner/customer).
  - Channel (online/offline, meeting link, location).
  - Purpose/notes.
- **Action:** Staff fills the form and clicks **Create**.

**System Validation:**

- **Success:** New appointment is saved and shown in calendar/list; invitation/notification may be sent.
- **Fail:** If validation fails (time conflict, missing required fields), show relevant messages.

**Application Scope:** TrustFundMe — Staff/Admin Schedule Management.

**Business Rules:**

- **BR-3.21.1-01:** System should prevent overlapping schedules for the same staff member (optional, depending on business rule).

---

### 3.21.2 Update Appointment Schedule

**Function trigger:** Staff/Admin needs to modify an existing appointment.

**Actor:** Staff / Admin

**Function description:**  
Allows editing or rescheduling an existing appointment (time, participants, notes).

**Screen layout:** Picture – Edit Appointment Modal/Form

**Function details:**

- **User Input:**
  - Select existing appointment from list/calendar.
  - Edit fields (date/time, channel, notes, status).
- **Action:** Staff saves changes; system validates new time and details.

**System Validation:**

- **Success:** Changes are saved; updated appointment is shown; notifications may be sent to affected participants.
- **Fail:** If invalid (e.g. past time, conflicts), show error and do not apply change.

**Application Scope:** TrustFundMe — Staff/Admin Schedule Management.

**Business Rules:**

- **BR-3.21.2-01:** Updates close to start time may be restricted or require additional confirmation (if business requires).
- **BR-3.21.2-02:** All changes should be audit-logged (who changed what and when).

## 4. Non-Functional Requirements

This section describes the external interfaces and quality attributes required for the TrustFundMe web application (including Admin, Staff, Fund-owner, and User modules).

### 4.1 External Interfaces

- Web Browser Interface  
  The system shall support modern browsers: latest 2 versions of Chrome, Firefox, Edge, and Safari.  
  The UI shall be responsive and usable on devices with screen widths from 360px (mobile) to 1920px (desktop).  
  The system shall conform to common web usability and accessibility guidelines (e.g., WCAG 2.1 AA where practical).

- Backend Service Interfaces  
  The frontend shall communicate with backend services through RESTful APIs using HTTPS.  
  All APIs shall use JSON as the primary request/response format.  
  Authentication and authorization shall be handled via JWT access/refresh token flow using HttpOnly secure cookies.

- Database Interfaces  
  Backend services shall access relational databases (e.g., PostgreSQL/MySQL) through an ORM or repository layer.  
  Direct SQL statements shall be parameterized to prevent SQL injection.

- Third-Party Services  
  Payment gateway: Integration via secure APIs (HTTPS, signed requests) for donation and payout flows.  
  Email/SMS provider: Used for verification codes, notification emails, and status updates.  
  Object storage / CDN: Used to store and serve media files (e.g., evidence images, feed post images). Access shall be via signed URLs or public buckets with least-privilege configuration.

### 4.2 Quality Attributes

4.2.1 Usability  
This section includes all non-functional requirements that affect usability.

- Training & Learnability  
  A normal user should become productive with basic operations (browse campaigns, donate, view feed posts) within 30 minutes of first use, without formal training.  
  A fund-owner or staff user should become productive with their day-to-day operations (manage campaigns, review requests, moderate feed) within 2 hours of guided onboarding.

- Task Efficiency  
  Common user tasks shall be completable within the following target times under normal network conditions:  
  – Browse and open a campaign detail: ≤ 5 seconds from home page.  
  – Complete a standard donation (from campaign page to confirmation): ≤ 2 minutes for a new user, ≤ 1 minute for a returning user.  
  – Staff review and decision (approve/reject) on a withdrawal request: ≤ 3 minutes given complete information.  
  Critical actions (donation, withdrawal approval, KYC approval) must be clearly labeled and require explicit confirmation UI to avoid mistakes.

- Consistency & Standards  
  The system shall use a consistent design system (colors, typography, button styles) throughout all modules.  
  Interaction patterns shall follow common web UX standards (e.g., clear navigation, visible feedback on actions, consistent icons and labels).  
  Forms and error messages shall use concise, user-friendly language and highlight invalid fields clearly.

- Accessibility  
  All interactive elements shall be usable with keyboard navigation.  
  Non-text content (e.g., images used as content) shall have appropriate alt text where relevant.  
  Color usage shall maintain sufficient contrast between text and background for normal content.

4.2.2 Reliability  
This section specifies requirements for reliability of the system.

- Availability  
  The system shall target an availability of ≥ 99.5% per month for core user functionalities (view campaigns, donate, view feed posts).  
  Planned maintenance windows shall be announced in advance and kept outside of peak hours where possible.

- Mean Time Between Failures (MTBF)  
  For production deployments, the MTBF for critical services (authentication, donation processing, campaign management) shall be at least 500 hours.  
  Non-critical auxiliary services (reporting, analytics) may have lower MTBF as long as they do not affect donation and campaign flows.

- Mean Time To Repair (MTTR)  
  For critical incidents that block donations or access to campaigns, MTTR shall be ≤ 2 hours from detection to restoration of service.  
  For non-critical issues, MTTR shall be ≤ 8 working hours.

- Data Accuracy & Integrity  
  All financial calculations (donation totals, withdrawal amounts, remaining balances) shall be accurate to 2 decimal places in the configured currency.  
  Transactions shall be stored in an atomic and consistent manner; partial updates to financial records are not allowed.

- Defect Rate  
  For production releases, the target maximum number of critical bugs (causing data loss or inability to use major functionality) is ≤ 1 per release.  
  Overall defect rate shall be targeted at ≤ 1 bug per 1,000 lines of code (KLOC) for critical backend components.

- Error Handling  
  The system shall fail gracefully: user-facing errors shall be clear and non-technical; sensitive details (e.g., stack traces) must never be shown to end users.  
  All unhandled exceptions and failed critical operations shall be logged to a centralized logging system for later analysis.

4.2.3 Performance  
The system’s performance characteristics are outlined in this section.

- Response Time  
  For 95% of requests under normal load:  
  – Campaign list and detail pages shall respond in ≤ 2 seconds (server time).  
  – Feed post list and detail shall respond in ≤ 2.5 seconds including loading images (excluding network latency to CDN).  
  – Admin/Staff dashboard and list screens shall respond in ≤ 3 seconds.  
  Authentication (login, token refresh) operations shall complete in ≤ 1.5 seconds.

- Throughput  
  The system shall support at least:  
  – 100 concurrent active users performing read-heavy operations (browsing campaigns, viewing feeds).  
  – 20 concurrent donation or withdrawal-related transactions per minute without significant degradation.  
  The architecture shall allow horizontal scaling of backend services and databases to handle higher throughput in the future.

- Capacity  
  The system shall support at least 100,000 registered user accounts, 10,000 active campaigns, and storage for at least 1 million media files (feed images, evidence images, avatars), assuming average size of 1 MB per image (or an equivalent capacity in the chosen storage).

- Resource Utilization  
  Under normal expected load, average CPU utilization on application servers should remain below 70%, and memory utilization below 75%.  
  Caching (at application level or via reverse proxy) should be used for frequently accessed resources (e.g., campaign list, home page sections) to reduce database and service load.

4.2.4 Security, Maintainability, and Scalability  
This sub-section groups additional non-functional requirements.

- Security  
  All external communication shall use HTTPS with modern TLS configurations.  
  Authentication shall use short-lived access tokens (15–30 minutes) and long-lived refresh tokens (7–30 days) stored in HttpOnly, Secure, SameSite=Strict cookies.  
  Passwords and sensitive data shall be stored using industry-standard hashing algorithms (e.g., bcrypt/argon2 with proper cost factors).  
  Authorization shall be role-based (e.g., User, Fund-owner, Staff, Admin) and enforced at API level.  
  Inputs shall be validated and sanitized to protect against XSS, SQL injection, CSRF, and other common web vulnerabilities.  
  Access to evidence/media files shall follow least-privilege principles (signed URLs or bucket policies).

- Maintainability  
  Codebase shall follow a modular architecture (separate services/modules for auth, feed, campaign, payment, etc.).  
  Coding standards, linting, and formatting rules shall be enforced via automated tools (e.g., ESLint, Prettier).  
  Unit tests shall be written for core business logic; critical flows shall be covered by integration tests.  
  Continuous Integration (CI) shall run tests and static analysis on every merge into main branches.

- Scalability  
  The system shall be designed to scale horizontally at the application tier (multiple instances / containers behind a load balancer).  
  Database design shall consider indexing and query optimization for high-traffic tables (e.g., donations, campaigns, feed posts).  
  Media storage shall use scalable object storage and CDN to handle increasing volume of images/evidence.  
  The architecture should allow incremental addition of new services (e.g., recommendation engine, advanced analytics) without major refactoring.

