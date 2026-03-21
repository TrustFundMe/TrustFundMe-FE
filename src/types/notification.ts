export interface Notification {
    id: number;
    userId: number;
    type: string;
    targetId: number;
    targetType: string;
    title: string;
    content: string;
    data: string; // JSON string from backend
    isRead: boolean;
    readAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationRequest {
    userId: number;
    type: string;
    targetId: number;
    targetType: string;
    title: string;
    content: string;
    data: Record<string, any>;
}
