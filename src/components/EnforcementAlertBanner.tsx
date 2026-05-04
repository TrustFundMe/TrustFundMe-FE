'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextProxy';
import { expenditureService } from '@/services/expenditureService';
import { campaignService } from '@/services/campaignService';
import { AlertCircle, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface CampaignEvidenceSummary {
  campaignId: number;
  campaignTitle: string;
  pendingCount: number;
  urgentDueAt: Date;
  isOverdue: boolean;
}

export function EnforcementAlertBanner() {
  const { isAuthenticated, user } = useAuth();
  const [summaries, setSummaries] = useState<CampaignEvidenceSummary[]>([]);
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
      if (!data || data.length === 0) {
        setSummaries([]);
        return;
      }

      const grouped = new Map<number, { items: any[]; campaignId: number }>();
      for (const ev of data) {
        const cid = ev.campaignId;
        if (!cid) continue;
        if (!grouped.has(cid)) grouped.set(cid, { items: [], campaignId: cid });
        grouped.get(cid)!.items.push(ev);
      }

      const results: CampaignEvidenceSummary[] = [];
      for (const [campaignId, { items }] of grouped) {
        let title = `Chiến dịch #${campaignId}`;
        try {
          const camp = await campaignService.getById(campaignId);
          if (camp?.title) title = camp.title;
        } catch {}

        const sorted = items.sort((a: any, b: any) =>
          new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
        );
        const urgentDueAt = new Date(sorted[0].dueAt);

        results.push({
          campaignId,
          campaignTitle: title,
          pendingCount: items.length,
          urgentDueAt,
          isOverdue: urgentDueAt < new Date(),
        });
      }

      results.sort((a, b) => a.urgentDueAt.getTime() - b.urgentDueAt.getTime());
      setSummaries(results);
    } catch (error) {
      console.error('Failed to load pending evidence:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || summaries.length === 0) {
    return null;
  }

  const totalPending = summaries.reduce((sum, s) => sum + s.pendingCount, 0);
  const hasOverdue = summaries.some(s => s.isOverdue);

  return (
    <div className={`${hasOverdue ? 'bg-red-600' : 'bg-amber-500'} text-white shadow-lg`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col gap-3">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-lg leading-tight">
                  {hasOverdue ? 'CẢNH BÁO: QUỸ CÓ NGUY CƠ BỊ KHÓA!' : 'YÊU CẦU NỘP MINH CHỨNG CHI TIÊU'}
                </p>
                <p className="text-sm opacity-90">
                  Bạn có <strong>{totalPending}</strong> giao dịch chi tiêu chưa nộp minh chứng
                  {summaries.length > 1 ? ` thuộc ${summaries.length} chiến dịch` : ''}.
                </p>
              </div>
            </div>

            <Link
              href="/account/campaigns"
              className="flex items-center justify-center gap-2 bg-white text-gray-900 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition-all shrink-0"
            >
              Chiến dịch của tôi
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Campaign list */}
          <div className="flex flex-wrap gap-2">
            {summaries.map((s) => (
              <Link
                key={s.campaignId}
                href={`/account/campaigns`}
                className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold transition-all ${
                  s.isOverdue
                    ? 'bg-white/25 hover:bg-white/35'
                    : 'bg-white/15 hover:bg-white/25'
                }`}
              >
                <span className="truncate max-w-[200px]">{s.campaignTitle}</span>
                <span className={`inline-flex items-center justify-center min-w-[22px] h-[22px] rounded-full text-xs font-black ${
                  s.isOverdue ? 'bg-white text-red-600' : 'bg-white/30 text-white'
                }`}>
                  {s.pendingCount}
                </span>
                <span className="flex items-center gap-1 text-xs opacity-80">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(s.urgentDueAt, { addSuffix: true, locale: vi })}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
