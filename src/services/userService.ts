import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { PaginatedResponse } from "@/types/pagination";

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
    async getAllUsers(page: number = 0, size: number = 10): Promise<{
        success: boolean;
        data?: PaginatedResponse<UserInfo>;
        error?: string;
    }> {
        try {
            const url = new URL(API_ENDPOINTS.USERS.BASE, window.location.origin);
            url.searchParams.append("page", page.toString());
            url.searchParams.append("size", size.toString());

            const response = await fetch(url.toString(), {
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
     * Get all active staff members
     */
    async getAllStaffs(): Promise<{
        success: boolean;
        data?: UserInfo[];
        error?: string;
    }> {
        try {
            const response = await fetch(API_ENDPOINTS.USERS.STAFF, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || data.message || "Failed to fetch staffs",
                };
            }

            return {
                success: true,
                data: data,
            };
        } catch (error: any) {
            console.error("User service error (getAllStaffs):", error);
            return {
                success: false,
                error: error?.message || "Failed to fetch staffs",
            };
        }
    },

    /**
     * Ban/deactivate user
     */
    async banUser(id: number | string, reason?: string): Promise<{
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
                body: reason ? JSON.stringify({ reason }) : undefined,
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

    /**
     * Upgrade user to FUND_DONOR (after KYC verification)
     */
    async upgradeToFundDonor(id: number | string): Promise<{
        success: boolean;
        error?: string;
    }> {
        try {
            const response = await fetch(API_ENDPOINTS.USERS.UPGRADE_TO_FUND_DONOR(id), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const data = await response.json();
                return {
                    success: false,
                    error: data.error || data.message || "Failed to upgrade user role",
                };
            }

            return { success: true };
        } catch (error: any) {
            console.error("User service error (upgrade to FUND_DONOR):", error);
            return {
                success: false,
                error: error?.message || "Failed to upgrade user role",
            };
        }
    },
};
