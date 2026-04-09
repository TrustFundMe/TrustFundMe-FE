import React from 'react';
import { MessageSquare, Star, Reply, User, Heart } from 'lucide-react';

const InteractionTab = () => {
    const reviews = [
        {
            id: 1,
            user: "Minh Tran",
            role: "Donor",
            rating: 5,
            content: "Minh bạch tuyệt vời. Mỗi đợt chi đều có video quay lại hiện trường. Rất tin tưởng!",
            date: "3 ngày trước"
        },
        {
            id: 2,
            user: "Hà Nguyễn",
            role: "Recipient",
            rating: 5,
            content: "Cảm ơn quỹ đã hỗ trợ kịp thời cho bà con vùng lũ. Quà tặng rất thiết thực.",
            date: "1 tuần trước"
        }
    ];

    const replies = [
        {
            id: 101,
            originalComment: "Quỹ cho mình hỏi khi nào có báo cáo đợt 3 ạ?",
            donorName: "Vinh Nguyễn",
            replyContent: "Chào bạn Vinh, báo cáo đợt 3 đang được đối soát với ngân hàng và sẽ được đăng tải vào sáng thứ 2 tới. Cảm ơn bạn đã quan tâm!",
            time: "5 giờ trước"
        },
        {
            id: 102,
            originalComment: "Mình vừa chuyển khoản ủng hộ 1tr, chúc quỹ thành công.",
            donorName: "Linh Lan",
            replyContent: "Quỹ đã nhận được tấm lòng của bạn. Chân thành cảm ơn bạn đã đồng hành cùng các em nhỏ!",
            time: "1 ngày trước"
        }
    ];

    return (
        <div className="interaction-tab">
            <div className="interaction-grid">
                <section className="interaction-section">
                    <h3 className="section-title">Đánh giá & Phản hồi</h3>
                    <div className="review-list">
                        {reviews.map((r) => (
                            <div key={r.id} className="review-card">
                                <div className="review-header">
                                    <div className="user-icon"><User size={20} /></div>
                                    <div className="user-info">
                                        <span className="user-name">{r.user}</span>
                                        <span className="user-role">{r.role}</span>
                                    </div>
                                    <div className="rating">
                                        {[...Array(r.rating)].map((_, i) => (
                                            <Star key={i} size={14} fill="#FBBF24" color="#FBBF24" />
                                        ))}
                                    </div>
                                </div>
                                <p className="review-content">"{r.content}"</p>
                                <span className="review-date">{r.date}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="interaction-section">
                    <h3 className="section-title">Lịch sử phản hồi</h3>
                    <div className="reply-list">
                        {replies.map((rp) => (
                            <div key={rp.id} className="reply-card">
                                <div className="original-comment">
                                    <MessageSquare size={14} />
                                    <span className="donor">@{rp.donorName}:</span>
                                    <p className="comment-text">"{rp.originalComment}"</p>
                                </div>
                                <div className="owner-reply">
                                    <div className="reply-meta">
                                        <div className="owner-badge">Fund Owner</div>
                                        <span className="reply-time">{rp.time}</span>
                                    </div>
                                    <p className="reply-text">{rp.replyContent}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <style jsx>{`
        .interaction-tab {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .interaction-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }
        .section-title {
          font-size: 20px;
          font-weight: 800;
          color: #111827;
          margin-bottom: 24px;
        }
        
        .review-list, .reply-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .review-card {
           background: #fff;
           border: 1px solid #f3f4f6;
           border-radius: 16px;
           padding: 20px;
        }
        .review-header {
           display: flex;
           align-items: center;
           gap: 12px;
           margin-bottom: 12px;
        }
        .user-icon {
           width: 36px;
           height: 36px;
           background: #f3f4f6;
           border-radius: 50%;
           display: flex;
           align-items: center;
           justify-content: center;
           color: #6b7280;
        }
        .user-info { flex: 1; display: flex; flex-direction: column; }
        .user-name { font-size: 14px; font-weight: 700; color: #111827; }
        .user-role { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; }
        .rating { display: flex; gap: 2px; }
        .review-content { font-size: 14px; color: #4b5563; font-style: italic; margin-bottom: 8px; }
        .review-date { font-size: 11px; color: #9ca3af; }

        .reply-card {
           background: #fff;
           border: 1px solid #f3f4f6;
           border-radius: 16px;
           overflow: hidden;
        }
        .original-comment {
           padding: 12px 16px;
           background: #f9fafb;
           display: flex;
           align-items: center;
           gap: 8px;
           border-bottom: 1px solid #f3f4f6;
        }
        .original-comment .donor { font-size: 13px; font-weight: 700; color: #6b7280; }
        .original-comment .comment-text { font-size: 13px; color: #9ca3af; margin: 0; }
        
        .owner-reply { padding: 16px; }
        .reply-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .owner-badge {
           background: #ecfdf5;
           color: #059669;
           font-size: 10px;
           font-weight: 800;
           padding: 2px 8px;
           border-radius: 4px;
        }
        .reply-time { font-size: 11px; color: #9ca3af; }
        .reply-text { font-size: 14px; color: #374151; margin: 0; line-height: 1.5; }

        @media (max-width: 991px) {
          .interaction-grid { grid-template-columns: 1fr; }
        }
      `}</style>
        </div>
    );
};

export default InteractionTab;
