'use client';

import { useState, useRef, useCallback } from 'react';
import NewCustomersPanel from '@/components/staff/chat/NewCustomersPanel';
import ChatSidebar from '@/components/staff/chat/ChatSidebar';
import ChatMessages from '@/components/staff/chat/ChatMessages';
import ChatDetails from '@/components/staff/chat/ChatDetails';
import type { Conversation, MessageItem, Appointment, MediaItem } from '@/components/staff/chat/types';

// Mock data - chỉ để hiển thị UI
const mockNewCustomers: Conversation[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    lastMessage: 'Xin chào, tôi cần hỗ trợ về campaign...',
    time: '2 phút trước',
    avatar: undefined,
  },
  {
    id: '2',
    name: 'Trần Thị B',
    lastMessage: 'Tôi muốn đóng góp nhưng gặp vấn đề...',
    time: '5 phút trước',
    avatar: undefined,
  },
];

const mockAssignedConversations: Conversation[] = [
  {
    id: '3',
    name: 'Lê Văn C',
    lastMessage: 'Cảm ơn bạn đã hỗ trợ!',
    time: '1 giờ trước',
    avatar: undefined,
  },
  {
    id: '4',
    name: 'Phạm Thị D',
    lastMessage: 'Tôi đã nhận được email xác nhận',
    time: '2 giờ trước',
    avatar: undefined,
  },
];

const mockMessages: MessageItem[] = [
  {
    id: '1',
    fromMe: false,
    text: 'Xin chào, tôi cần hỗ trợ về campaign của tôi',
    time: '10:30',
    senderName: 'Lê Văn C',
    senderAvatar: undefined,
  },
  {
    id: '2',
    fromMe: true,
    text: 'Chào bạn! Tôi có thể giúp gì cho bạn?',
    time: '10:31',
  },
  {
    id: '3',
    fromMe: false,
    text: 'Campaign của tôi đã được duyệt chưa?',
    time: '10:32',
    senderName: 'Lê Văn C',
  },
  {
    id: '4',
    fromMe: true,
    text: 'Để tôi kiểm tra giúp bạn nhé',
    time: '10:33',
  },
];

const mockAppointments: Appointment[] = [
  {
    id: '1',
    title: 'Hẹn gặp để thảo luận về campaign',
    date: '2024-01-15',
    time: '14:00',
    status: 'scheduled',
    location: 'Văn phòng TrustFundMe, 123 Đường ABC',
    notes: 'Thảo luận về chiến dịch gây quỹ cho trẻ em',
  },
  {
    id: '2',
    title: 'Kiểm tra tiến độ campaign',
    date: '2024-01-10',
    time: '10:00',
    status: 'completed',
    location: 'Online - Google Meet',
  },
  {
    id: '3',
    title: 'Hẹn gặp lần đầu',
    date: '2024-01-05',
    time: '15:30',
    status: 'completed',
    location: 'Café XYZ, 456 Đường DEF',
  },
];

const mockMediaItems: MediaItem[] = [
  {
    id: '1',
    type: 'image',
    url: 'https://placehold.co/400x300?text=Campaign+Image',
    name: 'campaign-banner.jpg',
    size: '245760',
    uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    uploadedBy: 'Lê Văn C',
  },
  {
    id: '2',
    type: 'file',
    url: '#',
    name: 'campaign-proposal.pdf',
    size: '1048576',
    uploadedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    uploadedBy: 'Lê Văn C',
  },
  {
    id: '3',
    type: 'image',
    url: 'https://placehold.co/400x300?text=Event+Photo',
    name: 'event-photo.png',
    size: '512000',
    uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    uploadedBy: 'Staff',
  },
  {
    id: '4',
    type: 'video',
    url: 'https://placehold.co/400x300?text=Video',
    name: 'campaign-video.mp4',
    size: '5242880',
    uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    uploadedBy: 'Lê Văn C',
  },
];

export default function ChatWithDonorPage() {
  const [showNew, setShowNew] = useState<boolean>(false);
  const [activeId, setActiveId] = useState<string>('3');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filter conversations based on search
  const filteredNewCustomers = mockNewCustomers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredAssigned = mockAssignedConversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get active conversation
  const activeConversation = mockAssignedConversations.find((c) => c.id === activeId);
  const activeMessages = activeId === '3' ? mockMessages : [];

  // Format time helper
  const formatTimeAgo = useCallback((timestamp: string): string => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  }, []);

  // Handle accept new conversation
  const handleAccept = useCallback((id: string) => {
    // UI only - không có logic thật
    console.log('Accept conversation:', id);
    setShowNew(false);
    setActiveId(id);
  }, []);

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
  const handleSendMessage = useCallback(() => {
    if ((!inputMessage.trim() && selectedImages.length === 0) || !activeConversation) return;
    
    // UI only - không gửi thật
    console.log('Send message:', inputMessage);
    setInputMessage('');
    setSelectedImages([]);
    setImagePreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [inputMessage, selectedImages, activeConversation]);

  return (
    <div className="h-full bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex h-full">
        {/* Far Left: New Customers Panel */}
        {showNew && (
          <NewCustomersPanel
            conversations={filteredNewCustomers}
            isLoading={false}
            onAccept={handleAccept}
            onClose={() => setShowNew(false)}
          />
        )}

        {/* Left: Assigned conversations list */}
        <ChatSidebar
          conversations={filteredAssigned}
          activeId={activeId}
          isLoading={false}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onConversationClick={setActiveId}
          onShowNewClick={() => setShowNew(true)}
          newCustomersCount={mockNewCustomers.length}
        />

        {/* Middle: messages */}
        <ChatMessages
          messages={activeMessages}
          isLoading={false}
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
