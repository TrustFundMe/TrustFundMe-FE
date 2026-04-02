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
    expenditureId?: number;
    expenditureItemId?: number;
}

export const mediaService = {
    async uploadMedia(
        file: File,
        campaignId?: number,
        postId?: number,
        expenditureId?: number,
        description?: string,
        mediaType?: "PHOTO" | "VIDEO" | "FILE",
        onProgress?: (progress: number) => void,
        expenditureItemId?: number
    ): Promise<MediaUploadResponse> {
        console.log(`[mediaService] Starting upload: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB), type: ${mediaType}`);
        const formData = new FormData();
        formData.append("file", file);

        if (campaignId) formData.append("campaignId", campaignId.toString());
        if (postId) formData.append("postId", postId.toString());
        if (expenditureId) formData.append("expenditureId", expenditureId.toString());
        if (expenditureItemId) formData.append("expenditureItemId", expenditureItemId.toString());
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
            const res = await uploadApi.post<MediaUploadResponse>("/api/media/upload", formData, {
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
        const token = typeof window !== "undefined" ? window.localStorage.getItem("token") : null;
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        // Strategy: Try hard DELETE first, then fallback to soft-delete via status if 403
        try {
            const res = await fetch(`/api-backend/api/media/${id}`, {
                method: "DELETE",
                headers,
                credentials: "include"
            });

            if (res.status === 403) {
                console.warn(`[mediaService] Hard DELETE forbidden (403) for id=${id}. Attempting soft-delete fallback via status update...`);
                // Use PATCH /api/media/{id}/status?status=DELETED
                await api.patch(`/api/media/${id}/status`, null, { params: { status: 'DELETED' } });
                console.log(`[mediaService] Soft-delete successful for id=${id}`);
                return;
            }

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw Object.assign(new Error(errorData.message || `Media delete failed: ${res.status}`), {
                    response: { status: res.status, data: errorData }
                });
            }
        } catch (error: any) {
            // If the error was already handled (fallback succeeded), don't rethrow
            if (error?.message?.includes('Soft-delete successful')) return;
            
            // If the initial DELETE was 403 and the fallback also failed, or it was some other error
            console.error(`[mediaService] Both hard and soft delete failed for id=${id}:`, error);
            throw error;
        }
    },

    async updateMedia(id: number, payload: { postId?: number; campaignId?: number; description?: string }): Promise<void> {
        const token = typeof window !== "undefined" ? window.localStorage.getItem("token") : null;
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`/api-backend/api/media/${id}`, {
            method: "PATCH",
            headers,
            credentials: "include",
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || `updateMedia failed: ${res.status}`);
        }
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
    },

    async getMediaByExpenditureItemId(expenditureItemId: number): Promise<MediaUploadResponse[]> {
        const res = await api.get<MediaUploadResponse[]>(`/api/media/expenditure-items/${expenditureItemId}`);
        return res.data;
    }
};
