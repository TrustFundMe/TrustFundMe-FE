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

  return (
    <div className="h-full bg-[#f8fafe] overflow-y-auto">
      <div className="max-w-3xl mx-auto py-10 px-6">
        {/* Header */}
        <div
          className="relative rounded-2xl px-7 pt-6 pb-14 mb-6"
          style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)' }}
        >
          <h1 className="text-xl font-bold text-white">To Cao Cua Toi</h1>
          <p className="text-sm text-white/70 mt-0.5">Danh sach to cao ban da gui</p>
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1200 50" preserveAspectRatio="none" style={{ display: 'block', height: '36px' }}>
            <path d="M0,30 C150,50 350,8 600,26 C850,44 1050,4 1200,28 L1200,50 L0,50 Z" fill="#f8fafe" />
          </svg>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['CAMPAIGN', 'POST'] as FlagTab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all"
              style={tab === t
                ? { background: 'linear-gradient(135deg,#ef4444,#f97316)', color: '#fff' }
                : { background: '#f3f4f6', color: '#6b7280' }}
            >
              <Flag className="h-3.5 w-3.5" />
              {t === 'CAMPAIGN' ? 'Chien dich' : 'Bai viet Feed'}
              <span
                className="px-1.5 py-0.5 rounded-full font-bold text-[10px]"
                style={tab === t ? { background: 'rgba(255,255,255,0.25)', color: '#fff' } : { background: '#e5e7eb', color: '#374151' }}
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
              <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-red-50">
                <Flag className="h-7 w-7 text-red-300" />
              </div>
              <p className="font-semibold text-gray-500 text-sm">
                {tab === 'CAMPAIGN' ? 'Chua co to cao chien dich nao' : 'Chua co to cao bai viet nao'}
              </p>
            </div>
          )}

          {!loading && list.map(flag => {
            const href = flag.campaignId
              ? `/campaigns-details?id=${flag.campaignId}`
              : `/post/${flag.postId}`;
            const label = flag.campaignId ? 'chien dich' : 'bai viet';
            return (
              <div key={flag.id} className="rounded-xl border border-gray-100 bg-white p-4 flex items-center justify-between gap-4 shadow-sm">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    <span className="text-xs font-semibold text-green-600">To cao da duoc gui</span>
                    <span className="text-xs text-gray-300">&middot;</span>
                    <span className="text-xs text-gray-400">{new Date(flag.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <p className="text-sm text-gray-700 truncate" title={flag.reason}>{flag.reason}</p>
                </div>
                <Link
                  href={href}
                  className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)' }}
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
