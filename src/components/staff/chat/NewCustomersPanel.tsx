interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  avatar?: string;
}

interface NewCustomersPanelProps {
  conversations: Conversation[];
  isLoading?: boolean;
  onAccept: (id: string) => void;
  onClose: () => void;
}

export default function NewCustomersPanel({ 
  conversations, 
  isLoading = false, 
  onAccept, 
  onClose 
}: NewCustomersPanelProps) {
  return (
    <aside className="w-64 border-r border-gray-100 flex flex-col flex-shrink-0 h-full" style={{ backgroundColor: '#f8fafc' }}>
      {/* Header - Fixed */}
      <div className="px-3 pt-3 pb-1 flex items-center justify-between flex-shrink-0">
        <p className="text-xs font-semibold" style={{ color: '#014091' }}>
          🆕 Khách cần hỗ trợ ({conversations.length})
        </p>
        <button 
          onClick={onClose} 
          className="text-[10px] px-2 py-1 rounded-md border hover:bg-gray-50" 
          style={{ borderColor: '#8abdfe', color: '#014091' }}
        >
          Ẩn
        </button>
      </div>
      
      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {isLoading ? (
          <div className="text-center py-4 text-sm text-gray-500">Đang tải...</div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-4 text-sm text-gray-500">Không có conversation mới</div>
        ) : (
          conversations.map((c) => (
            <div key={c.id} className="w-full p-2 rounded-xl mb-1.5 bg-white shadow-sm border border-gray-100">
              <div className="flex items-center">
                {c.avatar ? (
                  <img src={c.avatar} alt={c.name} className="w-9 h-9 rounded-full mr-2 object-cover" />
                ) : (
                  <div 
                    className="w-9 h-9 rounded-full flex items-center justify-center text-gray-600 font-semibold mr-2 text-sm" 
                    style={{ backgroundColor: '#8dcdfa', color: '#014091' }}
                  >
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium" style={{ color: '#014091' }}>{c.name}</p>
                  <p className="text-[10px]" style={{ color: '#9CA3AF' }}>{c.time}</p>
                </div>
              </div>
              <p className="text-xs mt-1 truncate" style={{ color: '#5f6777' }}>{c.lastMessage}</p>
              <button 
                onClick={() => onAccept(c.id)} 
                className="mt-2 w-full text-xs px-2 py-1 rounded-md hover:opacity-90 transition-opacity" 
                style={{ backgroundColor: '#014091', color: 'white' }}
              >
                Accept
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
