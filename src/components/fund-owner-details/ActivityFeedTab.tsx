import React from 'react';
import { Filter, Tag, Clock, MapPin, AlertCircle, Image as ImageIcon } from 'lucide-react';

const ActivityFeedTab = () => {
    const feedItems = [
        {
            id: 1,
            type: 'evidence',
            title: 'Cập nhật bằng chứng đợt 2',
            campaign: 'Mái trường cho em',
            content: 'Chúng tôi vừa hoàn thành việc thanh toán hóa đơn vật tư xây dựng cho giai đoạn 2. Hình ảnh hóa đơn đã được tải lên trong tab Minh bạch.',
            time: '2 giờ trước',
            images: ['/assets/img/defaul.jpg']
        },
        {
            id: 2,
            type: 'update',
            title: 'Khảo sát hiện trường tại bản Nậm Lỳ',
            campaign: 'Mái trường cho em',
            content: 'Nhóm tình nguyện đã có mặt để đo đạc và khảo sát địa chất chuẩn bị cho việc đổ móng trường.',
            time: '1 ngày trước',
            location: 'Hà Giang',
            images: ['/assets/img/defaul.jpg']
        },
        {
            id: 3,
            type: 'urgent',
            title: 'Thông báo khẩn cấp: Thay đổi địa điểm trao quà',
            campaign: 'Tết ấm vùng cao 2024',
            content: 'Do điều kiện thời tiết sạt lở, địa điểm trao quà tại xã A sẽ được dời sang nhà văn hóa xã B.',
            time: '3 ngày trước',
        }
    ];

    const categories = [
        { label: 'Tất cả', count: 12 },
        { label: 'Hiện trường', count: 5 },
        { label: 'Khẩn cấp', count: 2 },
        { label: 'Bằng chứng', count: 5 },
    ];

    return (
        <div className="activity-feed-tab">
            <div className="feed-controls">
                <div className="feed-filters">
                    {categories.map((cat, i) => (
                        <button key={i} className={`filter-btn ${i === 0 ? 'active' : ''}`}>
                            {cat.label} <span className="count">{cat.count}</span>
                        </button>
                    ))}
                </div>
                <button className="sort-btn">
                    <Filter size={16} /> Mới nhất
                </button>
            </div>

            <div className="feed-timeline">
                {feedItems.map((item) => (
                    <div key={item.id} className="feed-item">
                        <div className="feed-icon-col">
                            <div className={`icon-circle ${item.type}`}>
                                {item.type === 'evidence' && <ImageIcon size={18} />}
                                {item.type === 'update' && <MapPin size={18} />}
                                {item.type === 'urgent' && <AlertCircle size={18} />}
                            </div>
                            <div className="line"></div>
                        </div>

                        <div className="feed-card">
                            <div className="card-header">
                                <div className="meta">
                                    <span className="time">{item.time}</span>
                                    <span className="dot">•</span>
                                    <div className="campaign-tag">
                                        <Tag size={12} /> {item.campaign}
                                    </div>
                                </div>
                                <h4 className="card-title">{item.title}</h4>
                            </div>

                            <div className="card-body">
                                <p className="content-text">{item.content}</p>
                                {item.images && (
                                    <div className="image-grid">
                                        {item.images.map((img, i) => (
                                            <div key={i} className="feed-image" style={{ backgroundImage: `url(${img})` }}></div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="card-footer">
                                <button className="btn-interact">Thích</button>
                                <button className="btn-interact">Bình luận</button>
                                <button className="btn-interact">Chia sẻ</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
        .activity-feed-tab {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .feed-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .feed-filters {
          display: flex;
          gap: 12px;
        }
        .filter-btn {
          background: #fff;
          border: 1px solid #e5e7eb;
          padding: 8px 16px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          color: #6b7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .filter-btn.active {
          background: #0f5d51;
          border-color: #0f5d51;
          color: #fff;
        }
        .count { opacity: 0.6; }

        .sort-btn {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 700;
          color: #374151;
          cursor: pointer;
        }

        .feed-timeline {
          display: flex;
          flex-direction: column;
        }
        .feed-item {
          display: flex;
          gap: 20px;
        }
        .feed-icon-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 40px;
        }
        .icon-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }
        .icon-circle.evidence { background: #dbeafe; color: #2563eb; }
        .icon-circle.update { background: #fef3c7; color: #d97706; }
        .icon-circle.urgent { background: #fee2e2; color: #dc2626; }
        
        .line {
          flex: 1;
          width: 2px;
          background: #f3f4f6;
          margin-bottom: -20px;
        }
        .feed-item:last-child .line { display: none; }

        .feed-card {
          flex: 1;
          background: #fff;
          border: 1px solid #f3f4f6;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 32px;
        }
        .card-header { margin-bottom: 12px; }
        .meta {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #9ca3af;
          font-size: 12px;
          margin-bottom: 4px;
        }
        .campaign-tag {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #0f5d51;
          font-weight: 800;
        }
        .card-title {
          font-size: 18px;
          font-weight: 800;
          color: #111827;
        }
        .content-text {
          font-size: 15px;
          line-height: 1.6;
          color: #4b5563;
          margin-bottom: 16px;
        }
        .image-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }
        .feed-image {
          height: 200px;
          border-radius: 12px;
          background-size: cover;
          background-position: center;
        }

        .card-footer {
          border-top: 1px solid #f3f4f6;
          padding-top: 16px;
          display: flex;
          gap: 24px;
        }
        .btn-interact {
          background: none;
          border: none;
          padding: 0;
          font-size: 14px;
          font-weight: 700;
          color: #6b7280;
          cursor: pointer;
        }
        .btn-interact:hover { color: #0f5d51; }

        @media (max-width: 640px) {
          .feed-filters { overflow-x: auto; max-width: 250px; }
          .image-grid { grid-template-columns: 1fr; }
        }
      `}</style>
        </div>
    );
};

export default ActivityFeedTab;
