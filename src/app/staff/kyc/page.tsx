'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { RefreshCw, IdCard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import KYCTab from '@/components/staff/request/KYCTab';

export default function StaffKYCPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center bg-[#f1f5f9] min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff5e14] mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold uppercase tracking-widest">Đang tải...</p>
        </div>
      </div>
    }>
      <StaffKYCContent />
    </Suspense>
  );
}

function StaffKYCContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success('Đã làm mới dữ liệu');
  };

  return (
    <div className="flex flex-col flex-1 bg-[#f1f5f9] min-h-0">
      {/* Page Header */}
      {!isModalOpen && (
        <div className="flex items-end justify-between px-6 h-14">
          <div className="flex items-end gap-2 h-full">
            <div className="relative px-6 py-2.5 text-sm font-bold bg-white text-[#ff5e14] rounded-t-2xl shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.05)] z-20 h-11">
              <div className="flex items-center gap-2">
                <IdCard className="h-4 w-4 text-[#ff5e14]" />
                <span className="whitespace-nowrap">Xác thực danh tính</span>
              </div>
              <div className="absolute -bottom-2 left-0 right-0 h-4 bg-white z-30" />
            </div>
          </div>

          <button
            onClick={handleRefresh}
            className="mb-1 h-10 w-10 rounded-2xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-[#ff5e14] hover:border-[#ff5e14]/20 transition shadow-sm group active:scale-95"
            title="Làm mới trang"
          >
            <RefreshCw className={`h-5 w-5 transition-transform group-hover:rotate-180`} />
          </button>
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 bg-white mx-2 mb-2 rounded-[24px] shadow-lg border border-gray-100 overflow-hidden relative flex flex-col min-h-0 h-full">
        <div className="flex-1 overflow-hidden p-6 flex flex-col gap-6 bg-white min-h-0 h-full">
          <KYCTab key={refreshKey} initialUserId={userId ? Number(userId) : null} onModalToggle={setIsModalOpen} />
        </div>
      </div>
    </div>
  );
}
