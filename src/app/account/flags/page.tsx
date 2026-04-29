'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Flag, Loader2, ChevronRight, CheckCircle2 } from 'lucide-react';
import { flagService, FlagDto } from '@/services/flagService';

type FlagTab = 'CAMPAIGN' | 'POST';

export default function FlagsPage() {
  const [tab, setTab] = useState<FlagTab>('CAMPAIGN');
  const [flags, setFlags] = useState<FlagDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFlags = useCallback(async () => {
    setLoading(true);
    try {
      const data = await flagService.getMyFlags(0, 100);
      setFlags(data);
    } catch {
      setFlags([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFlags(); }, [fetchFlags]);

  const campaignFlags = flags.filter(f => f.campaignId != null);
  const postFlags = flags.filter(f => f.postId != null);
  const list = tab === 'CAMPAIGN' ? campaignFlags : postFlags;
  const getStatusMeta = (status: FlagDto['status']) => {
    if (status === 'RESOLVED') {
      return {
        text: 'Đã xử lý',
        color: '#059669',
        bg: 'rgba(16,185,129,0.12)',
      };
    }
    return {
      text: 'Đang chờ xử lý',
      color: '#b45309',
      bg: 'rgba(245,158,11,0.14)',
    };
  };

  return (
    <div className="h-full bg-[#f8fafe] overflow-y-auto">
      <div className="max-w-3xl mx-auto py-10 px-6">
        <div className="rounded-2xl border border-gray-100 bg-white px-7 py-6 mb-6">
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Tố cáo của tôi</h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách tố cáo bạn đã gửi và trạng thái xử lý hiện tại.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['CAMPAIGN', 'POST'] as FlagTab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all"
              style={tab === t
                ? { background: '#111827', color: '#fff' }
                : { background: '#f3f4f6', color: '#6b7280' }}
            >
              <Flag className="h-3.5 w-3.5" />
              {t === 'CAMPAIGN' ? 'Chiến dịch' : 'Bài viết Feed'}
              <span
                className="px-1.5 py-0.5 rounded-full font-bold text-[10px]"
                style={tab === t ? { background: 'rgba(255,255,255,0.22)', color: '#fff' } : { background: '#e5e7eb', color: '#374151' }}
              >
                {t === 'CAMPAIGN' ? campaignFlags.length : postFlags.length}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-3">
          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-red-400" />
            </div>
          )}

          {!loading && list.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-gray-100">
                <Flag className="h-7 w-7 text-gray-400" />
              </div>
              <p className="font-semibold text-gray-500 text-sm">
                {tab === 'CAMPAIGN' ? 'Chưa có tố cáo chiến dịch nào' : 'Chưa có tố cáo bài viết nào'}
              </p>
            </div>
          )}

          {!loading && list.map(flag => {
            const href = flag.campaignId
              ? `/campaigns-details?id=${flag.campaignId}`
              : `/post/${flag.postId}`;
            const label = flag.campaignId ? 'chiến dịch' : 'bài viết';
            const targetTitle = flag.campaignId
              ? flag.campaign?.title || `Chiến dịch #${flag.campaignId}`
              : flag.post?.title || flag.post?.content || `Bài viết #${flag.postId}`;
            const statusMeta = getStatusMeta(flag.status);
            return (
              <div key={flag.id} className="rounded-xl border border-gray-100 bg-white p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: statusMeta.color }} />
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ color: statusMeta.color, background: statusMeta.bg }}
                    >
                      {statusMeta.text}
                    </span>
                    <span className="text-xs text-gray-300">&middot;</span>
                    <span className="text-xs text-gray-400">{new Date(flag.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <p className="text-xs font-bold text-gray-900 truncate mb-1" title={targetTitle}>{targetTitle}</p>
                  <p className="text-sm text-gray-700 truncate" title={flag.reason}>{flag.reason}</p>
                </div>
                <Link
                  href={href}
                  className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all"
                  style={{ background: '#111827' }}
                >
                  Xem {label}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
