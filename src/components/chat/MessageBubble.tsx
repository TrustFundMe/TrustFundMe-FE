import type { MessageItem } from './types';

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
                <div
                    className={`${base} text-white shadow-sm`}
                    style={{
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        borderRadius: '20px',
                        borderBottomRightRadius: '4px'
                    }}
                >
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
                    {item.text && <span className="block text-white leading-relaxed">{contentText}</span>}
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-start mb-2">
            <div
                className={`${base} text-[#1e293b] shadow-sm`}
                style={{
                    backgroundColor: '#f1f5f9',
                    borderRadius: '20px',
                    borderBottomLeftRadius: '4px',
                    border: '1px dashed #cbd5e1'
                }}
            >
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
                {item.text && <span className="block leading-relaxed">{contentText}</span>}
            </div>
        </div>
    );
}
