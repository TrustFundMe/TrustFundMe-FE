'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { Calendar, Plus, X, Clock, MapPin, User, CheckCircle, XCircle, RefreshCw, ChevronRight, Search, Filter, LayoutList, ChevronLeft, Grid3X3, ChevronDown, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useSearchParams } from 'next/navigation';
import { appointmentService, AppointmentScheduleDto, AppointmentStatus, CreateAppointmentRequest } from '@/services/appointmentService';
import { campaignService } from '@/services/campaignService';
import { userService, UserInfo } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContextProxy';
import type { CampaignDto } from '@/types/campaign';

import CreateAppointmentModal from '@/components/staff/CreateAppointmentModal';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; color: string; bg: string; dot: string; icon: React.ReactNode }> = {
    PENDING: { label: 'Chờ duyệt', color: 'text-amber-700', bg: 'bg-amber-50 ring-amber-200', dot: 'bg-amber-400', icon: <Clock className="h-3 w-3" /> },
    CONFIRMED: { label: 'Đã xác nhận', color: 'text-[#446b5f]', bg: 'bg-[#446b5f]/10 ring-[#446b5f]/20', dot: 'bg-[#446b5f]', icon: <CheckCircle className="h-3 w-3" /> },
    CANCELLED: { label: 'Đã hủy', color: 'text-gray-500', bg: 'bg-gray-50 ring-gray-200', dot: 'bg-gray-400', icon: <XCircle className="h-3 w-3" /> },
    COMPLETED: { label: 'Hoàn thành', color: 'text-blue-700', bg: 'bg-blue-50 ring-blue-200', dot: 'bg-blue-400', icon: <CheckCircle className="h-3 w-3" /> },
};

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const WEEKDAYS_FULL = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(dt: string) {
    const d = new Date(dt);
    return {
        date: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
}

function getDuration(start: string, end: string) {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const mins = Math.round(diff / 60000);
    if (mins < 60) return `${mins} phút`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h} giờ`;
}

function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfWeek(d: Date) {
    const day = new Date(d);
    day.setDate(d.getDate() - d.getDay());
    day.setHours(0, 0, 0, 0);
    return day;
}

function addDays(d: Date, n: number) {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
}

// ─── Create Modal ─────────────────────────────────────────────────────────────

// ─── Detail Panel ─────────────────────────────────────────────────────────────

interface DetailPanelProps { appointment: AppointmentScheduleDto | null; onStatusChange: (id: number, status: AppointmentStatus) => void; }

function AppointmentDetailPanel({ appointment, onStatusChange }: DetailPanelProps) {
    const [updating, setUpdating] = useState<AppointmentStatus | null>(null);

    if (!appointment) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-400 bg-gray-50/20 rounded-[20px] border border-dashed border-gray-100 m-1">
                <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-gray-100"><Calendar className="h-6 w-6 text-gray-200 grayscale opacity-30" /></div>
                <p className="text-[9px] font-black uppercase tracking-widest italic opacity-60">Chọn lịch hẹn để xem chi tiết</p>
            </div>
        );
    }

    const start = formatDateTime(appointment.startTime);
    const end = formatDateTime(appointment.endTime);
    const duration = getDuration(appointment.startTime, appointment.endTime);
    const cfg = STATUS_CONFIG[appointment.status];
    const hoursUntilStart = (new Date(appointment.startTime).getTime() - Date.now()) / 3600000;
    const confirmDeadlinePassed = hoursUntilStart < 24;
    const appointmentEnded = Date.now() > new Date(appointment.endTime).getTime();

    const handleStatus = async (status: AppointmentStatus) => {
        setUpdating(status);
        try { await onStatusChange(appointment.id, status); } finally { setUpdating(null); }
    };

    const nextStatuses: AppointmentStatus[] = appointment.status === 'PENDING' ? ['CONFIRMED', 'CANCELLED'] : appointment.status === 'CONFIRMED' ? ['COMPLETED', 'CANCELLED'] : [];

    return (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col transition-all duration-300">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3">
                <div className="text-sm font-black text-gray-900 uppercase tracking-tight">Chi tiết lịch hẹn</div>
                <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ring-1 ${cfg.bg} ${cfg.color}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                </span>
            </div>

            <div className="flex-1 overflow-auto p-3.5 space-y-3 custom-scrollbar">
                {/* Time Card */}
                <div className="rounded-xl bg-gray-50/80 p-3 border border-gray-100/50">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Thời gian gặp</p>
                    <div className="flex items-end justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-black text-gray-800 tracking-tighter leading-none">{start.time}</span>
                            <span className="text-gray-300 font-light text-lg">—</span>
                            <span className="text-xl font-black text-gray-800 tracking-tighter leading-none">{end.time}</span>
                        </div>
                        <span className="text-[10px] font-black text-[#446b5f] uppercase tracking-wider">{duration}</span>
                    </div>
                    <p className="text-[10px] font-bold text-[#446b5f]/70 italic mt-1.5">{start.date}</p>
                </div>

                {/* Info Fields */}
                {[
                    { label: 'Mục đích / Lý do', value: appointment.purpose || 'Không có mô tả' },
                    { label: 'Người tham gia', value: appointment.donorName || `User #${appointment.donorId}` },
                    { label: 'Staff phụ trách', value: appointment.staffName || `Staff #${appointment.staffId}` },
                    { label: 'Địa điểm gặp', value: appointment.location || 'Chưa xác định' },
                ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-gray-50/80 p-2 border border-gray-100/50">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                        <div className="text-xs font-bold text-gray-700 leading-tight">{item.value}</div>
                    </div>
                ))}

                {/* Actions */}
                {nextStatuses.length > 0 && (
                    <div className="pt-1 space-y-2">
                        {appointment.status === 'PENDING' && confirmDeadlinePassed && (
                            <div className="p-2.5 rounded-xl bg-red-50 border border-red-100 text-[9px] text-red-600 font-bold uppercase tracking-tight text-center">
                                Quá hạn xác nhận (phải confirm trước 24h)
                            </div>
                        )}
                        {appointment.status === 'CONFIRMED' && !appointmentEnded && (
                            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-[9px] text-amber-700 font-bold uppercase tracking-tight text-center">
                                Có thể hoàn thành sau khi kết thúc lịch
                            </div>
                        )}
                        <div className="flex flex-col gap-1.5">
                            {nextStatuses.map(s => {
                                const isAction = s === 'CONFIRMED' || s === 'COMPLETED';
                                const isDisabledByConfirmRule = s === 'CONFIRMED' && confirmDeadlinePassed;
                                const isDisabledByEndRule = s === 'COMPLETED' && !appointmentEnded;
                                const isDisabled = isDisabledByConfirmRule || isDisabledByEndRule;
                                return (
                                    <button
                                        key={s}
                                        onClick={() => !isDisabled && handleStatus(s)}
                                        disabled={updating !== null || isDisabled}
                                        className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${isDisabled
                                            ? 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                                            : isAction
                                                ? 'bg-[#446b5f] text-white hover:bg-[#36564c] shadow-sm shadow-[#446b5f]/10'
                                                : 'text-gray-500 bg-gray-100 border border-gray-200 hover:bg-gray-200'
                                            } disabled:opacity-60`}
                                    >
                                        {updating === s ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : s === 'CONFIRMED' ? 'Duyệt lịch' : s === 'CANCELLED' ? 'Hủy lịch' : 'Hoàn thành'}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Calendar View ────────────────────────────────────────────────────────────

interface CalendarViewProps {
    appointments: AppointmentScheduleDto[];
    onSelect: (appt: AppointmentScheduleDto) => void;
    selectedId: number | null;
}

function CalendarView({ appointments, onSelect, selectedId }: CalendarViewProps) {
    const today = new Date();
    const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
    const [currentDate, setCurrentDate] = useState(new Date());

    const weekStart = useMemo(() => startOfWeek(currentDate), [currentDate]);
    const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

    const getApptForDay = (day: Date) =>
        appointments.filter(a => isSameDay(new Date(a.startTime), day))
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    const monthStart = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), [currentDate]);
    const monthEnd = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), [currentDate]);
    const calendarDays = useMemo(() => {
        const days: Date[] = [];
        const start = startOfWeek(monthStart);
        const end = addDays(startOfWeek(monthEnd), 6);
        let d = start;
        while (d <= end) { days.push(new Date(d)); d = addDays(d, 1); }
        return days;
    }, [monthStart, monthEnd]);

    const prevPeriod = () => viewMode === 'week' ? setCurrentDate(d => addDays(d, -7)) : setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    const nextPeriod = () => viewMode === 'week' ? setCurrentDate(d => addDays(d, 7)) : setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    const goToday = () => setCurrentDate(new Date());

    const periodLabel = viewMode === 'week'
        ? `${weekDays[0].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })} – ${weekDays[6].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
        : currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

    return (
        <div className="flex flex-col h-full gap-3 min-h-0">
            {/* Toolbar */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={goToday} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition">Hôm nay</button>
                <div className="flex items-center gap-1">
                    <button onClick={prevPeriod} className="h-7 w-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"><ChevronLeft className="h-4 w-4 text-gray-500" /></button>
                    <span className="px-3 text-sm font-bold text-gray-700 min-w-[170px] text-center">{periodLabel}</span>
                    <button onClick={nextPeriod} className="h-7 w-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"><ChevronRight className="h-4 w-4 text-gray-500" /></button>
                </div>
                <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                    <button onClick={() => setViewMode('week')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${viewMode === 'week' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        <LayoutList className="h-3.5 w-3.5" />Tuần
                    </button>
                    <button onClick={() => setViewMode('month')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${viewMode === 'month' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        <Grid3X3 className="h-3.5 w-3.5" />Tháng
                    </button>
                </div>
            </div>

            {/* Calendar grid — fixed header + scrollable body */}
            <div className="flex-1 min-h-0 rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col bg-white">

                {/* ── WEEK VIEW ── */}
                {viewMode === 'week' && (
                    <>
                        {/* Sticky header */}
                        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                            {weekDays.map((day, i) => {
                                const isToday = isSameDay(day, today);
                                return (
                                    <div key={i} className={`py-3 text-center border-r border-gray-100 last:border-r-0 ${isToday ? 'bg-red-50' : ''}`}>
                                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isToday ? 'text-red-500' : 'text-gray-400'}`} title={WEEKDAYS_FULL[day.getDay()]}>{WEEKDAYS[day.getDay()]}</p>
                                        <div className={`mx-auto mt-1.5 h-8 w-8 rounded-full flex items-center justify-center text-sm font-black ${isToday ? 'bg-red-500 text-white shadow-md shadow-red-200' : 'text-gray-700 hover:bg-gray-100'} transition`}>
                                            {day.getDate()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {/* Scrollable body */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="grid grid-cols-7 min-h-full">
                                {weekDays.map((day, i) => {
                                    const dayAppts = getApptForDay(day);
                                    const isToday = isSameDay(day, today);
                                    return (
                                        <div key={i} className={`border-r border-gray-100 last:border-r-0 p-2 space-y-1.5 min-h-[260px] ${isToday ? 'bg-red-50/20' : ''}`}>
                                            {dayAppts.length === 0 ? (
                                                <div className="flex items-center justify-center h-16">
                                                    <span className="text-[10px] text-gray-300 font-medium">Trống</span>
                                                </div>
                                            ) : dayAppts.map(appt => {
                                                const cfg = STATUS_CONFIG[appt.status];
                                                const time = new Date(appt.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                                                const isSelected = selectedId === appt.id;
                                                return (
                                                    <button key={appt.id} onClick={() => onSelect(appt)}
                                                        className={`w-full text-left p-2.5 rounded-xl border transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 ring-1 ${cfg.bg} ${cfg.color} ${isSelected ? 'ring-2 shadow-md' : ''}`}>
                                                        <div className="flex items-center gap-1.5 mb-1">
                                                            <div className={`h-2 w-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                                                            <span className="text-[10px] font-black">{time}</span>
                                                        </div>
                                                        <p className="text-[10px] font-semibold leading-tight line-clamp-2 opacity-90">{appt.purpose || `Donor #${appt.donorId}`}</p>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}

                {/* ── MONTH VIEW ── */}
                {viewMode === 'month' && (
                    <>
                        {/* Sticky header */}
                        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                            {WEEKDAYS_FULL.map(d => (
                                <div key={d} className="py-2.5 text-center border-r border-gray-100 last:border-r-0">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{d}</p>
                                </div>
                            ))}
                        </div>
                        {/* Scrollable body */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="grid grid-cols-7">
                                {calendarDays.map((day, i) => {
                                    const dayAppts = getApptForDay(day);
                                    const isToday = isSameDay(day, today);
                                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                                    const MAX_SHOW = 3;
                                    return (
                                        <div key={i} className={`min-h-[100px] border-r border-b border-gray-100 last:border-r-0 p-2 ${isToday ? 'bg-red-50/30' : !isCurrentMonth ? 'bg-gray-50/60' : 'bg-white'}`}>
                                            <div className={`mb-1.5 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${isToday ? 'bg-red-500 text-white shadow-sm shadow-red-200' : isCurrentMonth ? 'text-gray-700' : 'text-gray-300'}`}>
                                                {day.getDate()}
                                            </div>
                                            <div className="space-y-0.5">
                                                {dayAppts.slice(0, MAX_SHOW).map(appt => {
                                                    const cfg = STATUS_CONFIG[appt.status];
                                                    const time = new Date(appt.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                                                    const isSelected = selectedId === appt.id;
                                                    return (
                                                        <button key={appt.id} onClick={() => onSelect(appt)}
                                                            className={`w-full text-left px-1.5 py-1 rounded-lg text-[9px] font-semibold flex items-center gap-1 hover:opacity-90 transition ring-1 ${cfg.bg} ${cfg.color} ${isSelected ? 'ring-2' : ''}`}>
                                                            <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                                                            <span className="truncate">{time} {appt.purpose || `#${appt.id}`}</span>
                                                        </button>
                                                    );
                                                })}
                                                {dayAppts.length > MAX_SHOW && (
                                                    <p className="text-[9px] text-gray-400 font-semibold pl-1">+{dayAppts.length - MAX_SHOW} khác</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── List View ────────────────────────────────────────────────────────────────

interface ListViewProps {
    appointments: AppointmentScheduleDto[];
    isLoading: boolean;
    onStatusChange: (id: number, status: AppointmentStatus) => void;
    onOpenCreate: () => void;
    onRefresh: () => void;
    isRefreshing?: boolean;
    selectedId: number | null;
    setSelectedId: (id: number | null) => void;
}

function ListView({ appointments, isLoading, onStatusChange, onOpenCreate, onRefresh, isRefreshing, selectedId, setSelectedId }: ListViewProps) {
    const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'ALL'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = appointments.filter(a => {
        const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
        const matchSearch = !searchQuery || String(a.donorId).includes(searchQuery) || String(a.id).includes(searchQuery) || (a.purpose?.toLowerCase().includes(searchQuery.toLowerCase())) || (a.location?.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchStatus && matchSearch;
    });

    const selectedAppointment = appointments.find(a => a.id === selectedId) || null;

    return (
        <div className="flex flex-col flex-1 overflow-hidden gap-4">
            {/* Toolbar - Standardized Layout (Filters Left, Search Right) */}
            <div className="flex items-center justify-between gap-4 flex-shrink-0 bg-gray-50/50 p-2 rounded-2xl border border-gray-100 pr-3">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {(['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`inline-flex h-8 items-center rounded-full border px-4 text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s
                                ? 'border-[#446b5f]/30 bg-[#446b5f]/10 text-[#446b5f] shadow-sm'
                                : 'border-gray-200 bg-white text-gray-400 hover:bg-gray-50'
                                }`}
                        >
                            {s === 'ALL' ? 'Tất cả' : STATUS_CONFIG[s as AppointmentStatus].label}
                        </button>
                    ))}
                </div>

                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Tìm nội dung lý do, người tham gia..."
                        className="w-full pl-11 pr-4 py-2 rounded-xl border border-gray-100 text-[11px] font-bold focus:outline-none focus:ring-4 focus:ring-[#446b5f]/5 bg-white transition-all placeholder:text-gray-300"
                    />
                </div>
            </div>

            {/* Table + Detail */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden">
                <div className={`overflow-hidden flex flex-col gap-3 transition-all duration-500 ${selectedAppointment ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
                    <div className="flex items-center justify-between flex-shrink-0 px-2">
                        <div className="flex items-center gap-3">
                            <h2 className="text-sm font-black text-gray-800 uppercase tracking-[0.1em]">Danh sách nhiệm vụ lịch hẹn</h2>
                            <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-black">{filtered.length} kết quả</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onRefresh}
                                disabled={isLoading || isRefreshing}
                                className="h-9 w-9 rounded-2xl border border-gray-100 bg-white flex items-center justify-center text-gray-400 hover:text-[#446b5f] hover:border-[#446b5f]/20 transition shadow-sm group active:scale-95 disabled:opacity-50"
                                title="Làm mới dữ liệu"
                            >
                                <RefreshCw className={`h-4 w-4 transition-transform group-hover:rotate-180 ${(isLoading || isRefreshing) ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={onOpenCreate}
                                className="flex items-center gap-2 px-6 py-2 rounded-2xl bg-gradient-to-r from-[#446b5f] to-[#5a8075] text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition shadow-lg shadow-green-100 active:scale-95"
                            >
                                <Plus className="h-4 w-4" /> Tạo lịch hẹn
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto rounded-[24px] border border-gray-100 shadow-sm transition-all duration-500 bg-white">
                        {isLoading ? (
                            <div className="p-20 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest italic animate-pulse whitespace-nowrap">Đang truy xuất dữ liệu...</div>
                        ) : filtered.length === 0 ? (
                            <div className="p-20 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest italic whitespace-nowrap">Dữ liệu trống</div>
                        ) : (
                            <table className="w-full text-sm border-separate border-spacing-0">
                                <thead>
                                    <tr className="bg-[#446b5f] text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-sm">
                                        <th className="px-4 py-2 text-left w-[50px] border-r border-white/5" title="Số Thứ Tự">STT</th>
                                        <th className={`px-4 py-2 text-left border-r border-white/5 ${selectedId ? 'min-w-[100px]' : 'min-w-[140px]'}`}>NGƯỜI THAM GIA</th>
                                        <th className={`px-4 py-2 text-left border-r border-white/5 ${selectedId ? 'min-w-[120px]' : 'min-w-[200px]'}`}>LÝ DO GẶP</th>
                                        <th className="px-4 py-2 text-left border-r border-white/5 min-w-[140px]">THỜI GIAN GẶP</th>
                                        {!selectedId && <th className="px-4 py-2 text-left border-r border-white/5 min-w-[180px]">ĐỊA ĐIỂM</th>}
                                        <th className="px-4 py-2 text-center border-r border-white/5" title="Trình trạng xác nhận">TRẠNG THÁI</th>
                                        <th className="px-4 py-2 text-center w-[80px]">THAO TÁC</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 bg-white">
                                    {filtered.map((appt, idx) => {
                                        const s = formatDateTime(appt.startTime);
                                        const cfg = STATUS_CONFIG[appt.status];
                                        const isSelected = selectedId === appt.id;
                                        return (
                                            <tr
                                                key={appt.id}
                                                onClick={() => setSelectedId(appt.id)}
                                                className={`cursor-pointer transition-all duration-200 group relative z-10 ${isSelected ? 'bg-orange-50/60' : 'hover:bg-gray-50/80'}`}
                                            >
                                                <td className="px-4 py-1 text-[11px] font-black text-gray-400 border-r border-gray-50/50">
                                                    {String(idx + 1).padStart(2, '0')}
                                                </td>
                                                <td className="px-4 py-1 border-r border-gray-50/50">
                                                    <p className="font-black text-gray-900 text-[11px] uppercase tracking-tight truncate line-clamp-1">{appt.donorName || `User #${appt.donorId}`}</p>
                                                </td>
                                                <td className="px-4 py-1 border-r border-gray-50/50">
                                                    <p className="text-[10px] font-bold text-gray-600 italic truncate line-clamp-1 leading-[1.2]">{appt.purpose || 'Không có mô tả'}</p>
                                                </td>
                                                <td className="px-4 py-1 border-r border-gray-50/50 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] font-black text-gray-700 uppercase tracking-tight">{s.date}</span>
                                                        <span className="text-[10px] font-bold text-red-500/70 italic">{s.time}</span>
                                                    </div>
                                                </td>
                                                {!selectedId && (
                                                    <td className="px-4 py-1 border-r border-gray-50/50">
                                                        <p className="text-[11px] font-bold text-gray-600 line-clamp-1 italic">
                                                            {appt.location || '—'}
                                                        </p>
                                                    </td>
                                                )}
                                                <td className="px-4 py-1 border-r border-gray-50/50">
                                                    <div className="flex justify-center">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight border ${cfg.bg} ${cfg.color} ${cfg.color.replace('text-', 'border-').replace('700', '200')} whitespace-nowrap`}>
                                                            {cfg.label}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-1">
                                                    <div className="flex justify-center">
                                                        <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${isSelected ? 'text-[#446b5f] translate-x-1' : 'text-gray-300'}`} />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
                {selectedAppointment && (
                    <div className="lg:col-span-4 overflow-hidden pt-[21px] animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between px-1 mb-2">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chi tiết lịch hẹn</h3>
                            <button onClick={() => setSelectedId(null)} className="h-6 w-6 rounded-lg hover:bg-gray-100 flex items-center justify-center transition">
                                <X className="h-3.5 w-3.5 text-gray-400" />
                            </button>
                        </div>
                        <AppointmentDetailPanel appointment={selectedAppointment} onStatusChange={onStatusChange} />
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type TabType = 'list' | 'calendar';
export default function StaffSchedulePage() {
    return (
        <Suspense fallback={
            <div className="flex-1 flex items-center justify-center bg-white min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#446b5f] mx-auto mb-4"></div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Đang tải lịch hẹn...</p>
                </div>
            </div>
        }>
            <StaffScheduleContent />
        </Suspense>
    );
}

function StaffScheduleContent() {
    const { user } = useAuth();

    const searchParams = useSearchParams();
    const [appointments, setAppointments] = useState<AppointmentScheduleDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('list');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [calendarSelectedId, setCalendarSelectedId] = useState<number | null>(null);
    const [listSelectedId, setListSelectedId] = useState<number | null>(null);

    const myId = user?.id ? Number(user.id) : null;

    const fetchAppointments = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await appointmentService.getAll();
            setAppointments(data);
        } catch (err) { toast.error('Không thể tải danh sách lịch hẹn'); }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

    useEffect(() => {
        const apptId = searchParams.get('appointmentId');
        if (apptId && appointments.length > 0) {
            const id = Number(apptId);
            setListSelectedId(id);
            setCalendarSelectedId(id);
            setActiveTab('list'); // Default to list view if redirected
        }
    }, [searchParams, appointments]);

    const handleStatusChange = async (id: number, status: AppointmentStatus) => {
        try {
            const updated = await appointmentService.updateStatus(id, status);
            setAppointments(prev => prev.map(a => a.id === id ? updated : a));
            toast.success(`Đã cập nhật trạng thái thành ${STATUS_CONFIG[status].label}`);
        } catch (err: any) { toast.error(err?.response?.data?.message || 'Không thể cập nhật trạng thái'); }
    };

    const displayedAppointments = myId
        ? appointments.filter(a => Number(a.staffId) === myId)
        : [];

    const stats = {
        total: displayedAppointments.length,
        pending: displayedAppointments.filter(a => a.status === 'PENDING').length,
        confirmed: displayedAppointments.filter(a => a.status === 'CONFIRMED').length,
        completed: displayedAppointments.filter(a => a.status === 'COMPLETED').length,
    };

    const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
        { id: 'list', label: 'Danh sách', icon: <LayoutList className="h-4 w-4" /> },
        { id: 'calendar', label: 'Bảng lịch', icon: <Calendar className="h-4 w-4" /> },
    ];

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* Folder Tabs Header */}
            <div className="flex items-end px-3 gap-2 h-14 relative z-20 overflow-x-auto no-scrollbar">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`relative px-6 py-2.5 text-[10px] font-black tracking-widest uppercase transition-all duration-300 flex items-center gap-2.5 ${activeTab === tab.id
                            ? 'bg-white text-[#446b5f] rounded-t-2xl shadow-[0_-8px_20px_-8px_rgba(0,0,0,0.1)] z-20 h-11 border-t-2 border-[#446b5f]'
                            : 'bg-gray-100/50 text-gray-400 rounded-t-xl hover:bg-gray-200/50 z-10 h-9 mb-0.5'}`}>
                        {tab.icon}
                        <span className="whitespace-nowrap">{tab.label}</span>
                        {tab.id === 'list' && (
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border transition-all ${activeTab === 'list'
                                ? 'bg-[#446b5f]/10 text-[#446b5f] border-[#446b5f]/20'
                                : 'bg-gray-200 text-gray-400 border-gray-300'
                                }`}>
                                {displayedAppointments.length}
                            </span>
                        )}
                        {activeTab === tab.id && <div className="absolute -bottom-2 left-0 right-0 h-4 bg-white z-30" />}
                    </button>
                ))}
            </div>

            {/* Main Card */}
            <div className="flex-1 bg-white mx-2 mb-2 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden relative z-10 flex flex-col">
                <div className="flex-1 overflow-hidden p-3 flex flex-col pt-1">

                    {/* Tab content */}
                    {activeTab === 'list' && (
                        <ListView
                            appointments={displayedAppointments}
                            isLoading={isLoading}
                            onStatusChange={handleStatusChange}
                            onOpenCreate={() => setShowCreateModal(true)}
                            onRefresh={fetchAppointments}
                            selectedId={listSelectedId}
                            setSelectedId={setListSelectedId}
                        />
                    )}

                    {activeTab === 'calendar' && (
                        <div className="flex-1 min-h-0 flex gap-4 overflow-hidden">
                            {/* Calendar takes remaining space */}
                            <div className={`transition-all duration-500 overflow-hidden flex flex-col ${calendarSelectedId ? 'flex-[2]' : 'flex-1'}`}>
                                <CalendarView
                                    appointments={displayedAppointments}
                                    onSelect={appt => setCalendarSelectedId(appt.id)}
                                    selectedId={calendarSelectedId}
                                />
                            </div>
                            {/* Detail panel — fixed width, always visible */}
                            {calendarSelectedId && (
                                <div className="w-[340px] flex-shrink-0 overflow-auto animate-in slide-in-from-right duration-300">
                                    <div className="flex items-center justify-between px-1 mb-2">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chi tiết lịch hẹn</h3>
                                        <button onClick={() => setCalendarSelectedId(null)} className="h-6 w-6 rounded-lg hover:bg-gray-100 flex items-center justify-center transition">
                                            <X className="h-3.5 w-3.5 text-gray-400" />
                                        </button>
                                    </div>
                                    <AppointmentDetailPanel
                                        appointment={displayedAppointments.find(a => a.id === calendarSelectedId) || null}
                                        onStatusChange={handleStatusChange}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {showCreateModal && (
                <CreateAppointmentModal staffId={user?.id || 0} onClose={() => setShowCreateModal(false)} onCreated={fetchAppointments} />
            )}
        </div>
    );
}
