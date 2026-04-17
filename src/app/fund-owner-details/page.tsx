'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProfileHeader from '@/components/fund-owner-details/ProfileHeader';
import DocumentSection from '@/components/fund-owner-details/DocumentSection';

function FundOwnerDetailsContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';

  return (
    <div className="page-wrapper">
      <div className="header-container">
        <ProfileHeader id={id} />
      </div>
      <div className="list-container">
        <DocumentSection id={id} />
      </div>

      <style jsx>{`
        .page-wrapper {
          height: 100vh;
          background-color: #fffafb;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          gap: 0;
        }
        .header-container {
          width: 100%;
          flex-shrink: 0;
        }
        .list-container {
          width: 100%;
          flex: 1;
          display: flex;
          justify-content: center;
          padding: 24px 24px 32px 24px; /* Added 32px bottom margin to detach from edge */
          overflow: hidden;
        }

        :global(body) {
          margin: 0;
          padding: 0;
          height: 100vh;
          overflow: hidden;
          background-color: #fffafb;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        :global(.text-red-600) { color: #dc2626 !important; }
        :global(.bg-red-600) { background-color: #dc2626 !important; }
        :global(.border-red-600) { border-color: #dc2626 !important; }
      `}</style>
    </div>
  );
}

export default function FundOwnerDetailsPage() {
  return (
    <Suspense fallback={<div>Đang tải trang...</div>}>
      <FundOwnerDetailsContent />
    </Suspense>
  );
}
