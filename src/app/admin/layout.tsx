'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Megaphone,
  LogOut,
  Bell,
} from 'lucide-react';
import RequireRole from '@/components/auth/RequireRole';
import { useAuth } from '@/contexts/AuthContextProxy';

const sidebarNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'User Central', icon: Users },
  { href: '/admin/campaigns', label: 'Campaigns', icon: Megaphone },
];

function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="hidden md:flex md:flex-col md:w-72 bg-slate-900 text-slate-50">
      <div className="h-16 flex items-center px-6 border-b border-slate-800/70">
        <Link href="/" className="text-white font-semibold text-xl tracking-tight">
          TrustFundMe
        </Link>
      </div>

      <nav className="flex-1 py-5 space-y-2 px-4">
        {sidebarNavItems.map((item) => {
          const isActive =
            item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center px-4 py-2.5 transition-colors duration-200 ${
                isActive
                  ? "bg-white text-slate-900 rounded-2xl after:content-[''] after:absolute after:top-[-18px] after:right-0 after:h-[18px] after:w-[18px] after:bg-slate-900 after:rounded-br-[18px] before:content-[''] before:absolute before:bottom-[-18px] before:right-0 before:h-[18px] before:w-[18px] before:bg-slate-900 before:rounded-tr-[18px]"
                  : 'text-slate-200 hover:bg-white/10 hover:text-white rounded-2xl'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-slate-800/70">
        <button
          onClick={() => logout()}
          className="w-full flex items-center px-4 py-2.5 rounded-xl hover:bg-slate-800/70 text-slate-200"
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span>Quit</span>
        </button>
      </div>
    </aside>
  );
}

function Header() {
  const { user } = useAuth();
  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Admin';

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-gray-900">Admin</h1>
      </div>

      <div className="flex items-center space-x-3">
        <button className="p-2 rounded-full hover:bg-gray-100" aria-label="Notifications">
          <Bell className="h-5 w-5 text-gray-700" />
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right leading-tight hidden sm:block">
            <div className="text-sm font-semibold text-gray-900">{displayName}</div>
            <div className="text-xs text-gray-500">{user?.email}</div>
          </div>

          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="User Avatar"
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center font-semibold">
              {displayName
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0]?.toUpperCase())
                .join('') || 'A'}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole allowedRoles={['ADMIN']}>
      <div className="flex h-screen bg-slate-900 font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-900 p-6">
            <div className="min-h-full rounded-3xl bg-white shadow-sm border border-slate-100 p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RequireRole>
  );
}
