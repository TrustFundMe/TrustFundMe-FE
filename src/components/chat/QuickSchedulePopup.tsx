import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickSchedulePopupProps {
    isVisible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    detectedText: string;
}

export default function QuickSchedulePopup({
    isVisible,
    onConfirm,
    onCancel,
    detectedText
}: QuickSchedulePopupProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="mx-3 mt-2 mb-1 p-3 bg-red-50 border border-red-100 rounded-2xl shadow-sm flex items-center justify-between"
                >
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: '#dc2626' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-red-900 leading-tight">Phát hiện gợi ý lịch hẹn</p>
                            <p className="text-[11px] text-red-700 font-medium truncate italic opacity-80 mt-0.5">"{detectedText}"</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                        <button
                            onClick={onCancel}
                            className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                        >
                            Bỏ qua
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-1.5 text-xs font-black text-white hover:opacity-90 rounded-xl shadow-lg shadow-red-100 transition-all active:scale-95"
                            style={{ backgroundColor: '#dc2626' }}
                        >
                            Tạo lịch ngay
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
