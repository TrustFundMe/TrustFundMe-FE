import React from 'react';
import { MessageCircle, Star, Quote, Reply } from 'lucide-react';

const ReviewCard = ({ name, role, content, rating }: any) => (
    <div className="review-card">
        <div className="review-header">
            <div className="user-info">
                <div className="avatar">{name.charAt(0)}</div>
                <div className="texts">
                    <span className="name">{name}</span>
                    <span className="role">{role}</span>
                </div>
            </div>
            <div className="rating">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill={i < rating ? "#dc2626" : "none"} color={i < rating ? "#dc2626" : "#cbd5e1"} />
                ))}
            </div>
        </div>
        <div className="review-body">
            <Quote size={14} className="quote-icon" />
            <p className="content">{content}</p>
        </div>
        <style jsx>{`
      .review-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 16px; }
      .review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
      .user-info { display: flex; align-items: center; gap: 10px; }
      .avatar { width: 28px; height: 28px; background: #fef2f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #dc2626; }
      .texts { display: flex; flex-direction: column; }
      .name { font-size: 12px; font-weight: 700; color: #1e293b; }
      .role { font-size: 10px; color: #94a3b8; }
      .rating { display: flex; gap: 1px; }
      
      .review-body { position: relative; padding-left: 20px; }
      .quote-icon { position: absolute; left: 0; top: 2px; color: #fee2e2; }
      .content { font-size: 13px; color: #475569; line-height: 1.5; margin: 0; font-style: italic; }
    `}</style>
    </div>
);

const InteractionTab = ({ id }: { id: string | number }) => {
    return (
        <div className="interaction-tab">
            <div className="stats-header">
                <div className="stat-box">
                    <MessageCircle size={20} className="text-red-600" />
                    <div className="stat-texts">
                        <span className="val">1,240</span>
                        <span className="lab">Tổng phản hồi</span>
                    </div>
                </div>
                <div className="stat-box">
                    <Reply size={20} className="text-red-600" />
                    <div className="stat-texts">
                        <span className="val">98%</span>
                        <span className="lab">Tỷ lệ trả lời</span>
                    </div>
                </div>
            </div>

            <div className="interaction-grid">
                <div className="replies-preview">
                    <h3 className="section-subtitle">Phản hồi gần đây</h3>
                    <div className="reply-item">
                        <p className="reply-text">"Cảm ơn @donor123 đã đặt câu hỏi. Chúng tôi đã cập nhật danh sách hóa đơn Đợt 2 trong tab Minh bạch. Mời bạn kiểm tra!"</p>
                        <span className="reply-meta">Phản hồi trong <strong>Hỗ trợ hạ tầng khẩn cấp</strong> - 1 giờ trước</span>
                    </div>
                    <div className="reply-item">
                        <p className="reply-text">"Vâng, chúng tôi đang phối hợp với chính quyền địa phương để đảm bảo quà tặng được trao đúng người. Video cập nhật sẽ có sớm."</p>
                        <span className="reply-meta">Phản hồi trong <strong>Chương trình Áo ấm</strong> - 5 giờ trước</span>
                    </div>
                </div>

                <div className="reviews-section">
                    <h3 className="section-subtitle">Đánh giá minh bạch</h3>
                    <div className="reviews-list">
                        <ReviewCard
                            name="Albert Flores"
                            role="Nhà hảo tâm nổi bật"
                            rating={5}
                            content="Quy trình rất minh bạch. Chủ quỹ cập nhật bằng chứng các đợt rất nhanh. Độ tin cậy cao!"
                        />
                        <ReviewCard
                            name="Ronald Richards"
                            role="Thành viên cộng đồng"
                            rating={5}
                            content="Tôi đã theo dõi tổ chức này 2 năm. Các báo cáo của họ luôn nhất quán và trung thực."
                        />
                    </div>
                </div>
            </div>

            <style jsx>{`
        .interaction-tab { padding: 24px; display: flex; flex-direction: column; gap: 32px; }
        .stats-header { display: flex; gap: 16px; }
        .stat-box { 
            background: #fff; padding: 16px; border-radius: 16px; border: 1px solid #f1f5f9; 
            display: flex; align-items: center; gap: 16px; flex: 1;
        }
        .stat-texts { display: flex; flex-direction: column; }
        .val { font-size: 20px; font-weight: 800; color: #1e293b; }
        .lab { font-size: 11px; font-weight: 700; color: #64748b; }

        .interaction-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .section-subtitle { font-size: 15px; font-weight: 800; color: #1e293b; margin-bottom: 16px; }
        
        .replies-preview { display: flex; flex-direction: column; gap: 12px; }
        .reply-item { background: #fef2f266; padding: 16px; border-radius: 12px; border: 1px solid #fee2e2; }
        .reply-text { font-size: 13px; color: #334155; line-height: 1.5; margin: 0 0 8px 0; }
        .reply-meta { font-size: 10px; color: #94a3b8; }
        
        .reviews-list { display: flex; flex-direction: column; gap: 12px; }

        @media (max-width: 1024px) {
          .interaction-grid { grid-template-columns: 1fr; }
        }
      `}</style>
        </div>
    );
};

export default InteractionTab;
