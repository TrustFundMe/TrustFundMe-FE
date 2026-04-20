import React, { useEffect, useState } from 'react';
import { FileText, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { campaignService } from '@/services/campaignService';
import type { Expenditure } from '@/types/expenditure';

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
      .metric-icon.green { background: #ecfdf5; color: #059669; }
      .metric-info { display: flex; flex-direction: column; }
      .label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px; }
      .value { font-size: 16px; font-weight: 800; color: #1e293b; }
    `}</style>
    </div>
);

interface StatisticsResponse {
    totalReceived: number;
    totalSpent: number;
    currentBalance: number;
    totalReceivedFromGeneralFund: number;
    iconTotalReceived: string;
    iconTotalSpent: string;
    iconCurrentBalance: string;
    iconTotalReceivedFromGeneralFund: string;
    expenditures: Expenditure[];
    campaignMap?: Record<number, string>;
}

const formatCurrency = (amount: number): string => {
    if (!amount && amount !== 0) return '-';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount).replace('₫', 'VNĐ').trim();
};

const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return '-';
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    }).format(new Date(dateStr));
};

const ICON_GENERAL_FUND = 'https://cdn-icons-png.flaticon.com/512/5529/5529892.png';

const ExpenditureTab = ({ id }: { id: string | number }) => {
    const router = useRouter();
    const [stats, setStats] = useState<StatisticsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => {
        campaignService.getStatistics(id).then((data) => {
            setStats(data);
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });
    }, [id]);

    const filteredExpenditures = stats?.expenditures
        ? stats.expenditures.filter(exp => {
            const campaignTitle = (stats.campaignMap?.[exp.campaignId] || '').toLowerCase();
            const planText = (exp.plan || '').toLowerCase();
            const searchText = search.toLowerCase();
            const matchSearch = !search ||
                campaignTitle.includes(searchText) ||
                planText.includes(searchText);

            if ((dateFrom || dateTo) && exp.createdAt) {
                const created = new Date(exp.createdAt);
                if (dateFrom && created < new Date(dateFrom)) return false;
                if (dateTo && created > new Date(dateTo + 'T23:59:59')) return false;
            }

            return matchSearch;
        })
        : [];

    const handleEvidenceClick = (exp: Expenditure) => {
        const evidenceStatus = exp.evidenceStatus || '';
        if (evidenceStatus === 'PENDING') {
            toast('Chưa đến hạn nộp bằng chứng.');
            return;
        }
        if (evidenceStatus === 'SUBMITTED' || evidenceStatus === 'APPROVED') {
            router.push(`/post?target=evidence&targetId=${exp.id}`);
            return;
        }
        if (exp.disbursementProofUrl) {
            window.open(exp.disbursementProofUrl, '_blank');
        }
    };

    if (loading) {
        return <div className="expenditure-tab"><p style={{ textAlign: 'center', padding: 40 }}>Đang tải...</p></div>;
    }

    if (!stats) {
        return <div className="expenditure-tab"><p style={{ textAlign: 'center', padding: 40 }}>Không có dữ liệu.</p></div>;
    }

    const totalReceivedFromGeneralFund = Number(stats.totalReceivedFromGeneralFund ?? 0);

    return (
        <div className="expenditure-tab">
            <div className="cash-summary">
                <CashMetric
                    title="Tổng nhận"
                    value={formatCurrency(Number(stats.totalReceived))}
                    icon={<img src={stats.iconTotalReceived} alt="tong-nhan" width={18} height={18} />}
                    color="red"
                />
                <CashMetric
                    title="Tổng nhận từ quỹ chung"
                    value={formatCurrency(totalReceivedFromGeneralFund)}
                    icon={<img src={ICON_GENERAL_FUND} alt="tu-quy-chung" width={18} height={18} />}
                    color="green"
                />
                <CashMetric
                    title="Tổng chi"
                    value={formatCurrency(Number(stats.totalSpent))}
                    icon={<img src={stats.iconTotalSpent} alt="tong-chi" width={18} height={18} />}
                    color="rose"
                />
                <CashMetric
                    title="Số dư hiện tại"
                    value={formatCurrency(Number(stats.currentBalance))}
                    icon={<img src={stats.iconCurrentBalance} alt="so-du" width={18} height={18} />}
                    color="orange"
                />
            </div>

            <div className="toolbar">
                <div className="toolbar-row">
                    <div className="search-box">
                        <Search size={14} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm theo tên quỹ, chi tiêu..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {search && (
                            <button className="clear-btn" onClick={() => setSearch('')}>
                                <X size={12} />
                            </button>
                        )}
                    </div>
                    <div className="date-range">
                        <span className="date-label">Từ</span>
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="date-input" />
                        <span className="date-label">Đến</span>
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="date-input" />
                        {(dateFrom || dateTo) && (
                            <button className="clear-btn" onClick={() => { setDateFrom(''); setDateTo(''); }}>
                                <X size={12} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="exp-table">
                    <thead>
                        <tr>
                            <th>Chi tiêu</th>
                            <th>Tên quỹ</th>
                            <th>Số tiền</th>
                            <th>Thời gian tạo</th>
                            <th>Hạn nộp bằng chứng</th>
                            <th>Bằng chứng</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExpenditures.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>
                                    Không có khoản chi tiêu nào.
                                </td>
                            </tr>
                        ) : (
                            filteredExpenditures.map((exp) => (
                                <tr key={exp.id}>
                                    <td className="plan-col">{exp.plan || '-'}</td>
                                    <td className="campaign-col">
                                        {stats.campaignMap?.[exp.campaignId] || `Quỹ #${exp.campaignId}`}
                                    </td>
                                    <td className="amount">{formatCurrency(Number(exp.totalAmount))}</td>
                                    <td className="date-col">{formatDate(exp.createdAt)}</td>
                                    <td className="date-col">{formatDate(exp.evidenceDueAt)}</td>
                                    <td className="center-cell">
                                        <button
                                            className="evidence-btn"
                                            onClick={() => handleEvidenceClick(exp)}
                                            title="Xem bằng chứng"
                                        >
                                            <FileText size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
        .expenditure-tab { padding: 24px; display: flex; flex-direction: column; }
        .cash-summary { display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }

        .toolbar { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
        .toolbar-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }

        .search-box {
            position: relative; display: flex; align-items: center;
            background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0 10px;
            min-width: 220px; flex: 1; max-width: 300px;
        }
        .search-box input {
            border: none; outline: none; background: transparent; padding: 8px 6px;
            font-size: 13px; color: #334155; width: 100%;
        }
        .search-box input::placeholder { color: #94a3b8; }
        .search-icon { color: #94a3b8; flex-shrink: 0; }
        .clear-btn {
            background: none; border: none; cursor: pointer; color: #94a3b8;
            display: flex; align-items: center; padding: 2px; border-radius: 4px; flex-shrink: 0;
        }
        .clear-btn:hover { color: #475569; }

        .date-range { display: flex; align-items: center; gap: 6px; }
        .date-label { font-size: 12px; font-weight: 600; color: #64748b; white-space: nowrap; }
        .date-input {
            border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px;
            font-size: 12px; color: #334155; background: #fff; cursor: pointer;
        }
        .date-input:focus { outline: none; border-color: #f97316; }

        .table-wrapper { background: #fff; border-radius: 12px; border: 1px solid #f1f5f9; overflow: auto; max-height: 520px; }
        .exp-table { width: 100%; border-collapse: collapse; text-align: left; }
        th { padding: 12px 16px; font-size: 12px; font-weight: 700; color: #64748b; background: #f8fafc; border-bottom: 1px solid #f1f5f9; position: sticky; top: 0; z-index: 1; white-space: nowrap; }
        td { padding: 12px 16px; font-size: 13px; color: #334155; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }

        .plan-col { font-weight: 600; color: #1e293b; max-width: 200px; }
        .campaign-col { color: #64748b; font-size: 12px; max-width: 140px; }
        .date-col { color: #64748b; font-size: 12px; white-space: nowrap; }
        .amount { font-weight: 800; color: #111827; }
        .center-cell { text-align: center; }

        .evidence-btn {
            display: inline-flex; align-items: center; justify-content: center;
            background: #fff; border: 1px solid #e2e8f0; border-radius: 6px;
            padding: 5px 8px; cursor: pointer; color: #64748b; transition: all 0.2s;
        }
        .evidence-btn:hover { background: #fff7ed; border-color: #f97316; color: #f97316; }

      `}</style>
        </div>
    );
};

export default ExpenditureTab;