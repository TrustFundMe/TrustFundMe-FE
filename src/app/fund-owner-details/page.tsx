'use client';

import React, { useState } from 'react';
import OwnerProfileHeader from '@/components/fund-owner-details/OwnerProfileHeader';
import CampaignsTab from '@/components/fund-owner-details/CampaignsTab';
import ActivityFeedTab from '@/components/fund-owner-details/ActivityFeedTab';
import ExpenditureTab from '@/components/fund-owner-details/ExpenditureTab';
import InteractionTab from '@/components/fund-owner-details/InteractionTab';

export type TabId = 'campaigns' | 'feed' | 'expenditure' | 'interaction';

export default function FundOwnerDetailsPage() {
    const [activeTab, setActiveTab] = useState<TabId>('campaigns');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'campaigns':
                return <CampaignsTab />;
            case 'feed':
                return <ActivityFeedTab />;
            case 'expenditure':
                return <ExpenditureTab />;
            case 'interaction':
                return <InteractionTab />;
            default:
                return <CampaignsTab />;
        }
    };

    return (
        <div className="page-wrapper">
            <OwnerProfileHeader activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="tab-content-container">
                <div className="tab-content-area">
                    {renderTabContent()}
                </div>
            </div>

            <style jsx>{`
        .page-wrapper {
          min-height: 100vh;
          background-color: #f9fafb;
          display: flex;
          flex-direction: column;
        }
        .tab-content-container {
          width: 100%;
          padding: 32px 24px;
          display: flex;
          justify-content: flex-start; /* Left aligned content */
        }
        .tab-content-area {
          width: 100%;
          max-width: 1200px;
          /* Removed margin: 0 auto; to align left */
        }

        :global(body) {
          margin: 0;
          padding: 0;
          background-color: #f9fafb;
        }
      `}</style>
        </div>
    );
}
