import { api } from "@/config/axios";
import axios from "axios";

// Separate axios for multipart uploads — uses relative URL to go through Next.js proxy.
// withCredentials ensures the access_token cookie is sent so the proxy can authenticate
// with the BE identity token (not the Supabase token from localStorage).
const uploadApi = axios.create({
  withCredentials: true,
});

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
        expenditureId?: number,
        description?: string,
        mediaType?: "PHOTO" | "VIDEO" | "FILE",
        onProgress?: (progress: number) => void
    ): Promise<MediaUploadResponse> {
        console.log(`[mediaService] Starting upload: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB), type: ${mediaType}`);
        const formData = new FormData();
        formData.append("file", file);

        if (campaignId) formData.append("campaignId", campaignId.toString());
        if (postId) formData.append("postId", postId.toString());
        if (expenditureId) formData.append("expenditureId", expenditureId.toString());
        if (description) formData.append("description", description);
        if (mediaType) formData.append("mediaType", mediaType);

        try {
            // Use relative URL → Next.js proxy at /api/media/upload
            // This bypasses the API Gateway which can't properly forward multipart/form-data
            const res = await uploadApi.post<MediaUploadResponse>("/api/media/upload", formData, {
                headers: { "Content-Type": undefined },
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
            if (error.response) {
                console.error(`[mediaService] Upload failed with status ${error.response.status}:`, error.response.data);
            } else {
                console.error(`[mediaService] Upload failed (no response):`, error.message);
            }
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
        const res = await fetch(`/api/media/${id}`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`updateMedia failed: ${res.status}`);
    },

    async updateMediaStatus(id: number, status: string): Promise<void> {
        await api.patch(`/api/media/${id}/status`, null, { params: { status } });
    },

    async getCampaignFirstImage(campaignId: number): Promise<MediaUploadResponse | null> {
        const res = await api.get<MediaUploadResponse>(`/api/media/campaigns/${campaignId}/first-image`);
        return res.data;
    },

    async getMediaByConversationId(conversationId: number): Promise<MediaUploadResponse[]> {
        const res = await api.get<MediaUploadResponse[]>(`/api/media/conversations/${conversationId}`);
        return res.data;
    },

    async getMediaByCampaignId(campaignId: number): Promise<MediaUploadResponse[]> {
        const res = await api.get<MediaUploadResponse[]>(`/api/media/campaigns/${campaignId}`);
        return res.data;
    },

    async getMediaByPostId(postId: number): Promise<MediaUploadResponse[]> {
        const res = await api.get<MediaUploadResponse[]>(`/api/media/posts/${postId}`);
        return res.data;
    },

    async getMediaByExpenditureId(expenditureId: number): Promise<MediaUploadResponse[]> {
        const res = await api.get<MediaUploadResponse[]>(`/api/media/expenditures/${expenditureId}`);
        return res.data;
    }
};
