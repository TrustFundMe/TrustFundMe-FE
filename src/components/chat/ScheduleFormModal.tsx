import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';

interface ScheduleFormModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSubmit: (data: { purpose: string; location: string; startTime: string; endTime: string }) => void;
    isSubmitting?: boolean;
}

export default function ScheduleFormModal({
    isVisible,
    onClose,
    onSubmit,
    isSubmitting = false
}: ScheduleFormModalProps) {
    const [purpose, setPurpose] = useState('');
    const [location, setLocation] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [error, setError] = useState('');

    // Reset state when opening
    React.useEffect(() => {
        if (isVisible) {
            setPurpose('');
            setLocation('');
            setError('');

            // Default times: start tomorrow 09:00, end tomorrow 10:00
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(9, 0, 0, 0);
            const tzoffset = (new Date()).getTimezoneOffset() * 60000; // offset in milliseconds
            const localISOTime = (new Date(tomorrow.getTime() - tzoffset)).toISOString().slice(0, 16);
            setStartTime(localISOTime);

            const endTomorrow = new Date(tomorrow);
            endTomorrow.setHours(10, 0, 0, 0);
            const endLocalISOTime = (new Date(endTomorrow.getTime() - tzoffset)).toISOString().slice(0, 16);
            setEndTime(endLocalISOTime);
        }
    }, [isVisible]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!purpose.trim()) {
            setError('Vui lòng nhập mục đích cuộc hẹn.');
            return;
        }
        if (!location.trim()) {
            setError('Vui lòng nhập địa điểm.');
            return;
        }

        if (!startTime) {
            setError('Vui lòng chọn thời gian bắt đầu.');
            return;
        }
        if (!endTime) {
            setError('Vui lòng chọn thời gian kết thúc.');
            return;
        }

        const start = new Date(startTime);
        const end = new Date(endTime);
        const now = new Date();
        const minStartDate = new Date(now.getTime() + 25 * 60 * 60 * 1000);

        if (start < minStartDate) {
            setError('Lịch hẹn phải cách thời điểm hiện tại ít nhất 25 tiếng.');
            return;
        }

        if (end <= start) {
            setError('Thời gian kết thúc phải sau thời gian bắt đầu.');
            return;
        }

        const durationInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
        if (durationInMinutes < 15) {
            setError('Cuộc hẹn phải kéo dài ít nhất 15 phút.');
            return;
        }

        if (durationInMinutes > 480) { // 8 hours max
            setError('Cuộc hẹn không được kéo dài quá 8 tiếng.');
            return;
        }

        onSubmit({
            purpose,
            location,
            // Convert back to UTC ISO string for backend
            startTime: start.toISOString(),
            endTime: end.toISOString()
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100" style={{ backgroundColor: '#dc2626' }}>
                            <h3 className="text-sm font-bold text-white">Tạo lịch hẹn</h3>
                            <button
                                onClick={onClose}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} noValidate className="p-4 space-y-3">
                            {error && (
                                <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle className="shrink-0 w-4 h-4 text-[#ff715e]" />
                                    <span className="text-[11px] font-black text-[#ff715e] uppercase tracking-tight">{error}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-[11px] font-semibold text-gray-600 mb-1 pointer-events-none">Mục đích</label>
                                <input
                                    type="text"
                                    required
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                    className={`w-full px-3 py-1.5 text-xs border ${error && !purpose.trim() ? 'border-rose-400 ring-2 ring-rose-100' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all`}
                                    placeholder="Vd: Thảo luận dự án..."
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-gray-600 mb-1 pointer-events-none">Địa điểm</label>
                                <input
                                    type="text"
                                    required
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className={`w-full px-3 py-1.5 text-xs border ${error && !location.trim() ? 'border-rose-400 ring-2 ring-rose-100' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all`}
                                    placeholder="Vd: Online, Quán cà phê..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-600 mb-1 pointer-events-none">Bắt đầu</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        min={new Date(Date.now() + 25 * 3600 * 1000 - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className={`w-full px-2 py-1.5 text-xs border ${error && (!startTime || new Date(startTime) < new Date(Date.now() + 25 * 3600 * 1000)) ? 'border-rose-400 ring-2 ring-rose-100' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-600 mb-1 pointer-events-none">Kết thúc</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        min={new Date(Date.now() + 25 * 3600 * 1000 - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className={`w-full px-2 py-1.5 text-xs border ${error && (!endTime || new Date(endTime) <= new Date(startTime)) ? 'border-rose-400 ring-2 ring-rose-100' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all`}
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex gap-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 text-xs font-bold text-white hover:opacity-90 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center"
                                    style={{ backgroundColor: '#dc2626' }}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Xác nhận tạo'
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
