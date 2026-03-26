'use client';

import { X, Clock, User, MapPin } from 'lucide-react';
import { AppointmentScheduleDto } from '@/services/appointmentService';

interface EventDetailModalProps {
    appt: AppointmentScheduleDto | null;
    onClose: () => void;
}

export const EventDetailModal = ({ appt, onClose }: EventDetailModalProps) => {
    if (!appt) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-violet-500" />
                        <span className="text-[11px] font-semibold uppercase text-gray-400 tracking-widest">
                            Chi tiết cuộc hẹn
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                        {appt.purpose || 'Cuộc hẹn hỗ trợ'}
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-2xl bg-violet-50">
                                <Clock className="h-4 w-4 text-violet-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
                                    Thời gian
                                </p>
                                <p className="text-sm font-semibold text-gray-700">
                                    {new Date(appt.startTime).toLocaleTimeString('vi-VN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}{' '}
                                    —{' '}
                                    {new Date(appt.startTime).toLocaleDateString('vi-VN', {
                                        weekday: 'long',
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-2xl bg-cyan-50">
                                <User className="h-4 w-4 text-cyan-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
                                    Nhân viên hỗ trợ
                                </p>
                                <p className="text-sm font-semibold text-gray-700">
                                    {appt.staffName || 'Nhân viên quản trị'}
                                </p>
                            </div>
                        </div>

                        {appt.location && (
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-2xl bg-amber-50">
                                    <MapPin className="h-4 w-4 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
                                        Địa điểm
                                    </p>
                                    <p className="text-sm font-semibold text-gray-700 line-clamp-2">
                                        {appt.location}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-violet-100 active:scale-[0.98]"
                    >
                        Đã hiểu, cảm ơn!
                    </button>
                </div>
            </div>
        </div>
    );
};
