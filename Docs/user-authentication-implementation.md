# User Authentication & Dashboard Implementation

## Tổng quan

Tài liệu này mô tả chi tiết việc triển khai hệ thống xác thực người dùng và các trang dashboard theo yêu cầu.

## Cấu trúc thư mục

```
src/
├── contexts/
│   └── AuthContext.tsx          # Context quản lý authentication state
├── components/
│   ├── UserDropdown.tsx         # Dropdown menu cho user (avatar, menu)
│   └── Wallet.tsx               # Component hiển thị ví (fake wallet)
├── app/
│   ├── dashboard/
│   │   └── page.tsx             # Trang dashboard (homepage cho user đã login)
│   ├── account/
│   │   ├── profile/
│   │   │   └── page.tsx         # Trang profile/account settings
│   │   ├── campaigns/
│   │   │   └── page.tsx         # Trang "Your fundraisers"
│   │   └── impact/
│   │       └── page.tsx         # Trang "Your impact" (donations)
│   ├── forgot-password/
│   │   └── page.tsx             # Trang forgot password
│   └── sign-in/
│       └── page.tsx             # Trang đăng nhập (đã cập nhật)
└── layout/
    └── Header.tsx                 # Header component (đã cập nhật với avatar dropdown)
```

## 1. Authentication Context (`src/contexts/AuthContext.tsx`)

### Mục đích
Quản lý trạng thái xác thực người dùng toàn cục sử dụng React Context API và localStorage.

### Tính năng
- **State Management**: Quản lý `isAuthenticated` và `user` object
- **localStorage**: Lưu trữ auth state và user data trong localStorage
- **Auto-load**: Tự động load auth state từ localStorage khi component mount
- **Methods**:
  - `login(user)`: Đăng nhập và lưu vào localStorage
  - `logout()`: Đăng xuất và xóa localStorage
  - `updateUser(partialUser)`: Cập nhật thông tin user

### Cách sử dụng
```typescript
import { useAuth } from "@/contexts/AuthContext";

const { isAuthenticated, user, login, logout, updateUser } = useAuth();
```

### User Interface
```typescript
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  birthday?: string;
}
```

## 2. User Dropdown Component (`src/components/UserDropdown.tsx`)

### Mục đích
Hiển thị avatar và dropdown menu khi user đã đăng nhập.

### Tính năng
- **Avatar Display**: Hiển thị avatar hoặc initials
- **Dropdown Menu**: Menu với các options:
  - Profile
  - Your fundraisers
  - Your impact
  - Account settings
  - Sign out
- **Click Outside**: Tự động đóng khi click bên ngoài
- **Animations**: Sử dụng Framer Motion cho smooth animations
- **Icons**: Sử dụng Lucide React icons (professional icons)

### Design
- Avatar: 40x40px, rounded, border trắng
- Dropdown: White background, shadow, rounded corners
- Hover effects: Smooth transitions
- Responsive: Hoạt động tốt trên mobile và desktop

## 3. Header Component Updates (`src/layout/Header.tsx`)

### Thay đổi
- Thêm import `UserDropdown` và `useAuth`
- Tạo component `AuthButton` để hiển thị:
  - `UserDropdown` khi đã đăng nhập
  - "Sign In" button khi chưa đăng nhập
- Tích hợp vào `Header2` và `Header3`

### Vị trí
- Avatar/dropdown được đặt ở `header-right` section
- Responsive: Ẩn trên mobile, hiển thị trên desktop

## 4. Sign In Page Updates (`src/app/sign-in/page.tsx`)

### Thay đổi
- Import và sử dụng `useAuth` hook
- Sau khi login thành công:
  - Gọi `login()` với user data
  - Tự động set `localStorage.setItem("auth", "true")`
  - Redirect đến `/dashboard`

### User Data được tạo
```typescript
{
  id: `user_${Date.now()}`,
  firstName: user.firstName,
  lastName: user.lastName,
  email: normalized,
  phone: "+84123456703",
  birthday: "1990-01-01",
}
```

## 5. Dashboard Page (`src/app/dashboard/page.tsx`)

### Mục đích
Trang homepage cho user đã đăng nhập.

### Tính năng
- **Authentication Guard**: Redirect đến `/sign-in` nếu chưa đăng nhập
- **Total Impact**: Hiển thị tổng impact ($0)
- **Stats Cards**:
  - Fundraisers supported (0)
  - People you inspired to help (0)
- **Wallet Component**: Hiển thị ví (fake wallet)
- **Call to Action**: "Start seeing your impact" section
- **Fundraisers You Support**: Section với tabs (Share activity, Your donations)

### Design
- Sử dụng Framer Motion cho animations
- Cards với rounded corners (12px)
- Primary color: #1a685b (green)
- Responsive layout với Bootstrap grid

## 6. Profile/Account Settings Page (`src/app/account/profile/page.tsx`)

### Mục đích
Trang quản lý thông tin cá nhân và cài đặt tài khoản (gộp Profile và Account Settings).

### Tính năng
- **Avatar Section**: Hiển thị avatar hoặc initials
- **Name**: Có thể edit (Edit button)
- **Phone Number**: Hiển thị 3 số cuối (masked: *******0703)
  - Note: "Your phone number is linked to your account for security. To change your number please visit our help center."
- **Email Address**: Hiển thị email
- **Birthday**: Hiển thị ngày sinh
- **Password**: Masked (••••••••••••)
  - Note: "To edit your password, please visit our forgot password page."

### Design
- Cards với shadow và rounded corners
- Edit functionality cho name
- Info icons cho phone number
- Links đến forgot password page

## 7. My Campaigns Page (`src/app/account/campaigns/page.tsx`)

