import { api } from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { Notification } from "@/types/notification";

export const notificationService = {
    async getByUserId(userId: number | string): Promise<Notification[]> {
        const res = await api.get<Notification[]>(API_ENDPOINTS.NOTIFICATIONS.BY_USER(userId));
        return res.data;
    },
    async getLatest(userId: number | string): Promise<Notification[]> {
        const res = await api.get<Notification[]>(API_ENDPOINTS.NOTIFICATIONS.LATEST(userId));
        return res.data;
    },

    async getUnreadCount(userId: number | string): Promise<number> {
        const res = await api.get<number>(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT(userId));
        return res.data;
    },

    async markAsRead(id: number | string): Promise<Notification> {
        const res = await api.put<Notification>(API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(id));
        return res.data;
    },

    async createEvent(request: any): Promise<Notification> {
        const res = await api.post<Notification>(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/event`, request);
        return res.data;
    }
};
