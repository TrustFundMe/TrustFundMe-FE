'use client';

import { ReactNode, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, FolderOpen, Heart, CalendarClock, ArrowLeft, MessageCircle, FileCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextProxy';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Lighter red for the sidebar
const SIDEBAR_COLOR = '#2d3a30';

/**
 * ConcaveCorner creates the "reverse curve" effect where the red sidebar
 * meets the white active tab/content area.
 */
const ConcaveCorner = ({ position }: { position: 'top' | 'bottom' }) => (
    <div
        className="absolute right-0 w-6 h-6 pointer-events-none"
        style={{
            [position === 'top' ? 'bottom' : 'top']: '100%',
            backgroundColor: '#ffffff' // Pure white to match content
        }}
    >
        <svg viewBox="0 0 24 24" fill={SIDEBAR_COLOR} xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {position === 'top' ? (
                <path d="M0 0 H24 Q24 24 0 24 Z" />
            ) : (
                <path d="M0 24 H24 Q24 0 0 0 Z" />
            )}
        </svg>
    </div>
);

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
                    className="p-1 text-white/80 hover:text-white transition-colors"
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
                            {/* Concave bridge ABOVE active tab */}
                            {isActive && <ConcaveCorner position="top" />}

                            <Link
                                href={item.href}
                                className={`relative flex items-center gap-3 pl-8 pr-4 py-3 text-sm font-bold transition-all duration-200 ${isActive
                                    ? 'text-[#2d3a30] rounded-l-[2rem] shadow-[-4px_0_12px_rgba(0,0,0,0.05)]'
                                    : 'text-white/80 hover:text-white hover:bg-white/10 rounded-l-[1.5rem] ml-2'
                                    }`}
                                style={isActive ? { backgroundColor: '#ffffff' } : {}}
                            >
                                <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-[#2d3a30]' : 'text-white/60'}`} />
                                <span className={isActive ? 'text-[#2d3a30]' : 'text-white'}>{item.label}</span>
                            </Link>

                            {/* Concave bridge BELOW active tab */}
                            {isActive && <ConcaveCorner position="bottom" />}
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
    return (
        <ProtectedRoute requireVerified={true}>
            {/* The main container background matches the sidebar */}
            <div className="flex h-screen w-full overflow-hidden" style={{ backgroundColor: SIDEBAR_COLOR }}>
                <AccountSidebar />

                {/* Main content area - pure white rectangle that meets the sidebar */}
                <main
                    className="flex-1 overflow-y-auto shadow-[-10px_0_30px_rgba(0,0,0,0.05)] relative z-0"
                    style={{ backgroundColor: '#ffffff' }}
                >
                    <Toaster position="top-right" reverseOrder={false} />
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
