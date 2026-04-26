'use client';

import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface StaffConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
}

export default function StaffConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  isDanger = true
}: StaffConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className={`p-2 rounded-xl ${isDanger ? 'bg-rose-50 text-rose-500' : 'bg-[#ff5e14]/10 text-[#ff5e14]'}`}>
              <AlertCircle className="h-5 w-5" />
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight mb-2">{title}</h3>
          <p className="text-sm text-gray-500 font-medium leading-relaxed">{message}</p>
        </div>

        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-gray-200 bg-white text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-all active:scale-[0.98]"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 h-11 rounded-xl text-white text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg ${
              isDanger ? 'bg-rose-500 shadow-rose-500/20 hover:bg-rose-600' : 'bg-[#ff5e14] shadow-[#ff5e14]/20 hover:bg-[#355249]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
