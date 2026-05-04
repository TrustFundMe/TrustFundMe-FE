import React, { useState, useEffect } from 'react';
import CampaignsTab from './tabs/CampaignsTab';
import ActivityFeedTab from './tabs/ActivityFeedTab';
import ExpenditureTab from './tabs/ExpenditureTab';
import ReconciliationTab from './tabs/ReconciliationTab';
import { campaignService } from '@/services/campaignService';

interface DocumentSectionProps {
  id: string | number;
}

const DocumentSection = ({ id }: DocumentSectionProps) => {
  const [activeTab, setActiveTab] = useState('Campaigns');
  const [campaignCount, setCampaignCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      if (!id) return;
      try {
        const count = await campaignService.getCampaignCount(id);
        setCampaignCount(count);
      } catch (error) {
        console.error("Error fetching campaign count for tabs:", error);
      }
    };
    fetchCounts();
  }, [id]);

  const tabs = [
    { id: 'Campaigns', label: 'Chiến dịch', count: campaignCount },
    { id: 'Activity Feed', label: 'Nhật ký hoạt động' },
    { id: 'Expenditure', label: 'Minh bạch chi tiêu' },
    { id: 'Reconciliation', label: 'Đối Soát' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Campaigns': return <CampaignsTab id={id} />;
      case 'Activity Feed': return <ActivityFeedTab id={id} />;
      case 'Expenditure': return <ExpenditureTab id={id} />;
      case 'Reconciliation': return <ReconciliationTab id={id} />;
      default: return <CampaignsTab id={id} />;
    }
  };

  return (
    <div className="document-section">
      <div className="tabs-header">
        <div className="tabs-list">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label} {tab.count !== undefined && tab.count !== null ? `(${tab.count})` : ''}
            </button>
          ))}
        </div>
      </div>

      <div className="tab-viewport">
        {renderTabContent()}
      </div>

      <style jsx>{`
        .document-section {
          background: #fff;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          width: 100%;
          flex: 1;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          border: 1px solid #f1f5f9;
        }
        .tabs-header {
          padding: 0 32px;
          border-bottom: 1px solid #f1f5f9;
          background: #fff;
          flex-shrink: 0;
        }
        .tabs-list {
          display: flex;
          gap: 24px;
        }
        .tab-btn {
          background: none;
          border: none;
          padding: 20px 0;
          font-size: 14px;
          font-weight: 700;
          color: #94a3b8;
          cursor: pointer;
          position: relative;
          transition: all 0.2s;
          letter-spacing: -0.2px;
        }
        .tab-btn:hover { color: #64748b; }
        .tab-btn.active { color: #1e293b; }
        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: #2dd4bf; /* Using a fresh teal like the image, or red if user insists */
          background: #dc2626; /* User wanted red theme */
          border-radius: 2px 2px 0 0;
        }
        .tab-viewport {
          flex: 1;
          overflow: hidden;
          background: #fff;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
};

export default DocumentSection;
