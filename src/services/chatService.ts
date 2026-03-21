import { api } from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

export interface Conversation {
    id: number;
    staffId: number;
    fundOwnerId: number;
    campaignId: number;
    lastMessageAt: string;
    createdAt: string;
    updatedAt: string;
}

export const chatService = {
    /**
     * Get all conversations for the current staff member
     */
    async getAllConversations(): Promise<{
        success: boolean;
        data?: Conversation[];
        error?: string;
    }> {
        try {
            const response = await api.get<Conversation[]>(API_ENDPOINTS.CHAT.CONVERSATIONS);
            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            console.error("Chat service error:", error);
            return {
                success: false,
                error: error?.response?.data?.message || error?.message || "Failed to fetch conversations",
            };
        }
    },

    /**
     * Get messages for a specific conversation
     */
    async getMessagesByConversationId(conversationId: string | number): Promise<{
        success: boolean;
        data?: any[];
        error?: string;
    }> {
        try {
            const response = await api.get<any[]>(API_ENDPOINTS.CHAT.MESSAGES(conversationId));
            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            console.error("Chat service error:", error);
            return {
                success: false,
                error: error?.response?.data?.message || error?.message || "Failed to fetch messages",
            };
        }
    },

    async sendMessage(
        conversationId: string | number,
        content: string
    ): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }> {
        try {
            const response = await api.post(API_ENDPOINTS.CHAT.MESSAGES(conversationId), { content });
            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            console.error("Chat service error:", error);
            return {
                success: false,
                error: error?.response?.data?.message || error?.message || "Failed to send message",
            };
        }
    },

    /**
     * Create a new conversation
     */
    async createConversation(fundOwnerId: number, campaignId?: number, staffId?: number): Promise<{
        success: boolean;
        data?: Conversation;
        error?: string;
    }> {
        try {
            const response = await api.post<Conversation>(API_ENDPOINTS.CHAT.CONVERSATIONS, {
                fundOwnerId,
                campaignId,
                staffId
            });
            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            console.error("Chat service error:", error);
            return {
                success: false,
                error: error?.response?.data?.message || error?.message || "Failed to create conversation",
            };
        }
    },

    /**
     * Get conversation for a specific campaign (current user)
     */
    async getConversationByCampaignId(campaignId: string | number): Promise<{
        success: boolean;
        data?: Conversation;
        error?: string;
        isNotFound?: boolean;
    }> {
        try {
            const response = await api.get<Conversation>(API_ENDPOINTS.CHAT.BY_CAMPAIGN(campaignId));
            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            const isNotFound = error?.response?.status === 404;
            if (!isNotFound) {
                console.error("Chat service error:", error);
            }
            return {
                success: false,
                isNotFound,
                error: error?.response?.data?.message || error?.message || "Failed to fetch conversation",
            };
        }
    },
};
