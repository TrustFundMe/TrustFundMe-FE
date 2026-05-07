'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ProfileHeader from '@/components/fund-owner-details/ProfileHeader';
import DocumentSection from '@/components/fund-owner-details/DocumentSection';

function FundOwnerDetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id') || '';

  return (
    <div className="page-wrapper">
      <div className="back-bar">
        <button className="back-btn" onClick={() => router.back()}>
          <ArrowLeft size={18} />
          <span>Quay lại</span>
        </button>
      </div>
      <div className="header-container">
        <ProfileHeader id={id} />
      </div>
      <div className="list-container">
        <DocumentSection id={id} />
      </div>

      <style jsx>{`
        .page-wrapper {
          height: 100vh;
          background-color: #fff;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          gap: 0;
          font-family: var(--font-dm-sans, 'DM Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
        }
        .back-bar {
          padding: 12px 32px;
          background: #fff;
          border-bottom: 1px solid rgba(15,23,42,0.10);
          flex-shrink: 0;
        }
        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: 1.5px solid #ff5e14;
          color: #ff5e14;
          font-size: 14px;
          font-weight: 700;
          padding: 8px 20px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        .back-btn:hover {
          background: #ff5e14;
          color: #fff;
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
          padding: 24px 24px 32px 24px;
          overflow: hidden;
        }

        :global(body) {
          margin: 0;
          padding: 0;
          height: 100vh;
          overflow: hidden;
          background-color: #fff;
          font-family: var(--font-dm-sans, 'DM Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
        }
      `}</style>
    </div>
  );
}

export default function FundOwnerDetailsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: '#0f172a', fontWeight: 700 }}>Đang tải trang...</div>}>
      <FundOwnerDetailsContent />
    </Suspense>
  );
}
