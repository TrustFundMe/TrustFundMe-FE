import { API_ENDPOINTS } from "@/constants/apiEndpoints";

export interface UserInfo {
    id: number;
    email: string;
    fullName: string;
    phoneNumber: string;
    avatarUrl: string;
    role: string;
    verified: boolean;
}

export const userService = {
    /**
     * Get user info by ID
     */
    async getUserById(id: number | string): Promise<{
        success: boolean;
        data?: UserInfo;
        error?: string;
    }> {
        try {
            const response = await fetch(API_ENDPOINTS.USERS.BY_ID(id), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || data.message || "Failed to fetch user",
                };
            }

            return {
                success: true,
                data: data,
            };
        } catch (error: any) {
            console.error("User service error:", error);
            return {
                success: false,
                error: error?.message || "Failed to fetch user",
            };
        }
    },
};
