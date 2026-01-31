import MessageBubble from './MessageBubble';
import ChatComposer from './ChatComposer';
import type { MessageItem } from './types';

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
  hasActiveConversation: boolean;
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
  hasActiveConversation,
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
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-semibold mr-2" style={{ backgroundColor: '#8dcdfa', color: '#014091' }}>
                {activeConversationName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-left">
              <p className="text-sm font-semibold" style={{ color: '#014091' }}>{activeConversationName}</p>
            </div>
          </button>
        </div>
      )}

      {/* Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto p-3 min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-gray-500">Đang tải tin nhắn...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-gray-500">Chưa có tin nhắn nào</div>
          </div>
        ) : (
          <>
            {messages.map((m) => (
              <MessageBubble key={m.id} item={m} />
            ))}
          </>
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
          imagePreviews={imagePreviews}
          onImageSelect={onImageSelect}
          onRemoveImage={onRemoveImage}
          fileInputRef={fileInputRef}
          disabled={!hasActiveConversation}
        />
      )}
    </section>
  );
}
