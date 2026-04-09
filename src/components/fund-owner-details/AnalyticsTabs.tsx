import React from 'react';
import { ChevronDown } from 'lucide-react';

const AnalyticsTabs = () => {
    return (
        <div className="tabs-container">
            <div className="tabs-left">
                <button className="tab-item">Media (1k)</button>
                <div style={{ position: 'relative' }}>
                    <button className="tab-item active">Analytics</button>
                </div>
            </div>

            <div className="tabs-right">
                <div className="date-selector">
                    <span className="date-label">Date</span>
                    <button className="date-btn">
                        Last 30 Days <ChevronDown size={18} />
                    </button>
                </div>
            </div>

            <style jsx>{`
        .tabs-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #F3F4F6;
          margin-top: 20px;
        }
        .tabs-left {
          display: flex;
          gap: 32px;
        }
        .tab-item {
          background: none;
          border: none;
          padding: 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: #6B7280;
          cursor: pointer;
          position: relative;
          transition: color 0.2s;
        }
        .tab-item:hover {
          color: #111827;
        }
        .tab-item.active {
          color: #3B82F6;
        }
        .tab-item.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 3px;
          background: #3B82F6;
          border-radius: 2px;
        }
        .date-selector {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .date-label {
          color: #6B7280;
          font-size: 14px;
        }
        .date-btn {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          font-weight: 700;
          color: #111827;
          cursor: pointer;
        }
        .growth-tooltip {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(12px);
          background: #1F2937;
          color: #fff;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13px;
          width: 240px;
          line-height: 1.5;
          z-index: 100;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          pointer-events: none;
        }
        .growth-tooltip::before {
          content: '';
          position: absolute;
          top: -6px;
          left: 50%;
          transform: translateX(-50%);
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-bottom: 6px solid #1F2937;
        }
      `}</style>
        </div>
    );
};

export default AnalyticsTabs;
