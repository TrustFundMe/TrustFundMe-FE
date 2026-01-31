# III. Software Requirements Specification — 3.2 Common Functions, 3.3 Logout, 3.4.1 View Profile, 3.5.1, 3.6.1

> Format follows the Planbook template: Function trigger, Actor, Function description, Picture (Screen), User Input, Action, System Validation, Application Scope, Business Rules. Copy into [Report — III. SRS](https://docs.google.com/document/d/1GFLKnBI4-vYIZ_dhG2hnNRWx_B8LSbZv/edit).

---

## 3.2 Common Functions

### 3.2.1 Login

**Function trigger:** Guest sends a request to sign in to the system.

**Actor:** Guest

**Function description:** This function allows users to sign in to the system with email and password, or with Google. The flow has two steps: (1) user enters email and clicks "Continue" so the system can check if the account exists; (2) if the account exists, user enters password and clicks "Sign in". If the account does not exist, the system shows the registration form.

**Screen Layout (Visual Reference)**

*[Insert Sign-in screenshot here]*

**Picture – Screen Login (Step 1: Email entry)**  
Screen includes: TrustFundMe logo, text "Sign in to TrustFundMe or sign up to continue", "Continue with Google" button, "or" divider, **Email** input, **Continue** button, "Back to Home" link. White background, rounded card.

**Picture – Screen Login (Step 2: Password entry)**  
After email exists: **Email** field (read-only), **Password** field (with show/hide toggle), "Forgot password?" link, "Change email" link, **Sign in** button, "Don't have an account?" text and "Sign up" button.

---

**Function Details (Step-by-Step Interaction)**

**User Input** – Guest enters the following:

- **Email:** Text input (step 1).
- **Password:** Text input (step 2, when email already exists).
- **Continue:** Button (step 1 – check email).
- **Sign in:** Button (step 2 – submit email and password to sign in).
- **Continue with Google:** Button (step 1 – sign in with Google, when configured).

**Action:** Guest clicks "Continue" (step 1), then enters password and clicks "Sign in" (step 2). Or clicks "Continue with Google" at step 1.

**System Validation:** The system validates and processes:

- **Success (Sign in):** System returns access token and refresh token (httpOnly cookie), redirects to home "/" or "/admin", "/staff" depending on role.
- **Fail (Sign in):** System displays an error message (e.g. "Invalid email or password. Please try again.") in a red box on the form.
- **Success (Google):** On successful Google sign-in, redirects to "/".
- **Fail (Google):** Displays "Google sign-in failed. Please try again."

**Application Scope:** This function is used on the TrustFundMe / Danbox web application (Next.js, responsive).

**Business Rules:** BR-01 (JWT authentication, access and refresh token), BR-02 (passwords hashed with BCrypt), BR-03 (tokens must not be stored in localStorage; use httpOnly cookies). *(See also 3.5.1.)*

---

### 3.2.2 Register

**Function trigger:** Guest submits a request to register a new account (after entering email on the Sign-in screen and the system indicates the email does not exist).

**Actor:** Guest

**Function description:** This function allows users to register an account with First Name, Last Name, Email, and Password. Password must meet: minimum 12 characters, at least 1 uppercase, 1 lowercase, 1 number, 1 symbol. After successful registration, the system redirects to the verify-email page with OTP.

**Screen Layout (Visual Reference)**

*[Insert Sign-up screenshot here]*

**Picture – Screen Register**  
Form includes: **First Name**, **Last Name**, **Email Address**, **Password** (with show/hide toggle), panel "Your password must have at least:" (minimum 12 characters, 1 uppercase, 1 lowercase, 1 number, 1 symbol), **Sign up** button, "Back to email" button.

---

**Function Details (Step-by-Step Interaction)**

**User Input:**

- **First Name:** Text input.
- **Last Name:** Text input.
- **Email Address:** Text input (email format).
- **Password:** Text input (meeting password rules).
- **Sign up:** Button.

**Action:** Guest fills in First Name, Last Name, Email, Password (meeting requirements) and clicks "Sign up".

**System Validation:**

- **Success:** Creates user, sends OTP (if applicable), redirects to `/auth/verify-email?email=...`.
- **Fail:** Displays error (e.g. "This email is already registered. Please sign in instead.", "Password does not meet security requirements.", "Registration failed. Please check your details and try again.").

**Application Scope:** Used on the TrustFundMe / Danbox web application.

**Business Rules:** BR-02 (passwords hashed with BCrypt), BR-04 (password format: 12+ characters, uppercase, lowercase, number, symbol), BR-05 (OTP for email verification; verify-otp token is single-use and time-limited). *(See 3.5.1.)*

---

## 3.3 Logout

### 3.3.1 Logout

**Function trigger:** A logged-in user sends a request to sign out of the system.

**Actor:** User (any role: User, Fund Owner, Staff, Admin)

**Function description:** This function allows a logged-in user to sign out. The system revokes the refresh token (on the backend when the API exists), clears the access and refresh token cookies, and redirects the user to the home page or sign-in page. Logout is triggered from the user menu in the header (e.g. "Sign Out" in UserDropdown or UserMenuMobile) or from the "Logout" button in Admin/Staff layouts.

**Screen Layout (Visual Reference)**

*[Insert screenshot of user menu with "Sign Out" option here]*

**Picture – Screen (User menu with Sign Out)**  
The control is in the header/navigation: user avatar or name opens a dropdown (or mobile drawer) with "Sign Out" (or "Logout"). There is no dedicated full-screen for logout; the action is a single click.

---

**Function Details (Step-by-Step Interaction)**

**User Input:**

- **Sign Out / Logout:** Button or menu item in the user menu (dropdown or mobile drawer).

**Action:** User opens the user menu (click on avatar or name) and clicks "Sign Out" or "Logout".

**System Validation:**

- **Success:** Backend revokes the refresh token (if `POST /api/auth/logout` is called); frontend clears auth state and cookie. User is redirected to "/" or "/sign-in".
- **Fail:** If the logout API fails, the frontend still clears local auth state and cookies so the user is effectively signed out; may redirect to "/" or "/sign-in".

**Application Scope:** TrustFundMe / Danbox web application (header user menu, Admin/Staff sidebar).

**Business Rules:** BR-01, BR-03 (revoke refresh token when stored on backend; clear httpOnly cookies). *(See also 3.5.1.)*

---

## 3.4 View Profile

### 3.4.1 View Profile

**Function trigger:** A logged-in user navigates to the profile page to view their own profile information.

**Actor:** User (any role: User, Fund Owner, Staff, Admin)

**Function description:** This function allows a logged-in user to view their own profile. The page displays: profile picture (avatar), full name, email address, phone number, and email verification status. The user can click "Edit" to switch to edit mode (update profile or avatar). Quick-access links to My Campaigns, Your Impact, and Wallet are shown. The profile page is protected; unauthenticated users are redirected to sign-in.

**Screen Layout (Visual Reference)**

*[Insert Profile page screenshot here]*

**Picture – Screen Profile (View mode)**  
Screen includes: **Edit** button (top right), **Profile Picture** (avatar, with fallback initials), label–value rows for **Full Name**, **Email Address**, **Phone Number**, **Email verified** (Yes/No), and a "Quick access" section with links to **My Campaigns**, **Your Impact**, **Wallet**. White card, bordered layout.

---

**Function Details (Step-by-Step Interaction)**

**User Input:**

- **Edit:** Button (switches to edit mode; edit flow may be documented separately).
- **My Campaigns / Your Impact / Wallet:** Links (navigate to the corresponding account pages).

**Action:** User opens the profile page via the user menu ("Profile" in UserDropdown or UserMenuMobile) or by navigating to `/account/profile`. In view mode, the user sees the data; they may click "Edit" or use the quick-access links.

**System Validation:**

- **Success:** System loads the current user's profile from the backend (or from auth context). Data is displayed. If the user clicks a quick-access link, they are navigated to the target page.
- **Fail:** If the user is not authenticated, they are redirected to sign-in. If loading fails, an error message is shown.

**Application Scope:** TrustFundMe / Danbox web application; route `/account/profile`. Requires authentication (ProtectedRoute).

**Business Rules:** BR-06 (user may only view and update their own profile; access controlled by user ID in session/token). *(See also 3.5.1 for authentication.)*

---

## 3.5.1 Non-Functional Requirements — Security (JWT & API Gateway)

**Function trigger:** A request requiring authentication (with JWT) is sent to the system via the API Gateway.

**Actor:** System (API Gateway, Identity Service, Backend)

**Function description:** The system performs authentication and authorization: (1) API Gateway validates JWT before forwarding the request to microservices; (2) passwords are hashed with BCrypt; (3) short-lived access token, long-lived refresh token; (4) tokens stored with httpOnly, secure, SameSite; tokens must not be stored in localStorage; (5) OTP used for email verification and password reset; verify-otp token is single-use and time-limited.

**Function Details (System Behavior)**

**System Validation:**

- **Success:** JWT valid and not expired → Gateway forwards request to the appropriate service; @PreAuthorize grants access by role (USER, FUND_OWNER, STAFF, ADMIN).
- **Fail:** JWT missing, invalid, or expired → returns 401 Unauthorized; insufficient permissions → 403 Forbidden.

**Application Scope:** All backend APIs (Discovery, Gateway, Identity, Campaign, Feed, Media, Moderation).

**Business Rules (Security — NFR-1 to NFR-6):**

| ID    | Requirement |
|-------|-------------|
| NFR-1 | JWT: short-lived access token, long-lived refresh token. |
| NFR-2 | Tokens: httpOnly, secure, SameSite; do not store in localStorage. |
| NFR-3 | API Gateway validates JWT before routing to microservices. |
| NFR-4 | Role-based access control; @PreAuthorize at controller. |
| NFR-5 | Passwords hashed with BCrypt. |
| NFR-6 | OTP for email verification and password reset; verify-otp token is single-use and time-limited. |

---

## 3.6.1 User Interfaces (Screen Layout)

**Function trigger:** A user (Guest, User, Fund Owner, Staff, Admin) accesses the TrustFundMe / Danbox web interface.

**Actor:** User (all roles), Guest

**Function description:** The system provides a responsive, mobile-first web interface (Next.js 15, React 19, TypeScript, Tailwind CSS). Main screens include: Sign-in/Register, Campaign list and details, Feed (posts), Profile, Account (Wallet, Impact, Campaigns), and flows for Forgot password, Verify email, Reset password. Loading or skeleton while fetching data; errors shown via toast or inline messages.

**Screen Layout (Visual Reference)**

*[Insert screenshots or wireframes for each screen here]*

| Screen / Area | Short description |
|---------------|-------------------|
| **Picture – Screen Login** | Described in 3.2.1 (Email entry, Password entry). |
| **Picture – Screen Register** | Described in 3.2.2. |
| **Picture – (User menu with Sign Out)** | Described in 3.3.1 Logout; control in header. |
| **Picture – Screen Campaign List** | List of fundraising campaigns, filters, pagination. |
| **Picture – Screen Campaign Details** | Detail of a campaign, fundraising goals, Follow and Donate buttons. |
| **Picture – Screen Feed** | List of feed posts, Create post, like/comment buttons. |
| **Picture – Screen Profile** | Described in 3.4.1 (View Profile); avatar, full name, email, phone, verified, Edit, quick access to Campaigns, Impact, Wallet. |
| **Picture – Screen Verify Email** | Enter 6-digit OTP to verify email. |
| **Picture – Screen Forgot / Reset Password** | Enter email to send OTP; after OTP verification, enter and confirm new password. |

**Function Details (UI Behavior)**

- **User Input:** Controls (input, button, link) per screen (see 3.2.1, 3.2.2, 3.3.1, 3.4.1 and the corresponding feature sections).
- **Action:** User interacts (click, type, submit form).
- **System Validation:** Success: navigate or update content; Fail: show error (toast or inline), do not navigate when data is invalid.
- **Application Scope:** TrustFundMe / Danbox web application, desktop and mobile browsers.

**Business Rules (UX — NFR-15, NFR-16, NFR-17):**

- NFR-15: Responsive, mobile-first interface (Tailwind).
- NFR-16: Loading or skeleton while fetching data.
- NFR-17: Clear error messages (toast, inline).

---

## Notes for inserting into Google Doc

1. **Picture:** Replace *[Insert ... here]* with actual screenshots (Sign-in, Register, Campaign, Feed, etc.) and use the caption "Picture – Screen [Name]".
2. **Business Rules:** If the report has a separate BR table (BR-01, BR-02, …), map BR-01→JWT, BR-02→BCrypt, BR-03→httpOnly cookie, BR-04→password format, BR-05→OTP/verify-otp and cite the correct BR numbers in each section.
3. **3.2.3, 3.2.4, …:** Additional Common Functions (Forgot password, View Campaign, Create Post, etc.) can be added using the same format. **3.3 Logout** (3.3.1), **3.4 View Profile** (3.4.1) are in sections 3.3 and 3.4.
4. **Numbering:** If your report numbering differs, renumber as needed: 3.5.1 = NFR Security, 3.6.1 = User Interfaces. **3.4.1 View Profile** can be moved under 3.2 as 3.2.3 if 3.4 is reserved for another purpose.
5. **BR-06:** Used in 3.4.1 for “user may only view/update own profile.” Add to your BR table if missing.
