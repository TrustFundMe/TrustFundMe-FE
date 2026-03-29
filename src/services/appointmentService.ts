import { api } from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface AppointmentScheduleDto {
    id: number;
    donorId: number;
    donorName?: string;
    staffId: number;
    staffName?: string;
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
        try {
            const storedUser = localStorage.getItem('be_user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                let existingAppts: AppointmentScheduleDto[] = [];

                if (user.role && user.role.includes('ROLE_STAFF')) {
                    const resApi = await api.get<AppointmentScheduleDto[]>(API_ENDPOINTS.APPOINTMENTS.BY_STAFF(user.id));
                    existingAppts = resApi.data || [];
                } else {
                    const resApi = await api.get<AppointmentScheduleDto[]>(API_ENDPOINTS.APPOINTMENTS.BY_DONOR(user.id));
                    existingAppts = resApi.data || [];
                }

                const newStart = new Date(payload.startTime).getTime();

                for (const appt of existingAppts) {
                    if (appt.status === 'CANCELLED') continue;

                    const existingStart = new Date(appt.startTime).getTime();
                    const diffHours = (existingStart - newStart) / (1000 * 60 * 60);

                    if (diffHours >= 0 && diffHours <= 5) {
                        throw new Error(`Bạn đã có một lịch hẹn khác vào lúc ${new Date(appt.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ngày ${new Date(appt.startTime).toLocaleDateString('vi-VN')}. Không thể tạo lịch mới đè lên khoảng 5 tiếng sắp tới!`);
                    }
                }
            }
        } catch (error: any) {
            if (error.message && error.message.includes('khoảng 5 tiếng sắp tới')) {
                throw error;
            }
        }

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