### Mục đích
Trang hiển thị các campaigns của user ("Your fundraisers").

### Tính năng
- **Authentication Guard**: Redirect nếu chưa đăng nhập
- **Empty State**: Hiển thị khi chưa có campaigns
- **Create Button**: Link đến trang tạo fundraiser
- **Campaign List**: Hiển thị danh sách campaigns (hiện tại empty)

### Design
- Empty state với icon và CTA button
- Responsive grid layout
- Cards với animations

## 8. Impact Page (`src/app/account/impact/page.tsx`)

### Mục đích
Trang hiển thị lịch sử donations ("Your impact").

### Tính năng
- **Authentication Guard**: Redirect nếu chưa đăng nhập
- **Donations List**: Hiển thị danh sách donations
  - Campaign name
  - Date
  - Amount
  - Anonymous/Public status
- **Empty State**: Hiển thị khi chưa có donations

### Design
- Cards với donation details
- Icons cho calendar và heart
- Currency formatting
- Date formatting

## 9. Forgot Password Page (`src/app/forgot-password/page.tsx`)

### Mục đích
Trang reset password.

### Tính năng
- **Email Input**: Nhập email để nhận reset link
- **Success State**: Hiển thị sau khi gửi email thành công
- **Back Link**: Link quay lại sign in page

### Design
- Centered card layout
- Mail icon
- Success state với confirmation message
- Form validation

## 10. Wallet Component (`src/components/Wallet.tsx`)

### Mục đích
Component hiển thị ví (fake wallet design).

### Tính năng
- **Balance Display**: Hiển thị số dư ví
- **Stats Cards**: 
  - Total Spent
  - This Month
- **Design**: Gradient background (green), decorative circles
- **Animations**: Framer Motion entrance animation

### Design
- Gradient background: #1a685b to #0d4a3f
- Decorative circles với opacity
- Glassmorphism effect cho stats cards
- Currency formatting

## 11. Layout Updates (`src/app/layout.tsx`)

### Thay đổi
- Wrap toàn bộ app với `AuthProvider`
- Đảm bảo auth context available ở mọi nơi

## Design Guidelines

### Colors
- Primary: #1a685b (green)
- Background: White
- Text: #202426 (dark gray)
- Muted: #666 (gray)

### Typography
- Headings: Bold, DM Sans
- Body: Regular, DM Sans

### Spacing
- Section padding: Standard section-padding class
- Card padding: p-4 hoặc p-5
- Gaps: g-4 (Bootstrap grid gap)

### Animations
- Sử dụng Framer Motion
- Entrance animations: fade-in + slide-up
- Duration: 0.5s
- Stagger delays: 0.1s increments

### Icons
- Sử dụng Lucide React (professional icons)
- Size: 16-24px cho small icons, 30-40px cho large icons

### Responsive
- Mobile-first approach
- Breakpoints: Bootstrap standard (sm, md, lg, xl)
- Cards stack trên mobile

## Authentication Flow

1. User truy cập `/sign-in`
2. Nhập email và password
3. Click "Sign in"
4. `login()` được gọi với user data
5. `localStorage.setItem("auth", "true")` được set
6. User data được lưu vào localStorage
7. Redirect đến `/dashboard`
8. Header hiển thị avatar và dropdown
9. User có thể truy cập các trang account

## Logout Flow

1. User click "Sign out" trong dropdown
2. `logout()` được gọi
3. `localStorage` được clear
4. Redirect đến homepage (`/`)

## Protected Routes

Các trang sau yêu cầu authentication:
- `/dashboard`
- `/account/profile`
- `/account/campaigns`
- `/account/impact`

Nếu chưa đăng nhập, tự động redirect đến `/sign-in`.

## Notes

- **No Gradients**: Không sử dụng gradient (trừ Wallet component có gradient background theo design)
- **Animations Only**: Chỉ sử dụng animations, không có gradient effects
- **Professional Icons**: Sử dụng Lucide React icons
- **No Unnecessary Numbers**: Không hiển thị số liệu thừa
- **Optimized**: Code được tối ưu, clean, maintainable
- **Responsive**: Đảm bảo responsive trên mọi thiết bị
- **Smooth**: Animations mượt mà, transitions smooth

## Future Improvements

1. **Backend Integration**: Kết nối với API thật
2. **Real Data**: Load campaigns và donations từ backend
3. **Image Upload**: Cho phép upload avatar
4. **Password Change**: Implement password change functionality
5. **Phone Verification**: Implement phone number verification
6. **Email Verification**: Implement email verification
7. **Wallet Integration**: Kết nối với payment gateway thật

## Testing Checklist

- [x] Login flow hoạt động
- [x] Logout flow hoạt động
- [x] Avatar hiển thị trong header
- [x] Dropdown menu hoạt động
- [x] Protected routes redirect đúng
- [x] Profile page hiển thị đúng thông tin
- [x] Edit name functionality
- [x] Phone number masking
- [x] Password masking
- [x] Dashboard hiển thị đúng
- [x] Empty states hiển thị đúng
- [x] Responsive trên mobile
- [x] Animations mượt mà

## Commit Message

```
Feat: implement user authentication and dashboard features

- Add AuthContext for global auth state management
- Add UserDropdown component with avatar and menu
- Update Header to show avatar when authenticated
- Update sign-in page to set localStorage auth = true
- Create dashboard page as homepage for authenticated users
- Create profile/account settings page with edit functionality
- Create My Campaigns page (Your fundraisers)
- Create Impact page showing donations
- Create forgot password page
- Create Wallet component (fake wallet design)
- Add authentication guards to protected routes
- Use Lucide React icons (professional icons)
- Add Framer Motion animations
- Ensure responsive design
- Follow design guidelines (no gradients, clean UI)
```
