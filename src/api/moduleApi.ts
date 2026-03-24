import { api as axiosInstance } from '@/config/axios';
import type {
    ModuleGroup,
    Module,
    CreateModuleGroupRequest,
    CreateModuleRequest,
} from '../types/module';

export const moduleGroupApi = {
    getAllModuleGroups: async (params?: {
        page?: number;
        size?: number;
        sort?: string;
        keyword?: string;
    }) => {
        const res = await axiosInstance.get(
            "/api/module-groups/details",
            { params }
        );
        return res.data;
    },

    getActiveModuleGroups: async (): Promise<ModuleGroup[]> => {
        const response = await axiosInstance.get<ModuleGroup[]>(
            '/api/module-groups/active'
        );
        return response.data;
    },

    getModuleGroupById: async (id: string | number): Promise<ModuleGroup> => {
        const response = await axiosInstance.get<ModuleGroup>(
            `/api/module-groups/${id}`
        );
        return response.data;
    },

    createModuleGroup: async (
        moduleGroup: CreateModuleGroupRequest
    ): Promise<ModuleGroup> => {
        const response = await axiosInstance.post<ModuleGroup>(
            '/api/module-groups',
            moduleGroup
        );
        return response.data;
    },

    updateModuleGroup: async (
        id: string | number,
        moduleGroup: Partial<ModuleGroup>
    ): Promise<ModuleGroup> => {
        const response = await axiosInstance.put<ModuleGroup>(
            `/api/module-groups/${id}`,
            moduleGroup
        );
        return response.data;
    },

    deleteModuleGroup: async (id: string | number): Promise<void> => {
        await axiosInstance.delete(`/api/module-groups/${id}`);
    },
};

export const moduleApi = {
    getModulesByModuleGroup: async (
        moduleGroupId: string | number
    ): Promise<Module[]> => {
        const response = await axiosInstance.get<Module[]>(
            `/api/modules/module-group/${moduleGroupId}`
        );
        return response.data;
    },

    getModuleById: async (id: string | number): Promise<Module> => {
        const response = await axiosInstance.get<Module>(`/api/modules/${id}`);
        return response.data;
    },

    createModule: async (
        module: CreateModuleRequest
    ): Promise<Module> => {
        const response = await axiosInstance.post<Module>(
            '/api/modules',
            module
        );
        return response.data;
    },

    updateModule: async (
        id: string | number,
        module: Partial<Module>
    ): Promise<Module> => {
        const response = await axiosInstance.put<Module>(
            `/api/modules/${id}`,
            module
        );
        return response.data;
    },

    deleteModule: async (id: string | number): Promise<void> => {
        await axiosInstance.delete(`/api/modules/${id}`);
    },
};
