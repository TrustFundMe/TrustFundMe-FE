'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatDetails from '@/components/chat/ChatDetails';
import ScheduleFormModal from '@/components/chat/ScheduleFormModal';
import type { Conversation, MessageItem, Appointment, MediaItem } from '@/components/chat/types';
import { chatService } from '@/services/chatService';
import { userService } from '@/services/userService';
import { campaignService } from '@/services/campaignService';
import { mediaService } from '@/services/mediaService';
import { webSocketService } from '@/services/websocketService';
import { useAuth } from '@/contexts/AuthContextProxy';
import { useToast } from '@/components/ui/Toast';
import type { CampaignDto } from '@/types/campaign';
import { appointmentService } from '@/services/appointmentService';

// Keep some mocks for message details/appointments/media since those APIs aren't implemented yet
const mockAppointments: Appointment[] = [];

export default function AccountChatPage() {
    const [activeId, setActiveId] = useState<string>('');
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showDetails, setShowDetails] = useState<boolean>(false);
    const [inputMessage, setInputMessage] = useState<string>('');
    const [isSending, setIsSending] = useState<boolean>(false);
    const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [showSchedulePopup, setShowSchedulePopup] = useState(false);
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [detectedScheduleText, setDetectedScheduleText] = useState('');
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const hasFetchedRef = useRef<boolean>(false);
    const { user } = useAuth();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const autoSelectedRef = useRef<boolean>(false);

    // Connect WebSocket on mount
    useEffect(() => {
        webSocketService.connect();
        return () => {
            webSocketService.disconnect();
        };
    }, []);

    // Fetch conversations on mount
    useEffect(() => {
        const fetchConversations = async () => {
            // Prevent duplicate fetch in Strict Mode
            if (hasFetchedRef.current) return;
            hasFetchedRef.current = true;

            setIsLoading(true);
            try {
                const result = await chatService.getAllConversations();

                if (result.success && result.data) {
                    // Map API conversations to UI format
                    const mappedConversations = await Promise.all(
                        result.data.map(async (conv) => {
                            // For account user, we talk to staff
                            const staffResult = await userService.getUserById(conv.staffId);
                            const staff = staffResult.success && staffResult.data ? staffResult.data : null;

                            let campaignTitle = undefined;
                            if (conv.campaignId) {
                                try {
                                    const campaign = await campaignService.getById(conv.campaignId);
                                    campaignTitle = campaign.title;
                                } catch (err) {
                                    console.error(`Failed to fetch title for campaign ${conv.campaignId}:`, err);
                                }
                            }

                            // Fetch latest message preview
                            let lastMessage = 'Bắt đầu cuộc trò chuyện...';
                            try {
                                const msgResult = await chatService.getMessagesByConversationId(conv.id);
                                if (msgResult.success && msgResult.data && msgResult.data.length > 0) {
                                    const latest = msgResult.data[msgResult.data.length - 1];
                                    const rawContent: string = latest.content || latest.message || '';
                                    // Strip media payload (format: text|||imageUrls|||videoUrls)
                                    const textOnly = rawContent.split('|||')[0].trim();
                                    lastMessage = textOnly || 'Đã gửi media';
                                }
                            } catch (err) {
                                console.error(`Failed to fetch messages for conv ${conv.id}:`, err);
                            }

                            return {
                                id: conv.id.toString(),
                                name: staff?.fullName || `Staff ${conv.staffId}`,
                                lastMessage,
                                time: conv.lastMessageAt ? formatTimeAgo(conv.lastMessageAt) : '',
                                avatar: staff?.avatarUrl,
                                unread: 0,
                                staffId: conv.staffId,
                                fundOwnerId: conv.fundOwnerId,
                                campaignId: conv.campaignId,
                                campaignTitle: campaignTitle,
                            };
                        })
                    );

                    setConversations(mappedConversations);

                    // Handle query params AFTER conversations are set
                    const convId = searchParams.get('conversationId');
                    const campaignId = searchParams.get('campaignId');

                    if (convId) {
                        const found = mappedConversations.find(c => c.id === convId);
                        if (found) {
                            setActiveId(convId);
                            autoSelectedRef.current = true;
                        }
                    } else if (campaignId) {
                        // Find conversation by campaignId
                        const found = mappedConversations.find(c => c.campaignId?.toString() === campaignId);
                        if (found) {
                            setActiveId(found.id);
                            autoSelectedRef.current = true;
                        } else {
                            // Create new conversation for this campaign
                            try {
                                const createResult = await chatService.createConversationByCampaign(
                                    Number(campaignId)
                                );
                                if (createResult.success && createResult.data) {
                                    // Add new conversation to list
                                    const newConv = {
                                        id: createResult.data.id.toString(),
                                        name: 'Staff',
                                        lastMessage: 'Nhấn để xem cuộc trò chuyện',
                                        time: '',
                                        avatar: undefined,
                                        unread: 0,
                                        staffId: createResult.data.staffId,
                                        fundOwnerId: createResult.data.fundOwnerId,
                                        campaignId: createResult.data.campaignId,
                                        campaignTitle: undefined,
                                    };
                                    setConversations(prev => [newConv, ...prev]);
                                    setActiveId(newConv.id);
                                    autoSelectedRef.current = true;
                                }
                            } catch (err) {
                                console.error("Failed to create conversation:", err);
                            }
                        }
                    } else if (mappedConversations.length > 0 && !autoSelectedRef.current) {
                        // Không có query params → tự động mở conversation đầu tiên
                        setActiveId(mappedConversations[0].id);
                        autoSelectedRef.current = true;
                    }
                }
            } catch (error) {
                console.error("Failed to fetch conversations:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchConversations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Format time helper
    const formatTimeAgo = useCallback((timestamp: string): string => {
        if (!timestamp) return '';
        const now = new Date();
        const created = new Date(timestamp);
        const diffInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000);

        if (diffInSeconds < 60) return 'vừa xong';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
        return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    }, []);

    // Filter conversations based on search
    const filteredConversations = conversations.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get active conversation
    const activeConversation = conversations.find((c) => c.id === activeId);
    const [activeMessages, setActiveMessages] = useState<MessageItem[]>([]);
    const [isMessagesLoading, setIsMessagesLoading] = useState<boolean>(false);
    const [activeCampaignInfo, setActiveCampaignInfo] = useState<CampaignDto | null>(null);

    // Fetch campaign info when active conversation changes
    useEffect(() => {
        if (!activeConversation?.campaignId) {
            setActiveCampaignInfo(null);
            return;
        }

        const fetchCampaignInfo = async () => {
            try {
                const campaign = await campaignService.getById(activeConversation.campaignId!);
                try {
                    const firstImage = await mediaService.getCampaignFirstImage(Number(activeConversation.campaignId));
                    if (firstImage && firstImage.url) {
                        campaign.coverImageUrl = firstImage.url;
                    }
                } catch (mediaError) {
                    console.error("Failed to fetch campaign media:", mediaError);
                }
                setActiveCampaignInfo(campaign);
            } catch (error) {
                console.error("Failed to fetch campaign info:", error);
                setActiveCampaignInfo(null);
            }
        };

        fetchCampaignInfo();
    }, [activeConversation?.campaignId]);

    // Fetch messages when conversation changes
    useEffect(() => {
        if (!activeId || !activeConversation) return;

        const fetchMessages = async () => {
            setIsMessagesLoading(true);
            try {
                const result = await chatService.getMessagesByConversationId(activeId);
                if (result.success && result.data) {
                    interface ApiMessage {
                        id: number | string;
                        senderId: number;
                        content?: string;
                        message?: string;
                        createdAt: string;
                        imageUrls?: string[];
                        videoUrls?: string[];
                    }
                    const mappedMessages: MessageItem[] = (result.data as ApiMessage[])
                        .map((msg) => {
                            const isBot = msg.senderId === 0;
                            const fromMe = !isBot && user?.id && msg.senderId === Number(user.id);
                            return {
                                id: msg.id.toString(),
                                text: msg.content || msg.message || '',
                                fromMe: !!fromMe,
                                time: formatTimeAgo(msg.createdAt),
                                rawTime: msg.createdAt,
                                senderName: isBot ? 'Bot' : (fromMe ? user?.fullName : activeConversation?.name),
                                senderAvatar: fromMe ? user?.avatarUrl : activeConversation?.avatar,
                                imageUrls: msg.imageUrls,
                                videoUrls: msg.videoUrls,
                                isBot,
                                senderId: msg.senderId,
                            };
                        });
                    setActiveMessages(mappedMessages);
                }
            } catch (error) {
                console.error("Failed to fetch messages:", error);
            } finally {
                setIsMessagesLoading(false);
            }
        };

        fetchMessages();
    }, [activeId, activeConversation, formatTimeAgo, user?.id, user?.fullName, user?.avatarUrl]);

    const [activeMediaItems, setActiveMediaItems] = useState<MediaItem[]>([]);
    const [isMediaLoading, setIsMediaLoading] = useState<boolean>(false);

    // Fetch media items when conversation changes
    useEffect(() => {
        if (!activeId) return;

        const fetchMedia = async () => {
            setIsMediaLoading(true);
            try {
                const items = await mediaService.getMediaByConversationId(Number(activeId));
                const mappedItems: MediaItem[] = items.map(item => ({
                    id: item.id.toString(),
                    type: item.mediaType.toLowerCase() as 'image' | 'video' | 'file',
                    url: item.url,
                    name: item.fileName,
                    size: item.sizeBytes.toString(),
                    uploadedAt: item.createdAt,
                    uploadedBy: 'User'
                }));
                setActiveMediaItems(mappedItems);
            } catch (error) {
                console.error("Failed to fetch media history:", error);
            } finally {
                setIsMediaLoading(false);
            }
        };

        fetchMedia();
    }, [activeId]);

    // Handle schedule detection (Optional for donor, but usually staff initiates. We can keep it if needed)
    useEffect(() => {
        if (!inputMessage.trim()) {
            setShowSchedulePopup(false);
            return;
        }
        const scheduleRegex = /(?:\d|ngày|mai|mốt|kia|thứ|lúc|giờ)/i;
        const match = inputMessage.match(scheduleRegex);
        if (match) {
            setDetectedScheduleText(inputMessage);
            setShowSchedulePopup(true);
        } else {
            setShowSchedulePopup(false);
        }
    }, [inputMessage]);

    const handleStartSchedule = () => {
        setShowSchedulePopup(false);
        setShowScheduleForm(true);
    };

    const handleScheduleSubmit = async (data: { purpose: string, location: string, startTime: string, endTime: string }) => {
        if (!user || !activeConversation || !activeConversation.staffId) {
            toast("Không tìm thấy thông tin nhân viên để tạo lịch!", "error");
            return;
        }

        setIsSending(true);
        try {
            const res = await appointmentService.create({
                donorId: Number(user.id),
                staffId: Number(activeConversation.staffId),
                startTime: data.startTime,
                endTime: data.endTime,
                location: data.location,
                purpose: data.purpose
            });

            if (res) {
                toast('Đã gửi yêu cầu đặt lịch!', 'success');
                setShowScheduleForm(false);
                setDetectedScheduleText('');
            }
        } catch (error: any) {
            console.error("Failed to create appointment:", error);
            const msg = error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi tạo lịch !";
            toast(msg, "error");
        } finally {
            setIsSending(false);
        }
    };

    // Subscribe to WebSocket topic
    useEffect(() => {
        if (!activeId) return;

        const handleNewMessage = (msg: {
            id: number | string;
            conversationId: number | string;
            senderId: number;
            content: string;
            createdAt: string;
            imageUrls?: string[];
            videoUrls?: string[];
        }) => {
            if (msg.conversationId.toString() !== activeId.toString()) return;

            const isBot = msg.senderId === 0;
            const isFromMe = !isBot && user?.id && msg.senderId === Number(user.id);

            const newMsg: MessageItem = {
                id: msg.id.toString(),
                text: msg.content,
                fromMe: !!isFromMe,
                time: formatTimeAgo(msg.createdAt),
                senderName: isBot ? 'Bot' : (isFromMe ? user?.fullName : activeConversation?.name),
                senderAvatar: isFromMe ? user?.avatarUrl : activeConversation?.avatar,
                imageUrls: msg.imageUrls,
                videoUrls: msg.videoUrls,
                isBot,
                senderId: msg.senderId,
            };

            setActiveMessages(prev => {
                if (prev.some(m => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
            });

            // Update conversations list real-time (update last message, time, and move to top)
            setConversations(prev => {
                const convIndex = prev.findIndex(c => c.id.toString() === msg.conversationId.toString());
                if (convIndex === -1) return prev; // If conversation not loaded, let it be

                let lastMessageText = 'Đã gửi media';
                if (msg.content) {
                    const textOnly = msg.content.split('|||')[0].trim();
                    if (textOnly) lastMessageText = textOnly;
                }

                const updatedConv = {
                    ...prev[convIndex],
                    lastMessage: lastMessageText,
                    time: 'vừa xong', // It just arrived
                    unread: prev[convIndex].id !== activeId ? (prev[convIndex].unread || 0) + 1 : 0
                };

                const nextConvs = [...prev];
                nextConvs.splice(convIndex, 1);
                nextConvs.unshift(updatedConv);
                return nextConvs;
            });
        };

        webSocketService.subscribe(`/topic/conversation/${activeId}`, handleNewMessage);
        return () => {
            webSocketService.unsubscribe(`/topic/conversation/${activeId}`);
        };
    }, [activeId, activeConversation, formatTimeAgo, user?.id, user?.fullName, user?.avatarUrl]);

    // Handle image select
    const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const validFiles: File[] = [];
        files.forEach((file) => {
            if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
                toast(`File ${file.name} không phải là ảnh hoặc video!`, 'error');
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                toast(`${file.type.startsWith('image/') ? 'Ảnh' : 'Video'} ${file.name} vượt quá 10MB!`, 'error');
                return;
            }
            validFiles.push(file);
        });

        if (validFiles.length === 0) return;

        const previewPromises = validFiles.map((file) => {
            if (file.type.startsWith('video/')) return Promise.resolve('');
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(previewPromises).then((previews) => {
            setSelectedImages((prev) => [...prev, ...validFiles]);
            setImagePreviews((prev) => [...prev, ...previews]);
        });
    }, [toast]);

    const handleRemoveImage = useCallback((index: number) => {
        setSelectedImages((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    }, []);

    // Handle send message
    const handleSendMessage = useCallback(async () => {
        const hasMedia = selectedImages.length > 0;
        if ((!inputMessage.trim() && !hasMedia) || !activeId || !activeConversation || isSending) return;

        setIsSending(true);
        try {
            let mediaUrls: string[] = [];
            let videoUrls: string[] = [];

            if (selectedImages.length > 0) {
                setIsUploadingImage(true);
                setUploadProgress(0);
                try {
                    const progressMap = new Map<number, number>();
                    const updateOverallProgress = (index: number, p: number) => {
                        progressMap.set(index, Math.min(p, 98));
                        const total = Array.from(progressMap.values()).reduce((a, b) => a + b, 0);
                        setUploadProgress(Math.round(total / selectedImages.length));
                    };

                    const uploadPromises = selectedImages.map(async (file, index) => {
                        const isVideo = file.type.startsWith('video/');
                        const result = await mediaService.uploadForConversation(
                            file,
                            Number(activeId),
                            'Chat message media',
                            isVideo ? 'VIDEO' : 'PHOTO',
                            (p) => updateOverallProgress(index, p)
                        );
                        return { url: result.url, isVideo };
                    });

                    const results = await Promise.all(uploadPromises);
                    mediaUrls = results.filter(r => !r.isVideo).map(r => r.url);
                    videoUrls = results.filter(r => r.isVideo).map(r => r.url);
                } catch (uploadError) {
                    console.error("Failed to upload media:", uploadError);
                    toast("Không thể tải ảnh/video lên. Vui lòng thử lại!", 'error');
                    setIsUploadingImage(false);
                    setUploadProgress(0);
                    setIsSending(false);
                    return;
                } finally {
                    setIsUploadingImage(false);
                    setUploadProgress(0);
                }
            }

            const textContent = inputMessage.trim();
            let finalContent = textContent;
            if (mediaUrls.length > 0 || videoUrls.length > 0) {
                finalContent = `${textContent}|||${mediaUrls.join(',')}|||${videoUrls.join(',')}`;
            }

            if (user?.id) {
                webSocketService.sendMessage(`/app/chat/${activeId}`, {
                    conversationId: Number(activeId),
                    content: finalContent,
                    senderId: Number(user.id),
                    senderRole: 'ROLE_USER'
                });

                setInputMessage('');
                setSelectedImages([]);
                setImagePreviews([]);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSending(false);
        }
    }, [inputMessage, selectedImages, activeId, activeConversation, isSending, user?.id, toast]);

    return (
        <div className="h-full">
            <div className="flex h-full">
                <ChatSidebar
                    conversations={filteredConversations}
                    activeId={activeId}
                    isLoading={isLoading}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onConversationClick={setActiveId}
                    onShowNewClick={() => { }}
                    newCustomersCount={0}
                />

                <ChatMessages
                    messages={activeMessages}
                    isLoading={isMessagesLoading}
                    activeConversationName={activeConversation?.name}
                    activeConversationAvatar={activeConversation?.avatar}
                    onShowDetails={() => setShowDetails(true)}
                    inputMessage={inputMessage}
                    onInputChange={setInputMessage}
                    onSend={handleSendMessage}
                    isSending={isSending}
                    isUploadingImage={isUploadingImage}
                    uploadProgress={uploadProgress}
                    imagePreviews={imagePreviews}
                    onImageSelect={handleImageSelect}
                    onRemoveImage={handleRemoveImage}
                    fileInputRef={fileInputRef}
                    selectedFiles={selectedImages}
                    hasActiveConversation={!!activeConversation}
                    campaignInfo={activeCampaignInfo}
                    showSchedulePopup={showSchedulePopup}
                    detectedScheduleText={detectedScheduleText}
                    onScheduleConfirm={handleStartSchedule}
                    onScheduleCancel={() => setShowSchedulePopup(false)}
                />

                {showDetails && activeConversation && (
                    <ChatDetails
                        userName={activeConversation.name}
                        userEmail="staff@trustfundme.com"
                        userAvatar={activeConversation.avatar}
                        conversationStatus="active"
                        conversationCreatedAt={new Date().toISOString()}
                        appointments={mockAppointments}
                        isLoadingAppointments={false}
                        mediaItems={activeMediaItems}
                        isLoadingMedia={isMediaLoading}
                        onClose={() => setShowDetails(false)}
                        formatTimeAgo={formatTimeAgo}
                    />
                )}
            </div>

            <ScheduleFormModal
                isVisible={showScheduleForm}
                onClose={() => setShowScheduleForm(false)}
                onSubmit={handleScheduleSubmit}
                isSubmitting={isSending}
            />
        </div>
    );
}
