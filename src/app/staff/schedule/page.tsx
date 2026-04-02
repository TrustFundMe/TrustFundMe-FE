'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, Plus, X, Clock, MapPin, User, CheckCircle, XCircle, RefreshCw, ChevronRight, Search, Filter, LayoutList, ChevronLeft, Grid3X3, ChevronDown, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { appointmentService, AppointmentScheduleDto, AppointmentStatus, CreateAppointmentRequest } from '@/services/appointmentService';
import { campaignService } from '@/services/campaignService';
import { userService, UserInfo } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContextProxy';
import type { CampaignDto } from '@/types/campaign';

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

interface CreateModalProps { staffId: number; onClose: () => void; onCreated: () => void; }

function CreateAppointmentModal({ staffId, onClose, onCreated }: CreateModalProps) {
    const [form, setForm] = useState<CreateAppointmentRequest>({ donorId: 0, staffId, startTime: '', endTime: '', location: '', purpose: '' });
    const [loading, setLoading] = useState(false);
    const [campaigns, setCampaigns] = useState<CampaignDto[]>([]);
    const [users, setUsers] = useState<Map<number, UserInfo>>(new Map());
    const [loadingCampaigns, setLoadingCampaigns] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoadingCampaigns(true);
            try {
                // Fetch campaigns
                const campaignResp = await campaignService.getAll(0, 1000);
                const approvedCampaigns = (campaignResp.content || []).filter((c: CampaignDto) => c.status === 'APPROVED');
                setCampaigns(approvedCampaigns);

                // Fetch users for approved campaigns
                const userIds = [...new Set(approvedCampaigns.map(c => c.fundOwnerId))];
                const userMap = new Map<number, UserInfo>();

                // Fetch all users and filter
                const allUsersResult = await userService.getAllUsers(0, 1000);
                if (allUsersResult.success && allUsersResult.data && allUsersResult.data.content) {
                    allUsersResult.data.content.forEach(user => {
                        if (userIds.includes(user.id)) {
                            userMap.set(user.id, user);
                        }
                    });
                }
                setUsers(userMap);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoadingCampaigns(false);
            }
        };
        fetchData();
    }, []);

    const filteredCampaigns = useMemo(() => {
        if (!searchTerm) return campaigns;
        const term = searchTerm.toLowerCase();
        return campaigns.filter(c => {
            const user = users.get(c.fundOwnerId);
            return (
                c.title.toLowerCase().includes(term) ||
                String(c.fundOwnerId).includes(term) ||
                user?.fullName?.toLowerCase().includes(term)
            );
        });
    }, [campaigns, searchTerm, users]);

    const selectedCampaign = campaigns.find(c => c.fundOwnerId === form.donorId);

    const handleSelectDonor = (fundOwnerId: number, campaignTitle: string) => {
        setForm(f => ({ ...f, donorId: fundOwnerId }));
        setShowDropdown(false);
        setSearchTerm('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Convert Date objects to ISO strings for API
        const startTimeISO = (form.startTime as any) instanceof Date ? (form.startTime as any).toISOString() : form.startTime;
        const endTimeISO = (form.endTime as any) instanceof Date ? (form.endTime as any).toISOString() : form.endTime;

        if (!form.donorId || !startTimeISO || !endTimeISO) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        if (new Date(endTimeISO) <= new Date(startTimeISO)) {
            toast.error('Thời gian kết thúc phải sau thời gian bắt đầu');
            return;
        }

        const hoursUntilStart = (new Date(startTimeISO).getTime() - Date.now()) / 3600000;
        if (hoursUntilStart < 24) {
            toast.error(`Lịch hẹn phải được đặt trước tối thiểu 24 tiếng. Hiện tại chỉ còn ${Math.floor(hoursUntilStart)} tiếng đến giờ hẹn.`);
            return;
        }

        setLoading(true);
        try {
            await appointmentService.create({
                ...form,
                startTime: startTimeISO,
                endTime: endTimeISO
            });
            toast.success('Tạo lịch hẹn thành công!');
            onCreated(); onClose();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Không thể tạo lịch hẹn');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg mx-4 overflow-hidden border border-white/20">
                <div className="bg-gradient-to-br from-[#446b5f] to-[#2d4a42] px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10"><Calendar className="h-5 w-5 text-white" /></div>
                        <div><h2 className="text-white font-black text-sm uppercase tracking-widest">Tạo lịch hẹn mới</h2><p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Đặt lịch gặp với người dùng</p></div>
                    </div>
                    <button onClick={onClose} className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition text-white border border-white/10"><X className="h-4 w-4" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
                    <div className="relative">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Người dùng <span className="text-[#db5945]">*</span></label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-100 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-[#db5945]/5 focus:border-[#db5945]/30 transition bg-white text-left flex items-center justify-between shadow-sm"
                            >
                                {selectedCampaign ? (
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-black text-gray-900 truncate uppercase tracking-tight">{users.get(form.donorId)?.fullName || `User #${form.donorId}`}</span>
                                        <span className="text-[10px] text-gray-400 font-bold truncate italic">{selectedCampaign.title}</span>
                                    </div>
                                ) : (
                                    <span className="text-gray-400">Chọn người dùng (có chiến dịch)</span>
                                )}
                                <ChevronDown className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
                            </button>
                            {showDropdown && (
                                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-64 overflow-hidden border-t-4 border-t-[#446b5f]">
                                    <div className="p-3 border-b border-gray-50 bg-gray-50/30">
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            placeholder="Tìm kiếm chiến dịch..."
                                            className="w-full px-4 py-2 text-xs border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#446b5f]/5 focus:border-[#446b5f]/30 font-bold shadow-sm"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="overflow-y-auto max-h-48 custom-scrollbar">
                                        {loadingCampaigns ? (
                                            <div className="p-6 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest italic animate-pulse whitespace-nowrap">Đang tải dữ liệu...</div>
                                        ) : filteredCampaigns.length === 0 ? (
                                            <div className="p-6 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest italic">Không thấy kết quả</div>
                                        ) : (
                                            filteredCampaigns.map(campaign => {
                                                const user = users.get(campaign.fundOwnerId);
                                                return (
                                                    <button
                                                        key={campaign.id}
                                                        type="button"
                                                        onClick={() => handleSelectDonor(campaign.fundOwnerId, campaign.title)}
                                                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition border-b border-gray-50 last:border-0 ${form.donorId === campaign.fundOwnerId ? 'bg-orange-50/50' : ''}`}
                                                    >
                                                        <div className="font-black text-[11px] text-gray-900 truncate uppercase tracking-tight">{campaign.title}</div>
                                                        <div className="text-[10px] text-gray-400 mt-0.5 font-bold">{user?.fullName || `User #${campaign.fundOwnerId}`}</div>
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <input type="hidden" value={form.donorId} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Bắt đầu <span className="text-[#db5945]">*</span></label>
                            <DatePicker
                                selected={form.startTime ? new Date(form.startTime) : null}
                                onChange={(date: Date | null) => setForm(f => ({ ...f, startTime: date ? date.toISOString() : '' }))}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="dd/MM/yyyy HH:mm"
                                placeholderText="Ngày & giờ bắt đầu"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-100 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-[#db5945]/5 focus:border-[#db5945]/30 transition bg-white shadow-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Kết thúc <span className="text-[#db5945]">*</span></label>
                            <DatePicker
                                selected={form.endTime ? new Date(form.endTime) : null}
                                onChange={(date: Date | null) => setForm(f => ({ ...f, endTime: date ? date.toISOString() : '' }))}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="dd/MM/yyyy HH:mm"
                                placeholderText="Ngày & giờ kết thúc"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-100 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-[#db5945]/5 focus:border-[#db5945]/30 transition bg-white shadow-sm"
                                minDate={form.startTime ? new Date(form.startTime) : undefined}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Địa điểm</label>
                        <input type="text" value={form.location || ''} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Nhập địa điểm gặp mặt..." className="w-full px-4 py-2.5 rounded-xl border border-gray-100 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-[#db5945]/5 focus:border-[#db5945]/30 transition bg-white shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Mục đích</label>
                        <textarea value={form.purpose || ''} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} placeholder="Mô tả nội dung cuộc hẹn..." rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-[#db5945]/5 focus:border-[#db5945]/30 transition bg-white shadow-sm resize-none" />
                    </div>
                    <div className="flex gap-4 pt-4 border-t border-gray-50">
                        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition active:scale-95 shadow-sm">Hủy bỏ</button>
                        <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#446b5f] to-[#5a8075] text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-[#446b5f]/20 active:scale-95">
                            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            {loading ? 'Đang xử lý...' : 'Tạo lịch hẹn'}
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
        <div className="rounded-[24px] border border-gray-100 bg-white shadow-sm overflow-hidden h-full flex flex-col transition-all duration-300">
            {/* Header - Compact */}
            <div className="px-5 py-4 border-b border-gray-100 bg-white">
                <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em]">Lịch hẹn #{appointment.id}</p>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-[0.05em] border ${cfg.bg} ${cfg.color} ${cfg.color.replace('text-', 'border-').replace('700', '200')}`}>
                         {cfg.label}
                    </span>
                </div>
                <h3 className="text-gray-900 font-black text-sm uppercase tracking-tight line-clamp-2 leading-snug">{appointment.purpose || 'Không có mô tả'}</h3>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4 custom-scrollbar">
                {/* Simplified Time Display */}
                <div className="flex items-center gap-2 pb-3 border-b border-gray-50">
                    <div className="flex-1">
                        <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-1">Thời gian gặp</p>
                        <div className="flex items-center gap-2">
                             <span className="text-lg font-black text-gray-800 tracking-tighter leading-none">{start.time}</span>
                             <span className="text-gray-300 font-light">—</span>
                             <span className="text-lg font-black text-gray-800 tracking-tighter leading-none">{end.time}</span>
                        </div>
                        <p className="text-[10px] font-bold text-red-500/80 italic mt-1">{start.date}</p>
                    </div>
                    <div className="text-right">
                         <div className="text-[10px] font-black text-[#db5945] uppercase tracking-wider">{duration}</div>
                    </div>
                </div>

                {/* Simplified Info List - NO BOXES */}
                <div className="space-y-3 px-1 pt-1">
                    {[
                        { label: 'Người tham gia', value: appointment.donorName || `User #${appointment.donorId}` },
                        { label: 'Staff phụ trách', value: appointment.staffName || `Staff #${appointment.staffId}` },
                        { label: 'Địa điểm gặp', value: appointment.location || 'Chưa xác định' },
                    ].map((item, id) => (
                        <div key={id} className="min-w-0">
                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">{item.label}</p>
                            <p className="text-[11px] font-black text-gray-800 tracking-tight uppercase leading-relaxed">{item.value}</p>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                {nextStatuses.length > 0 && (
                    <div className="pt-3 border-t border-gray-50 space-y-2">
                        {appointment.status === 'PENDING' && confirmDeadlinePassed && (
                            <div className="p-2 rounded-lg bg-red-50/50 border border-red-100 text-[8px] text-red-700 font-bold uppercase tracking-tight italic text-center">
                                Quá hạn xác nhận (phải confirm trước 24h)
                            </div>
                        )}

                        {appointment.status === 'CONFIRMED' && !appointmentEnded && (
                            <div className="p-2 rounded-lg bg-amber-50/50 border border-amber-100 text-[8px] text-amber-700 font-bold uppercase tracking-tight italic text-center">
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
                                        className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                                            isDisabled 
                                            ? 'bg-gray-50 text-gray-300 cursor-not-allowed' 
                                            : isAction 
                                              ? 'bg-[#446b5f] text-white hover:bg-[#36564c] shadow-sm shadow-[#446b5f]/10' 
                                              : 'text-gray-500 bg-gray-100 border border-gray-200 hover:bg-gray-200'
                                        } disabled:opacity-60`}
                                    >
                                        {updating === s ? <Loader2 className="h-3 w-3 animate-spin" /> : s === 'CONFIRMED' ? 'Duyệt lịch' : s === 'CANCELLED' ? 'Hủy lịch' : 'Hoàn thành'}
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
}

function ListView({ appointments, isLoading, onStatusChange, onOpenCreate, onRefresh, isRefreshing }: ListViewProps) {
    const [selectedId, setSelectedId] = useState<number | null>(null);
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
                            className={`inline-flex h-8 items-center rounded-full border px-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                                statusFilter === s 
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
                                                         <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${isSelected ? 'text-[#db5945] translate-x-1' : 'text-gray-300'}`} />
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
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<AppointmentScheduleDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('list');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [calendarSelected, setCalendarSelected] = useState<AppointmentScheduleDto | null>(null);

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
                            ? 'bg-white text-[#db5945] rounded-t-2xl shadow-[0_-8px_20px_-8px_rgba(0,0,0,0.1)] z-20 h-11 border-t-2 border-[#db5945]'
                            : 'bg-gray-100/50 text-gray-400 rounded-t-xl hover:bg-gray-200/50 z-10 h-9 mb-0.5'}`}>
                        {tab.icon}
                        <span className="whitespace-nowrap">{tab.label}</span>
                        {tab.id === 'list' && (
                             <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border transition-all ${
                                 activeTab === 'list' 
                                 ? 'bg-[#db5945]/10 text-[#db5945] border-[#db5945]/20' 
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
                        />
                    )}

                    {activeTab === 'calendar' && (
                        <div className="flex-1 min-h-0 flex gap-4 overflow-hidden">
                            {/* Calendar takes remaining space */}
                            <div className={`transition-all duration-500 overflow-hidden flex flex-col ${calendarSelected ? 'flex-[2]' : 'flex-1'}`}>
                                <CalendarView
                                    appointments={displayedAppointments}
                                    onSelect={appt => setCalendarSelected(appt)}
                                    selectedId={calendarSelected?.id ?? null}
                                />
                            </div>
                            {/* Detail panel — fixed width, always visible */}
                            {calendarSelected && (
                                <div className="w-[340px] flex-shrink-0 overflow-auto animate-in slide-in-from-right duration-300">
                                     <div className="flex items-center justify-between px-1 mb-2">
                                         <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chi tiết lịch hẹn</h3>
                                         <button onClick={() => setCalendarSelected(null)} className="h-6 w-6 rounded-lg hover:bg-gray-100 flex items-center justify-center transition">
                                             <X className="h-3.5 w-3.5 text-gray-400" />
                                         </button>
                                     </div>
                                    <AppointmentDetailPanel appointment={calendarSelected} onStatusChange={handleStatusChange} />
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
