import { RefreshCw } from 'lucide-react';
import type { Conversation } from './types';

interface ChatSidebarProps {
    conversations: Conversation[];
    activeId: string;
    isLoading?: boolean;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onConversationClick: (id: string) => void;
    onShowNewClick: () => void;
    newCustomersCount: number;
    onRefresh?: () => void;
}

export default function ChatSidebar({
    conversations,
    activeId,
    isLoading = false,
    searchQuery,
    onSearchChange,
    onConversationClick,
    onShowNewClick,
    newCustomersCount,
    onRefresh,
}: ChatSidebarProps) {
    return (
        <aside className="w-80 border-r border-gray-100 flex flex-col flex-shrink-0 h-full" style={{ backgroundColor: '#f8fafc' }}>
            {/* Header - Fixed */}
            <div className="p-3 flex items-center space-x-2 flex-shrink-0">
                {newCustomersCount > 0 && (
                    <button
                        onClick={onShowNewClick}
                        className="text-[10px] px-2 py-1 rounded-md border hover:bg-gray-50"
                        style={{ borderColor: '#8abdfe', color: '#014091' }}
                    >
                        Tin nhắn mới ({newCustomersCount})
                    </button>
                )}
                <div className="flex-1 relative">
                    <input
                        placeholder="Tìm kiếm người dùng"
                        className="w-full text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                        style={{ borderColor: '#e5e7eb', boxShadow: '0 0 0 2px rgba(9,145,243,0.0)' }}
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
                {onRefresh && (
                    <button 
                        onClick={onRefresh}
                        disabled={isLoading}
                        className="h-9 w-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-100 transition shadow-sm group active:scale-95 disabled:opacity-50"
                        title="Làm mới hội thoại"
                    >
                        <RefreshCw className={`h-4 w-4 transition-transform group-hover:rotate-180 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                )}
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-2 pb-2">
                {isLoading ? (
                    <div className="text-center py-4 text-sm text-gray-500">Đang tải...</div>
                ) : conversations.length === 0 ? (
                    <div className="text-center py-4 text-sm text-gray-500">Không có conversation đã nhận</div>
                ) : (
                    conversations.map((c) => {
                        const active = c.id === activeId;
                        return (
                            <button
                                key={c.id}
                                onClick={() => onConversationClick(c.id)}
                                className={`w-full flex items-center px-3 py-2 rounded-xl mb-1 text-left transition-all duration-150 ${active ? 'text-white shadow-md' : 'hover:bg-gray-50'}`}
                                style={{
                                    backgroundColor: active ? '#dc2626' : 'white',
                                    boxShadow: active
                                        ? '0 4px 12px rgba(220,38,38,0.25)'
                                        : '0 1px 3px rgba(0,0,0,0.06)',
                                    borderLeft: active ? '3px solid #b91c1c' : '3px solid transparent',
                                }}
                            >
                                {/* Avatar 28px */}
                                <div className="relative flex-shrink-0 mr-2">
                                    {c.avatar ? (
                                        <img
                                            src={c.avatar}
                                            alt={c.name}
                                            className={`w-7 h-7 rounded-full object-cover ${active ? 'ring-2 ring-white' : ''}`}
                                        />
                                    ) : (
                                        <div
                                            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                                            style={{
                                                backgroundColor: active ? 'rgba(255,255,255,0.25)' : '#fee2e2',
                                                color: active ? 'white' : '#dc2626',
                                            }}
                                        >
                                            {c.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span
                                        className="absolute bottom-0 right-0 w-2 h-2 rounded-full border"
                                        style={{
                                            backgroundColor: '#22c55e',
                                            borderColor: active ? '#dc2626' : 'white',
                                        }}
                                    />
                                </div>

                                {/* Text — dùng span thay p để tránh Bootstrap margin-bottom:1rem trên p */}
                                <div className="flex-1 min-w-0" style={{ lineHeight: 1.4 }}>
                                    {/* Row 1: Tên + Thời gian — cùng hàng */}
                                    <div className="flex items-center justify-between">
                                        <span
                                            className="block truncate text-xs font-bold"
                                            style={{ color: active ? 'white' : '#111827' }}
                                        >
                                            {c.name}
                                        </span>
                                        <span
                                            className="text-xs ml-2 flex-shrink-0"
                                            style={{ color: active ? '#fca5a5' : '#9CA3AF' }}
                                        >
                                            {c.time}
                                        </span>
                                    </div>

                                    {/* Row 2: Tên campaign */}
                                    {c.campaignTitle && (
                                        <span
                                            className="block truncate text-xs font-medium"
                                            style={{ color: active ? '#fecaca' : '#dc2626' }}
                                        >
                                            {c.campaignTitle}
                                        </span>
                                    )}

                                    {/* Row 3: Tin nhắn mới nhất + badge */}
                                    <div className="flex items-center justify-between">
                                        <span
                                            className="block truncate text-xs"
                                            style={{ color: active ? '#fca5a5' : '#6B7280' }}
                                        >
                                            {c.lastMessage}
                                        </span>
                                        {c.unread && c.unread > 0 ? (
                                            <span
                                                className="ml-2 flex-shrink-0 min-w-[16px] h-4 flex items-center justify-center text-[10px] rounded-full font-bold"
                                                style={{
                                                    backgroundColor: active ? 'white' : '#dc2626',
                                                    color: active ? '#dc2626' : 'white',
                                                    padding: '0 3px',
                                                }}
                                            >
                                                {c.unread}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </aside>
    );
}
