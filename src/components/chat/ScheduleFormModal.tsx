import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CalendarDays, Clock, CheckCircle } from 'lucide-react';

interface ScheduleFormModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSubmit: (data: { purpose: string; location: string; startTime: string; endTime: string }) => void;
    isSubmitting?: boolean;
}

// ─── helpers ────────────────────────────────────────────────────────────────

/** Trả về chuỗi "YYYY-MM-DD" theo giờ local */
function toLocalDateString(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

/** Tạo Date object từ ngày (string) + giờ + phút — hoàn toàn local time */
function buildLocalDate(dateStr: string, hour: number, minute: number): Date | null {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d, hour, minute, 0, 0);
}

/**
 * Format sang ISO local time KHÔNG có timezone suffix — giống CalendarGrid.
 * Backend nhận "2026-04-01T14:00:00" → lưu đúng 14:00 local.
 * Nếu dùng .toISOString() sẽ ra "2026-04-01T07:00:00.000Z" (UTC) → DB lưu 7:00 → SAI.
 */
function formatToLocalISO(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

// ─── component ──────────────────────────────────────────────────────────────

export default function ScheduleFormModal({
    isVisible,
    onClose,
    onSubmit,
    isSubmitting = false,
}: ScheduleFormModalProps) {
    const [purpose, setPurpose] = useState('');
    const [location, setLocation] = useState('');
    const [error, setError] = useState('');

    // Ngày + giờ + phút tách riêng → tránh mọi ambiguity timezone
    const [startDate, setStartDate] = useState('');
    const [startHour, setStartHour] = useState(9);
    const [startMinute, setStartMinute] = useState(0);

    const [endDate, setEndDate] = useState('');
    const [endHour, setEndHour] = useState(10);
    const [endMinute, setEndMinute] = useState(0);

    // Reset khi mở lại modal
    useEffect(() => {
        if (isVisible) {
            setPurpose('');
            setLocation('');
            setError('');

            // Mặc định: ngày mai 09:00 → 10:00
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = toLocalDateString(tomorrow);

            setStartDate(tomorrowStr);
            setStartHour(9);
            setStartMinute(0);
            setEndDate(tomorrowStr);
            setEndHour(10);
            setEndMinute(0);
        }
    }, [isVisible]);

    // Giá trị min cho <input type="date">: ít nhất 25 tiếng từ hiện tại
    const minDate = toLocalDateString(new Date(Date.now() + 25 * 3600 * 1000));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!purpose.trim()) { setError('Vui lòng nhập mục đích cuộc hẹn.'); return; }
        if (!location.trim()) { setError('Vui lòng nhập địa điểm.'); return; }
        if (!startDate) { setError('Vui lòng chọn ngày bắt đầu.'); return; }
        if (!endDate) { setError('Vui lòng chọn ngày kết thúc.'); return; }

        const start = buildLocalDate(startDate, startHour, startMinute)!;
        const end = buildLocalDate(endDate, endHour, endMinute)!;
        const now = new Date();
        const minStart = new Date(now.getTime() + 25 * 60 * 60 * 1000);

        if (start < minStart) {
            setError('Lịch hẹn phải cách thời điểm hiện tại ít nhất 25 tiếng.'); return;
        }
        if (end <= start) {
            setError('Thời gian kết thúc phải sau thời gian bắt đầu.'); return;
        }
        const durationMin = (end.getTime() - start.getTime()) / 60000;
        if (durationMin < 15) {
            setError('Cuộc hẹn phải kéo dài ít nhất 15 phút.'); return;
        }
        if (durationMin > 480) {
            setError('Cuộc hẹn không được kéo dài quá 8 tiếng.'); return;
        }

        const startISO = formatToLocalISO(start);
        const endISO = formatToLocalISO(end);

        // Debug log — xác nhận giá trị gửi lên backend
        console.log('[ScheduleFormModal] Gửi lịch hẹn:', {
            startInput: `${startDate} ${startHour}:${startMinute}`,
            endInput: `${endDate} ${endHour}:${endMinute}`,
            startISO,   // Phải là "YYYY-MM-DDTHH:MM:SS" LOCAL (không có Z)
            endISO,
        });

        onSubmit({
            purpose,
            location,
            startTime: startISO,
            endTime: endISO,
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4" style={{ background: 'linear-gradient(135deg, #446b5f, #2d4a42)' }}>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <CalendarDays size={16} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">Tạo lịch hẹn</h3>
                                    <p className="text-[10px] text-white/70">Điền thông tin bên dưới</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                                <X size={14} className="text-white" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} noValidate className="p-5 space-y-4">
                            {/* Error */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2"
                                    >
                                        <AlertCircle className="shrink-0 w-4 h-4 text-rose-500 mt-0.5" />
                                        <span className="text-[11px] font-semibold text-rose-600">{error}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Mục đích */}
                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Mục đích</label>
                                <input
                                    type="text"
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                    placeholder="Vd: Thảo luận dự án từ thiện..."
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#446b5f] focus:ring-2 focus:ring-[#446b5f]/10 transition-all"
                                />
                            </div>

                            {/* Địa điểm */}
                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Địa điểm</label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Vd: Online, Quán cà phê..."
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#446b5f] focus:ring-2 focus:ring-[#446b5f]/10 transition-all"
                                />
                            </div>

                            {/* Thời gian */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* Bắt đầu */}
                                <DateTimeBlock
                                    label="Bắt đầu"
                                    date={startDate}
                                    hour={startHour}
                                    minute={startMinute}
                                    minDate={minDate}
                                    onDateChange={(d) => {
                                        setStartDate(d);
                                        // If endDate is before new startDate, sync them
                                        if (d && (!endDate || endDate < d)) setEndDate(d);
                                    }}
                                    onHourChange={(h) => {
                                        setStartHour(h);
                                        // If same day and endHour <= new startHour, bump endHour
                                        if (startDate === endDate && endHour <= h) {
                                            setEndHour((h + 1) % 24);
                                        }
                                    }}
                                    onMinuteChange={(m) => {
                                        setStartMinute(m);
                                        if (startDate === endDate && startHour === endHour && endMinute <= m) {
                                            setEndMinute((m + 15) % 60);
                                            if (m + 15 >= 60) setEndHour(prev => (prev + 1) % 24);
                                        }
                                    }}
                                />
                                {/* Kết thúc */}
                                <DateTimeBlock
                                    label="Kết thúc"
                                    date={endDate}
                                    hour={endHour}
                                    minute={endMinute}
                                    minDate={startDate || minDate}
                                    onDateChange={setEndDate}
                                    onHourChange={setEndHour}
                                    onMinuteChange={setEndMinute}
                                />
                            </div>

                            {/* Preview thời gian */}
                            {startDate && endDate && (
                                <div className="bg-[#446b5f]/5 border border-[#446b5f]/10 rounded-xl px-3 py-2 flex items-center gap-2">
                                    <Clock size={13} className="text-[#446b5f] shrink-0" />
                                    <span className="text-[11px] text-[#446b5f] font-bold">
                                        {formatPreview(startDate, startHour, startMinute)} → {formatPreview(endDate, endHour, endMinute)}
                                    </span>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-[2] px-4 py-2.5 text-sm font-black text-white rounded-xl shadow-lg transition-all shadow-[#446b5f]/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                    style={{ backgroundColor: '#446b5f' }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ĐANG TẠO...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={16} /> XÁC NHẬN TẠO
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

// ─── sub-component: DateTimeBlock ────────────────────────────────────────────

function DateTimeBlock({
    label,
    date,
    hour,
    minute,
    minDate,
    onDateChange,
    onHourChange,
    onMinuteChange,
}: {
    label: string;
    date: string;
    hour: number;
    minute: number;
    minDate: string;
    onDateChange: (v: string) => void;
    onHourChange: (v: number) => void;
    onMinuteChange: (v: number) => void;
}) {
    return (
        <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">{label}</label>

            {/* Chọn ngày */}
            <div className="relative">
                <CalendarDays size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                    type="date"
                    value={date}
                    min={minDate}
                    onChange={(e) => onDateChange(e.target.value)}
                    className="w-full pl-7 pr-2 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#446b5f] focus:ring-2 focus:ring-[#446b5f]/10 transition-all cursor-pointer"
                />
            </div>

            {/* Chọn giờ & phút */}
            <div className="flex gap-1">
                <div className="flex-1 relative">
                    <Clock size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <select
                        value={hour}
                        onChange={(e) => onHourChange(Number(e.target.value))}
                        className="w-full pl-6 pr-1 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#446b5f] focus:ring-2 focus:ring-[#446b5f]/10 transition-all appearance-none cursor-pointer bg-white"
                    >
                        {HOURS.map(h => (
                            <option key={h} value={h}>{String(h).padStart(2, '0')}h</option>
                        ))}
                    </select>
                </div>
                <select
                    value={minute}
                    onChange={(e) => onMinuteChange(Number(e.target.value))}
                    className="w-14 px-1 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#446b5f] focus:ring-2 focus:ring-[#446b5f]/10 transition-all appearance-none cursor-pointer bg-white text-center"
                >
                    {MINUTES.map(m => (
                        <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}

function formatPreview(dateStr: string, hour: number, minute: number): string {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
