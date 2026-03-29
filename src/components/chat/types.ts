export interface Conversation {
    id: string;
    name: string;
    lastMessage: string;
    time: string;
    unread?: number;
    avatar?: string;
    staffId?: number;
    fundOwnerId?: number;
    campaignId?: number;
    campaignTitle?: string;
}

export interface MessageItem {
    id: string;
    fromMe: boolean;
    text?: string;
    time: string;
    rawTime?: string;  // ISO timestamp for time separator calculation
    senderName?: string;
    senderAvatar?: string;
    imageUrl?: string;
    imageUrls?: string[];
    videoUrl?: string;
    videoUrls?: string[];
    /** True if this message was sent by the bot (senderId = 0) */
    isBot?: boolean;
    /** Original sender ID for internal use */
    senderId?: number;
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
