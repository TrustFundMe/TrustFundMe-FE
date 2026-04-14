import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Calendar } from 'lucide-react';
import { userService, UserInfo } from '@/services/userService';
import { campaignService } from '@/services/campaignService';
import { expenditureService } from '@/services/expenditureService';

interface ProfileHeaderProps {
  id: string | number;
}

const ProfileHeader = ({ id }: ProfileHeaderProps) => {
  const [userData, setUserData] = useState<UserInfo | null>(null);
  const [campaignCount, setCampaignCount] = useState<number>(0);
  const [totalDisbursed, setTotalDisbursed] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [userRes, countRes, disbursedRes] = await Promise.all([
          userService.getUserById(id),
          campaignService.getCampaignCount(id),
          expenditureService.getTotalDisbursed(id)
        ]);

        if (userRes.success && userRes.data) {
          setUserData(userRes.data);
        }
        setCampaignCount(countRes || 0);
        setTotalDisbursed(disbursedRes || 0);
      } catch (error) {
        console.error("Error fetching header data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <div className="profile-header loading">Đang tải...</div>;
  }

  // Format date: dd/mm/yyyy
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Mới tham gia";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1e9) {
      return (amount / 1e9).toFixed(1) + " Tỷ";
    }
    if (amount >= 1e6) {
      return (amount / 1e6).toFixed(0) + " Tr";
    }
    return new Intl.NumberFormat('vi-VN').format(amount) + " đ";
  };

  return (
    <div className="profile-header">
      <div className="left-section">
        <div className="avatar-container">
          <Image
            src={userData?.avatarUrl || "/assets/img/defaul.jpg"}
            alt="Profile"
            width={72}
            height={72}
            className="profile-avatar"
          />
        </div>
        <div className="profile-info">
          <div className="name-row">
            <h1 className="name">{userData?.fullName || "Chủ quỹ"}</h1>
            <span className="join-date">
              <Calendar size={14} /> Tham gia: {formatDate(userData?.createdAt)}
            </span>
          </div>

          <div className="metrics-row">
            <div className="metric-item">
              <div className="metric-icon-box">
                <Image src="https://cdn-icons-png.flaticon.com/512/11125/11125038.png" alt="Campaigns" width={24} height={24} />
              </div>
              <div className="metric-texts">
                <span className="metric-value">{campaignCount}</span>
                <span className="metric-label">Chiến dịch</span>
              </div>
            </div>

            <div className="metric-item">
              <div className="metric-icon-box">
                <Image src="https://cdn-icons-png.flaticon.com/512/10224/10224952.png" alt="Disbursed" width={24} height={24} />
              </div>
              <div className="metric-texts">
                <span className="metric-value">{formatCurrency(totalDisbursed)}</span>
                <span className="metric-label">Đã giải ngân</span>
              </div>
            </div>

            <div className="metric-item">
              <div className="metric-icon-box">
                <Image src="https://cdn-icons-png.flaticon.com/512/5843/5843286.png" alt="Trust Score" width={24} height={24} />
              </div>
              <div className="metric-texts">
                <span className="metric-value">{userData?.trustScore || 0}</span>
                <span className="metric-label">Điểm uy tín</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="right-section">
        {/* Follow button removed per user request */}
      </div>

      <style jsx>{`
        .profile-header {
          background: #fff;
          padding: 24px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #fee2e2;
        }
        .profile-header.loading { height: 120px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; color: #dc2626; }
        
        .left-section { display: flex; gap: 24px; align-items: center; }
        .avatar-container { position: relative; width: 72px; height: 72px; }
        .profile-avatar { border-radius: 50%; object-fit: cover; border: 3px solid #fef2f2; }

        .profile-info { display: flex; flex-direction: column; gap: 12px; }
        .name-row { display: flex; align-items: center; gap: 16px; }
        .name { font-size: 28px; font-weight: 800; color: #111827; margin: 0; letter-spacing: -0.5px; }
        .join-date { display: flex; align-items: center; gap: 6px; font-size: 14px; color: #991b1b; font-weight: 700; background: #fef2f2; padding: 4px 12px; border-radius: 99px; }
        
        .metrics-row { display: flex; gap: 32px; align-items: center; }
        .metric-item { display: flex; align-items: center; gap: 12px; }
        .metric-icon-box { background: #f8fafc; padding: 8px; border-radius: 12px; display: flex; }
        
        .metric-texts { display: flex; flex-direction: column; }
        .metric-value { font-size: 20px; font-weight: 700; color: #111827; line-height: 1.1; }
        .metric-label { font-size: 12px; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }

        .right-section { display: flex; align-items: center; }

        @media (max-width: 1024px) {
          .metrics-row { gap: 24px; }
          .name { font-size: 24px; }
        }
      `}</style>
    </div>
  );
};

export default ProfileHeader;
