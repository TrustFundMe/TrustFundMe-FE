import { api } from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface AppointmentScheduleDto {
    id: number;
    donorId: number;
    staffId: number;
    startTime: string;
    endTime: string;
    status: AppointmentStatus;
    location?: string;
    purpose?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateAppointmentRequest {
    donorId: number;
    staffId: number;
    startTime: string;
    endTime: string;
    location?: string;
    purpose?: string;
}

export const appointmentService = {
    async getAll(): Promise<AppointmentScheduleDto[]> {
        const res = await api.get<AppointmentScheduleDto[]>(API_ENDPOINTS.APPOINTMENTS.BASE);
        return res.data;
    },

    async getById(id: number): Promise<AppointmentScheduleDto> {
        const res = await api.get<AppointmentScheduleDto>(API_ENDPOINTS.APPOINTMENTS.BY_ID(id));
        return res.data;
    },

    async getByDonor(donorId: number): Promise<AppointmentScheduleDto[]> {
        const res = await api.get<AppointmentScheduleDto[]>(API_ENDPOINTS.APPOINTMENTS.BY_DONOR(donorId));
        return res.data;
    },

    async getByStaff(staffId: number): Promise<AppointmentScheduleDto[]> {
        const res = await api.get<AppointmentScheduleDto[]>(API_ENDPOINTS.APPOINTMENTS.BY_STAFF(staffId));
        return res.data;
    },

    async create(payload: CreateAppointmentRequest): Promise<AppointmentScheduleDto> {
        const res = await api.post<AppointmentScheduleDto>(API_ENDPOINTS.APPOINTMENTS.BASE, payload);
        return res.data;
    },

    async update(id: number, payload: Partial<CreateAppointmentRequest>): Promise<AppointmentScheduleDto> {
        const res = await api.put<AppointmentScheduleDto>(API_ENDPOINTS.APPOINTMENTS.BY_ID(id), payload);
        return res.data;
    },

    async updateStatus(id: number, status: AppointmentStatus): Promise<AppointmentScheduleDto> {
        const res = await api.patch<AppointmentScheduleDto>(
            API_ENDPOINTS.APPOINTMENTS.UPDATE_STATUS(id),
            null,
            { params: { status } }
        );
        return res.data;
    },
};
