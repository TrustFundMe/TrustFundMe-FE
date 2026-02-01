'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Users,
  LogOut,
  Bell,
  Search,
  Box,
  Home,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RequireRole from '@/components/auth/RequireRole';
import { useAuth } from '@/contexts/AuthContextProxy';

const sidebarNavItems = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/users', label: 'User Central', icon: LayoutGrid },
  { href: '/admin/campaigns', label: 'Campaigns', icon: Box },
];

function Sidebar({ isExpanded, setIsExpanded }: { isExpanded: boolean; setIsExpanded: (v: boolean) => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Admin';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || 'A';

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isExpanded ? 260 : 64,
        margin: isExpanded ? 0 : '16px',
        borderRadius: isExpanded ? '0px 48px 48px 0px' : '32px'
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="hidden md:flex md:flex-col bg-[#111315] text-white shadow-2xl relative z-50 overflow-hidden"
    >
      {/* Profile/Toggle Area */}
      <div className={`pt-8 pb-4 flex flex-col items-center px-4`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`relative group flex items-center transition-all duration-300 w-full ${isExpanded ? 'justify-start gap-4' : 'justify-center'}`}
        >
          <div className="h-10 w-10 min-w-[40px] rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-white transition-all shadow-lg bg-gray-800 flex items-center justify-center shrink-0">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Admin" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs font-black text-white">{initials}</span>
            )}
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-left overflow-hidden whitespace-nowrap"
              >
                <div className="text-sm font-black text-white truncate">{displayName}</div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Administrator</div>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 flex flex-col gap-4 py-12 px-3">
        {sidebarNavItems.map((item) => {
          const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`group relative h-12 flex items-center transition-all duration-300 rounded-2xl ${isExpanded ? 'px-4 justify-start gap-5' : 'justify-center'
                } ${isActive ? 'bg-white text-red-600 shadow-lg shadow-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />

              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-sm font-bold whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Tooltip for collapsed state */}
              {!isExpanded && (
                <div className="absolute left-16 bg-gray-900 text-white text-[10px] px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold uppercase tracking-wider z-50 shadow-2xl border border-white/10">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout & Bottom Toggle */}
      <div className="pb-8 px-3 space-y-4">
        <button
          onClick={() => logout()}
          className={`group flex items-center transition-all duration-300 w-full h-12 rounded-2xl hover:bg-red-500/10 hover:text-red-500 text-gray-400 ${isExpanded ? 'px-4 justify-start gap-5' : 'justify-center'
            }`}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-sm font-bold whitespace-nowrap overflow-hidden"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <div className="pt-2 flex justify-center border-t border-white/5">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-500 transition-colors"
          >
            {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}



export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <RequireRole allowedRoles={['ADMIN']}>
      <div className="flex h-screen bg-[#111315] overflow-hidden antialiased select-none">
        <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />

        {/* Animated Frame Wrapper */}
        <motion.div
          initial={false}
          animate={{
            padding: isExpanded ? '16px' : '16px 16px 16px 0px',
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex-1 flex flex-col h-full overflow-hidden"
        >
          <div className="flex-1 flex flex-col bg-[#fcfcfc] rounded-[48px] overflow-hidden shadow-2xl relative border border-white/10">
            <main className="flex-1 overflow-auto px-8 py-8 custom-scrollbar">
              <div className="min-h-full py-2">
                {children}
              </div>
            </main>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </RequireRole>
  );
}
