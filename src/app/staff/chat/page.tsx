'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import ChatSidebar from '@/components/staff/chat/ChatSidebar';
import ChatMessages from '@/components/staff/chat/ChatMessages';
import ChatDetails from '@/components/staff/chat/ChatDetails';
import type { Conversation, MessageItem, Appointment, MediaItem } from '@/components/staff/chat/types';
import { chatService } from '@/services/chatService';
import { userService } from '@/services/userService';

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
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hasFetchedRef = useRef<boolean>(false);

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
  // Handle image select
  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles: File[] = [];
    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} không phải là ảnh!`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`Ảnh ${file.name} vượt quá 5MB!`);
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length === 0) return;

    const previewPromises = validFiles.map((file) => {
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
    if ((!inputMessage.trim() && selectedImages.length === 0) || !activeId || !activeConversation || isSending) {
      return;
    }

    setIsSending(true);
    try {
      const result = await chatService.sendMessage(activeId, inputMessage.trim());
      if (result.success && result.data) {
        // Accessing data fields through type casting or any
        const msg = result.data as any;
        const newMsg: MessageItem = {
          id: msg.id.toString(),
          text: msg.message || msg.content,
          fromMe: msg.senderRole === 'STAFF' || msg.senderId === activeConversation.staffId,
          time: formatTimeAgo(msg.createdAt),
          senderName: 'Staff',
          senderAvatar: undefined,
        };

        setActiveMessages(prev => [...prev, newMsg]);
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
  }, [inputMessage, activeId, activeConversation, isSending, formatTimeAgo, chatService, setActiveMessages, setInputMessage, setSelectedImages, setImagePreviews]);

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
          imagePreviews={imagePreviews}
          onImageSelect={handleImageSelect}
          onRemoveImage={handleRemoveImage}
          fileInputRef={fileInputRef}
          hasActiveConversation={!!activeConversation}
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
            mediaItems={mockMediaItems}
            isLoadingMedia={false}
            onClose={() => setShowDetails(false)}
            formatTimeAgo={formatTimeAgo}
          />
        )}
      </div>
    </div>
  );
}
