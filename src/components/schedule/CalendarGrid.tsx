'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, ChevronDown, Clock, User, X, MapPin, Search, Phone, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { AppointmentScheduleDto, appointmentService, CreateAppointmentRequest } from '@/services/appointmentService';
import { userService, UserInfo } from '@/services/userService';
import { toast } from 'react-hot-toast';

interface CalendarGridProps {
    monthCells: { date: Date; isCurrentMonth: boolean }[];
    appointments: AppointmentScheduleDto[];
    loading: boolean;
    currentDate: Date;
    onDateChange: (date: Date) => void;
    view: 'Month' | 'Week';
    setView: (v: 'Month' | 'Week') => void;
    onRefresh?: () => void;
}

const DAYS_ORDERED = ['Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy', 'CN'];
const HOURS = Array.from({ length: 24 }, (_, i) => i); // 00:00 to 23:00

const VIEW_LABELS: Record<string, string> = {
    Month: 'Tháng',
    Week: 'Tuần',
};

const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-600 border-amber-200 ring-amber-400',
    CONFIRMED: 'bg-emerald-50 text-emerald-600 border-emerald-200 ring-emerald-400',
    CANCELLED: 'bg-rose-50 text-rose-600 border-rose-200 ring-rose-400',
    COMPLETED: 'bg-blue-50 text-blue-600 border-blue-200 ring-blue-400',
};

const STATUS_LABELS: Record<string, string> = {
    PENDING: 'Chờ duyệt',
    CONFIRMED: 'Chấp nhận',
    CANCELLED: 'Từ chối',
    COMPLETED: 'Hoàn thành',
};

const DOT_COLORS: Record<string, string> = {
    PENDING: 'bg-amber-400',
    CONFIRMED: 'bg-emerald-400',
    CANCELLED: 'bg-rose-400',
    COMPLETED: 'bg-blue-400',
};

type ModalMode = 'EVENT_DETAIL' | 'CREATE_EVENT';

