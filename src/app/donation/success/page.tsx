'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SuccessRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const donationId = searchParams.get('donationId');
    const query = donationId ? `?donationId=${encodeURIComponent(donationId)}` : '';
    router.replace(`/thankyou-new${query}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-[100dvh] bg-[#fff8f3] flex items-center justify-center text-[#ff5e14] font-bold">
      Đang chuyển sang trang xác nhận mới...
    </div>
  );
}

export default function DonationSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] bg-[#fff8f3] flex items-center justify-center text-[#ff5e14] font-bold">
          Đang xử lý thông tin thành công...
        </div>
      }
    >
      <SuccessRedirectContent />
    </Suspense>
  );
}
