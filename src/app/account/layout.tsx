'use client';

import { ReactNode, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, FolderOpen, Heart, CalendarClock, ArrowLeft, MessageCircle, FileCheck, Flag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextProxy';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Lighter red for the sidebar
const SIDEBAR_COLOR = '#2d3a30';

function AccountSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();

    const navItems = useMemo(() => {
        const items = [
            { href: '/account/profile', label: 'Hồ sơ', icon: User },
            { href: '/account/campaigns', label: 'Chiến dịch', icon: FolderOpen },
            { href: '/account/impact', label: 'Lịch sử quyên góp', icon: Heart },
            { href: '/account/schedule', label: 'Lịch hẹn', icon: CalendarClock },
            { href: '/account/chat', label: 'Trò chuyện', icon: MessageCircle },
            { href: '/account/flags', label: 'Tố cáo', icon: Flag },
        ];
        if (user?.role === 'FUND_OWNER') {
            items.push({ href: '/account/commitments', label: 'Biên bản cam kết', icon: FileCheck });
        }
        return items;
    }, [user?.role]);

    return (
        <aside className="relative flex flex-col h-full w-[200px] shrink-0"
            style={{ backgroundColor: SIDEBAR_COLOR }}>

            {/* Back Arrow at Top */}
            <div className="pt-8 pb-10 flex justify-center">
                <button
                    onClick={() => router.push('/')}
                    className="bg-[#F8FAFC] text-[#1E293B]/80 hover:text-[#1E293B] transition-colors p-2 rounded-full"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
            </div>

            {/* Navigation tabs */}
            <nav className="flex-1 flex flex-col justify-start gap-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

                    return (
                        <div key={item.href} className="relative">
                            <Link
                                href={item.href}
                                className={`relative flex items-center gap-3 pl-8 pr-4 py-3 text-sm font-bold rounded-l-[2rem] overflow-hidden transition-colors duration-150 ${isActive
                                    ? 'bg-white text-[#1E293B] ml-2'
                                    : 'text-white/80 hover:text-white hover:bg-white/10 ml-2'
                                    }`}
                                style={isActive ? { backgroundColor: '#ffffff' } : {}}
                            >
                                <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-[#1E293B]' : 'text-white/60'}`} />
                                <span className={isActive ? 'text-[#1E293B]' : 'text-white'}>{item.label}</span>
                            </Link>
                        </div>
                    );
                })}
            </nav>

            {/* Profile image at bottom */}
            <div className="pb-10 flex justify-center px-4">
                <img
                    src="/assets/img/profile.png"
                    alt="Profile illustration"
                    className="w-full h-auto opacity-90"
                />
            </div>
        </aside>
    );
}

export default function AccountLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    // Hide sidebar on expenditure detail page or transactions page
    const hideSidebar = 
        (pathname?.includes('/account/campaigns/expenditures/') && pathname.split('/').length > 4) ||
        pathname?.includes('/account/campaigns/transactions');

    return (
        <ProtectedRoute requireVerified={true}>
            {/* The main container background matches the sidebar */}
            <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC]">
                {!hideSidebar && <AccountSidebar />}
                <main className="flex-1 overflow-y-auto relative z-0">
                    <Toaster position="top-right" reverseOrder={false} />
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
