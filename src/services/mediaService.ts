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

            // We use a fresh header object and don't include Content-Type
            // to allow Axios/Browser to set it with the correct boundary.
            const res = await api.post<MediaUploadResponse>("/api/media/upload", formData, {
                headers: {
                    "Content-Type": undefined, // Explicitly undefined to override default JSON
                },
                // This prevents Axios from trying to stringify the FormData if headers are present
                transformRequest: [(data) => data],
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total && onProgress) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        console.log(`[mediaService] Upload progress: ${percentCompleted}%`);
                        onProgress(percentCompleted);
                    }
                },
            });

            console.log(`[mediaService] Upload success for ${file.name}:`, res.data.url);
            return res.data;
        } catch (error: any) {
            console.error(`[mediaService] Upload failed for ${file.name}:`, {
                message: error.message,
                code: error.code,
                status: error.response?.status,
                data: error.response?.data,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers
                }
            });
            throw error;
        }
    },

    async deleteMedia(id: number): Promise<void> {
        await api.delete(`/api/media/${id}`);
    },

    async updateMedia(id: number, payload: { postId?: number; campaignId?: number; description?: string }): Promise<void> {
        await api.patch(`/api/media/${id}`, payload);
    }
};
