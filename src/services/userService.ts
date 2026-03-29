import axios from "axios";
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
     * Create a new user
     */
    async createUser(userData: {
        email: string;
        fullName: string;
        phoneNumber?: string;
        role?: string;
    }): Promise<{
        success: boolean;
        data?: UserInfo;
        error?: string;
    }> {
        try {
            const response = await fetch(`http://localhost:8080/api/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data?.message || "Lỗi khi tạo người dùng",
                };
            }

            return {
                success: true,
                data: data?.data,
            };
        } catch (error: any) {
            console.error("User service error (create):", error);
            return {
                success: false,
                error: error?.message || "Lỗi khi tạo người dùng",
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

    /**
     * Get all staff and admin users
     */
    async getAllStaff(): Promise<{
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
                    error: data.error || data.message || "Failed to fetch staff members",
                };
            }

            return {
                success: true,
                data: data,
            };
        } catch (error: any) {
            console.error("User service error (getAllStaff):", error);
            return {
                success: false,
                error: error?.message || "Failed to fetch staff members",
            };
        }
    },

    /**
     * Export users to Excel
     */
    async exportUsers(): Promise<Blob> {
        // Call Next.js proxy route (/api/users/export) which runs server-side
        // and can read the httpOnly access_token cookie to forward via Authorization header.
        // Direct call to backend localhost:8080 is NOT used because the backend
        // JwtAuthenticationFilter expects the token in Authorization header,
        // but the token is stored in an httpOnly cookie that JS cannot read.
        const feOrigin = typeof window !== "undefined" ? window.location.origin : "";
        const response = await axios.get(`${feOrigin}${API_ENDPOINTS.USERS.EXPORT}`, {
            responseType: "blob",
        });
        return response.data;
    },

    /**
     * Import users from Excel
     */
    async importUsers(file: File): Promise<{
        success: boolean;
        message?: string;
        imported?: number;
        skipped?: number;
        skippedReasons?: string[];
        error?: string;
    }> {
        try {
            const formData = new FormData();
            formData.append("file", file);

            // Call backend directly with localStorage token (same pattern as baseFe)
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            const response = await axios.post(
                `http://localhost:8080/api/users/import`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                }
            );

            const data = response.data;
            const message = data?.message || "Nhập dữ liệu thành công";
            const result = data?.data || {};
            return {
                success: true,
                message,
                imported: result.imported,
                skipped: result.skipped,
                skippedReasons: result.skippedReasons,
            };
        } catch (error: any) {
            console.error("User service error (import):", error);
            const status = error?.response?.status;
            const data = error?.response?.data;
            let msg = "Lỗi khi nhập dữ liệu";
            if (status === 401) msg = "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại";
            else if (status === 400) msg = data?.error || data?.message || "File không hợp lệ, vui lòng dùng đúng file mẫu";
            else if (status === 417) msg = data?.error || data?.message || "Không thể nhập dữ liệu từ file này";
            else if (status === 500) msg = "Lỗi máy chủ khi xử lý file";
            else msg = data?.error || data?.message || error?.message || msg;
            return { success: false, error: msg };
        }
    },

    /**
     * Download users import template
     */
    async downloadUsersTemplate(): Promise<Blob> {
        const feOrigin = typeof window !== "undefined" ? window.location.origin : "";
        const response = await axios.get(`${feOrigin}${API_ENDPOINTS.USERS.IMPORT_TEMPLATE}`, {
            responseType: "blob",
        });
        return response.data;
    },
};
