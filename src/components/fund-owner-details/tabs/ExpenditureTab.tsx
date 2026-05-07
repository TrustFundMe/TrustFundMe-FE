import React, { useEffect, useState } from 'react';
import { FileText, Search, X, Loader2, TrendingUp, TrendingDown, Wallet, ChevronDown, ChevronUp } from 'lucide-react';
import { campaignService } from '@/services/campaignService';
import { paymentService, CassoTransaction } from '@/services/paymentService';
import type { CampaignDto } from '@/types/campaign';

const formatCurrency = (amount: number): string => {
    if (!amount && amount !== 0) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
};

const ExpenditureTab = ({ id }: { id: string | number }) => {
    const [loading, setLoading] = useState(true);
    const [campaigns, setCampaigns] = useState<CampaignDto[]>([]);
    const [allTransactions, setAllTransactions] = useState<(CassoTransaction & { campaignTitle?: string })[]>([]);
    const [search, setSearch] = useState('');
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    const toggleRow = (txId: number) => {
        setExpandedRows(prev => {
            const next = new Set(prev);
            if (next.has(txId)) next.delete(txId);
            else next.add(txId);
            return next;
        });
    };

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const camps: CampaignDto[] = await campaignService.getByFundOwner(Number(id));
                setCampaigns(camps);

                const txnPromises = camps.map(async (camp: CampaignDto) => {
                    try {
                        const txns = await paymentService.getCassoTransactionsByCampaign(camp.id);
                        console.log(`[ExpenditureTab] Campaign ${camp.id} (${camp.title}): ${txns.length} casso txns`);
                        return txns.map((t: CassoTransaction) => ({ ...t, campaignTitle: camp.title }));
                    } catch (e) {
                        console.error(`[ExpenditureTab] Failed to fetch casso for campaign ${camp.id}:`, e);
                        return [] as (CassoTransaction & { campaignTitle?: string })[];
                    }
                });

                const results = await Promise.all(txnPromises);
                const merged = results.flat().sort(
                    (a: CassoTransaction, b: CassoTransaction) => new Date(b.transactionDate || b.createdAt).getTime() - new Date(a.transactionDate || a.createdAt).getTime()
                );
                setAllTransactions(merged);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [id]);

    const totalIn = allTransactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const totalOut = allTransactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

    const filtered = allTransactions.filter(t => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            (t.campaignTitle || '').toLowerCase().includes(q) ||
            (t.description || '').toLowerCase().includes(q) ||
            (t.donorName || '').toLowerCase().includes(q) ||
            (t.counterAccountName || '').toLowerCase().includes(q)
        );
    });

    const fmtSender = (t: CassoTransaction) => {
        const n = t.counterAccountName;
        const b = t.counterAccountBankName || t.bankAbbreviation;
        if (n && b) return `${n} (${b})`;
        if (n) return n;
        if (t.counterAccountNumber && b) return `${t.counterAccountNumber} - ${b}`;
        if (t.counterAccountNumber) return t.counterAccountNumber;
        if (b) return b;
        return '—';
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 60, fontFamily: 'var(--font-dm-sans)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <Loader2 className="animate-spin" size={32} style={{ color: '#ff5e14' }} />
                    <span style={{ color: '#0f172a', fontWeight: 700, fontSize: 14 }}>Đang tải dữ liệu giao dịch...</span>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: 24, fontFamily: 'var(--font-dm-sans)' }}>
            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                <div style={{ background: '#fff', border: '2px solid #bbf7d0', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={16} style={{ color: '#16a34a' }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 1 }}>Tổng nhận</span>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#16a34a' }}>+{formatCurrency(totalIn)}</div>
                </div>
                <div style={{ background: '#fff', border: '2px solid #fecaca', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingDown size={16} style={{ color: '#dc2626' }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: 1 }}>Tổng chi</span>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#dc2626' }}>-{formatCurrency(totalOut)}</div>
                </div>
                <div style={{ background: '#fff', border: '2px solid #fed7aa', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Wallet size={16} style={{ color: '#0f172a' }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 1 }}>Số dư</span>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>{formatCurrency(totalIn - totalOut)}</div>
                </div>
            </div>

            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{
                    position: 'relative', display: 'flex', alignItems: 'center',
                    background: '#fff', border: '1px solid rgba(15,23,42,0.15)', borderRadius: 8, padding: '0 10px',
                    flex: 1, maxWidth: 350,
                }}>
                    <Search size={14} style={{ color: '#0f172a', opacity: 0.4, flexShrink: 0 }} />
                    <input
                        type="text"
                        placeholder="Tìm theo chiến dịch, nội dung..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ border: 'none', outline: 'none', background: 'transparent', padding: '8px 6px', fontSize: 13, color: '#0f172a', width: '100%', fontFamily: 'inherit' }}
                    />
                    {search && (
                        <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0f172a', opacity: 0.5, display: 'flex', padding: 2 }}>
                            <X size={12} />
                        </button>
                    )}
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                    {filtered.length} / {allTransactions.length} giao dịch
                </span>
            </div>

            {/* Table */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(15,23,42,0.10)', overflow: 'hidden' }}>
                <div style={{ overflowY: 'auto', maxHeight: 520 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#fafafa', position: 'sticky', top: 0, zIndex: 1 }}>
                                <th style={{ padding: '12px 14px', fontSize: 10, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 1.5, borderBottom: '2px solid rgba(15,23,42,0.06)', width: 40 }}>STT</th>
                                <th style={{ padding: '12px 14px', fontSize: 10, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 1.5, borderBottom: '2px solid rgba(15,23,42,0.06)', width: 140 }}>Ngày giờ</th>
                                <th style={{ padding: '12px 14px', fontSize: 10, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 1.5, borderBottom: '2px solid rgba(15,23,42,0.06)', width: 110, textAlign: 'right' }}>Số tiền</th>
                                <th style={{ padding: '12px 14px', fontSize: 10, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 1.5, borderBottom: '2px solid rgba(15,23,42,0.06)' }}>Nội dung</th>
                                <th style={{ padding: '12px 14px', fontSize: 10, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 1.5, borderBottom: '2px solid rgba(15,23,42,0.06)', width: 250 }}>Chiến dịch</th>
                                <th style={{ padding: '12px 14px', fontSize: 10, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 1.5, borderBottom: '2px solid rgba(15,23,42,0.06)', width: 150 }}>Người gửi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: 48 }}>
                                        <FileText size={36} style={{ color: '#e2e8f0', margin: '0 auto 8px', display: 'block' }} />
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Chưa có giao dịch nào</div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((t, idx) => (
                                    <tr key={`${t.id}-${idx}`} style={{ borderBottom: '1px solid rgba(15,23,42,0.04)' }}>
                                        <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{idx + 1}</td>
                                        <td style={{ padding: '12px 14px', fontSize: 12, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>
                                            {new Date(t.transactionDate || t.createdAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                                            <span style={{ fontSize: 13, fontWeight: 800, color: t.amount >= 0 ? '#16a34a' : '#dc2626' }}>
                                                {t.amount >= 0 ? '+' : ''}{new Intl.NumberFormat('vi-VN').format(t.amount)}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 14px' }}>
                                            {t.description && t.description.length > 35 ? (
                                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, flexWrap: 'wrap' }}>
                                                    <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', wordBreak: 'break-all' }}>
                                                        {expandedRows.has(t.id) ? t.description : t.description.slice(0, 35) + '...'}
                                                    </span>
                                                    <button
                                                        onClick={() => toggleRow(t.id)}
                                                        style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 10, fontWeight: 700, color: '#ff5e14', flexShrink: 0 }}
                                                    >
                                                        {expandedRows.has(t.id) ? <>Ẩn <ChevronUp size={10} /></> : <>Thêm <ChevronDown size={10} /></>}
                                                    </button>
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{t.description || '—'}</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#ff5e14', maxWidth: 250, wordBreak: 'break-word' }} title={t.campaignTitle}>
                                            {t.campaignTitle || '—'}
                                        </td>
                                        <td style={{ padding: '12px 14px' }}>
                                            {t.amount < 0 ? (
                                                <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#dc2626', flexShrink: 0 }} />
                                                    Chi phí chiến dịch
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', maxWidth: 140 }} title={t.donorName || fmtSender(t)}>
                                                    {t.donorName || fmtSender(t)}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ExpenditureTab;
