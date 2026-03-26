import MessageBubble from '@/components/chat/MessageBubble';
import ChatComposer from '@/components/chat/ChatComposer';
import QuickSchedulePopup from '@/components/chat/QuickSchedulePopup';
import type { MessageItem } from './types';
import type { CampaignDto } from '@/types/campaign';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

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
    showSchedulePopup?: boolean;
    detectedScheduleText?: string;
    onScheduleConfirm?: () => void;
    onScheduleCancel?: () => void;
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
    uploadProgress = 0,
    showSchedulePopup = false,
    detectedScheduleText = '',
    onScheduleConfirm = () => { },
    onScheduleCancel = () => { }
}: ChatMessagesProps) {
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
        setShowScrollButton(false);
    };

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const atBottom = scrollHeight - scrollTop - clientHeight < 150;
        setIsAtBottom(atBottom);
        if (atBottom) setShowScrollButton(false);
    };

    useEffect(() => {
        if (isAtBottom) {
            scrollToBottom('auto');
        } else {
            setShowScrollButton(true);
        }
    }, [messages]);

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
            <div
                className="flex-1 relative min-h-0 flex flex-col"
            >
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto p-3 custom-scrollbar"
                >
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
                                        style={{ backgroundImage: `url(${campaignInfo.coverImage || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop'})` }}
                                    >
                                        {/* Dark Gradient Overlay for better text readability */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                    </div>

                                    {/* Content Overlay */}
                                    <div className="absolute inset-x-0 bottom-4 h-18 flex items-center px-10">
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex-1 min-w-0 pr-6">
                                                <h2 className="text-lg font-black text-white truncate tracking-tight leading-none mb-1 shadow-sm">
                                                    {campaignInfo.title}
                                                </h2>
                                                <p className="text-white/80 text-[10px] font-bold truncate uppercase tracking-[0.05em] leading-none">
                                                    {campaignInfo.description || 'No description provided.'}
                                                </p>
                                            </div>

                                            <div className="flex-shrink-0">
                                                <div className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center min-w-[70px]">
                                                    <span className="text-[8px] font-black text-white uppercase tracking-[0.1em] text-center leading-none">
                                                        {campaignInfo.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Top Branding */}
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
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Small Floating Scroll to Bottom Button */}
                {showScrollButton && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
                        <button
                            onClick={() => scrollToBottom('smooth')}
                            className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 text-white text-[11px] font-bold shadow-lg hover:bg-red-700 transition-all animate-chat-bounce-jump"
                            style={{
                                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
                            }}
                        >
                            <ChevronDown size={14} className="animate-bounce" />
                            Tin nhắn mới
                        </button>
                    </div>
                )}

                <style>{`
          @keyframes chatBounceJump {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          .animate-chat-bounce-jump {
            animation: chatBounceJump 1.5s ease-in-out infinite;
          }
        `}</style>
            </div>

            {/* Composer */}
            {hasActiveConversation && (
                <>
                    <QuickSchedulePopup
                        isVisible={showSchedulePopup}
                        detectedText={detectedScheduleText}
                        onConfirm={onScheduleConfirm}
                        onCancel={onScheduleCancel}
                    />
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
                </>
            )}
        </section>
    );
}
