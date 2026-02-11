interface MessageItem {
  id: string;
  fromMe: boolean;
  text?: string;
  time: string;
  senderName?: string;
  senderAvatar?: string;
  imageUrl?: string;
  imageUrls?: string[];
  videoUrl?: string;
  videoUrls?: string[];
}

interface MessageBubbleProps {
  item: MessageItem;
}

export default function MessageBubble({ item }: MessageBubbleProps) {
  const base = 'max-w-[75%] px-3 py-2 rounded-2xl text-sm';
  // Giải mã (Decode) media từ content nếu có
  let contentText = item.text || '';
  let decodedImages: string[] = [];
  let decodedVideos: string[] = [];

  if (contentText.includes('|||')) {
    const parts = contentText.split('|||');
    contentText = parts[0];
    if (parts[1]) decodedImages = parts[1].split(',').filter(u => u);
    if (parts[2]) decodedVideos = parts[2].split(',').filter(u => u);
  }

  // Ưu tiên media đã giải mã, sau đó đến các trường có sẵn trong model
  const images = decodedImages.length > 0
    ? decodedImages
    : item.imageUrls && item.imageUrls.length > 0
      ? item.imageUrls
      : item.imageUrl
        ? [item.imageUrl]
        : [];

  const videos = decodedVideos.length > 0
    ? decodedVideos
    : item.videoUrls && item.videoUrls.length > 0
      ? item.videoUrls
      : item.videoUrl
        ? [item.videoUrl]
        : [];

  if (item.fromMe) {
    return (
      <div className="flex justify-end mb-2">
        <div className={`${base} shadow-sm border border-red-100`} style={{ backgroundColor: '#dc2626' }}>
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
          {videos.length > 0 && (
            <div className="mb-2 space-y-2">
              {videos.map((videoUrl, idx) => (
                <video
                  key={idx}
                  src={videoUrl}
                  controls
                  className="max-w-full h-auto rounded-lg"
                  style={{ maxHeight: '300px' }}
                />
              ))}
            </div>
          )}
          {item.text && <p className="text-white">{contentText}</p>}
          <div className="text-[10px] mt-1 text-right text-red-100 opacity-80">{item.time}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-2 items-end gap-2">
      {item.senderAvatar ? (
        <img src={item.senderAvatar} alt={item.senderName || 'User'} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
      ) : (
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
          {(item.senderName?.trim() || 'U').charAt(0).toUpperCase()}
        </div>
      )}
      <div className={`${base} bg-white shadow-sm border border-gray-100`}>
        {item.senderName && !item.fromMe && (
          <p className="text-[10px] font-semibold mb-1 text-gray-700">{item.senderName}</p>
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
        {videos.length > 0 && (
          <div className="mb-2 space-y-2">
            {videos.map((videoUrl, idx) => (
              <video
                key={idx}
                src={videoUrl}
                controls
                className="max-w-full h-auto rounded-lg"
                style={{ maxHeight: '300px' }}
              />
            ))}
          </div>
        )}
        {item.text && <p className="text-gray-900">{contentText}</p>}
        <div className="text-[10px] mt-1" style={{ color: '#5f6777' }}>{item.time}</div>
      </div>
    </div>
  );
}
