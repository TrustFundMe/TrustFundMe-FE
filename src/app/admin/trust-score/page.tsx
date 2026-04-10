'use client';

import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { trustScoreService } from '@/services/trustScoreService';
import { TrustScoreConfigTable } from '@/components/admin/trust-score/TrustScoreConfigTable';

export default function TrustScorePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['trust-score-configs'],
    queryFn: () => trustScoreService.getConfigs(),
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Star className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Cấu hình Điểm Uy Tín</h1>
            <p className="text-sm text-slate-500">
              Quản lý số điểm cho từng quy tắc. Mọi thay đổi sẽ áp dụng cho các sự kiện tiếp theo.
            </p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
        <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Star className="h-4 w-4 text-blue-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-blue-800">Điểm Uy Tín là gì?</p>
          <p className="text-sm text-blue-600 mt-0.5">
            Điểm uy tín được cộng cho chủ quỹ khi họ hoạt động tích cực: campaign được duyệt, nộp đúng hạn,
            đăng bài hàng ngày. Admin có thể chỉnh số điểm hoặc bật/tắt từng quy tắc.
          </p>
        </div>
      </div>

      {/* Config Table */}
      <div className="rounded-[32px] border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-hidden">
          <TrustScoreConfigTable data={data ?? []} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
