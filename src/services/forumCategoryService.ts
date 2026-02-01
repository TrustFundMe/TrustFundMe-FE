import { api } from "@/config/axios";
import type { ForumCategory } from "@/types/forumCategory";

const BASE_URL = "/api/forum/categories";

export const forumCategoryService = {
    async getAll(): Promise<ForumCategory[]> {
        const res = await api.get<ForumCategory[]>(BASE_URL);
        return res.data;
    },

    async getBySlug(slug: string): Promise<ForumCategory> {
        const res = await api.get<ForumCategory>(`${BASE_URL}/${slug}`);
        return res.data;
    },
};
