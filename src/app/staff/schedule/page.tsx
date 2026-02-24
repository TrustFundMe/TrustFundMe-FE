'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, Plus, X, Clock, MapPin, User, CheckCircle, XCircle, RefreshCw, ChevronRight, Search, Filter, LayoutList, ChevronLeft, Grid3X3 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { appointmentService, AppointmentScheduleDto, AppointmentStatus, CreateAppointmentRequest } from '@/services/appointmentService';
import { useAuth } from '@/contexts/AuthContextProxy';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; color: string; bg: string; dot: string; icon: React.ReactNode }> = {
    PENDING: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 ring-amber-200', dot: 'bg-amber-400', icon: <Clock className="h-3 w-3" /> },
    CONFIRMED: { label: 'Confirmed', color: 'text-emerald-700', bg: 'bg-emerald-50 ring-emerald-200', dot: 'bg-emerald-400', icon: <CheckCircle className="h-3 w-3" /> },
    CANCELLED: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-50 ring-red-200', dot: 'bg-red-400', icon: <XCircle className="h-3 w-3" /> },
    COMPLETED: { label: 'Completed', color: 'text-blue-700', bg: 'bg-blue-50 ring-blue-200', dot: 'bg-blue-400', icon: <CheckCircle className="h-3 w-3" /> },
};

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const WEEKDAYS_FULL = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(dt: string) {
    const d = new Date(dt);
    return {
        date: d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }),
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

interface CreateModalProps { staffId: number; onClose: () => void; onCreated: () => void; }

