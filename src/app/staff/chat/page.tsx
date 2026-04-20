'use client';

import { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatDetails from '@/components/chat/ChatDetails';
import ScheduleFormModal from '@/components/chat/ScheduleFormModal';
import { useSearchParams } from 'next/navigation';
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
const mockMessages: MessageItem[] = [];
const mockAppointments: Appointment[] = [];
const mockMediaItems: MediaItem[] = [];

export default function ChatWithDonorPage() {
  return (
    <Suspense fallback={
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold uppercase tracking-widest">Đang tải cuộc trò chuyện...</p>
        </div>
      </div>
    }>
      <ChatWithDonorContent />
    </Suspense>
  );
}

function ChatWithDonorContent() {
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
  const autoSelectedRef = useRef<boolean>(false);
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  // Connect WebSocket on mount
  useEffect(() => {
    webSocketService.connect();
    return () => {
      webSocketService.disconnect();
    };
  }, []);

  const fetchConversations = async (isRefresh = false) => {
    // Prevent duplicate fetch in Strict Mode, but allow if it's a manual refresh
    if (!isRefresh && hasFetchedRef.current) return;
    if (!isRefresh) hasFetchedRef.current = true;

    setIsLoading(true);
    try {
      const result = await chatService.getAllConversations();

      if (result.success && result.data) {
        // Map API conversations to UI format
        // Need to fetch user info for each conversation
        const mappedConversations = await Promise.all(
          result.data.map(async (conv) => {
            // Fetch user info based on fundOwnerId
            // Assuming we are staff, talking to fundOwner
            const userResult = await userService.getUserById(conv.fundOwnerId || conv.id); // Fallback to id if fundOwnerId missing

            const user = userResult.success && userResult.data ? userResult.data : null;

            let campaignTitle = undefined;
            if (conv.campaignId) {
              try {
                const campaign = await campaignService.getById(conv.campaignId);
                campaignTitle = campaign.title;
              } catch (err) {
                console.error(`Failed to fetch title for campaign ${conv.campaignId}:`, err);
              }
            }

            return {
              id: conv.id.toString(),
              name: user?.fullName || `User ${conv.fundOwnerId}`,
              // API doesn't provide last message content, so we leave it empty or use placeholder
              lastMessage: 'Tap to view conversation',
              time: conv.lastMessageAt ? formatTimeAgo(conv.lastMessageAt) : '',
              avatar: user?.avatarUrl,
              unread: 0,
              staffId: conv.staffId,
              fundOwnerId: conv.fundOwnerId,
              campaignId: conv.campaignId,
              campaignTitle: campaignTitle,
            };
          })
        );

        setConversations(mappedConversations);

        const convId = searchParams?.get('conversationId');
        const campaignId = searchParams?.get('campaignId');

        if (convId) {
          const found = mappedConversations.find(c => c.id === convId);
          if (found) {
            setActiveId(convId);
            autoSelectedRef.current = true;
          }
        } else if (campaignId) {
          const found = mappedConversations.find(c => c.campaignId?.toString() === campaignId);
          if (found) {
            setActiveId(found.id);
            autoSelectedRef.current = true;
          }
        } else if (!autoSelectedRef.current && mappedConversations.length > 0 && !activeId) {
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

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update active conversation when search params change
  useEffect(() => {
    const convId = searchParams?.get('conversationId');
    const campaignId = searchParams?.get('campaignId');

    if (convId && conversations.length > 0) {
      const found = conversations.find(c => c.id.toString() === convId);
      if (found) {
        setActiveId(found.id);
      }
    } else if (campaignId && conversations.length > 0) {
      const found = conversations.find(c => c.campaignId?.toString() === campaignId);
      if (found) {
        setActiveId(found.id);
      }
    }
  }, [searchParams, conversations]);

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

        // Fetch first image from media-service if needed
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
          // Map API messages to UI format and filter out bot messages (senderId = 0)
          const mappedMessages: MessageItem[] = result.data
            .filter((msg: any) => msg.senderId !== 0)
            .map((msg: any) => {
              // Determine if message is from the staff member
              const fromMe = user?.id && msg.senderId === Number(user.id);

              return {
                id: msg.id.toString(),
                text: msg.content || msg.message,
                fromMe: !!fromMe,
                time: formatTimeAgo(msg.createdAt),
                senderName: fromMe ? 'Staff' : activeConversation?.name,
                senderAvatar: fromMe ? undefined : activeConversation?.avatar,
                imageUrls: msg.imageUrls,
                videoUrls: msg.videoUrls
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, formatTimeAgo, user?.id]);

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
          uploadedBy: 'User' // Default until we have sender info link
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

  // Handle schedule detection
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
    if (!user || !activeConversation || !activeConversation.fundOwnerId) {
      toast("Không tìm thấy thông tin người dùng để tạo lịch!", "error");
      return;
    }

    setIsSending(true);
    try {
      const res = await appointmentService.create({
        donorId: Number(activeConversation.fundOwnerId),
        staffId: Number(user.id),
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

  // Subscribe to WebSocket topic when active conversation changes
  useEffect(() => {
    if (!activeId) return;

    const handleNewMessage = (msg: any) => {
      console.log("[Staff Chat] Received message via WS:", msg);
      // Msg structure from BE: MessageResponse { id, conversationId, senderId, content, ... }
      if (msg.conversationId.toString() !== activeId.toString()) {
        console.log("[Staff Chat] Message ignored (wrong conversation):", msg.conversationId);
        return;
      }

      // Filter out bot messages (senderId = 0)
      if (msg.senderId === 0) return;

      const newMsg: MessageItem = {
        id: msg.id.toString(),
        text: msg.content,
        fromMe: (user?.id && msg.senderId === Number(user.id)) || false,
        time: formatTimeAgo(msg.createdAt),
        senderName: (user?.id && msg.senderId === Number(user.id)) ? 'Staff' : activeConversation?.name,
        senderAvatar: (user?.id && msg.senderId === Number(user.id)) ? undefined : activeConversation?.avatar,
        imageUrls: msg.imageUrls,
        videoUrls: msg.videoUrls
      };

      setActiveMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    };

    webSocketService.subscribe(`/topic/conversation/${activeId}`, handleNewMessage);

    return () => {
      webSocketService.unsubscribe(`/topic/conversation/${activeId}`);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, formatTimeAgo, user?.id]);

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
      if (file.type.startsWith('video/')) {
        return Promise.resolve('');
      }
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previewPromises).then((previews) => {
      setSelectedImages((prev) => [...prev, ...validFiles]);
      setImagePreviews((prev) => [...prev, ...previews]);
    });
  }, [toast]);

  // Handle remove image
  const handleRemoveImage = useCallback((index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Handle send message
  const handleSendMessage = useCallback(async () => {
    console.log("[Staff Chat] handleSendMessage triggered:", {
      inputMessage,
      selectedImagesCount: selectedImages.length,
      activeId,
      hasActiveConversation: !!activeConversation,
      isSending,
      userId: user?.id
    });

    const hasMedia = selectedImages.length > 0;
    if ((!inputMessage.trim() && !hasMedia) || !activeId || !activeConversation || isSending) {
      console.log("[Staff Chat] Message sending blocked by validation check");
      return;
    }

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
            const cappedProgress = Math.min(p, 98);
            progressMap.set(index, cappedProgress);
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

      let textContent = inputMessage.trim();
      let finalContent = textContent;
      if (mediaUrls.length > 0 || videoUrls.length > 0) {
        finalContent = `${textContent}|||${mediaUrls.join(',')}|||${videoUrls.join(',')}`;
      }

      if (user?.id) {
        console.log("[Staff Chat] Sending WebSocket message", {
          to: `/app/chat/${activeId}`,
          senderId: user.id,
          role: 'ROLE_STAFF'
        });
        // Essential fix: Send senderRole to avoid ForbiddenException on Backend
        webSocketService.sendMessage(`/app/chat/${activeId}`, {
          conversationId: Number(activeId),
          content: finalContent,
          senderId: Number(user.id),
          senderRole: 'ROLE_STAFF'
        });

        setInputMessage('');
        setSelectedImages([]);
        setImagePreviews([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  }, [inputMessage, selectedImages, activeId, activeConversation, isSending, formatTimeAgo, user?.id, toast]);

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
          onRefresh={() => fetchConversations(true)}
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
            userEmail="user@example.com"
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
