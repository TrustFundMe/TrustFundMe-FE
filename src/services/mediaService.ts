import { api } from "@/config/axios";

export interface MediaUploadResponse {
    id: number;
    url: string;
    mediaType: "PHOTO" | "VIDEO" | "FILE";
    fileName: string;
    contentType: string;
    sizeBytes: number;
    createdAt: string;
}

export const mediaService = {
    async uploadMedia(
        file: File,
        campaignId?: number,
        postId?: number,
        description?: string,
        mediaType?: "PHOTO" | "VIDEO" | "FILE",
        onProgress?: (progress: number) => void
    ): Promise<MediaUploadResponse> {
        console.log(`[mediaService] Starting upload: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB), type: ${mediaType}`);
        const formData = new FormData();
        formData.append("file", file);

        if (campaignId) formData.append("campaignId", campaignId.toString());
        if (postId) formData.append("postId", postId.toString());
        if (description) formData.append("description", description);
        if (mediaType) formData.append("mediaType", mediaType);

        try {
            console.log(`[mediaService] Sending POST /api/media/upload with campaignId: ${campaignId || 'MISSING'}`);

            const res = await api.post<MediaUploadResponse>("/api/media/upload", formData, {
                headers: {
                    "Content-Type": undefined,
                },
                transformRequest: [(data) => data],
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total && onProgress) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(percentCompleted);
                    }
                },
            });

            return res.data;
        } catch (error: any) {
            console.error(`[mediaService] Upload failed:`, error);
            throw error;
        }
    },

    async uploadForConversation(
        file: File,
        conversationId: number,
        description?: string,
        mediaType?: "PHOTO" | "VIDEO" | "FILE",
        onProgress?: (progress: number) => void
    ): Promise<MediaUploadResponse> {
        console.log(`[mediaService] Starting conversation upload: ${file.name}, type: ${mediaType}`);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("conversationId", conversationId.toString());

        if (description) formData.append("description", description);
        if (mediaType) formData.append("mediaType", mediaType);

        try {
            const res = await api.post<MediaUploadResponse>("/api/media/upload/conversation", formData, {
                headers: {
                    "Content-Type": undefined,
                },
                transformRequest: [(data) => data],
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total && onProgress) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(percentCompleted);
                    }
                },
            });

            return res.data;
        } catch (error: any) {
            console.error(`[mediaService] Conversation upload failed:`, error);
            throw error;
        }
    },

    async deleteMedia(id: number): Promise<void> {
        await api.delete(`/api/media/${id}`);
    },

    async updateMedia(id: number, payload: { postId?: number; campaignId?: number; description?: string }): Promise<void> {
        await api.patch(`/api/media/${id}`, payload);
    },

    async getCampaignFirstImage(campaignId: number): Promise<MediaUploadResponse | null> {
        const res = await api.get<MediaUploadResponse>(`/api/media/campaigns/${campaignId}/first-image`);
        return res.data;
    },

    async getMediaByConversationId(conversationId: number): Promise<MediaUploadResponse[]> {
        const res = await api.get<MediaUploadResponse[]>(`/api/media/conversations/${conversationId}`);
        return res.data;
    }
};
