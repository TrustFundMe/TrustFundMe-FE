import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Copy,
  Loader2,
  Clock
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

const TIMEOUT_SECONDS = 600; // 10 minutes

interface VietQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrUrl: string;
  donationId: number | null;
  orderCode?: string | null;
  amount: number;
  onConfirm: () => void;
  onTimeout?: () => void;
}

export default function VietQRModal({
  isOpen,
  onClose,
  qrUrl,
  donationId,
  orderCode,
  amount,
  onConfirm,
  onTimeout,
}: VietQRModalProps) {
  const { toast } = useToast();
  const [copying, setCopying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TIMEOUT_SECONDS);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  useEffect(() => {
    if (isOpen) {
      setSecondsLeft(TIMEOUT_SECONDS);
      timerRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            onTimeoutRef.current?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const isUrgent = secondsLeft <= 60;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopying(true);
    toast("Đã sao chép nội dung!", "success");
    setTimeout(() => setCopying(false), 2000);
  };

  const transferContent = `TF ${orderCode || donationId}`;

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[400px]"
        >
          {/* Left Side: Info & Steps (Blue/Dark Gradient) */}
          <div className="bg-[#0F172A] text-white p-6 md:p-10 md:w-[40%] flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-6 md:mb-10">
              <div className="w-8 h-8 bg-brand/20 rounded-lg flex items-center justify-center text-brand">
                <ShieldCheck className="w-5 h-5 text-[#ff5e14]" />
              </div>
              <span className="font-bold text-sm tracking-tight">Thanh toán bảo mật</span>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-gray-400 text-[10px] uppercase font-black tracking-[0.2em] mb-1">Mã quyên góp</p>
                <div className="flex items-center justify-between group cursor-pointer" onClick={() => handleCopy(transferContent)}>
                  <p className="font-mono text-xl font-bold">{transferContent}</p>
                  <Copy className="w-4 h-4 text-gray-500 group-hover:text-brand transition-colors" />
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-[10px] uppercase font-black tracking-[0.2em] mb-1">Số tiền</p>
                <p className="text-2xl font-black text-brand">{amount.toLocaleString('vi-VN')} ₫</p>
              </div>

              <div className="pt-2 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold flex-shrink-0">1</div>
                  <p className="text-[11px] text-gray-300 leading-tight">Mở ứng dụng ngân hàng và chọn "Quét QR"</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold flex-shrink-0">2</div>
                  <p className="text-[11px] text-gray-300 leading-tight">Quét ảnh mã QR bên cạnh để thanh toán</p>
                </div>
                <div className="flex items-start gap-3 text-brand">
                  <div className="mt-1 w-5 h-5 rounded-full bg-brand/20 flex items-center justify-center text-[10px] font-bold flex-shrink-0">3</div>
                  <p className="text-[11px] font-bold leading-tight">Hệ thống tự động xác nhận ngay sau đó</p>
                </div>
              </div>
            </div>

            <div className={`mt-8 flex items-center gap-3 py-3 px-4 rounded-2xl border ${isUrgent ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10'}`}>
              <div className="relative">
                {secondsLeft > 0 ? (
                  <>
                    <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-400' : 'text-brand'}`} />
                    {isUrgent && <div className="absolute inset-0 bg-red-400/30 blur-sm animate-pulse" />}
                  </>
                ) : (
                  <X className="w-4 h-4 text-red-400" />
                )}
              </div>
              <div className="flex flex-col">
                <span className={`font-mono text-sm font-bold ${isUrgent ? 'text-red-400' : 'text-white'}`}>
                  {secondsLeft > 0 ? timeDisplay : 'Hết thời gian'}
                </span>
                <span className={`text-[10px] font-medium ${isUrgent ? 'text-red-300' : 'text-gray-400'}`}>
                  {secondsLeft > 0 ? 'Thời gian còn lại để thanh toán' : 'Giao dịch đã bị huỷ'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Side: QR Code Area */}
          <div className="bg-white p-6 md:p-10 md:w-[60%] flex flex-col items-center justify-center relative">
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <div className="text-center mb-4 md:mb-8">
              <h3 className="text-xl font-black text-gray-900 mb-1">Quét mã VietQR</h3>
              <p className="text-xs text-gray-400">Nội dung và số tiền đã được tự động điền</p>
            </div>

            <div className="relative group mb-6 md:mb-10">
              {/* Decorative corners */}
              <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-brand rounded-tl-lg" />
              <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-brand rounded-tr-lg" />
              <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-brand rounded-bl-lg" />
              <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-brand rounded-br-lg" />

              <div className="p-3 bg-white shadow-xl rounded-2xl border border-gray-100">
                <img 
                  src={qrUrl} 
                  alt="VietQR Code" 
                  className="w-44 h-44 md:w-64 md:h-64 object-contain"
                />
              </div>
            </div>

            <div className="w-full max-w-sm flex flex-col gap-3">
              <div className="flex items-center justify-center gap-6 mt-1">
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 font-bold text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-3 h-3" />
                  Quay lại
                </button>
                <div className="flex items-center gap-2 text-[9px] text-gray-300 font-medium">
                  <Smartphone className="w-3 h-3" />
                  <span>Dùng app ngân hàng</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
