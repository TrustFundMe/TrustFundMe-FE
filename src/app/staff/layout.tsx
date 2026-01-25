'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Megaphone, Inbox, LogOut } from 'lucide-react';
import RequireRole from '@/components/auth/RequireRole';
import { useAuth } from '@/contexts/AuthContextProxy';

const sidebarNavItems = [
  { href: '/staff', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/staff/request', label: 'Requests', icon: Inbox },
  { href: '/staff/users', label: 'Users', icon: Users },
  { href: '/staff/campaigns', label: 'Campaigns', icon: Megaphone },
];

function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Staff';
  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || 'S';

  return (
    <aside className="hidden md:flex md:flex-col w-[72px] bg-white border-r border-gray-200">
      <nav className="flex-1 flex flex-col items-center justify-center gap-3">
        {sidebarNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              title={item.label}
              className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors duration-150 ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              <item.icon className="h-5 w-5" />
            </Link>
          );
        })}
      </nav>

      <div className="pb-4 flex flex-col items-center gap-3">
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt="User Avatar"
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-semibold">
            {initials}
          </div>
        )}

        <button
          onClick={() => logout()}
          aria-label="Logout"
          title="Logout"
          className="h-10 w-10 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
}


export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole allowedRoles={['STAFF', 'ADMIN']}>
      <div className="flex h-screen bg-gray-100 font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
            {children}
          </main>
        </div>
      </div>
    </RequireRole>
  );
}