function CreateAppointmentModal({ staffId, onClose, onCreated }: CreateModalProps) {
    const [form, setForm] = useState<CreateAppointmentRequest>({ donorId: 0, staffId, startTime: '', endTime: '', location: '', purpose: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.donorId || !form.startTime || !form.endTime) { toast.error('Vui lòng điền đầy đủ thông tin bắt buộc'); return; }
        if (new Date(form.endTime) <= new Date(form.startTime)) { toast.error('Thời gian kết thúc phải sau thời gian bắt đầu'); return; }
        const hoursUntilStart = (new Date(form.startTime).getTime() - Date.now()) / 3600000;
        if (hoursUntilStart < 24) { toast.error(`Lịch hẹn phải được đặt trước tối thiểu 24 tiếng. Hiện tại chỉ còn ${Math.floor(hoursUntilStart)} tiếng đến giờ hẹn.`); return; }
        setLoading(true);
        try {
            await appointmentService.create(form);
            toast.success('Tạo lịch hẹn thành công!');
            onCreated(); onClose();
        } catch (err: any) { toast.error(err?.response?.data?.message || 'Không thể tạo lịch hẹn'); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center"><Calendar className="h-5 w-5 text-white" /></div>
                        <div><h2 className="text-white font-bold text-base">Tạo lịch hẹn mới</h2><p className="text-red-100 text-xs">Đặt lịch gặp với người dùng</p></div>
                    </div>
                    <button onClick={onClose} className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition"><X className="h-4 w-4 text-white" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Donor ID <span className="text-red-500">*</span></label>
                        <input type="number" value={form.donorId || ''} onChange={e => setForm(f => ({ ...f, donorId: parseInt(e.target.value) || 0 }))} placeholder="Nhập ID của người dùng" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition" required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Bắt đầu <span className="text-red-500">*</span></label>
                            <input type="datetime-local" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition" required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Kết thúc <span className="text-red-500">*</span></label>
                            <input type="datetime-local" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Địa điểm</label>
                        <input type="text" value={form.location || ''} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Địa điểm gặp mặt (tùy chọn)" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Mục đích</label>
                        <textarea value={form.purpose || ''} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} placeholder="Mô tả mục đích cuộc hẹn..." rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition resize-none" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Hủy</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-bold hover:from-red-600 hover:to-rose-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
                            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            {loading ? 'Đang tạo...' : 'Tạo lịch hẹn'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

interface DetailPanelProps { appointment: AppointmentScheduleDto | null; onStatusChange: (id: number, status: AppointmentStatus) => void; }

function AppointmentDetailPanel({ appointment, onStatusChange }: DetailPanelProps) {
    const [updating, setUpdating] = useState<AppointmentStatus | null>(null);

    if (!appointment) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-400">
                <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center"><Calendar className="h-8 w-8 text-gray-300" /></div>
                <p className="text-sm font-medium">Chọn một lịch hẹn để xem chi tiết</p>
            </div>
        );
    }

    const start = formatDateTime(appointment.startTime);
    const end = formatDateTime(appointment.endTime);
    const duration = getDuration(appointment.startTime, appointment.endTime);
    const cfg = STATUS_CONFIG[appointment.status];
    const hoursUntilStart = (new Date(appointment.startTime).getTime() - Date.now()) / 3600000;
    const confirmDeadlinePassed = hoursUntilStart < 24;
    // Complete chỉ được bấm khi đã qua giờ kết thúc
    const appointmentEnded = Date.now() > new Date(appointment.endTime).getTime();

    const handleStatus = async (status: AppointmentStatus) => {
        setUpdating(status);
        try { await onStatusChange(appointment.id, status); } finally { setUpdating(null); }
    };

    const nextStatuses: AppointmentStatus[] = appointment.status === 'PENDING' ? ['CONFIRMED', 'CANCELLED'] : appointment.status === 'CONFIRMED' ? ['COMPLETED', 'CANCELLED'] : [];

    return (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden h-full flex flex-col">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-4 py-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">Lịch hẹn #{appointment.id}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ring-1 whitespace-nowrap flex-shrink-0 ${cfg.bg} ${cfg.color}`}>{cfg.icon}{cfg.label}</span>
                </div>
                <h3 className="text-white font-bold text-sm leading-snug line-clamp-1">{appointment.purpose || 'Không có mô tả'}</h3>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
                {/* Time section — compact single row */}
                <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                    <div className="flex items-center gap-1.5 mb-2">
                        <Clock className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                        <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Thời gian</span>
                        <span className="ml-auto text-[11px] font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">{duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white rounded-lg p-2">
                            <p className="text-[9px] text-gray-400 font-medium">Bắt đầu</p>
                            <p className="text-[11px] font-semibold text-gray-700">{start.date}</p>
                            <p className="text-sm font-black text-red-600">{start.time}</p>
                        </div>
                        <div className="text-gray-300 font-bold text-lg">→</div>
                        <div className="flex-1 bg-white rounded-lg p-2">
                            <p className="text-[9px] text-gray-400 font-medium">Kết thúc</p>
                            <p className="text-[11px] font-semibold text-gray-700">{end.date}</p>
                            <p className="text-sm font-black text-red-600">{end.time}</p>
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50">
                        <div className="h-7 w-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0"><User className="h-3.5 w-3.5 text-blue-600" /></div>
                        <div><p className="text-[10px] text-gray-500 font-medium">Donor</p><p className="text-sm font-bold text-gray-800">{appointment.donorName || `User #${appointment.donorId}`}</p></div>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50">
                        <div className="h-7 w-7 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0"><User className="h-3.5 w-3.5 text-purple-600" /></div>
                        <div><p className="text-[10px] text-gray-500 font-medium">Staff phụ trách</p><p className="text-sm font-bold text-gray-800">{appointment.staffName || `Staff #${appointment.staffId}`}</p></div>
                    </div>
                    {appointment.location && (
                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50">
                            <div className="h-7 w-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0"><MapPin className="h-3.5 w-3.5 text-green-600" /></div>
                            <div><p className="text-[10px] text-gray-500 font-medium">Địa điểm</p><p className="text-sm font-bold text-gray-800">{appointment.location}</p></div>
                        </div>
                    )}
                </div>
                {nextStatuses.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Cập nhật trạng thái</p>

                        {/* Warning: confirm deadline passed */}
                        {appointment.status === 'PENDING' && confirmDeadlinePassed && (
                            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200">
                                <Clock className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                                <p className="text-[11px] text-red-700 font-medium leading-tight">Đã quá hạn xác nhận (phải confirm trước 24h). Lịch hẹn này không thể được xác nhận.</p>
                            </div>
                        )}

                        {/* Warning: appointment not ended yet */}
                        {appointment.status === 'CONFIRMED' && !appointmentEnded && (
                            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                                <Clock className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                                <p className="text-[11px] text-amber-700 font-medium leading-tight">Chỉ có thể hoàn thành sau khi qua giờ kết thúc lịch hẹn.</p>
                            </div>
                        )}

                        {nextStatuses.map(s => {
                            const c = STATUS_CONFIG[s];
                            const isConfirm = s === 'CONFIRMED' || s === 'COMPLETED';
                            const isDisabledByConfirmRule = s === 'CONFIRMED' && confirmDeadlinePassed;
                            const isDisabledByEndRule = s === 'COMPLETED' && !appointmentEnded;
                            const isDisabled = isDisabledByConfirmRule || isDisabledByEndRule;
                            const disabledLabel = isDisabledByConfirmRule ? 'Quá hạn xác nhận' : isDisabledByEndRule ? 'Chưa đến giờ kết thúc' : c.label;
                            const disabledTitle = isDisabledByConfirmRule ? 'Phải confirm trước 24h so với giờ hẹn' : isDisabledByEndRule ? 'Chỉ được hoàn thành sau khi qua giờ kết thúc lịch hẹn' : undefined;
                            return (
                                <button key={s} onClick={() => !isDisabled && handleStatus(s)} disabled={updating !== null || isDisabled}
                                    title={disabledTitle}
                                    className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition ${isDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : isConfirm ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700' : 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700'} disabled:opacity-60`}>
                                    {updating === s ? <RefreshCw className="h-4 w-4 animate-spin" /> : c.icon}
                                    {disabledLabel}
                                </button>
                            );
                        })}
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
        ? `${weekDays[0].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} – ${weekDays[6].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
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
                                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isToday ? 'text-red-500' : 'text-gray-400'}`}>{WEEKDAYS[day.getDay()]}</p>
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
}

function ListView({ appointments, isLoading, onStatusChange }: ListViewProps) {
    const [selectedId, setSelectedId] = useState<number | null>(appointments[0]?.id ?? null);
    const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'ALL'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => { if (appointments.length > 0 && !selectedId) setSelectedId(appointments[0].id); }, [appointments]);

    const filtered = appointments.filter(a => {
        const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
        const matchSearch = !searchQuery || String(a.donorId).includes(searchQuery) || String(a.id).includes(searchQuery) || (a.purpose?.toLowerCase().includes(searchQuery.toLowerCase())) || (a.location?.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchStatus && matchSearch;
    });

    const selectedAppointment = appointments.find(a => a.id === selectedId) || null;

    return (
        <div className="flex flex-col flex-1 overflow-hidden gap-4">
            {/* Toolbar */}
            <div className="flex items-center gap-3 flex-shrink-0">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Tìm kiếm lịch hẹn..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition" />
                </div>
                <div className="flex items-center gap-1.5">
                    <Filter className="h-4 w-4 text-gray-400" />
                    {(['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)} className={`inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold shadow-sm transition ${statusFilter === s ? 'border-red-200 bg-red-50 text-red-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>
                            {s === 'ALL' ? 'Tất cả' : STATUS_CONFIG[s as AppointmentStatus].label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table + Detail */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
                <div className="lg:col-span-7 overflow-hidden flex flex-col gap-2">
                    <div className="flex items-center justify-between flex-shrink-0">
                        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Danh sách lịch hẹn</h2>
                        <span className="text-xs font-medium text-gray-400">{filtered.length} kết quả</span>
                    </div>
                    <div className="flex-1 overflow-auto rounded-xl border border-gray-100 shadow-sm">
                        {isLoading ? (
                            <div className="p-8 text-center"><RefreshCw className="h-6 w-6 animate-spin text-red-400 mx-auto mb-2" /><p className="text-sm text-gray-400">Đang tải dữ liệu...</p></div>
                        ) : filtered.length === 0 ? (
                            <div className="p-8 text-center"><Calendar className="h-10 w-10 text-gray-200 mx-auto mb-3" /><p className="text-sm font-medium text-gray-400">Không có lịch hẹn nào</p></div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/80">
                                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Lịch hẹn</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Thời gian</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Địa điểm</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(appt => {
                                        const s = formatDateTime(appt.startTime);
                                        const cfg = STATUS_CONFIG[appt.status];
                                        const isSelected = selectedId === appt.id;
                                        return (
                                            <tr key={appt.id} onClick={() => setSelectedId(appt.id)} className={`border-b border-gray-50 cursor-pointer transition-colors ${isSelected ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-red-100' : 'bg-gray-100'}`}>
                                                            <Calendar className={`h-4 w-4 ${isSelected ? 'text-red-500' : 'text-gray-400'}`} />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 text-xs">#{appt.id} · {appt.donorName || `Donor #${appt.donorId}`}</p>
                                                            <p className="text-[10px] text-gray-400 line-clamp-1">{appt.purpose || 'Không có mô tả'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3"><p className="text-xs font-semibold text-gray-700">{s.date}</p><p className="text-[10px] text-gray-400">{s.time}</p></td>
                                                <td className="px-4 py-3"><p className="text-xs text-gray-600 line-clamp-1">{appt.location || '—'}</p></td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ring-1 ${cfg.bg} ${cfg.color}`}>{cfg.icon}{cfg.label}</span>
                                                </td>
                                                <td className="px-4 py-3"><ChevronRight className={`h-4 w-4 ${isSelected ? 'text-red-400' : 'text-gray-300'}`} /></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
                <div className="lg:col-span-5 overflow-auto">
                    <AppointmentDetailPanel appointment={selectedAppointment} onStatusChange={onStatusChange} />
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type TabType = 'list' | 'calendar';

export default function StaffSchedulePage() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<AppointmentScheduleDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('list');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [calendarSelected, setCalendarSelected] = useState<AppointmentScheduleDto | null>(null);
    const [myOnly, setMyOnly] = useState(false);

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

    const handleStatusChange = async (id: number, status: AppointmentStatus) => {
        try {
            const updated = await appointmentService.updateStatus(id, status);
            setAppointments(prev => prev.map(a => a.id === id ? updated : a));
            if (calendarSelected?.id === id) setCalendarSelected(updated);
            toast.success(`Đã cập nhật trạng thái thành ${STATUS_CONFIG[status].label}`);
        } catch (err: any) { toast.error(err?.response?.data?.message || 'Không thể cập nhật trạng thái'); }
    };

    const displayedAppointments = myOnly && myId
        ? appointments.filter(a => Number(a.staffId) === myId)
        : appointments;

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
        <div className="flex flex-col h-full bg-[#f1f5f9]">
            {/* Folder Tabs Header */}
            <div className="flex items-end px-6 gap-2 h-14">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`relative px-5 py-2.5 text-sm font-bold transition-all duration-200 flex items-center gap-2 ${activeTab === tab.id
                            ? 'bg-white text-red-600 rounded-t-2xl shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.05)] z-20 h-11'
                            : 'bg-gray-200/80 text-gray-500 rounded-t-xl hover:bg-gray-200 z-10 h-9 mb-0.5'}`}>
                        {tab.icon}
                        <span className="whitespace-nowrap">{tab.label}</span>
                        {tab.id === 'list' && <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'list' ? 'bg-red-50 text-red-600' : 'bg-gray-300 text-gray-500'}`}>{displayedAppointments.length}</span>}
                        {activeTab === tab.id && <div className="absolute -bottom-2 left-0 right-0 h-4 bg-white z-30" />}
                    </button>
                ))}
            </div>

            {/* Main Card */}
            <div className="flex-1 bg-white mx-2 mb-2 rounded-[24px] shadow-sm border border-gray-100 overflow-hidden relative z-10 flex flex-col">
                <div className="flex-1 overflow-hidden p-6 flex flex-col gap-4">

                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-3 flex-shrink-0">
                        {[
                            { label: 'Tổng cộng', value: stats.total, color: 'from-slate-600 to-slate-700', wave: '#94a3b8' },
                            { label: 'Chờ xác nhận', value: stats.pending, color: 'from-amber-500 to-orange-500', wave: '#fcd34d' },
                            { label: 'Đã xác nhận', value: stats.confirmed, color: 'from-emerald-500 to-green-600', wave: '#6ee7b7' },
                            { label: 'Hoàn thành', value: stats.completed, color: 'from-blue-500 to-indigo-600', wave: '#93c5fd' },
                        ].map(s => (
                            <div key={s.label} className={`relative bg-gradient-to-br ${s.color} rounded-2xl p-4 text-white overflow-hidden`}>
                                <span className="text-white/70 text-xs font-medium block mb-1">{s.label}</span>
                                <p className="text-2xl font-black relative z-10">{s.value}</p>
                                {/* Wave decoration */}
                                <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 200 40" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0,20 C40,35 80,5 120,20 C160,35 180,10 200,20 L200,40 L0,40 Z" fill={s.wave} fillOpacity="0.3" />
                                    <path d="M0,28 C50,15 100,38 150,25 C170,20 185,30 200,28 L200,40 L0,40 Z" fill={s.wave} fillOpacity="0.2" />
                                </svg>
                            </div>
                        ))}
                    </div>

                    {/* Action bar */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-bold hover:from-red-600 hover:to-rose-700 transition shadow-sm">
                            <Plus className="h-4 w-4" />Tạo lịch hẹn
                        </button>

                        {/* My appointments iOS toggle */}
                        <button
                            onClick={() => setMyOnly(v => !v)}
                            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-colors duration-200 ${myOnly ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                        >
                            <span className={`text-sm font-semibold select-none ${myOnly ? 'text-green-700' : 'text-gray-500'}`}>Lịch của tôi</span>
                            <span className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${myOnly ? 'bg-green-500' : 'bg-gray-300'}`}>
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${myOnly ? 'translate-x-5' : 'translate-x-0'}`} />
                            </span>
                        </button>

                        <button onClick={fetchAppointments} disabled={isLoading} className="h-9 w-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition disabled:opacity-50">
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {/* Tab content */}
                    {activeTab === 'list' && (
                        <ListView appointments={displayedAppointments} isLoading={isLoading} onStatusChange={handleStatusChange} />
                    )}

                    {activeTab === 'calendar' && (
                        <div className="flex-1 min-h-0 flex gap-4 overflow-hidden">
                            {/* Calendar takes remaining space */}
                            <div className="flex-1 min-w-0 min-h-0 flex flex-col">
                                <CalendarView
                                    appointments={displayedAppointments}
                                    onSelect={appt => setCalendarSelected(appt)}
                                    selectedId={calendarSelected?.id ?? null}
                                />
                            </div>
                            {/* Detail panel — fixed width, always visible */}
                            <div className="w-[340px] flex-shrink-0 overflow-auto">
                                <AppointmentDetailPanel appointment={calendarSelected} onStatusChange={handleStatusChange} />
                            </div>
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
