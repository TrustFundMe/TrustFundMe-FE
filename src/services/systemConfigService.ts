import { api } from "@/config/axios";

export interface SystemConfig {
    id?: number;
    configKey: string;
    configValue: string;
    configGroup: string;
    description: string;
    updatedBy: string;
    updatedAt?: string;
}

export const systemConfigService = {
    getByKey: async (key: string): Promise<SystemConfig> => {
        const response = await api.get(`/api/system-configs/${key}`);
        return response.data;
    },

    getByGroup: async (group: string): Promise<SystemConfig[]> => {
        const response = await api.get(`/api/system-configs/group/${group}`);
        return response.data;
    },

    update: async (key: string, config: Partial<SystemConfig>): Promise<SystemConfig> => {
        const response = await api.put(`/api/system-configs/${key}`, config);
        return response.data;
    }
};