export const CalendarGrid = ({
    monthCells,
    appointments,
    loading,
    currentDate,
    onDateChange,
    view,
    setView,
    onRefresh,
}: CalendarGridProps) => {
    const [now, setNow] = useState(new Date());
    const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);

    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>('EVENT_DETAIL');
    const [selectedEvent, setSelectedEvent] = useState<AppointmentScheduleDto | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [staffs, setStaffs] = useState<UserInfo[]>([]);
    const [error, setError] = useState<string | null>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const sidePanelRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const statusDropRef = useRef<HTMLDivElement>(null);
    const hasFetchedStaffs = useRef(false);

    const [formData, setFormData] = useState({
        purpose: '',
        location: '',
        date: '',
        startTime: '',
        endTime: '',
        staffId: '',
    });

    useEffect(() => {
        const fetchStaffs = async () => {
            if (hasFetchedStaffs.current) return;
            hasFetchedStaffs.current = true;

            const res = await userService.getAllStaff();
            if (res.success && res.data) {
                setStaffs(res.data);
            } else {
                hasFetchedStaffs.current = false; // Allow retry on failure
            }
        };
        fetchStaffs();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (statusDropRef.current && !statusDropRef.current.contains(event.target as Node)) {
                setIsStatusDropdownOpen(false);
            }
            if (isSidePanelOpen) {
                const isInsidePanel = sidePanelRef.current?.contains(event.target as Node);
                const isCellTarget = (event.target as HTMLElement).closest('[data-calendar-cell]');
                if (!isInsidePanel && !isCellTarget) setIsSidePanelOpen(false);
            }
            if (isModalOpen) {
                const isInsideModal = modalRef.current?.contains(event.target as Node);
                const isEventTarget = (event.target as HTMLElement).closest('[data-calendar-event]');
                const isAddButton = (event.target as HTMLElement).closest('[data-add-button]');
                if (!isInsideModal && !isEventTarget && !isAddButton) setIsModalOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSidePanelOpen, isModalOpen]);

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleClickOutsideDropdown = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsYearPickerOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutsideDropdown);
        return () => document.removeEventListener('mousedown', handleClickOutsideDropdown);
    }, []);

    const getDayEvents = (date: Date) =>
        appointments
            .filter((a) => {
                const d = new Date(a.startTime);
                return (
                    d.getFullYear() === date.getFullYear() &&
                    d.getMonth() === date.getMonth() &&
                    d.getDate() === date.getDate()
                );
            })
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    const goToPrev = () => {
        const d = new Date(currentDate);
        if (view === 'Month') d.setMonth(d.getMonth() - 1);
        else d.setDate(d.getDate() - 7);
        onDateChange(d);
    };
    const goToNext = () => {
        const d = new Date(currentDate);
        if (view === 'Month') d.setMonth(d.getMonth() + 1);
        else d.setDate(d.getDate() + 7);
        onDateChange(d);
    };

    const getWeekDays = () => {
        const start = new Date(currentDate);
        const day = start.getDay();

        const diff = start.getDate() - (day === 0 ? 6 : day - 1);
        start.setHours(0, 0, 0, 0);
        start.setDate(diff);




        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            return d;
        });
    };

    const handleCreateClick = () => {
        setError(null);
        setModalMode('CREATE_EVENT');
        
        // If a date was selected in the calendar, pre-fill the form
        if (selectedDate) {
            const pad = (num: number) => String(num).padStart(2, '0');
            const dateStr = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`;
            setFormData(prev => ({
                ...prev,
                date: dateStr,
                startTime: '09:00',
                endTime: '10:00'
            }));
        }
        
        setIsModalOpen(true);
    };

    const handleEventClick = (appt: AppointmentScheduleDto) => {
        setSelectedEvent(appt);
        setModalMode('EVENT_DETAIL');
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Required fields check
        if (!formData.purpose.trim()) {
            setError('Vui lòng nhập mục đích cuộc hẹn.');
            return;
        }
        if (!formData.staffId) {
            setError('Vui lòng chọn nhân viên tiếp nhận.');
            return;
        }
        if (!formData.date) {
            setError('Vui lòng chọn ngày hẹn.');
            return;
        }
        if (!formData.startTime) {
            setError('Vui lòng chọn thời gian bắt đầu.');
            return;
        }
        if (!formData.endTime) {
            setError('Vui lòng chọn thời gian kết thúc.');
            return;
        }

        const selectedDateStr = formData.date;
        const now = new Date();
        const minStartDate = new Date(now.getTime() + 25 * 60 * 60 * 1000);

        const startDateTime = new Date(`${selectedDateStr}T${formData.startTime}`);
        const endDateTime = new Date(`${selectedDateStr}T${formData.endTime}`);

        // Past time check (for today or tomorrow)
        if (startDateTime < minStartDate) {
            setError('Lịch hẹn phải cách thời điểm hiện tại ít nhất 25 tiếng.');
            return;
        }

        // Logical sequence check
        if (endDateTime <= startDateTime) {
            setError('Thời gian kết thúc phải sau thời gian bắt đầu.');
            return;
        }

        // Duration check (e.g., at least 15 minutes)
        const durationInMinutes = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60);
        if (durationInMinutes < 15) {
            setError('Cuộc hẹn phải kéo dài ít nhất 15 phút.');
            return;
        }

        if (durationInMinutes > 480) { // 8 hours max
            setError('Cuộc hẹn không được kéo dài quá 8 tiếng.');
            return;
        }

        setIsSubmitting(true);
        try {
            const storedUser = localStorage.getItem('be_user');
            const donor: UserInfo | null = storedUser ? JSON.parse(storedUser) : null;

            if (!donor) throw new Error('Vui lòng đăng nhập để tạo lịch hẹn.');

            const formatToLocalISO = (date: Date) => {
                const pad = (num: number) => String(num).padStart(2, '0');
                const year = date.getFullYear();
                const month = pad(date.getMonth() + 1);
                const day = pad(date.getDate());
                const hours = pad(date.getHours());
                const minutes = pad(date.getMinutes());
                const seconds = pad(date.getSeconds());
                return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
            };

            const payload: CreateAppointmentRequest = {
                donorId: donor.id,
                staffId: parseInt(formData.staffId),
                startTime: formatToLocalISO(startDateTime),
                endTime: formatToLocalISO(endDateTime),
                location: formData.location || 'Tại văn phòng',
                purpose: formData.purpose,
            };

            await appointmentService.create(payload);

            toast.success('Đã tạo lịch hẹn thành công!');
            setIsModalOpen(false);
            setFormData({ purpose: '', location: '', date: '', startTime: '', endTime: '', staffId: '' });
            // Refresh list
            if (onRefresh) {
                onRefresh();
            } else {
                onDateChange(new Date(currentDate));
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || 'Không thể tạo lịch hẹn. Vui lòng thử lại.');
            toast.error('Lỗi khi tạo lịch hẹn.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateStatus = async (status: 'CONFIRMED' | 'CANCELLED') => {
        if (!selectedEvent) return;
        setIsSubmitting(true);
        setError(null);
        try {
            await appointmentService.updateStatus(selectedEvent.id, status);
            toast.success(status === 'CONFIRMED' ? 'Đã xác nhận lịch hẹn' : 'Đã hủy lịch hẹn');
            setIsModalOpen(false);
            if (onRefresh) {
                onRefresh();
            } else {
                onDateChange(new Date(currentDate));
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || 'Không thể cập nhật trạng thái');
            toast.error('Lỗi khi cập nhật trạng thái.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekDays = getWeekDays();
    const dateRangeLabel = view === 'Month'
        ? currentDate.toLocaleString('vi-VN', { month: 'long', year: 'numeric' })
        : `${weekDays[0].getDate().toString().padStart(2, '0')}/${(weekDays[0].getMonth() + 1).toString().padStart(2, '0')} - ${weekDays[6].getDate().toString().padStart(2, '0')}/${(weekDays[6].getMonth() + 1).toString().padStart(2, '0')} ${weekDays[6].getFullYear()}`;

    const filteredDrawerEvents = selectedDate ? getDayEvents(selectedDate).filter(a => {
        const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
        const query = searchQuery.toLowerCase();
        const matchesSearch = query === '' ||
            (a.staffName?.toLowerCase().includes(query)) ||
            (a.location?.toLowerCase().includes(query)) ||
            (a.purpose?.toLowerCase().includes(query));
        return matchesStatus && matchesSearch;
    }) : [];

    const WeeklyView = () => (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white rounded-xl border border-gray-100 mx-5 mb-5 relative">
            {/* Header Row */}
            <div className="grid grid-cols-[80px_1fr] border-b border-gray-100 bg-gray-50/50 shrink-0">
                <div className="border-r border-gray-100" />
                <div className="grid grid-cols-7">
                    {weekDays.map((date, i) => {
                        const isToday = date.toDateString() === new Date().toDateString();
                        return (
                            <div key={i} className={`py-3 text-center border-r border-gray-100 last:border-r-0 ${isToday ? 'bg-black text-white' : ''}`}>
                                <p className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">{DAYS_ORDERED[i]}</p>
                                <p className="text-sm font-black">{date.getDate()}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto relative no-scrollbar">
                <div className="grid grid-cols-[80px_1fr] relative">
                    {/* Time Column */}
                    <div className="border-r border-gray-100 bg-gray-50/20">
                        {HOURS.map(h => (
                            <div key={h} className="h-[80px] border-b border-gray-100/50 flex flex-col justify-start items-center pt-1">
                                <span className="text-[10px] font-bold text-gray-400">
                                    {h.toString().padStart(2, '0')}:00
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Grid and Events */}
                    <div className="relative">
                        {/* Hour Background lines */}
                        {HOURS.map(h => (
                            <div key={h} className="h-[80px] border-b border-gray-100/30 w-full" />
                        ))}

                        {/* Day Column lines */}
                        <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
                            {Array.from({ length: 7 }).map((_, i) => (
                                <div key={i} className="border-r border-gray-100/30 last:border-r-0" />
                            ))}
                        </div>

                        {/* Current Time line */}
                        {weekDays.some(d => d.toDateString() === now.toDateString()) && (
                            <div
                                className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                                style={{ top: `${((now.getHours() * 60 + now.getMinutes()) * 80) / 60}px` }}
                            >
                                <div className="absolute -left-[84px] bg-black text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-lg">
                                    {now.getHours().toString().padStart(2, '0')}:{now.getMinutes().toString().padStart(2, '0')}
                                </div>
                                <div className="w-full h-[2px] bg-black relative">
                                    <div className="absolute left-0 -top-1 w-2 h-2 rounded-full bg-black shadow-sm" />
                                </div>
                            </div>
                        )}

                        {/* Events Layer */}
                        <div className="absolute inset-0 grid grid-cols-7 text-xs">
                            {weekDays.map((date, dayIdx) => (
                                <div key={dayIdx} className="relative h-full">
                                    {getDayEvents(date).map(appt => {
                                        const start = new Date(appt.startTime);
                                        const end = new Date(appt.endTime);

                                        // Calculate minutes since 00:00 of this specific day
                                        const dayStart = new Date(date);
                                        dayStart.setHours(0, 0, 0, 0);

                                        const startMin = (start.getTime() - dayStart.getTime()) / (1000 * 60);
                                        const originalDuration = (end.getTime() - start.getTime()) / (1000 * 60);
                                        const displayDuration = Math.max(30, originalDuration);

                                        const topPosPx = (startMin * 80) / 60;
                                        const heightPosPx = (displayDuration * 80) / 60;

                                        return (
                                            <div
                                                key={appt.id}
                                                data-calendar-event
                                                onClick={() => handleEventClick(appt)}
                                                className={`absolute left-0.5 right-0.5 rounded-md p-1 group/card text-left border shadow-sm z-10 hover:shadow-md hover:scale-[1.01] cursor-pointer transition-all ${STATUS_COLORS[appt.status] || 'bg-gray-50 text-gray-400 border-gray-200'}`}
                                                style={{
                                                    top: `${topPosPx}px`,
                                                    height: `${heightPosPx}px`,
                                                    minHeight: '20px'
                                                }}
                                            >
                                                <div className="flex flex-col h-full justify-start items-start gap-0.5 overflow-hidden">
                                                    <h4 className="text-[9px] font-black uppercase leading-none mb-0.5 text-ellipsis line-clamp-2 md:line-clamp-none">
                                                        {appt.purpose || 'HẸN HỖ TRỢ'}
                                                    </h4>
                                                    <div className="flex items-center gap-1 opacity-80 overflow-hidden">
                                                        <Clock className="w-2 h-2 shrink-0" />
                                                        <span className="text-[8px] font-bold whitespace-nowrap">
                                                            {start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden min-h-0 relative">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 shrink-0 relative z-40">
                <div className="flex-1 flex flex-col gap-3 justify-start">
                    <div className="flex items-center bg-gray-100 rounded-2xl p-1 gap-1 w-fit">
                        {(['Week', 'Month'] as const).map((v) => (
                            <button key={v} onClick={() => setView(v)} className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-tight transition-all duration-300 ${view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>{VIEW_LABELS[v]}</button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 flex justify-center items-center">
                    {view === 'Week' ? (
                        <div className="flex items-center gap-4 bg-gray-50 px-2 py-1.5 rounded-2xl border border-gray-100 shadow-sm">
                            <button onClick={goToPrev} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white hover:text-gray-900 text-gray-400 transition-all"><ChevronLeft className="w-4 h-4" /></button>
                            <span className="text-[11px] font-black text-gray-900 tracking-tight min-w-[120px] text-center uppercase">{dateRangeLabel}</span>
                            <button onClick={goToNext} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white hover:text-gray-900 text-gray-400 transition-all"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <button onClick={goToPrev} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-white border border-gray-100 text-gray-400 hover:text-gray-900 transition-all shadow-sm">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="relative" ref={dropdownRef}>
                                <button onClick={() => setIsYearPickerOpen(!isYearPickerOpen)} className="flex items-center gap-2 px-6 py-2 bg-gray-50 hover:bg-white hover:shadow-sm border border-gray-100 rounded-2xl transition-all group">
                                    <span className="text-[11px] font-black text-gray-900 tracking-tight uppercase">{currentDate.toLocaleString('vi-VN', { month: 'long', year: 'numeric' })}</span>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 group-hover:text-gray-900 ${isYearPickerOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isYearPickerOpen && (
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 p-4 z-[100] animate-in fade-in zoom-in duration-200">
                                        <div className="flex items-center justify-between mb-4 px-2">
                                            <button onClick={() => { const d = new Date(currentDate); d.setFullYear(d.getFullYear() - 1); onDateChange(d); }} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all"><ChevronLeft className="w-4 h-4" /></button>
                                            <span className="text-sm font-black text-gray-900">{currentDate.getFullYear()}</span>
                                            <button onClick={() => { const d = new Date(currentDate); d.setFullYear(d.getFullYear() + 1); onDateChange(d); }} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all"><ChevronRight className="w-4 h-4" /></button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {Array.from({ length: 12 }).map((_, i) => <button key={i} onClick={() => { const d = new Date(currentDate); d.setMonth(i); onDateChange(d); setIsYearPickerOpen(false); }} className={`py-2 rounded-xl text-[10px] font-black transition-all ${currentDate.getMonth() === i ? 'bg-[#ff715e] text-white shadow-md shadow-rose-100' : 'hover:bg-gray-50 text-gray-500 hover:text-gray-900'}`}>{`T${i + 1}`}</button>)}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button onClick={goToNext} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-white border border-gray-100 text-gray-400 hover:text-gray-900 transition-all shadow-sm">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex-1 flex justify-end">
                    <button data-add-button onClick={handleCreateClick} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#ff715e] text-white text-[10px] font-black hover:bg-[#f74938] transition-all shadow-lg shadow-rose-200">
                        <Plus className="w-4 h-4" /> THÊM LỊCH
                    </button>
                </div>
            </div>

            {view === 'Week' ? WeeklyView() : (
                <>
                    <div className="grid grid-cols-7 shrink-0 mx-8">
                        {DAYS_ORDERED.map((day) => <div key={day} className="py-2 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">{day}</div>)}
                    </div>
                    <div className="flex-1 min-h-0 relative mx-8 mb-8 group/grid">
                        <div className="absolute inset-0 border border-gray-100 rounded-[2rem] overflow-hidden">
                            {loading && <div className="absolute inset-0 z-40 bg-white/60 backdrop-blur-sm flex items-center justify-center"><div className="h-8 w-8 border-2 border-[#ff715e] border-t-transparent rounded-full animate-spin" /></div>}
                            <div className="grid grid-cols-7 grid-rows-6 h-full">
                                {monthCells.map((cell, idx) => {
                                    const dayEvents = getDayEvents(cell.date);
                                    const isToday = new Date(cell.date).toDateString() === today.toDateString();
                                    const isOut = !cell.isCurrentMonth;
                                    return (
                                        <div key={idx} data-calendar-cell onClick={() => { setSelectedDate(cell.date); setIsSidePanelOpen(true); }} className={`relative flex flex-col overflow-hidden cursor-pointer ${idx % 7 !== 6 ? 'border-r border-gray-100' : ''} ${idx < 35 ? 'border-b border-gray-100' : ''} ${!isOut && !isToday ? 'hover:bg-gray-50/40 transition-colors' : ''} ${selectedDate?.getTime() === cell.date.getTime() && !isOut && isSidePanelOpen ? 'bg-rose-50/50' : ''}`} style={isOut ? { backgroundImage: 'repeating-linear-gradient(-45deg, transparent 0, transparent 5px, rgba(156,163,175,0.08) 5px, rgba(156,163,175,0.08) 6px)', backgroundColor: '#fafafa' } : {}}>
                                            {isToday ? (
                                                <div className="absolute inset-1 rounded-xl bg-[#ff715e] flex flex-col p-2 overflow-hidden shadow-lg shadow-rose-200 hover:scale-[1.02] transition-transform">
                                                    <span className="text-sm font-black text-white leading-none">{cell.date.getDate()}</span>
                                                    <div className="flex flex-col gap-0.5 mt-1 flex-1 overflow-hidden">{dayEvents.slice(0, 2).map((appt) => <div key={appt.id}><p className="text-[8px] font-bold text-white/90 truncate leading-snug">• {appt.purpose || 'Hẹn hỗ trợ'}</p></div>)}</div>
                                                </div>
                                            ) : (
                                                <div className="p-2 flex flex-col gap-1 h-full">
                                                    <span className={`text-[10px] font-black leading-none ${isOut ? 'text-gray-300' : 'text-gray-800'}`}>{cell.date.getDate().toString().padStart(2, '0')}</span>
                                                    <div className="flex flex-col gap-1 overflow-hidden">{dayEvents.slice(0, 3).map((appt) => <div key={appt.id} className="flex items-center gap-1 text-left w-full"><span className={`w-1 h-1 rounded-full shrink-0 ${DOT_COLORS[appt.status] || 'bg-gray-300'}`} /><span className="text-[8px] font-bold truncate text-gray-500">{appt.purpose || 'Hẹn hỗ trợ'}</span></div>)}</div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Side Panel */}
            <div ref={sidePanelRef} className={`fixed top-0 right-0 bottom-0 w-[550px] bg-white border-l border-gray-100 z-[60] shadow-[-20px_0_50px_rgba(0,0,0,0.05)] transition-transform duration-500 ease-in-out flex flex-col ${isSidePanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="px-10 pt-8 pb-4 shrink-0 flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-[#ff715e] uppercase tracking-[0.3em] opacity-80">CHI TIẾT NGÀY</span>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter">{selectedDate?.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</h2>
                    </div>
                    <button onClick={() => setIsSidePanelOpen(false)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all"><X className="w-5 h-5" /></button>
                </div>

                <div className="px-10 py-2 flex items-center gap-3 shrink-0 mb-2">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Tên, SĐT, Địa điểm..." className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-11 pr-5 py-3 text-xs font-bold focus:ring-2 focus:ring-gray-100" />
                    </div>
                    <div className="relative" ref={statusDropRef}>
                        <button onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)} className="flex items-center gap-2 px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl transition-all">
                            <span className="text-[10px] font-black text-gray-900 uppercase">{statusFilter === 'ALL' ? 'Tất cả' : STATUS_LABELS[statusFilter]}</span>
                            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isStatusDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                                <button onClick={() => { setStatusFilter('ALL'); setIsStatusDropdownOpen(false); }} className="w-full px-4 py-2 text-left text-[10px] font-black hover:bg-gray-50">TẤT CẢ</button>
                                {Object.entries(STATUS_LABELS).map(([s, l]) => <button key={s} onClick={() => { setStatusFilter(s); setIsStatusDropdownOpen(false); }} className="w-full px-4 py-2 text-left text-[10px] font-black hover:bg-gray-50 uppercase">{l}</button>)}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-10 py-2 no-scrollbar space-y-4">
                    <div className="space-y-4 pb-20">
                        {filteredDrawerEvents.length > 0 ? filteredDrawerEvents.map(appt => (
                            <div key={appt.id} className="relative bg-white rounded-[2rem] border border-gray-100 p-6 flex flex-col gap-2 shadow-sm scale-95 origin-center">
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${DOT_COLORS[appt.status]}`} />
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full"><Clock className="w-3.5 h-3.5 text-gray-400" /><span className="text-[10px] font-black text-gray-900">{new Date(appt.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(appt.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span></div>
                                    <div className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${STATUS_COLORS[appt.status]}`}>{STATUS_LABELS[appt.status]}</div>
                                </div>
                                <h3 className="text-base font-black text-gray-900 uppercase tracking-tight leading-tight mb-1">{appt.purpose || 'HẸN HỖ TRỢ'}</h3>
                                <div className="grid grid-cols-[1.2fr_1fr] gap-4">
                                    <div className="flex items-start gap-2.5 text-gray-400">
                                        <User className="w-4.5 h-4.5 shrink-0 mt-0.5 text-gray-500" />
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-black text-gray-900 leading-none mb-1.5">{appt.staffName || 'Nhân viên 3'}</span>
                                            <div className="flex items-center gap-1.5 text-gray-500"><Phone className="w-3 h-3" /><span className="text-[12px] font-bold">038 923 1234</span></div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2.5 text-gray-400 pt-0.5"><MapPin className="w-4 h-4 shrink-0 text-gray-500" /><span className="text-[12px] font-bold text-gray-600 leading-tight truncate">{appt.location || 'Vinhomes Central Park'}</span></div>
                                </div>
                            </div>
                        )) : <div className="flex flex-col items-center justify-center py-20 opacity-30 items-center justify-center p-20"><Search className="w-16 h-16 mb-4 text-gray-300" /><p className="text-xs font-black uppercase tracking-widest">Không tìm thấy kết quả</p></div>}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" />
                    <div ref={modalRef} className="relative w-full max-w-[500px] bg-white rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.15)] overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                        <div className="px-10 pt-6 pb-3 flex items-center justify-between border-b border-gray-100/50">
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{modalMode === 'EVENT_DETAIL' ? 'Chi Tiết Lịch Hẹn' : 'Tạo Lịch Hẹn Mới'}</h2>
                                {modalMode === 'EVENT_DETAIL' && selectedEvent && (
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${STATUS_COLORS[selectedEvent.status]}`}>
                                        {selectedEvent.status === 'PENDING' 
                                            ? (selectedEvent.createdByRole !== 'ROLE_USER' ? 'Chờ bạn xác nhận' : 'Đang chờ Staff xác nhận') 
                                            : (selectedEvent.status === 'CONFIRMED' ? 'Chuẩn bị gặp' : STATUS_LABELS[selectedEvent.status])}
                                    </div>
                                )}
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="px-10 py-4">
                            {error && (
                                <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle className="w-4 h-4 text-[#ff715e]" />
                                    <span className="text-[11px] font-black text-[#ff715e] uppercase tracking-tight">{error}</span>
                                </div>
                            )}

                            {modalMode === 'EVENT_DETAIL' && selectedEvent ? (
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex flex-col">
                                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5">Trạng thái đặt lịch</p>
                                            <div className="flex items-center gap-4 flex-wrap">
                                                <p className="text-2xl font-black text-gray-900 leading-none">
                                                    {new Date(selectedEvent.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedEvent.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
                                                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                    <span className="text-[11px] font-black text-gray-600">{selectedEvent.location || 'Tại văn phòng'}</span>
                                                </div>
                                            </div>
                                            <p className="text-[11px] font-bold text-gray-400 mt-1">
                                                Ngày: {new Date(selectedEvent.startTime).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            </p>
                                        </div>

                                        <div className="py-3 border-y border-gray-100/50">
                                            <div className="flex flex-col gap-1">
                                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Nhân viên tiếp nhận</p>
                                                <p className="text-[15px] font-black text-gray-900">{selectedEvent.staffName || 'Chưa phân công'}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1 pt-1">
                                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Mục đích cuộc hẹn</p>
                                            <p className="text-base font-black text-gray-900 leading-tight uppercase tracking-tight">{selectedEvent.purpose || 'HẸN HỖ TRỢ'}</p>
                                        </div>
                                    </div>


                                    <div className="pt-4 flex gap-3">
                                        {selectedEvent.status === 'PENDING' && (
                                            <>
                                                {selectedEvent.createdByRole !== 'ROLE_USER' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus('CONFIRMED')}
                                                        disabled={isSubmitting}
                                                        className="flex-1 py-3 bg-[#ff715e] text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-[#f74938] transition-all shadow-lg shadow-rose-100 disabled:opacity-50 flex items-center justify-center gap-2"
                                                    >
                                                        {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                                                        Xác nhận
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleUpdateStatus('CANCELLED')}
                                                    disabled={isSubmitting}
                                                    className="flex-1 py-3 bg-white border border-gray-100 text-gray-500 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                                                    {selectedEvent.createdByRole === 'ROLE_USER' ? 'Hủy yêu cầu' : 'Từ chối'}
                                                </button>
                                            </>
                                        )}
                                        
                                        {(selectedEvent.status === 'CONFIRMED') && (
                                            <button
                                                onClick={() => handleUpdateStatus('CANCELLED')}
                                                disabled={isSubmitting}
                                                className="w-full py-3 bg-white border border-rose-100 text-rose-500 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-rose-50 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                                                Hủy Lịch Hẹn
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleFormSubmit} noValidate className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="relative group">
                                            <input
                                                required
                                                value={formData.purpose}
                                                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                                placeholder="MỤC ĐÍCH HẸN"
                                                className={`w-full bg-gray-50 border ${error && !formData.purpose.trim() ? 'border-rose-400 ring-2 ring-rose-100' : 'border-transparent'} rounded-2xl px-6 py-4 text-sm font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all uppercase`}
                                            />
                                        </div>
                                        <div className="relative">
                                            <input
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                placeholder="ĐỊA ĐIỂM (TÙY CHỌN)"
                                                className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 border-t border-gray-50 pt-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Nhân viên tiếp nhận</label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={formData.staffId}
                                                onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                                                className={`w-full bg-gray-50 border ${error && !formData.staffId ? 'border-rose-400 ring-2 ring-rose-100' : 'border-none'} rounded-2xl px-6 py-4 text-sm font-black text-gray-900 outline-none focus:ring-2 focus:ring-rose-100 transition-all cursor-pointer appearance-none`}
                                            >
                                                <option value="" disabled>-- CHỌN NHÂN VIÊN --</option>
                                                {staffs.map(s => (
                                                    <option key={s.id} value={s.id}>
                                                        {s.fullName} ({s.email})
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Ngày hẹn</label>
                                        <input
                                            required
                                            type="date"
                                            min={new Date(Date.now() + 25 * 3600 * 1000 - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]}
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className={`w-full bg-gray-50 border ${error && !formData.date ? 'border-rose-400 ring-2 ring-rose-100' : 'border-none'} rounded-2xl px-6 py-4 text-sm font-black text-gray-900 outline-none focus:ring-2 focus:ring-rose-100 transition-all`}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Bắt đầu</label>
                                            <input
                                                required
                                                type="time"
                                                value={formData.startTime}
                                                onChange={(e) => {
                                                    const newStart = e.target.value;
                                                    setFormData(prev => {
                                                        const updated = { ...prev, startTime: newStart };
                                                        // Auto-set end time to start + 1h if end is empty or before start
                                                        if (newStart && (!prev.endTime || prev.endTime <= newStart)) {
                                                            const [h, m] = newStart.split(':').map(Number);
                                                            const nextH = (h + 1) % 24;
                                                            updated.endTime = `${String(nextH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                                                        }
                                                        return updated;
                                                    });
                                                }}
                                                className={`w-full bg-gray-50 border ${error && !formData.startTime ? 'border-rose-400 ring-2 ring-rose-100' : 'border-none'} rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 outline-none`}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Kết thúc</label>
                                            <input
                                                required
                                                type="time"
                                                value={formData.endTime}
                                                min={formData.startTime}
                                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                                className={`w-full bg-gray-50 border ${error && !formData.endTime ? 'border-rose-400 ring-2 ring-rose-100' : 'border-none'} rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 outline-none`}
                                            />
                                        </div>
                                    </div>

                                    <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-[#ff715e] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-[2rem] shadow-xl shadow-rose-200 hover:bg-[#f74938] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                                        {isSubmitting ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                                        {isSubmitting ? 'ĐANG XỬ LÝ...' : 'TẠO LỊCH HẸN'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
