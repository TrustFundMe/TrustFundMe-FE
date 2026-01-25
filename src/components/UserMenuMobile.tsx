'use client';

import { useAuth } from '@/contexts/AuthContextProxy';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut, Heart, Wallet } from 'lucide-react';

export function UserMenuMobile() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated || !user) {
    return (
      <Link href="/sign-in" className="theme-btn text-center w-full">
        <span>
          Sign In
          <i className="fa-solid fa-arrow-right-long ms-2" />
        </span>
      </Link>
    );
  }

  const displayName = user.fullName || 
                     user.email?.split('@')[0] ||
                     'User';

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
          <img
            src={user.avatarUrl}
            alt={displayName}
            className="w-12 h-12 rounded-full object-cover me-3"
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
            <span>Profile</span>
          </Link>
        </li>
        
        <li className="mb-2">
          <Link
            href="/account/campaigns"
            className="d-flex align-items-center py-3 px-3 text-gray-700 hover:bg-gray-100 transition-colors rounded-lg text-decoration-none"
          >
            <Heart className="w-5 h-5 me-3" style={{ flexShrink: 0 }} />
            <span>Your fundraisers</span>
          </Link>
        </li>
        
        <li className="mb-2">
          <Link
            href="/account/impact"
            className="d-flex align-items-center py-3 px-3 text-gray-700 hover:bg-gray-100 transition-colors rounded-lg text-decoration-none"
          >
            <Wallet className="w-5 h-5 me-3" style={{ flexShrink: 0 }} />
            <span>Your impact</span>
          </Link>
        </li>
        
        <li className="mt-3 pt-3 border-top">
          <button
            onClick={handleLogout}
            className="w-100 d-flex align-items-center py-3 px-3 text-red-600 hover:bg-red-50 transition-colors rounded-lg border-0 bg-transparent text-start"
            style={{ cursor: 'pointer' }}
          >
            <LogOut className="w-5 h-5 me-3" style={{ flexShrink: 0 }} />
            <span>Sign Out</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
