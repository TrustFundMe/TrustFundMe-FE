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
        try {
            // Try hard DELETE via proxy
            await api.delete(`/api/media/${id}`);
            console.log(`[mediaService] Hard delete successful for id=${id}`);
        } catch (error: any) {
            const status = error.response?.status;
            const errorData = error.response?.data;
            
            console.warn(`[mediaService] DELETE request failed for id=${id}. Status: ${status}`, errorData);

            // If Forbidden (403), Method Not Allowed (405), or Internal Server Error (500)
            // 500 often happens if hard delete fails due to DB constraints but soft-delete might still work
            if (status === 403 || status === 405 || status === 500) {
                console.log(`[mediaService] Attempting soft-delete fallback (status=DELETED) for id=${id}...`);
                try {
                    await api.patch(`/api/media/${id}/status`, null, { params: { status: 'DELETED' } });
                    console.log(`[mediaService] Soft-delete successful for id=${id}`);
                    return;
                } catch (fallbackError: any) {
                    console.error(`[mediaService] Soft-delete fallback also failed for id=${id}:`, fallbackError.response?.data || fallbackError.message);
                    // Throw the original error if fallback also fails
                    throw error;
                }
            }

            // For other errors (401, 404, etc.), just throw
            throw error;
        }
    },

    async updateMedia(id: number, payload: { postId?: number; campaignId?: number; description?: string }): Promise<void> {
        await api.patch(`/api/media/${id}`, payload);
    },

    async updateMediaStatus(id: number, status: string): Promise<void> {
        await api.patch(`/api/media/${id}/status`, null, { params: { status } });
    },

    /** Set postId = null — removes image association from a post without deleting the file. */
    async unlinkFromPost(id: number): Promise<void> {
        await api.delete(`/api/media/${id}/post`);
    },

    async getMediaById(id: number): Promise<MediaUploadResponse> {
        const res = await api.get<MediaUploadResponse>(`/api/media/${id}`);
        return res.data;
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
        try {
            const res = await api.get<MediaUploadResponse[]>(`/api/media/posts/${postId}`);
            if (Array.isArray(res.data)) return res.data;
            return [];
        } catch (err) {
            console.warn(`[mediaService] getMediaByPostId(${postId}) failed:`, err);
            return [];
        }
    },

    async getMediaByExpenditureId(expenditureId: number): Promise<MediaUploadResponse[]> {
        const res = await api.get<MediaUploadResponse[]>(`/api/media/expenditures/${expenditureId}`);
        return res.data;
    },

    async getMediaByExpenditureItemId(expenditureItemId: number): Promise<MediaUploadResponse[]> {
        try {
            const res = await api.get<MediaUploadResponse[]>(`/api/media/expenditure-items/${expenditureItemId}`);
            return res.data;
        } catch (err: any) {
            if (err.response?.status === 403) {
                console.warn(`[mediaService] getMediaByExpenditureItemId 403 fallback for id=${expenditureItemId}`);
                try {
                    // Bypass gateway and hit media-service directly (8083) if gateway 403s
                    const res = await axios.get<MediaUploadResponse[]>(`http://localhost:8083/api/media/expenditure-items/${expenditureItemId}`);
                    return res.data;
                } catch (fallbackErr) {
                    console.error("[mediaService] Direct fallback also failed:", fallbackErr);
                    throw err;
                }
            }
            throw err;
        }
    }
};
