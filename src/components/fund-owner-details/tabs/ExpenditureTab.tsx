import React from 'react';
import { FileText, Eye, CheckCircle, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

const CashMetric = ({ title, value, icon, color }: any) => (
    <div className="cash-metric">
        <div className={`metric-icon ${color}`}>{icon}</div>
        <div className="metric-info">
            <span className="label">{title}</span>
            <span className="value">{value}</span>
        </div>
        <style jsx>{`
      .cash-metric { background: #fff; padding: 16px; border-radius: 12px; border: 1px solid #f1f5f9; display: flex; align-items: center; gap: 12px; flex: 1; }
      .metric-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
      .metric-icon.red { background: #fef2f2; color: #dc2626; }
      .metric-icon.rose { background: #fff1f2; color: #e11d48; }
      .metric-icon.orange { background: #fff7ed; color: #f97316; }
      .metric-info { display: flex; flex-direction: column; }
      .label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px; }
      .value { font-size: 16px; font-weight: 800; color: #1e293b; }
    `}</style>
    </div>
);

const ExpenditureTab = ({ id }: { id: string | number }) => {
    return (
        <div className="expenditure-tab">
            <div className="cash-summary">
                <CashMetric title="Tổng nhận" value="31.2 Tỷ VNĐ" icon={<TrendingUp size={18} />} color="red" />
                <CashMetric title="Tổng chi" value="30.5 Tỷ VNĐ" icon={<TrendingDown size={18} />} color="rose" />
                <CashMetric title="Số dư hiện tại" value="700 Tr VNĐ" icon={<Wallet size={18} />} color="orange" />
            </div>

            <div className="expenditure-list">
                <h3 className="section-title">Danh sách đợt chi & Bằng chứng</h3>
                <div className="table-wrapper">
                    <table className="exp-table">
                        <thead>
                            <tr>
                                <th>Đợt chi</th>
                                <th>Số tiền</th>
                                <th>Trạng thái</th>
                                <th>Bằng chứng</th>
                                <th>Đối soát</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="round">Đợt 1</td>
                                <td className="amount">6.2 Tỷ VNĐ</td>
                                <td><span className="badge approved">Đã duyệt</span></td>
                                <td><div className="evidence-icons"><FileText size={14} /> <Eye size={14} /></div></td>
                                <td><div className="audit-info"><CheckCircle size={12} /> <span>Đã đối soát</span></div></td>
                                <td><button className="view-btn">Chi tiết</button></td>
                            </tr>
                            <tr>
                                <td className="round">Đợt 2</td>
                                <td className="amount">10 Tỷ VNĐ</td>
                                <td><span className="badge active">Hoạt động</span></td>
                                <td><div className="evidence-icons"><FileText size={14} /></div></td>
                                <td><span className="text-slate-400 text-xs">Đang xử lý</span></td>
                                <td><button className="view-btn">Chi tiết</button></td>
                            </tr>
                            <tr>
                                <td className="round">Đợt 3</td>
                                <td className="amount">13.3 Tỷ VNĐ</td>
                                <td><span className="badge pending">Chờ duyệt</span></td>
                                <td>-</td>
                                <td>-</td>
                                <td><button className="view-btn disabled" disabled>Chi tiết</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <style jsx>{`
        .expenditure-tab { padding: 24px; display: flex; flex-direction: column; gap: 32px; }
        .cash-summary { display: flex; gap: 16px; }
        
        .section-title { font-size: 16px; font-weight: 800; color: #1e293b; margin-bottom: 16px; }
        .table-wrapper { background: #fff; border-radius: 12px; border: 1px solid #f1f5f9; overflow: hidden; }
        .exp-table { width: 100%; border-collapse: collapse; text-align: left; }
        th { padding: 12px 20px; font-size: 12px; font-weight: 700; color: #64748b; background: #f8fafc; border-bottom: 1px solid #f1f5f9; }
        td { padding: 12px 20px; font-size: 13px; color: #334155; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        
        .round { font-weight: 700; color: #1e293b; }
        .amount { font-weight: 800; color: #111827; }
        
        .badge { padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
        .badge.approved { background: #fef2f2; color: #dc2626; }
        .badge.active { background: #eff6ff; color: #3b82f6; }
        .badge.pending { background: #fff7ed; color: #f97316; }
        
        .evidence-icons { display: flex; gap: 6px; color: #94a3b8; }
        .audit-info { display: flex; align-items: center; gap: 4px; color: #991b1b; font-size: 11px; font-weight: 700; }
        
        .view-btn { 
            background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 4px 10px;
            font-size: 12px; font-weight: 700; color: #475569; cursor: pointer; transition: all 0.2s;
        }
        .view-btn:hover:not(:disabled) { background: #f8fafc; border-color: #cbd5e1; }
        .view-btn.disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
        </div>
    );
};

export default ExpenditureTab;
