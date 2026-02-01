export interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
  avatar?: string;
  staffId?: number;
  fundOwnerId?: number;
}

export interface MessageItem {
  id: string;
  fromMe: boolean;
  text?: string;
  time: string;
  senderName?: string;
  senderAvatar?: string;
  imageUrl?: string;
  imageUrls?: string[];
}

export interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
  location?: string;
  notes?: string;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'file';
  url: string;
  name: string;
  size?: string;
  uploadedAt: string;
  uploadedBy: string;
}
