'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, ScrollText } from 'lucide-react';
import { trustScoreService } from '@/services/trustScoreService';
import { TrustScoreConfigTable } from '@/components/admin/trust-score/TrustScoreConfigTable';
import { TrustScoreLogTable } from '@/components/admin/trust-score/logs/TrustScoreLogTable';

export default function TrustScorePage() {
  const [activeTab, setActiveTab] = useState<'config' | 'logs'>('config');

  const { data: configs, isLoading: configsLoading } = useQuery({
    queryKey: ['trust-score-configs'],
    queryFn: () => trustScoreService.getConfigs(),
  });

  const tabs = [
    {
      key: 'config' as const,
      label: 'Cấu hình điểm',
      icon: Star,
      count: configs?.length,
    },
    {
      key: 'logs' as const,
      label: 'Nhật ký điểm',
      icon: ScrollText,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Star className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Điểm Uy Tín</h1>
            <p className="text-sm text-slate-500">
              Quản lý cấu hình điểm và xem nhật ký thay đổi điểm uy tín.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'config' && (
        <>
          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Star className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Điểm Uy Tín là gì?</p>
              <p className="text-sm text-blue-600 mt-0.5">
                Điểm uy tín được cộng cho chủ quỹ khi hoạt động tích cực: campaign được duyệt, nộp đúng hạn,
                đăng bài hàng ngày. Admin có thể chỉnh số điểm hoặc bật/tắt từng quy tắc.
              </p>
            </div>
          </div>

          {/* Config Table */}
          <div className="rounded-[32px] border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 overflow-hidden">
            <TrustScoreConfigTable data={configs ?? []} isLoading={configsLoading} />
          </div>
        </>
      )}

      {activeTab === 'logs' && (
        <div className="rounded-[32px] border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 overflow-hidden">
          <TrustScoreLogTable />
        </div>
      )}
    </div>
  );
}
