export type ForumCategory = {
    id: number;
    name: string;
    slug: string;
    description?: string;
    iconUrl?: string;
    color: string;
    displayOrder: number;
    postCount: number;
};
