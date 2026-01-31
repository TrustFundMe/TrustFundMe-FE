interface MessageItem {
  id: string;
  fromMe: boolean;
  text?: string;
  time: string;
  senderName?: string;
  senderAvatar?: string;
  imageUrl?: string;
  imageUrls?: string[];
}

interface MessageBubbleProps {
  item: MessageItem;
}

export default function MessageBubble({ item }: MessageBubbleProps) {
  const base = 'max-w-[75%] px-3 py-2 rounded-2xl text-sm';
  // Ưu tiên imageUrls (array), nếu không có thì dùng imageUrl (single)
  const images = item.imageUrls && item.imageUrls.length > 0 
    ? item.imageUrls 
    : item.imageUrl 
      ? [item.imageUrl] 
      : [];
  
  if (item.fromMe) {
    return (
      <div className="flex justify-end mb-2">
        <div className={`${base}`} style={{ backgroundColor: '#f6ae2d' }}>
          {images.length > 0 && (
            <div className="mb-2 space-y-2">
              {images.map((imgUrl, idx) => (
                <img 
                  key={idx}
                  src={imgUrl} 
                  alt={`Message image ${idx + 1}`} 
                  className="max-w-full h-auto rounded-lg cursor-pointer"
                  onClick={() => window.open(imgUrl, '_blank')}
                  style={{ maxHeight: '300px' }}
                />
              ))}
            </div>
          )}
          {item.text && <p style={{ color: '#014091' }}>{item.text}</p>}
          <div className="text-[10px] mt-1 text-right" style={{ color: '#5f6777' }}>{item.time}</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex justify-start mb-2 items-end gap-2">
      {item.senderAvatar ? (
        <img src={item.senderAvatar} alt={item.senderName || 'User'} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
      ) : (
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0" style={{ backgroundColor: '#8dcdfa', color: '#014091' }}>
          {(item.senderName || 'U').charAt(0).toUpperCase()}
        </div>
      )}
      <div className={`${base} bg-white shadow-sm border border-gray-100`}>
        {item.senderName && !item.fromMe && (
          <p className="text-[10px] font-semibold mb-1" style={{ color: '#014091' }}>{item.senderName}</p>
        )}
        {images.length > 0 && (
          <div className="mb-2 space-y-2">
            {images.map((imgUrl, idx) => (
              <img 
                key={idx}
                src={imgUrl} 
                alt={`Message image ${idx + 1}`} 
                className="max-w-full h-auto rounded-lg cursor-pointer"
                onClick={() => window.open(imgUrl, '_blank')}
                style={{ maxHeight: '300px' }}
              />
            ))}
          </div>
        )}
        {item.text && <p style={{ color: '#014091' }}>{item.text}</p>}
        <div className="text-[10px] mt-1" style={{ color: '#5f6777' }}>{item.time}</div>
      </div>
    </div>
  );
}
