import React from 'react';
import Image from 'next/image';
import { Mail, MoreHorizontal, Star, CheckCircle2 } from 'lucide-react';
import { TabId } from '@/app/fund-owner-details/page';

interface OwnerProfileHeaderProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const OwnerProfileHeader = ({ activeTab, onTabChange }: OwnerProfileHeaderProps) => {
  const tabs: { id: TabId; label: string }[] = [
    { id: 'campaigns', label: 'Chiến dịch' },
    { id: 'feed', label: 'Nhật ký hoạt động' },
    { id: 'expenditure', label: 'Minh bạch chi tiêu' },
    { id: 'interaction', label: 'Phản hồi cộng đồng' },
  ];

  return (
    <div className="profile-header">
      <div className="content-container">
        <div className="profile-main-area">
          <div className="avatar-side">
            <div className="avatar-wrapper">
              <div className="avatar-bg">
                <Image
                  src="/assets/img/defaul.jpg"
                  alt="Profile"
                  width={130}
                  height={130}
                  className="avatar-img"
                />
              </div>
              <div className="verified-badge">
                <CheckCircle2 size={24} color="#fff" fill="#3B82F6" strokeWidth={1} />
              </div>
            </div>
          </div>

          <div className="info-side">
            <div className="top-row">
              <div className="name-group">
                <h2 className="username">amanda_nash <Star size={22} fill="#FBBF24" color="#FBBF24" className="star-icon" /></h2>
                <div className="tags">
                  <span className="tag">Lifestyle</span>
                  <span className="tag">Music</span>
                </div>
              </div>
              <div className="brand-actions">
                <button className="icon-btn"><Mail size={22} /></button>
                <button className="icon-btn"><MoreHorizontal size={22} /></button>
              </div>
            </div>

            <div className="display-name">Amanda Nash</div>

            <div className="stats-row">
              <div className="stat-item"><strong>1,022</strong> Posts</div>
              <div className="stat-item"><strong>47.2k</strong> Followers</div>
              <div className="stat-item"><strong>652</strong> Following</div>
            </div>

            <div className="bio">
              Actor, musician, songwriter. #amanda_nash Mailbox: amanda.nash@gmail.com *Rythm&Blues is Life* // Link to our new video! ⬇️⬇️⬇️ <a href="https://youtu.be/8TcueZdy881" className="bio-link">youtu.be/8TcueZdy881</a>
            </div>

            <div className="status-badges">
              <div className="badge-item hot">🔥</div>
              <div className="badge-item trophy">🏆</div>
              <div className="badge-item medal">🎖️</div>
            </div>
          </div>
        </div>

        <div className="tabs-navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .profile-header {
          background: #fff;
          width: 100%;
          border-bottom: 2px solid #F3F4F6;
        }
        .content-container {
          width: 25%;
          min-width: 550px; /* Slight increase to avoid overlapping in horizontal rows */
          padding: 40px 40px 0 40px;
          display: flex;
          flex-direction: column;
        }
        .profile-main-area {
          display: flex;
          gap: 40px;
          align-items: flex-start;
          margin-bottom: 32px;
        }
        .avatar-side {
          flex-shrink: 0;
        }
        .avatar-wrapper {
          position: relative;
        }
        .avatar-bg {
          width: 154px;
          height: 154px;
          border-radius: 50%;
          background: #f84d43; /* Vivid red-pink background */
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }
        .avatar-img {
          border-radius: 50%;
          border: 4px solid #fff;
          object-fit: cover;
        }
        .verified-badge {
          position: absolute;
          bottom: 12px;
          right: 4px;
          background: #fff;
          border-radius: 50%;
          padding: 2px;
        }
        
        .info-side {
          flex: 1;
        }
        .top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }
        .name-group {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .username {
          font-size: 28px;
          font-weight: 700;
          color: #111827;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tags {
          display: flex;
          gap: 10px;
        }
        .tag {
          background: #F3F4F6;
          padding: 6px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          color: #374151;
        }
        .brand-actions {
          display: flex;
          gap: 16px;
        }
        .icon-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid #E5E7EB;
          background: #F9FAFB;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #374151;
        }
        
        .display-name {
          color: #9CA3AF;
          font-size: 15px;
          margin-bottom: 24px;
        }
        .stats-row {
          display: flex;
          gap: 48px;
          margin-bottom: 24px;
        }
        .stat-item {
          font-size: 16px;
          color: #374151;
        }
        .stat-item strong {
          color: #111827;
          font-size: 20px;
          font-weight: 800;
          margin-right: 6px;
        }
        .bio {
          font-size: 16px;
          line-height: 1.5;
          color: #6B7280;
          margin-bottom: 24px;
        }
        .bio-link {
          color: #3B82F6;
          text-decoration: none;
          font-weight: 600;
        }
        .status-badges {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
        }
        .badge-item {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid #E5E7EB;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          background: #fff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }

        .tabs-navigation {
          display: flex;
          gap: 32px;
        }
        .tab-item {
          background: none;
          border: none;
          padding: 16px 0;
          font-size: 16px;
          font-weight: 700;
          color: #6B7280;
          cursor: pointer;
          position: relative;
          transition: all 0.2s;
        }
        .tab-item:hover { color: #111827; }
        .tab-item.active { color: #0f5d51; }
        .tab-item.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 3px;
          background: #0f5d51;
          border-radius: 2px;
        }

        @media (max-width: 1024px) {
           .content-container { width: 100%; min-width: auto; padding: 20px; }
           .profile-main-area { flex-direction: column; align-items: center; text-align: center; }
           .top-row { flex-direction: column; gap: 16px; }
           .name-group { flex-direction: column; }
           .brand-actions { margin-left: 0; }
           .stats-row { justify-content: center; gap: 24px; }
        }
      `}</style>
    </div>
  );
};

export default OwnerProfileHeader;
