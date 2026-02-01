interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
  avatar?: string;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string;
  isLoading?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onConversationClick: (id: string) => void;
  onShowNewClick: () => void;
  newCustomersCount: number;
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
        <input
          placeholder="Tìm kiếm người dùng"
          className="w-full text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
          style={{ borderColor: '#e5e7eb', boxShadow: '0 0 0 2px rgba(9,145,243,0.0)' }}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
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
                className={`w-full flex items-center p-2 rounded-xl mb-1.5 text-left transition-colors ${active ? 'text-white' : ''}`}
                style={{ backgroundColor: active ? '#dc2626' : 'white', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04)' }}
              >
                {c.avatar ? (
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className={`w-10 h-10 rounded-full mr-3 object-cover ${active ? 'ring-2 ring-white' : ''}`}
                  />
                ) : (
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 text-sm font-semibold ${active ? '' : 'text-gray-600'}`}
                    style={{ backgroundColor: active ? 'white' : '#fee2e2', color: '#dc2626' }}
                  >
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p
                      className={`truncate text-sm font-medium ${active ? '' : ''}`}
                      style={{ color: active ? 'white' : '#374151' }}
                    >
                      {c.name}
                    </p>
                    <span className={`text-[10px]`} style={{ color: active ? '#fca5a5' : '#9CA3AF' }}>
                      {c.time}
                    </span>
                  </div>
                  <p className={`truncate text-xs`} style={{ color: active ? '#fca5a5' : '#4b5563' }}>
                    {c.lastMessage}
                  </p>
                </div>
                {c.unread && c.unread > 0 ? (
                  <span
                    className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-bold`}
                    style={{ backgroundColor: active ? 'white' : '#dc2626', color: active ? '#dc2626' : 'white' }}
                  >
                    {c.unread}
                  </span>
                ) : null}
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
