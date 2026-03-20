'use client';

import { useAuth } from '@/contexts/AuthContextProxy';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut, Heart, TrendingUp } from 'lucide-react';
import Image from 'next/image';

export function UserMenuMobile() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated || !user) {
    return (
      <Link href="/sign-in" className="theme-btn text-center w-full">
        <span>
          Đăng nhập
          <i className="fa-solid fa-arrow-right-long ms-2" />
        </span>
      </Link>
    );
  }

  const displayName = user.fullName ||
    user.email?.split('@')[0] ||
    'Người dùng';

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = () => {
    if (user.fullName) {
      const parts = user.fullName.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return user.fullName[0].toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="user-menu-mobile w-100">
      {/* User Info */}
      <div className="d-flex align-items-center mb-4 p-3 bg-gray-50 rounded-lg">
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={displayName}
            width={48}
            height={48}
            className="rounded-full object-cover me-3"
            style={{ flexShrink: 0 }}
          />
        ) : (
          <div
            className="rounded-full bg-gray-300 d-flex align-items-center justify-content-center text-lg font-medium text-gray-700 me-3"
            style={{ width: '48px', height: '48px', flexShrink: 0 }}
          >
            {getInitials()}
          </div>
        )}
        <div className="flex-1" style={{ minWidth: 0 }}>
          <p className="mb-0 font-semibold text-gray-900" style={{ fontSize: '16px' }}>{displayName}</p>
          <p className="mb-0 text-sm text-gray-600" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
        </div>
      </div>

      {/* Menu Items */}
      <ul className="list-unstyled mb-0">
        <li className="mb-2">
          <Link
            href="/account/profile"
            className="d-flex align-items-center py-3 px-3 text-gray-700 hover:bg-gray-100 transition-colors rounded-lg text-decoration-none"
          >
            <User className="w-5 h-5 me-3" style={{ flexShrink: 0 }} />
            <span>Hồ sơ cá nhân</span>
          </Link>
        </li>

        <li className="mb-2">
          <Link
            href="/account/campaigns"
            className="d-flex align-items-center py-3 px-3 text-gray-700 hover:bg-gray-100 transition-colors rounded-lg text-decoration-none"
          >
            <Heart className="w-5 h-5 me-3" style={{ flexShrink: 0 }} />
            <span>Chiến dịch của bạn</span>
          </Link>
        </li>

        <li className="mb-2">
          <Link
            href="/account/impact"
            className="d-flex align-items-center py-3 px-3 text-gray-700 hover:bg-gray-100 transition-colors rounded-lg text-decoration-none"
          >
            <TrendingUp className="w-5 h-5 me-3" style={{ flexShrink: 0 }} />
            <span>Tác động của bạn</span>
          </Link>
        </li>

        <li className="mt-3 pt-3 border-top">
          <button
            onClick={handleLogout}
            className="w-100 d-flex align-items-center justify-between py-3 px-3 rounded-lg border-0 bg-transparent text-start"
            style={{ cursor: 'pointer', backgroundColor: '#fef2f2', color: '#b91c1c' }}
          >
            <span className="d-flex align-items-center">
              <LogOut className="w-5 h-5 me-3" style={{ flexShrink: 0 }} />
              <span>Đăng xuất</span>
            </span>
            <span className="text-xs text-red-400">Thoát tài khoản an toàn</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
