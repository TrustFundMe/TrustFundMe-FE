'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Megaphone, Settings, LogOut, Sun } from 'lucide-react';
import RequireRole from '@/components/auth/RequireRole';
import { useAuth } from '@/contexts/AuthContextProxy';

const sidebarNavItems = [
  { href: '/staff', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/staff/users', label: 'Users', icon: Users },
  { href: '/staff/campaigns', label: 'Campaigns', icon: Megaphone },
];

function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-gray-800 text-gray-300">
      <div className="h-16 flex items-center px-6 border-b border-gray-700">
        <Link href="/" className="text-white font-bold text-xl">
          TrustFundMe
        </Link>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        {sidebarNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 ${isActive
                  ? 'bg-red-600 text-white'
                  : 'hover:bg-gray-700 hover:text-white'
                }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-gray-700">
        <Link
          href="/settings"
          className="flex items-center px-4 py-2.5 rounded-lg hover:bg-gray-700 hover:text-white"
        >
          <Settings className="h-5 w-5 mr-3" />
          <span>Settings</span>
        </Link>
        <button
          onClick={() => logout()}
          className="w-full flex items-center px-4 py-2.5 rounded-lg hover:bg-gray-700 hover:text-white mt-2"
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

function Header() {
  const { user } = useAuth();
  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Staff';

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Good morning, {displayName}</h1>
        <p className="text-sm text-gray-500">Stay on top of your tasks, monitor progress, and track status.</p>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-gray-100">
            <Sun className="h-5 w-5 text-gray-600"/>
        </button>
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt="User Avatar"
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold">
            {displayName
              .split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p[0]?.toUpperCase())
              .join('') || 'S'}
          </div>
        )}
      </div>
    </header>
  );
}

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole allowedRoles={['STAFF', 'ADMIN']}>
      <div className="flex h-screen bg-gray-100 font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
            {children}
          </main>
        </div>
      </div>
    </RequireRole>
  );
}
