'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(7);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.9 }}
                            className={`pointer-events-auto flex items-center gap-3 p-4 rounded-2xl shadow-2xl border-2 min-w-[300px] max-w-[450px] ${t.type === 'error'
                                    ? 'bg-white border-red-500 text-red-600'
                                    : t.type === 'success'
                                        ? 'bg-white border-green-500 text-green-600'
                                        : 'bg-white border-blue-500 text-blue-600'
                                }`}
                        >
                            <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${t.type === 'error' ? 'bg-red-50' : t.type === 'success' ? 'bg-green-50' : 'bg-blue-50'
                                }`}>
                                {t.type === 'error' ? <AlertCircle className="h-5 w-5" /> : t.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <Info className="h-5 w-5" />}
                            </div>
                            <div className="flex-1 text-sm font-bold leading-tight">
                                {t.message}
                            </div>
                            <button
                                onClick={() => removeToast(t.id)}
                                className="shrink-0 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <X className="h-4 w-4 text-gray-400" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
