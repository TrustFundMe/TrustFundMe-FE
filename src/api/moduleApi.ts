import { api as axiosInstance } from '@/config/axios';
import type {
    ModuleGroup,
    Module,
    CreateModuleGroupRequest,
    CreateModuleRequest,
} from '../types/module';

export const moduleGroupApi = {
    getAllModuleGroups: async (params: {
        page: number;
        size: number;
        sort: string;
        keyword?: string;
    }) => {
        const res = await axiosInstance.get(
            "/module-groups",
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

    getModuleGroupById: async (id: string): Promise<ModuleGroup> => {
        const response = await axiosInstance.get<ModuleGroup>(
            `/module-groups/${id}`
        );
        return response.data;
    },

    createModuleGroup: async (
        moduleGroup: CreateModuleGroupRequest
    ): Promise<ModuleGroup> => {
        const response = await axiosInstance.post<ModuleGroup>(
            '/module-groups',
            moduleGroup
        );
        return response.data;
    },

    updateModuleGroup: async (
        id: string,
        moduleGroup: Partial<ModuleGroup>
    ): Promise<ModuleGroup> => {
        const response = await axiosInstance.put<ModuleGroup>(
            `/module-groups/${id}`,
            moduleGroup
        );
        return response.data;
    },

    deleteModuleGroup: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/module-groups/${id}`);
    },
};

export const moduleApi = {
    getModulesByModuleGroup: async (
        moduleGroupId: string
    ): Promise<Module[]> => {
        const response = await axiosInstance.get<Module[]>(
            `/modules/module-group/${moduleGroupId}`
        );
        return response.data;
    },

    getModuleById: async (id: string): Promise<Module> => {
        const response = await axiosInstance.get<Module>(`/modules/${id}`);
        return response.data;
    },

    createModule: async (
        module: CreateModuleRequest
    ): Promise<Module> => {
        const response = await axiosInstance.post<Module>(
            '/modules',
            module
        );
        return response.data;
    },

    updateModule: async (
        id: string,
        module: Partial<Module>
    ): Promise<Module> => {
        const response = await axiosInstance.put<Module>(
            `/modules/${id}`,
            module
        );
        return response.data;
    },

    deleteModule: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/modules/${id}`);
    },
};
