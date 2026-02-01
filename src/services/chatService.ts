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
            const response = await fetch(API_ENDPOINTS.CHAT.CONVERSATIONS, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                return {
                    success: false,
                    error: data.error || data.message || "Failed to fetch conversations",
                };
            }

            const data = await response.json();
            return {
                success: true,
                data: data,
            };
        } catch (error: any) {
            console.error("Chat service error:", error);
            return {
                success: false,
                error: error?.message || "Failed to fetch conversations",
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
            const response = await fetch(API_ENDPOINTS.CHAT.MESSAGES(conversationId), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                return {
                    success: false,
                    error: data.error || data.message || "Failed to fetch messages",
                };
            }

            const data = await response.json();
            return {
                success: true,
                data: data,
            };
        } catch (error: any) {
            console.error("Chat service error:", error);
            return {
                success: false,
                error: error?.message || "Failed to fetch messages",
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
            const response = await fetch(API_ENDPOINTS.CHAT.MESSAGES(conversationId), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content: content }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                return {
                    success: false,
                    error: data.error || data.message || "Failed to send message",
                };
            }

            const data = await response.json();
            return {
                success: true,
                data: data,
            };
        } catch (error: any) {
            console.error("Chat service error:", error);
            return {
                success: false,
                error: error?.message || "Failed to send message",
            };
        }
    },
};
