'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { X, Send, MessageSquare, Loader2, Camera, Calendar, ChevronDown } from 'lucide-react';
import { chatService } from '@/services/chatService';
import { webSocketService } from '@/services/websocketService';
import { appointmentService } from '@/services/appointmentService';
import QuickSchedulePopup from '@/components/staff/chat/QuickSchedulePopup';
import { useAuth } from '@/contexts/AuthContextProxy';
import { useToast } from '@/components/ui/Toast';
import { CampaignDto } from '@/types/campaign';
import { MessageItem } from '@/components/staff/chat/types';
import { userService, UserInfo } from '@/services/userService';
import { Conversation } from '@/services/chatService';

interface UserChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaign: CampaignDto;
    initialConversation?: Conversation | null;
}

export default function UserChatModal({ isOpen, onClose, campaign, initialConversation }: UserChatModalProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<MessageItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [inputMessage, setInputMessage] = useState('');
    const [staffInfo, setStaffInfo] = useState<UserInfo | null>(null);
    const [isWsConnected, setIsWsConnected] = useState(webSocketService.isConnected);
    const [showSchedulePopup, setShowSchedulePopup] = useState(false);
    const [detectedScheduleText, setDetectedScheduleText] = useState('');
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const staffId = campaign.approvedByStaff;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setShowScrollButton(false);
    };

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const atBottom = scrollHeight - scrollTop - clientHeight < 50;
        setIsAtBottom(atBottom);
        if (atBottom) setShowScrollButton(false);
    };

    useEffect(() => {
        if (isAtBottom) {
            scrollToBottom();
        } else {
            // If new message comes and we are not at bottom, show button
            setShowScrollButton(true);
        }
    }, [messages]);

    // 1. Load or Create Conversation
    useEffect(() => {
        if (!isOpen || !user) return;

        const initChat = async () => {
            setIsLoading(true);
            try {
                console.log('[Chat] Initializing for campaign:', campaign.id);
                if (staffId) {
                    const staffRes = await userService.getUserById(staffId);
                    if (staffRes.success && staffRes.data) {
                        setStaffInfo(staffRes.data);
                    }
                } else {
                    console.log('[Chat] Campaign not approved yet or no staff assigned');
                }

                // 2. Determine target conversation
                let targetConv: Conversation | null = null;

                // Nếu từ page.tsx đã check và thấy có conversation, dùng luôn
                if (initialConversation) {
                    console.log('[Chat] Using initial conversation:', initialConversation.id);
                    targetConv = initialConversation;
                } else {
                    // Nếu page.tsx trả về null (404), tiến hành tạo mới
                    console.log('[Chat] No initial conversation found, creating new one...');
                    const targetStaffId = campaign.approvedByStaff || null;
                    console.log('[Chat] targetStaffId for new conversation:', targetStaffId);

                    const createRes = await chatService.createConversation(
                        user.id,
                        campaign.id,
                        targetStaffId || undefined
                    );

                    if (createRes.success && createRes.data) {
                        console.log('[Chat] Created new conversation SUCCESS:', createRes.data.id);
                        targetConv = createRes.data;
                    } else {
                        console.error('[Chat] Create conversation FAILED:', createRes.error);
                        toast(createRes.error || 'Không thể khởi tạo cuộc hội thoại', 'error');
                    }
                }

                if (targetConv) {
                    setConversation(targetConv);
                    console.log('[Chat] Fetching messages for conversation:', targetConv.id);
                    const msgsRes = await chatService.getMessagesByConversationId(targetConv.id);

                    if (msgsRes.success && msgsRes.data) {
                        console.log('[Chat] Fetched messages count:', msgsRes.data.length);
                        const mapped = msgsRes.data.map((msg: any) => {
                            const isMe = msg.senderId === Number(user.id);
                            const isBot = msg.senderId === 0;
                            return {
                                id: msg.id.toString(),
                                text: msg.content,
                                fromMe: isMe,
                                time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                senderName: isBot ? 'Bot' : (isMe ? 'Tôi' : staffInfo?.fullName || 'Staff'),
                            };
                        });
                        setMessages(mapped);
                    }
                }
            } catch (error) {
                console.error('[Chat] Init Error:', error);
                toast('Lỗi khi kết nối dịch vụ chat', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        initChat();
    }, [isOpen, user?.id, campaign.id, initialConversation]); // Thêm initialConversation vào deps

    // 2. WebSocket
    useEffect(() => {
        if (!conversation?.id || !user) return;

        webSocketService.connect();
        const topic = `/topic/conversation/${conversation.id}`;

        const handleNewMessage = (msg: any) => {
            console.log("[User Chat] Received message via WS:", msg);
            if (msg.conversationId !== conversation.id) {
                console.log("[User Chat] Message ignored (wrong conversation):", msg.conversationId);
                return;
            }

            const isMe = msg.senderId === Number(user.id);
            const isBot = msg.senderId === 0;
            const newMsg: MessageItem = {
                id: msg.id.toString(),
                text: msg.content,
                fromMe: isMe,
                time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                senderName: isBot ? 'Bot' : (isMe ? 'Tôi' : staffInfo?.fullName || 'Staff'),
            };
            setMessages(prev => {
                if (prev.some(m => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
            });
        };

        webSocketService.subscribe(topic, handleNewMessage);

        // Check connection status periodically
        const interval = setInterval(() => {
            setIsWsConnected(webSocketService.isConnected);
        }, 1000);

        return () => {
            webSocketService.unsubscribe(topic);
            clearInterval(interval);
        };
    }, [conversation?.id, user, staffInfo?.fullName]);

    // 3. Detect schedule keywords
    useEffect(() => {
        if (!inputMessage.trim()) {
            setShowSchedulePopup(false);
            return;
        }

        // Logic: detect numbers or date keywords (ngày, lúc, vào, mai, mốt, thứ...)
        const scheduleRegex = /(?:vào|lúc|ngày|thứ|mai|mốt|\d{1,2}[\/\-]\d{1,2})|(\d{2,})/;
        const match = inputMessage.match(scheduleRegex);

        if (match && inputMessage.length > 3) {
            setDetectedScheduleText(inputMessage);
            setShowSchedulePopup(true);
        } else {
            setShowSchedulePopup(false);
        }
    }, [inputMessage]);

    // 4. Send
    const handleSend = async () => {
        if (!inputMessage.trim() || !conversation || !user || isSending) return;
        setIsSending(true);

        setIsSending(true);

        if (!webSocketService.isConnected) {
            toast('Đang kết nối lại WebSocket...', 'info');
            webSocketService.connect();
            setIsSending(false);
            return;
        }

        try {
            webSocketService.sendMessage(`/app/chat/${conversation.id}`, {
                conversationId: conversation.id,
                content: inputMessage.trim(),
                senderId: Number(user.id),
                senderRole: 'ROLE_FUND_OWNER',
            });
            setInputMessage('');
        } catch (error) {
            console.error('Send Error:', error);
            toast('Không thể gửi tin nhắn', 'error');
        } finally {
            setIsSending(false);
        }
    };

    const formatToLocalISO = (date: Date) => {
        const pad = (num: number) => String(num).padStart(2, '0');
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    const handleScheduleConfirm = async () => {
        if (!user || !campaign || !staffId) return;

        setIsSending(true);
        try {
            // Pre-fill appointment info
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(9, 0, 0, 0); // Default 9 AM tomorrow

            const endHour = new Date(tomorrow);
            endHour.setHours(10, 0, 0, 0); // 1 hour duration

            const res = await appointmentService.create({
                donorId: Number(user.id),
                staffId: Number(staffId),
                startTime: formatToLocalISO(tomorrow),
                endTime: formatToLocalISO(endHour),
                location: 'Trao đổi qua chat / Online',
                purpose: `Hẹn gặp thảo luận về: ${campaign.title}. Nội dung gợi ý: "${detectedScheduleText}"`
            });

            if (res) {
                toast('Đã tạo lịch hẹn thành công! Staff sẽ sớm xác nhận nha.', 'success');
                setShowSchedulePopup(false);

                // Optionally send a message to notify staff
                webSocketService.sendMessage(`/app/chat/${conversation?.id}`, {
                    conversationId: conversation?.id,
                    content: `[Hệ thống] Tôi vừa yêu cầu một lịch hẹn thảo luận về chiến dịch này vào lúc ${tomorrow.toLocaleTimeString()} ngày ${tomorrow.toLocaleDateString()}.`,
                    senderId: Number(user.id),
                    senderRole: 'ROLE_FUND_OWNER',
                });
            }
        } catch (error: any) {
            console.error('Schedule Create Error:', error);
            toast(error?.response?.data?.message || 'Không thể tạo lịch hẹn tự động', 'error');
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) return null;

    const popup = (
        <div
            style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                width: '360px',
                height: '520px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                fontFamily: 'Inter, sans-serif',
                animation: 'chatPopIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            }}
        >
            <style>{`
                @keyframes chatPopIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                .mini-chat-messages::-webkit-scrollbar { width: 4px; }
                .mini-chat-messages::-webkit-scrollbar-track { background: transparent; }
                .mini-chat-messages::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 4px; }
            `}</style>

            {/* Header - campaign cover image as background */}
            <div style={{
                position: 'relative',
                height: '110px',
                flexShrink: 0,
                overflow: 'hidden',
            }}>
                {/* Cover image */}
                <img
                    src={campaign.coverImageUrl || '/assets/img/defaul.jpg'}
                    alt={campaign.title}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {/* Dark red overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, rgba(153,27,27,0.55) 0%, rgba(185,28,28,0.82) 100%)',
                }} />
                {/* Content */}
                <div style={{ position: 'relative', height: '100%', padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                padding: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
                        >
                            <X size={16} />
                        </button>
                    </div>
                    {/* Campaign title at bottom of header */}
                    <div>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px', textShadow: '0 1px 4px rgba(0,0,0,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {campaign.title}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '11px', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            Hỗ trợ chiến dịch
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="mini-chat-messages"
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px 12px',
                    background: '#f0f4f8',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                }}
            >
                {isLoading ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px', gap: '8px' }}>
                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        Đang tải...
                    </div>
                ) : messages.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <MessageSquare size={32} style={{ color: '#cbd5e1' }} />
                        <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>
                            Gửi tin nhắn để bắt đầu<br />thảo luận với staff
                        </p>
                    </div>
                ) : (
                    messages.map(msg => (
                        <MiniMessageBubble key={msg.id} msg={msg} staffInfo={staffInfo} />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Small Scroll to Bottom Button - MOVED OUTSIDE SCROLLABLE DIV */}
            <div style={{ position: 'relative', height: 0, overflow: 'visible', zIndex: 100 }}>
                {showScrollButton && (
                    <button
                        onClick={scrollToBottom}
                        style={{
                            position: 'absolute',
                            bottom: '12px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            padding: '6px 12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 4px 15px rgba(239,68,68,0.4)',
                            cursor: 'pointer',
                            animation: 'chatBounceJump 1.5s ease-in-out infinite',
                            whiteSpace: 'nowrap',
                            zIndex: 100,
                        }}
                    >
                        <ChevronDown size={14} className="animate-bounce" />
                        Tin nhắn mới
                    </button>
                )}
            </div>

            <style>{`
                @keyframes chatBounceJump {
                    0%, 100% { transform: translateX(-50%) translateY(0); }
                    50% { transform: translateX(-50%) translateY(-8px); }
                }
            `}</style>

            {/* Quick Schedule Suggestion */}
            <div style={{ background: '#f0f4f8' }}>
                <QuickSchedulePopup
                    isVisible={showSchedulePopup}
                    detectedText={detectedScheduleText}
                    onConfirm={handleScheduleConfirm}
                    onCancel={() => setShowSchedulePopup(false)}
                />
            </div>

            {/* Input */}
            <div style={{
                background: '#fff',
                borderTop: '1px solid #e8ecf0',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexShrink: 0,
            }}>
                {/* Pill input with camera icon inside */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    background: '#f0f2f5',
                    borderRadius: '999px',
                    padding: '0 10px 0 16px',
                    height: '42px',
                    gap: '6px',
                }}>
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={e => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything..."
                        disabled={isLoading || !conversation || isSending}
                        style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            fontSize: '14px',
                            color: '#1e293b',
                            background: 'transparent',
                            padding: 0,
                            minWidth: 0,
                        }}
                    />
                    {/* Camera icon inside pill */}
                    <button
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            color: '#94a3b8',
                            borderRadius: '50%',
                            transition: 'color 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#64748b')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
                        title="Gửi ảnh"
                    >
                        <Camera size={18} />
                    </button>
                </div>
                {/* Dark circular send button */}
                <button
                    onClick={handleSend}
                    disabled={!inputMessage.trim() || isLoading || !conversation || isSending || !isWsConnected}
                    style={{
                        background: '#1e293b',
                        border: 'none',
                        borderRadius: '50%',
                        width: '42px',
                        height: '42px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: inputMessage.trim() && !isLoading && conversation && !isSending && isWsConnected ? 'pointer' : 'not-allowed',
                        opacity: inputMessage.trim() && !isLoading && conversation && !isSending && isWsConnected ? 1 : 0.4,
                        transition: 'opacity 0.2s',
                        flexShrink: 0,
                    }}
                >
                    {isSending
                        ? <Loader2 size={16} style={{ color: '#fff', animation: 'spin 1s linear infinite' }} />
                        : <Send size={16} style={{ color: '#fff', marginLeft: '1px' }} />
                    }
                </button>
            </div>
        </div >
    );

    if (typeof window === 'undefined') return null;
    return ReactDOM.createPortal(popup, document.body);
}

// ---- Mini Message Bubble ----
function MiniMessageBubble({ msg, staffInfo }: { msg: MessageItem; staffInfo: UserInfo | null }) {
    let contentText = msg.text || '';
    let decodedImages: string[] = [];
    let decodedVideos: string[] = [];

    if (contentText.includes('|||')) {
        const parts = contentText.split('|||');
        contentText = parts[0];
        if (parts[1]) decodedImages = parts[1].split(',').filter((u: string) => u);
        if (parts[2]) decodedVideos = parts[2].split(',').filter((u: string) => u);
    }

    // Bot welcome message — centered system bubble
    if (msg.senderName === 'Bot') {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                <div style={{
                    maxWidth: '90%',
                    padding: '8px 14px',
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    color: '#475569',
                    fontSize: '12px',
                    lineHeight: '1.5',
                    textAlign: 'center',
                    fontStyle: 'italic',
                }}>
                    <span style={{ marginRight: '5px' }}>🤖</span>
                    {contentText}
                    <div style={{ fontSize: '10px', marginTop: '4px', color: '#94a3b8' }}>{msg.time}</div>
                </div>
            </div>
        );
    }

    if (msg.fromMe) {
        return (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{
                    maxWidth: '75%',
                    padding: '8px 12px',
                    background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
                    borderRadius: '16px 16px 4px 16px',
                    color: '#fff',
                    fontSize: '13px',
                    lineHeight: '1.4',
                    boxShadow: '0 1px 3px rgba(185,28,28,0.3)',
                }}>
                    {decodedImages.map((url, i) => (
                        <img key={i} src={url} alt="" onClick={() => window.open(url, '_blank')}
                            style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '4px', cursor: 'pointer' }} />
                    ))}
                    {decodedVideos.map((url, i) => (
                        <video key={i} src={url} controls style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '4px' }} />
                    ))}
                    {contentText && <p style={{ margin: 0 }}>{contentText}</p>}
                    <div style={{ fontSize: '10px', textAlign: 'right', marginTop: '4px', opacity: 0.75 }}>{msg.time}</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
            {staffInfo?.avatarUrl ? (
                <img src={staffInfo.avatarUrl} alt="Staff" style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            ) : (
                <div style={{
                    width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                    background: '#fee2e2', color: '#dc2626',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 700,
                }}>
                    {(staffInfo?.fullName || 'S').charAt(0).toUpperCase()}
                </div>
            )}
            <div style={{
                maxWidth: '75%',
                padding: '8px 12px',
                background: '#fff',
                borderRadius: '16px 16px 16px 4px',
                color: '#1e293b',
                fontSize: '13px',
                lineHeight: '1.4',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}>
                {msg.senderName && (
                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#dc2626', marginBottom: '3px' }}>{msg.senderName}</div>
                )}
                {decodedImages.map((url, i) => (
                    <img key={i} src={url} alt="" onClick={() => window.open(url, '_blank')}
                        style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '4px', cursor: 'pointer' }} />
                ))}
                {decodedVideos.map((url, i) => (
                    <video key={i} src={url} controls style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '4px' }} />
                ))}
                {contentText && <p style={{ margin: 0 }}>{contentText}</p>}
                <div style={{ fontSize: '10px', marginTop: '4px', color: '#94a3b8' }}>{msg.time}</div>
            </div>
        </div>
    );
}


