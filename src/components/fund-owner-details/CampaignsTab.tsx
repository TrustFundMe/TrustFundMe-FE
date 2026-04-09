import React from 'react';
import { Users, Clock, CheckCircle } from 'lucide-react';

const CampaignsTab = () => {
    const activeCampaigns = [
        {
            id: 1,
            title: 'Mái trường cho em - Build schools for children',
            type: 'Authorized',
            progress: 75,
            donors: 1240,
            image: '/assets/img/defaul.jpg',
        },
        {
            id: 2,
            title: 'Cứu trợ lũ lụt miền Trung - Flood relief',
            type: 'Itemized',
            progress: 40,
            donors: 850,
            image: '/assets/img/defaul.jpg',
        }
    ];

    const endedCampaigns = [
        {
            id: 3,
            title: 'Tết ấm vùng cao 2024',
            status: 'Đã tất toán & Hoàn tất bằng chứng',
            donors: 3200,
            image: '/assets/img/defaul.jpg',
        }
    ];

    return (
        <div className="campaigns-tab">
            <section className="campaign-section">
                <h3 className="section-title">Đang hoạt động</h3>
                <div className="campaign-grid">
                    {activeCampaigns.map((c) => (
                        <div key={c.id} className="campaign-card">
                            <div className="card-thumb" style={{ backgroundImage: `url(${c.image})` }}>
                                <span className={`fund-tag ${c.type.toLowerCase()}`}>
                                    {c.type === 'Authorized' ? 'Quỹ ủy quyền' : 'Quỹ vật phẩm'}
                                </span>
                            </div>
                            <div className="card-content">
                                <h4 className="card-title">{c.title}</h4>
                                <div className="progress-container">
                                    <div className="progress-bar-bg">
                                        <div className="progress-bar-fill" style={{ width: `${c.progress}%` }}></div>
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <div className="progress-info">
                                        <strong>{c.progress}%</strong> tiến độ
                                    </div>
                                    <div className="donors-info">
                                        <Users size={14} /> {c.donors} donors
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="campaign-section">
                <h3 className="section-title">Đã kết thúc</h3>
                <div className="campaign-grid">
                    {endedCampaigns.map((c) => (
                        <div key={c.id} className="campaign-card ended">
                            <div className="card-thumb" style={{ backgroundImage: `url(${c.image})` }}>
                                <div className="ended-overlay">
                                    <CheckCircle size={32} color="#fff" />
                                </div>
                            </div>
                            <div className="card-content">
                                <h4 className="card-title">{c.title}</h4>
                                <div className="ended-status">
                                    <CheckCircle size={14} /> {c.status}
                                </div>
                                <div className="card-footer">
                                    <div className="donors-info">
                                        <Users size={14} /> {c.donors} donors
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <style jsx>{`
        .campaigns-tab {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }
        .section-title {
          font-size: 20px;
          font-weight: 800;
          color: #111827;
          margin-bottom: 20px;
        }
        .campaign-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        .campaign-card {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #f3f4f6;
          transition: transform 0.2s;
        }
        .campaign-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
        }
        .card-thumb {
          height: 180px;
          background-size: cover;
          background-position: center;
          position: relative;
        }
        .fund-tag {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          color: #fff;
        }
        .fund-tag.authorized { background: #2563eb; } /* Blue */
        .fund-tag.itemized { background: #f59e0b; } /* Orange */

        .card-content {
          padding: 20px;
        }
        .card-title {
          font-size: 16px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 16px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .progress-bar-bg {
          height: 8px;
          background: #f3f4f6;
          border-radius: 4px;
          margin-bottom: 12px;
        }
        .progress-bar-fill {
          height: 100%;
          background: #0f5d51;
          border-radius: 4px;
        }
        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .progress-info {
          font-size: 13px;
          color: #6b7280;
        }
        .progress-info strong {
          color: #0f5d51;
        }
        .donors-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #6b7280;
        }

        .ended-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .ended-status {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 12px;
            background: #f0fdf4;
            color: #166534;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            margin-bottom: 12px;
        }

        @media (max-width: 640px) {
          .campaign-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
};

export default CampaignsTab;
