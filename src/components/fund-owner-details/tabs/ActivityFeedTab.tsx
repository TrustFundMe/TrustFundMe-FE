import React, { useState } from 'react';
import { Tag, Clock, AlertTriangle, Image as ImageIcon, FileCheck } from 'lucide-react';

const FeedItem = ({ type, campaign, content, date, images }: any) => {
    const getIcon = () => {
        switch (type) {
            case 'Emergency': return <AlertTriangle size={14} className="text-red-600" />;
            case 'Evidence': return <FileCheck size={14} className="text-red-600" />;
            default: return <Clock size={14} className="text-red-500" />;
        }
    };

    const typeLabels: any = {
        'Emergency': 'Cảnh báo khẩn cấp',
        'Evidence': 'Cập nhật bằng chứng',
        'Update': 'Cập nhật hiện trường'
    };

    return (
        <div className="feed-item">
            <div className="feed-left">
                <div className={`icon-circle ${type.toLowerCase()}`}>
                    {getIcon()}
                </div>
                <div className="line"></div>
            </div>
            <div className="feed-content">
                <div className="feed-header">
                    <div className="campaign-tag">
                        <Tag size={10} />
                        <span>{campaign}</span>
                    </div>
                    <span className="feed-date">{date}</span>
                </div>
                <div className="feed-body">
                    <p className="text">{content}</p>
                    {images && (
                        <div className="image-grid">
                            <div className="placeholder-img"><ImageIcon size={20} /></div>
                            <div className="placeholder-img"><ImageIcon size={20} /></div>
                        </div>
                    )}
                </div>
                <div className="feed-actions">
                    <button className="view-details">Xem bài viết gốc</button>
                </div>
            </div>
            <style jsx>{`
        .feed-item { display: flex; gap: 16px; }
        .feed-left { display: flex; flex-direction: column; align-items: center; }
        .icon-circle { 
            width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
            border: 2px solid transparent; flex-shrink: 0;
        }
        .icon-circle.emergency { background: #fef2f2; border-color: #fee2e2; }
        .icon-circle.evidence { background: #fff1f2; border-color: #ffe4e6; }
        .icon-circle.update { background: #fff5f5; border-color: #fed7d7; }
        .line { width: 1.5px; flex: 1; background: #f1f5f9; margin: 4px 0; }
        
        .feed-content { flex: 1; padding-bottom: 24px; }
        .feed-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .campaign-tag { 
            display: flex; align-items: center; gap: 5px; padding: 3px 8px; 
            background: #fffafa; border: 1px solid #fee2e2; border-radius: 6px;
            font-size: 10px; font-weight: 700; color: #991b1b;
        }
        .feed-date { font-size: 11px; color: #94a3b8; font-weight: 500; }
        
        .feed-body { background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 16px; margin-bottom: 8px; }
        .text { font-size: 13px; color: #334155; line-height: 1.5; margin: 0; }
        
        .image-grid { display: flex; gap: 10px; margin-top: 12px; }
        .placeholder-img { 
            width: 100px; height: 60px; background: #f8fafc; border: 1px dashed #cbd5e1; 
            border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #94a3b8;
        }

        .view-details { 
            background: none; border: none; color: #dc2626; font-size: 12px; font-weight: 700; 
            padding: 0; cursor: pointer; text-decoration: underline;
        }
      `}</style>
        </div>
    );
};

const ActivityFeedTab = ({ id }: { id: string | number }) => {
    const [filter, setFilter] = useState('Tất cả');
    const filters = ['Tất cả', 'Cập nhật hiện trường', 'Cảnh báo khẩn cấp', 'Cập nhật bằng chứng'];

    return (
        <div className="activity-feed">
            <div className="filter-bar">
                {filters.map(f => (
                    <button
                        key={f}
                        className={`filter-btn ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="feed-list">
                <FeedItem
                    type="Evidence"
                    campaign="Cứu trợ lũ lụt khẩn cấp Miền Trung"
                    content="Chúng tôi vừa hoàn tất việc mua 500 gói nhu yếu phẩm. Đang quét toàn bộ hóa đơn để cập nhật. Cảm ơn sự ủng hộ của các bạn!"
                    date="2 giờ trước"
                    images={true}
                />
                <FeedItem
                    type="Emergency"
                    campaign="Xây dựng lại trường học sau bão số 10"
                    content="Cảnh báo lũ quét tại khu vực dự án. Đội ngũ của chúng tôi đang tạm dừng công tác tại hiện trường để đảm bảo an toàn."
                    date="Hôm qua"
                />
                <FeedItem
                    type="Update"
                    campaign="Áo ấm cho trẻ em vùng cao Hà Giang"
                    content="Lô hàng 200 chiếc áo khoác mùa đông đầu tiên đã đến Hà Giang. Việc phân phát sẽ bắt đầu vào 8:00 sáng mai."
                    date="2 ngày trước"
                    images={true}
                />
            </div>

            <style jsx>{`
        .activity-feed { padding: 24px; max-width: 800px; }
        .filter-bar { display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; }
        .filter-btn { 
          padding: 6px 14px; border-radius: 99px; border: 1px solid #e2e8f0; 
          background: #fff; font-size: 12px; font-weight: 600; color: #64748b; cursor: pointer;
          transition: all 0.2s;
        }
        .filter-btn:hover { background: #f8fafc; }
        .filter-btn.active { background: #dc2626; color: #fff; border-color: #dc2626; }
        
        .feed-list { display: flex; flex-direction: column; }
      `}</style>
        </div>
    );
};

export default ActivityFeedTab;
