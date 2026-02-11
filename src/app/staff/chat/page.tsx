'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import ChatSidebar from '@/components/staff/chat/ChatSidebar';
import ChatMessages from '@/components/staff/chat/ChatMessages';
import ChatDetails from '@/components/staff/chat/ChatDetails';
import type { Conversation, MessageItem, Appointment, MediaItem } from '@/components/staff/chat/types';
import { chatService } from '@/services/chatService';
import { userService } from '@/services/userService';
import { campaignService } from '@/services/campaignService';
import { mediaService } from '@/services/mediaService';
import { webSocketService } from '@/services/websocketService';
import { useAuth } from '@/contexts/AuthContextProxy';
import { useToast } from '@/components/ui/Toast';
import type { CampaignDto } from '@/types/campaign';

// Keep some mocks for message details/appointments/media since those APIs aren't implemented yet
const mockMessages: MessageItem[] = [];
const mockAppointments: Appointment[] = [];
const mockMediaItems: MediaItem[] = [];

export default function ChatWithDonorPage() {
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hasFetchedRef = useRef<boolean>(false);
  const { user } = useAuth();
  const { toast } = useToast();

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
          // Need to fetch user info for each conversation
          const mappedConversations = await Promise.all(
            result.data.map(async (conv) => {
              // Fetch user info based on fundOwnerId
              // Assuming we are staff, talking to fundOwner
              const userResult = await userService.getUserById(conv.fundOwnerId || conv.id); // Fallback to id if fundOwnerId missing, though interface implies it's number

              const user = userResult.success && userResult.data ? userResult.data : null;

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
              };
            })
          );

          setConversations(mappedConversations);
          if (mappedConversations.length > 0 && !activeId) {
            setActiveId(mappedConversations[0].id);
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

        // Fetch first image from media-service if needed
        try {
          const firstImage = await mediaService.getCampaignFirstImage(activeConversation.campaignId!);
          if (firstImage && firstImage.url) {
            campaign.coverImage = firstImage.url;
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
          // Map API messages to UI format
          const mappedMessages: MessageItem[] = result.data.map((msg: any) => {
            // Determine if message is from the staff member
            // Use senderRole if BE provides it, otherwise compare IDs
            const fromMe = msg.senderRole
              ? msg.senderRole === 'STAFF'
              : activeConversation && msg.senderId === activeConversation.staffId;

            return {
              id: msg.id.toString(),
              text: msg.content || msg.message, // Fallback to message just in case
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
  }, [activeId, activeConversation, formatTimeAgo]);

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

  // Subscribe to WebSocket topic when active conversation changes
  useEffect(() => {
    if (!activeId) return;

    const handleNewMessage = (msg: any) => {
      // Check if message belongs to current conversation (though topic is specific)
      // Msg structure from BE: MessageResponse { id, conversationId, senderId, content, ... }
      if (msg.conversationId.toString() !== activeId.toString()) return;

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
        // Prevent duplicates
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    };

    webSocketService.subscribe(`/topic/conversation/${activeId}`, handleNewMessage);

    return () => {
      webSocketService.unsubscribe(`/topic/conversation/${activeId}`);
    };
  }, [activeId, activeConversation, formatTimeAgo, user?.id]);

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
      if (file.size > 10 * 1024 * 1024) { // Increase to 10MB for videos
        toast(`${file.type.startsWith('image/') ? 'Ảnh' : 'Video'} ${file.name} vượt quá 10MB!`, 'error');
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length === 0) return;

    const previewPromises = validFiles.map((file) => {
      if (file.type.startsWith('video/')) {
        return Promise.resolve(''); // No preview for video for now, or use a placeholder
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
  }, []);

  // Handle remove image
  const handleRemoveImage = useCallback((index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Handle send message
  const handleSendMessage = useCallback(async () => {
    const hasMedia = selectedImages.length > 0;
    if ((!inputMessage.trim() && !hasMedia) || !activeId || !activeConversation || isSending) {
      return;
    }

    setIsSending(true);
    try {
      let mediaUrls: string[] = [];
      let videoUrls: string[] = [];

      // 1. Upload media if any
      if (selectedImages.length > 0) {
        setIsUploadingImage(true);
        setUploadProgress(0);
        try {
          const progressMap = new Map<number, number>();
          const updateOverallProgress = (index: number, p: number) => {
            // Cap at 98% to avoid "full bar" while server is still processing
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

      // 2. Prepare message content
      let textContent = inputMessage.trim();

      // Kỹ thuật Encode: Đóng gói media vào content tin nhắn
      // Định dạng: TEXT|||IMAGE_URLS|||VIDEO_URLS
      let finalContent = textContent;
      if (mediaUrls.length > 0 || videoUrls.length > 0) {
        finalContent = `${textContent}|||${mediaUrls.join(',')}|||${videoUrls.join(',')}`;
      }

      if (user?.id) {
        webSocketService.sendMessage(`/app/chat/${activeId}`, {
          conversationId: Number(activeId),
          content: finalContent,
          senderId: Number(user.id)
        });
        // Optimistic update or wait for WS echo?
        // WS echo (subscription) handles the UI update.
        // Just clear input.
        setInputMessage('');
        setSelectedImages([]);
        setImagePreviews([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        // Fallback or error if no user
        console.error("User not identified for WS message");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  }, [inputMessage, selectedImages, activeId, activeConversation, isSending, formatTimeAgo, setActiveMessages, setInputMessage, setSelectedImages, setImagePreviews, user?.id]);

  return (
    <div className="h-full bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex h-full">
        {/* Left: Assigned conversations list */}
        <ChatSidebar
          conversations={filteredConversations}
          activeId={activeId}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onConversationClick={setActiveId}
          onShowNewClick={() => { }} // Removed functionality
          newCustomersCount={0} // Removed functionality
        />

        {/* Middle: messages */}
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
        />

        {/* Right: slide-in customer details */}
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
    </div>
  );
}
