import React from 'react';

interface AnalyticsCardProps {
    title: string;
    value: string;
    trend?: {
        value: string;
        isUp: boolean;
        label: string;
    };
    icon: React.ReactNode;
    iconBgColor?: string;
}

const AnalyticsCard = ({ title, value, trend, icon, iconBgColor }: AnalyticsCardProps) => {
    return (
        <div className="analytics-card">
            <div className="card-top">
                <div className="card-title">{title}</div>
                <div className="card-icon" style={{ backgroundColor: iconBgColor || '#f3f4f6' }}>
                    {icon}
                </div>
            </div>

            <div className="card-value">{value}</div>

            {trend && (
                <div className="card-trend">
                    <span className={`trend-value ${trend.isUp ? 'up' : 'down'}`}>
                        {trend.isUp ? '↗ ' : '↘ '}
                        {trend.value}
                    </span>
                    <span className="trend-label">{trend.label}</span>
                </div>
            )}

            <style jsx>{`
        .analytics-card {
          background: #fff;
          border-radius: 24px;
          padding: 24px 28px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .analytics-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
        }
        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .card-title {
          color: #6B7280;
          font-size: 14px;
          font-weight: 500;
          line-height: 1.4;
          max-width: 140px;
        }
        .card-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          alignItems: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .card-value {
          font-size: 48px;
          font-weight: 800;
          color: #111827;
          letter-spacing: -1px;
        }
        .card-trend {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
        }
        .trend-value {
          font-size: 15px;
          font-weight: 700;
        }
        .trend-value.up {
          color: #10B981;
        }
        .trend-value.down {
          color: #F84D43;
        }
        .trend-label {
          color: #9CA3AF;
          font-size: 14px;
        }
      `}</style>
        </div>
    );
};

export default AnalyticsCard;
