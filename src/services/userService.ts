import { API_ENDPOINTS } from "@/constants/apiEndpoints";

export interface UserInfo {
    id: number;
    email: string;
    fullName: string;
    phoneNumber: string;
    avatarUrl: string;
    role: string;
    verified: boolean;
    isActive: boolean;
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

    /**
     * Get all users
     */
    async getAllUsers(): Promise<{
        success: boolean;
        data?: UserInfo[];
        error?: string;
    }> {
        try {
            const response = await fetch(API_ENDPOINTS.USERS.BASE, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || data.message || "Failed to fetch users",
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
                error: error?.message || "Failed to fetch users",
            };
        }
    },

    /**
     * Ban/deactivate user
     */
    async banUser(id: number | string): Promise<{
        success: boolean;
        data?: UserInfo;
        error?: string;
    }> {
        try {
            const response = await fetch(API_ENDPOINTS.USERS.BAN(id), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || data.message || "Failed to ban user",
                };
            }

            return {
                success: true,
                data: data,
            };
        } catch (error: any) {
            console.error("User service error (ban):", error);
            return {
                success: false,
                error: error?.message || "Failed to ban user",
            };
        }
    },

    /**
     * Unban/activate user
     */
    async unbanUser(id: number | string): Promise<{
        success: boolean;
        data?: UserInfo;
        error?: string;
    }> {
        try {
            const response = await fetch(API_ENDPOINTS.USERS.UNBAN(id), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || data.message || "Failed to unban user",
                };
            }

            return {
                success: true,
                data: data,
            };
        } catch (error: any) {
            console.error("User service error (unban):", error);
            return {
                success: false,
                error: error?.message || "Failed to unban user",
            };
        }
    },

    /**
     * Update user information
     */
    async updateUser(id: number | string, userData: Partial<UserInfo> & { password?: string }): Promise<{
        success: boolean;
        data?: UserInfo;
        error?: string;
    }> {
        try {
            const response = await fetch(API_ENDPOINTS.USERS.BY_ID(id), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || data.message || "Failed to update user",
                };
            }

            return {
                success: true,
                data: data,
            };
        } catch (error: any) {
            console.error("User service error (update):", error);
            return {
                success: false,
                error: error?.message || "Failed to update user",
            };
        }
    },
};
