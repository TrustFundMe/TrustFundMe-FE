'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutGrid, 
  ClipboardList, 
  LogOut, 
  MessageCircle, 
  MessageSquare, 
  Calendar, 
  ShieldCheck, 
  Flag,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import RequireRole from '@/components/auth/RequireRole';
import { useAuth } from '@/contexts/AuthContextProxy';
import { Toaster } from 'react-hot-toast';

const sidebarNavItems = [
  { href: '/staff', label: 'Tổng quan', icon: LayoutGrid },
  { href: '/staff/request', label: 'Trung tâm xử lý', icon: ClipboardList },
  { href: '/staff/commitments', label: 'Cam kết', icon: ShieldCheck },
  { href: '/staff/flags', label: 'Báo cáo', icon: Flag },
  { href: '/staff/feed-post', label: 'Bài đăng', icon: MessageSquare },
  { href: '/staff/schedule', label: 'Lịch', icon: Calendar },
  { href: '/staff/chat', label: 'Trò chuyện', icon: MessageCircle },
];

function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Staff';
  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || 'S';

  return (
    <aside 
      className={`hidden md:flex md:flex-col bg-white border-r border-gray-100 h-full transition-all duration-300 ease-in-out relative shadow-sm z-30 ${
        isExpanded ? 'w-[240px]' : 'w-[72px]'
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-10 bg-white border border-gray-100 rounded-full p-1 shadow-md text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all z-40"
      >
        {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      {/* Top Section - Logo */}
      <div className={`pt-6 flex flex-col gap-4 ${isExpanded ? 'px-4' : 'items-center'}`}>
        <div className={`flex items-center transition-all duration-300 ${isExpanded ? 'justify-start gap-3 px-2' : 'justify-center'}`}>
            <div className={`flex-shrink-0 transition-all duration-300 w-10 h-10 flex items-center justify-center rounded-xl overflow-hidden`}>
                <img 
                  src="/assets/img/logo/black-logo.png" 
                  alt="Logo" 
                  className={`transition-all duration-300 h-[34px] w-[130px] object-cover object-left`} 
                />
            </div>
            {isExpanded && (
              <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-500">
                <span className="font-black text-[13px] uppercase tracking-[0.1em] text-[#446b5f]">TrustFundMe</span>
              </div>
            )}
        </div>
      </div>

      <div className="h-[1px] bg-gray-50 mx-4 my-6 opacity-50" />

      {/* Navigation */}
      <nav className={`flex-1 flex flex-col gap-2 ${isExpanded ? 'px-3' : 'items-center'}`}>
        {sidebarNavItems.map((item) => {
          const isActive = item.href === '/staff'
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`h-11 rounded-xl flex items-center transition-all duration-200 ${
                isExpanded 
                ? 'w-full px-4 gap-3' 
                : 'w-11 justify-center'
              } ${isActive
                ? 'bg-[#446b5f]/10 text-[#446b5f]'
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-800'
              }`}
              title={!isExpanded ? item.label : ''}
            >
              <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'scale-110' : ''}`} />
              {isExpanded && <span className="text-[11px] font-bold uppercase tracking-wide truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section - User Info & Logout */}
      <div className={`pb-6 flex flex-col items-center gap-3 ${isExpanded ? 'px-4' : ''}`}>
        <div className={`flex items-center cursor-pointer p-2 rounded-2xl hover:bg-gray-50 transition-colors ${isExpanded ? 'w-full gap-3' : 'justify-center'}`}>
            {user?.avatarUrl ? (
                <img
                    src={user.avatarUrl}
                    alt="User Avatar"
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-50"
                />
            ) : (
                <div className="h-10 w-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-black shadow-inner">
                    {initials}
                </div>
            )}
            {isExpanded && (
                <div className="flex flex-col truncate">
                    <span className="text-[11px] font-black uppercase text-gray-800 tracking-tight truncate">{displayName}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate">Trực tuyến</span>
                </div>
            )}
        </div>

        <button
          onClick={() => logout()}
          className={`h-11 rounded-xl flex items-center transition-all ${
            isExpanded 
            ? 'w-full px-4 gap-3 bg-gray-50 text-gray-600 hover:bg-rose-50 hover:text-rose-600' 
            : 'w-11 justify-center text-gray-400 hover:bg-rose-50 hover:text-rose-600'
          }`}
          title="Logout"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {isExpanded && <span className="text-[11px] font-bold uppercase tracking-wider">Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
}


export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole allowedRoles={['STAFF', 'ADMIN']}>
      <div className="h-screen flex overflow-hidden bg-white">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 bg-white h-full relative overflow-hidden">
          <div className="flex-1 overflow-hidden relative flex flex-col">
            <Toaster position="top-right" reverseOrder={false} />
            {children}
          </div>
        </main>
      </div>
    </RequireRole>
  );
}
