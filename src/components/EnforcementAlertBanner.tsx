'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextProxy';
import { expenditureService } from '@/services/expenditureService';
import { AlertCircle, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export function EnforcementAlertBanner() {
  const { isAuthenticated, user } = useAuth();
  const [pendingEvidences, setPendingEvidences] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadPendingEvidence();
    }
  }, [isAuthenticated, user?.id]);

  const loadPendingEvidence = async () => {
    try {
      setLoading(true);
      const data = await expenditureService.getPendingEvidenceByUser(user.id);
      setPendingEvidences(data);
    } catch (error) {
      console.error('Failed to load pending evidence:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || pendingEvidences.length === 0) {
    return null;
  }

  // Lấy ra minh chứng có hạn gần nhất
  const urgentEvidence = [...pendingEvidences].sort((a, b) => 
    new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
  )[0];

  const dueAtDate = new Date(urgentEvidence.dueAt);
  const isOverdue = dueAtDate < new Date();

  return (
    <div className={`${isOverdue ? 'bg-red-600' : 'bg-amber-500'} text-white shadow-lg`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/20 rounded-full">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-lg leading-tight">
                {isOverdue ? 'CẢNH BÁO: QUỸ CÓ NGUY CƠ BỊ KHÓA!' : 'YÊU CẦU NỘP MINH CHỨNG CHI TIÊU'}
              </p>
              <p className="text-sm opacity-90">
                Bạn có <strong>{pendingEvidences.length}</strong> giao dịch chi tiêu chưa nộp minh chứng. 
                Giao dịch gần nhất {isOverdue ? 'đã quá hạn' : 'sẽ hết hạn'} trong 
                <span className="flex items-center gap-1 inline-flex ml-1 bg-white/20 px-2 py-0.5 rounded font-mono">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(dueAtDate, { addSuffix: true, locale: vi })}
                </span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link 
              href={`/account/campaigns/transactions`}
              className="flex items-center justify-center gap-2 bg-white text-gray-900 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition-all w-full md:w-auto"
            >
              Nộp minh chứng ngay
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
