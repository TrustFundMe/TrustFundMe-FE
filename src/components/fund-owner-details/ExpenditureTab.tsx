import React from 'react';
import { FileText, Download, CheckCircle, Clock, BarChart3, ChevronRight, Image as ImageIcon, Video } from 'lucide-react';

const ExpenditureTab = () => {
    const expenditures = [
        {
            id: "EXP-101",
            cycle: "Đợt 1 - Mua vật tư xây dựng",
            amount: "250.000.000 ₫",
            status: "Đã đối soát",
            date: "12/03/2026",
            evidenceCount: 12,
            type: "receipt"
        },
        {
            id: "EXP-102",
            cycle: "Đợt 2 - Tiền công nhân & Vận chuyển",
            amount: "80.000.000 ₫",
            status: "Đang chờ xác minh",
            date: "25/03/2026",
            evidenceCount: 5,
            type: "video"
        },
        {
            id: "EXP-103",
            cycle: "Đợt 3 - Trang thiết bị phòng học",
            amount: "120.000.000 ₫",
            status: "Chờ duyệt",
            date: "-",
            evidenceCount: 0,
            type: "-"
        }
    ];

    return (
        <div className="expenditure-tab">
            <section className="cashflow-summary">
                <div className="section-header">
                    <h3 className="section-title">Lịch sử dòng tiền</h3>
                    <div className="selector">
                        Năm 2026 <ChevronRight size={16} />
                    </div>
                </div>

                <div className="cashflow-grid">
                    <div className="cf-card green">
                        <span className="cf-label">Tổng nhận</span>
                        <span className="cf-value">1.520.000.000 ₫</span>
                    </div>
                    <div className="cf-card red">
                        <span className="cf-label">Tổng chi</span>
                        <span className="cf-value">330.000.000 ₫</span>
                    </div>
                    <div className="cf-card blue">
                        <span className="cf-label">Số dư hiện tại</span>
                        <span className="cf-value">1.190.000.000 ₫</span>
                    </div>
                </div>

                <div className="cf-chart-placeholder">
                    <div className="chart-bar-container">
                        {[60, 80, 45, 90, 70, 55].map((h, i) => (
                            <div key={i} className="chart-bar" style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                    <div className="chart-labels">
                        <span>T1</span><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span>
                    </div>
                </div>
            </section>

            <section className="expenditure-list-section">
                <h3 className="section-title">Danh sách đợt chi</h3>
                <div className="exp-list">
                    {expenditures.map((e) => (
                        <div key={e.id} className="exp-item">
                            <div className="exp-info">
                                <div className="exp-main">
                                    <span className="exp-id">{e.id}</span>
                                    <h4 className="exp-title">{e.cycle}</h4>
                                </div>
                                <div className="exp-meta">
                                    <div className={`status-badge ${e.status === 'Đã đối soát' ? 'done' : e.status === 'Chờ duyệt' ? 'pending' : 'active'}`}>
                                        {e.status}
                                    </div>
                                    <span className="exp-date">{e.date}</span>
                                </div>
                            </div>

                            <div className="exp-amount">
                                {e.amount}
                            </div>

                            <div className="exp-evidence">
                                <div className="evidence-icons">
                                    <ImageIcon size={16} />
                                    <Video size={16} />
                                </div>
                                <span className="evidence-text">{e.evidenceCount} bằng chứng</span>
                            </div>

                            <button className="btn-detail">
                                Chi tiết <ChevronRight size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <style jsx>{`
        .expenditure-tab {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .section-title {
          font-size: 20px;
          font-weight: 800;
          color: #111827;
        }
        .selector {
          font-size: 14px;
          font-weight: 700;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
        }

        .cashflow-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }
        .cf-card {
          padding: 20px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .cf-card.green { background: #f0fdf4; }
        .cf-card.red { background: #fef2f2; }
        .cf-card.blue { background: #eff6ff; }
        
        .cf-label { font-size: 13px; font-weight: 700; color: #6b7280; }
        .cf-value { font-size: 18px; font-weight: 800; color: #111827; }

        .cf-chart-placeholder {
          background: #fff;
          border: 1px solid #f3f4f6;
          border-radius: 16px;
          padding: 24px;
          height: 200px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          gap: 12px;
        }
        .chart-bar-container {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 100%;
        }
        .chart-bar {
          width: 40px;
          background: #0f5d51;
          border-radius: 6px 6px 0 0;
          opacity: 0.8;
        }
        .chart-labels {
          display: flex;
          justify-content: space-around;
          color: #9ca3af;
          font-size: 12px;
          font-weight: 700;
        }

        .exp-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .exp-item {
          background: #fff;
          border: 1px solid #f3f4f6;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }
        .exp-info { flex: 2; display: flex; flex-direction: column; gap: 8px; }
        .exp-main { display: flex; align-items: center; gap: 12px; }
        .exp-id { font-size: 12px; font-weight: 800; color: #9ca3af; }
        .exp-title { font-size: 16px; font-weight: 700; color: #111827; }
        .exp-meta { display: flex; align-items: center; gap: 12px; }
        
        .status-badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 800;
        }
        .status-badge.done { background: #f0fdf4; color: #166534; }
        .status-badge.pending { background: #fff7ed; color: #9a3412; }
        .status-badge.active { background: #fdf2f8; color: #9d174d; }

        .exp-date { font-size: 12px; color: #9ca3af; }

        .exp-amount { flex: 1; font-size: 18px; font-weight: 800; color: #111827; text-align: right; }
        
        .exp-evidence {
           display: flex;
           flex-direction: column;
           align-items: flex-end;
           gap: 4px;
        }
        .evidence-icons { display: flex; gap: 8px; color: #6b7280; }
        .evidence-text { font-size: 12px; color: #9ca3af; }

        .btn-detail {
          background: none;
          border: 1px solid #e5e7eb;
          padding: 10px 16px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }
        .btn-detail:hover { background: #f9fafb; }

        @media (max-width: 991px) {
          .exp-item { flex-direction: column; align-items: flex-start; }
          .exp-amount { text-align: left; }
          .exp-evidence { align-items: flex-start; }
          .btn-detail { width: 100%; justify-content: center; }
        }
      `}</style>
        </div>
    );
};

export default ExpenditureTab;
