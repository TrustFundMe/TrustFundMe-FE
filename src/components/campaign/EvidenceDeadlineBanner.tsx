'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface Props {
  dueAt: string;
}

export default function EvidenceDeadlineBanner({ dueAt }: Props) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const deadline = new Date(dueAt);
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Đã quá hạn');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days} ngày ${hours} giờ ${minutes} phút`);
      } else if (hours > 0) {
        setTimeLeft(`${hours} giờ ${minutes} phút ${seconds} giây`);
      } else {
        setTimeLeft(`${minutes} phút ${seconds} giây`);
      }
    };

    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [dueAt]);

  const deadline = new Date(dueAt);
  const now = new Date();
  const isOverdue = deadline.getTime() - now.getTime() <= 0;
  const isUrgent = deadline.getTime() - now.getTime() <= 24 * 60 * 60 * 1000; // within 24h

  return (
    <div className={`rounded-[1.5rem] border-2 px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
      isOverdue
        ? 'bg-rose-50 border-rose-300 animate-pulse'
        : isUrgent
        ? 'bg-red-50 border-red-300 animate-pulse'
        : 'bg-amber-50 border-amber-200'
    }`}>
      <div className={`flex items-center gap-3 ${isOverdue ? 'text-rose-600' : 'text-red-600'}`}>
        <div className="w-14 h-14 rounded-2xl bg-white/80 flex items-center justify-center shadow-sm">
          {isOverdue ? (
            <AlertTriangle className="w-7 h-7" />
          ) : (
            <Clock className="w-7 h-7" />
          )}
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-[2px] opacity-70 mb-0.5">
            {isOverdue ? 'Đã quá hạn nộp' : 'Thời gian còn lại'}
          </p>
          <p className="text-2xl font-black leading-none">{timeLeft}</p>
        </div>
      </div>
      <div className="sm:ml-auto text-right">
        <p className="text-[9px] font-black uppercase tracking-widest text-black/30 mb-0.5">Hạn nộp</p>
        <p className="text-sm font-black text-black/60">
          {deadline.toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}
          {' lúc '}
          {deadline.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
