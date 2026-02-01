interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
  location?: string;
  notes?: string;
}

interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'file';
  url: string;
  name: string;
  size?: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface ChatDetailsProps {
  userName: string;
  userEmail: string;
  userAvatar?: string;
  conversationStatus?: string;
  conversationCreatedAt?: string;
  appointments: Appointment[];
  isLoadingAppointments?: boolean;
  mediaItems: MediaItem[];
  isLoadingMedia?: boolean;
  onClose: () => void;
  formatTimeAgo: (timestamp: string) => string;
}

export default function ChatDetails({
  userName,
  userEmail,
  userAvatar,
  conversationStatus,
  conversationCreatedAt,
  appointments,
  isLoadingAppointments = false,
  mediaItems,
  isLoadingMedia = false,
  onClose,
  formatTimeAgo,
}: ChatDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Đã lên lịch';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      case 'pending':
        return 'Chờ xác nhận';
      default:
        return status;
    }
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return '';
    const size = parseInt(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <aside className="w-80 border-l bg-white flex flex-col flex-shrink-0 h-full" style={{ borderColor: '#e5e7eb' }}> 
      {/* Header - Fixed */}
      <div className="p-3 flex items-center justify-between flex-shrink-0 border-b" style={{ borderColor: '#e5e7eb' }}>
        <p className="text-sm font-semibold" style={{ color: '#014091' }}>Thông tin chi tiết</p>
        <button onClick={onClose} className="text-xs hover:opacity-80" style={{ color: '#0991f3' }}>
          Đóng
        </button>
      </div>
      
      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-3 min-h-0">
        <div className="flex items-center mb-3">
          {userAvatar ? (
            <img src={userAvatar} alt={userName} className="w-12 h-12 rounded-full mr-3 object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-semibold mr-3" style={{ backgroundColor: '#8abdfe', color: '#014091' }}>
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm" style={{ color: '#014091' }}>{userName}</p>
            <p className="text-xs" style={{ color: '#5f6777' }}>{userEmail}</p>
          </div>
        </div>
        
        <div className="space-y-2 text-xs" style={{ color: '#5f6777' }}>
          {/* Chat Information */}
          <div className="p-2 bg-gray-50 border rounded-lg" style={{ borderColor: '#e5e7eb' }}>
            <p className="font-medium text-sm mb-2" style={{ color: '#014091' }}>Thông tin đoạn chat</p>
            {conversationStatus && (
              <p className="mt-1">
                Trạng thái: <span className="font-semibold">{conversationStatus}</span>
              </p>
            )}
            {conversationCreatedAt && (
              <p>Tạo lúc: {formatTimeAgo(conversationCreatedAt)}</p>
            )}
          </div>
          
          {/* Appointment History */}
          <div className="p-2 bg-gray-50 border rounded-lg" style={{ borderColor: '#e5e7eb' }}>
            <p className="font-medium text-sm mb-2" style={{ color: '#014091' }}>Lịch sử cuộc hẹn</p>
            {isLoadingAppointments ? (
              <div className="text-center py-2 text-xs text-gray-500">Đang tải...</div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-2 text-xs text-gray-500">Chưa có cuộc hẹn nào</div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-auto">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="p-2 bg-white border rounded-md" style={{ borderColor: '#e5e7eb' }}>
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-semibold text-xs flex-1" style={{ color: '#014091' }}>
                        {appointment.title}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: '#5f6777' }}>
                      📅 {appointment.date} • 🕐 {appointment.time}
                    </p>
                    {appointment.location && (
                      <p className="text-[10px] mt-1" style={{ color: '#5f6777' }}>
                        📍 {appointment.location}
                      </p>
                    )}
                    {appointment.notes && (
                      <p className="text-[10px] mt-1 italic" style={{ color: '#5f6777' }}>
                        {appointment.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Media History */}
          <div className="p-2 bg-gray-50 border rounded-lg" style={{ borderColor: '#e5e7eb' }}>
            <p className="font-medium text-sm mb-2" style={{ color: '#014091' }}>Media đã gửi</p>
            {isLoadingMedia ? (
              <div className="text-center py-2 text-xs text-gray-500">Đang tải...</div>
            ) : mediaItems.length === 0 ? (
              <div className="text-center py-2 text-xs text-gray-500">Chưa có media nào</div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-auto">
                {mediaItems.map((media) => (
                  <div key={media.id} className="p-2 bg-white border rounded-md" style={{ borderColor: '#e5e7eb' }}>
                    {media.type === 'image' && (
                      <div className="mb-2">
                        <img
                          src={media.url}
                          alt={media.name}
                          className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => window.open(media.url, '_blank')}
                        />
                      </div>
                    )}
                    {media.type === 'video' && (
                      <div className="mb-2 relative">
                        <video
                          src={media.url}
                          className="w-full h-24 object-cover rounded cursor-pointer"
                          controls={false}
                          onClick={() => window.open(media.url, '_blank')}
                        />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                          <svg className="w-8 h-8 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    )}
                    {media.type === 'file' && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate" style={{ color: '#014091' }}>{media.name}</p>
                          {media.size && (
                            <p className="text-[10px] text-gray-500">{formatFileSize(media.size)}</p>
                          )}
                        </div>
                        <a
                          href={media.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                          style={{ color: '#0991f3' }}
                        >
                          Tải
                        </a>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px]" style={{ color: '#5f6777' }}>
                        {formatTimeAgo(media.uploadedAt)}
                      </p>
                      <p className="text-[10px]" style={{ color: '#5f6777' }}>
                        {media.uploadedBy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
