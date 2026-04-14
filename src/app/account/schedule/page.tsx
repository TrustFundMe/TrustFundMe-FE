'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContextProxy';
import { CalendarGrid } from '@/components/schedule/CalendarGrid';
import { appointmentService, AppointmentScheduleDto } from '@/services/appointmentService';

/**
 * SchedulePage - Donor appointments calendar
 */
export default function SchedulePage() {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'Month' | 'Week'>('Week');
    const [appointments, setAppointments] = useState<AppointmentScheduleDto[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAppointments = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const data = await appointmentService.getByDonor(user.id);
            setAppointments(data);
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const generateMonthCells = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);

        // Monday-first: 0=Mon … 6=Sun
        let firstDayOfWeek = firstDayOfMonth.getDay(); // 0=Sun
        firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

        const cells: { date: Date; isCurrentMonth: boolean }[] = [];

        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            cells.push({ date: new Date(year, month - 1, prevMonthLastDay - i), isCurrentMonth: false });
        }

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            cells.push({ date: new Date(year, month, i), isCurrentMonth: true });
        }

        const nextMonthDaysNeeded = 42 - cells.length;
        for (let i = 1; i <= nextMonthDaysNeeded; i++) {
            cells.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
        }

        return cells;
    };

    return (
        <div className="h-full w-full bg-[#f4f4f8] flex flex-col overflow-hidden p-5">
            <CalendarGrid
                monthCells={generateMonthCells()}
                appointments={appointments}
                loading={loading}
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                view={view}
                setView={setView}
                onRefresh={fetchAppointments}
            />
        </div>
    );
}
