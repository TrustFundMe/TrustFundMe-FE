import MessageBubble from './MessageBubble';
import ChatComposer from './ChatComposer';
import type { MessageItem } from './types';
import type { CampaignDto } from '@/types/campaign';
import { motion } from 'framer-motion';

interface ChatMessagesProps {
  messages: MessageItem[];
  isLoading?: boolean;
  activeConversationName?: string;
  activeConversationAvatar?: string;
  onShowDetails: () => void;
  inputMessage: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isSending?: boolean;
  isUploadingImage?: boolean;
  imagePreviews: string[];
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  selectedFiles?: File[];
  hasActiveConversation: boolean;
  campaignInfo?: CampaignDto | null;
  uploadProgress?: number;
}

export default function ChatMessages({
  messages,
  isLoading = false,
  activeConversationName,
  activeConversationAvatar,
  onShowDetails,
  inputMessage,
  onInputChange,
  onSend,
  isSending = false,
  isUploadingImage = false,
  imagePreviews,
  onImageSelect,
  onRemoveImage,
  fileInputRef,
  selectedFiles = [],
  hasActiveConversation,
  campaignInfo,
  uploadProgress = 0
}: ChatMessagesProps) {
  return (
    <section className="flex-1 flex flex-col h-full min-w-0" style={{ backgroundColor: '#f8fafc' }}>
      {/* Header - Fixed */}
      {activeConversationName && (
        <div className="p-3 border-b bg-white flex items-center justify-between flex-shrink-0" style={{ borderColor: '#e5e7eb' }}>
          <button
            onClick={onShowDetails}
            className="flex items-center cursor-pointer hover:opacity-90 focus:outline-none"
            title="Xem thông tin khách hàng"
          >
            {activeConversationAvatar ? (
              <img src={activeConversationAvatar} alt={activeConversationName} className="w-9 h-9 rounded-full mr-2 object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-semibold mr-2" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                {activeConversationName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-left">
              <p className="text-sm font-semibold" style={{ color: '#dc2626' }}>{activeConversationName}</p>
            </div>
          </button>
        </div>
      )}

      {/* Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto p-3 min-h-0 custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-gray-500 italic">Đang tải tin nhắn...</div>
          </div>
        ) : !hasActiveConversation ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-gray-500">Chọn một cuộc hội thoại để bắt đầu</div>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            {/* Campaign info card */}
            {campaignInfo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-[440px] mx-auto h-48 rounded-[2.8rem] overflow-hidden shadow-2xl mb-10 group"
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-[2.5s] group-hover:scale-110"
                  style={{ backgroundImage: `url(${campaignInfo.coverImage || '/placeholder-campaign.jpg'})` }}
                >
                  {/* Dark Gradient Overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </div>

                {/* Content Overlay - Lifted up with bottom-4 to avoid sticking to the edge */}
                <div className="absolute inset-x-0 bottom-4 h-18 flex items-center px-10">
                  <div className="flex items-center justify-between w-full">
                    {/* Left: Info */}
                    <div className="flex-1 min-w-0 pr-6">
                      <h2 className="text-lg font-black text-white truncate tracking-tight leading-none mb-1 shadow-sm">
                        {campaignInfo.title}
                      </h2>
                      <p className="text-white/80 text-[10px] font-bold truncate uppercase tracking-[0.05em] leading-none">
                        {campaignInfo.description || 'No description provided.'}
                      </p>
                    </div>

                    {/* Right: Pill Status Badge */}
                    <div className="flex-shrink-0">
                      <div className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center min-w-[70px]">
                        <span className="text-[8px] font-black text-white uppercase tracking-[0.1em] text-center leading-none">
                          {campaignInfo.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Branding (Soft) */}
                <div className="absolute top-6 left-10 flex items-center space-x-2 opacity-60">
                  <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
                  <span className="text-white font-black tracking-[0.4em] text-[8px] uppercase drop-shadow-md">TrustFundMe</span>
                </div>
              </motion.div>
            )}

            {messages.length === 0 ? (
              <div className="flex items-center justify-center p-10">
                <div className="text-xs text-gray-400 font-medium">Bạn có thể bắt đầu cuộc hội thoại ngay bây giờ</div>
              </div>
            ) : (
              <>
                {messages.map((m) => (
                  <MessageBubble key={m.id} item={m} />
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Composer */}
      {hasActiveConversation && (
        <ChatComposer
          inputMessage={inputMessage}
          onInputChange={onInputChange}
          onSend={onSend}
          isSending={isSending}
          isUploadingImage={isUploadingImage}
          uploadProgress={uploadProgress}
          imagePreviews={imagePreviews}
          onImageSelect={onImageSelect}
          onRemoveImage={onRemoveImage}
          fileInputRef={fileInputRef}
          selectedFiles={selectedFiles}
          disabled={!hasActiveConversation}
        />
      )}
    </section>
  );
}
