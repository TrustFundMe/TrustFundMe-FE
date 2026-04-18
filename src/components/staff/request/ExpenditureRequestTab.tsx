'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    Search, Filter, ChevronDown, ChevronUp, 
    CheckCircle, AlertCircle, Clock, 
    HandCoins, Search as SearchIcon, X,
    LayoutDashboard, Sparkles, Loader2, Info, ShoppingBag,
    ShieldCheck, AlertTriangle, ShieldAlert
} from 'lucide-react';
import { campaignService } from '@/services/campaignService';
import { expenditureService } from '@/services/expenditureService';
import { Expenditure, ExpenditureItem } from '@/types/expenditure';
import { useAuth } from '@/contexts/AuthContextProxy';
import { toast } from 'react-hot-toast';
import RejectModal from './RejectModal';
import AIAnalysisModal from './AIAnalysisModal';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop';

const fmt = (v: number) => new Intl.NumberFormat('vi-VN').format(v) + ' VND';
const fmtDate = (d: string) => new Date(d).toLocaleDateString('vi-VN');

const STATUS_EXP: Record<string, { label: string; color: string; bg: string }> = {
    'PENDING':              { label: 'Chờ duyệt',    color: '#f59e0b', bg: '#fffbeb' },
    'PENDING_REVIEW':       { label: 'Chờ duyệt',    color: '#f59e0b', bg: '#fffbeb' },
    'APPROVED':             { label: 'Đã duyệt',     color: '#10b981', bg: '#ecfdf5' },
    'WITHDRAWAL_REQUESTED': { label: 'Đã duyệt',     color: '#10b981', bg: '#ecfdf5' },
    'CLOSED':               { label: 'Đã duyệt',     color: '#10b981', bg: '#ecfdf5' },
    'REJECTED':             { label: 'Từ chối',     color: '#ef4444', bg: '#fef2f2' },
    'DISBURSED':            { label: 'Đã giải ngân', color: '#0369a1', bg: '#e0f2fe' },
    'COMPLETED':            { label: 'Hoàn tất',     color: '#059669', bg: '#f0fdf4' },
};

const EVIDENCE_STATUS: Record<string, { label: string; color: string; bg: string }> = {
    'NOT_SUBMITTED': { label: 'Chưa nộp MC',    color: '#94a3b8', bg: '#f8fafc' },
    'SUBMITTED':     { label: 'Đã nộp — chờ', color: '#f59e0b', bg: '#fffbeb' },
    'APPROVED':      { label: 'MC hợp lệ',       color: '#10b981', bg: '#ecfdf5' },
    'REJECTED':      { label: 'MC không hợp lệ', color: '#ef4444', bg: '#fef2f2' },
};

const CAM_TYPE: Record<string, string> = { 'AUTHORIZED': 'Ủy Quyền', 'ITEMIZED': 'Vật Phẩm' };

/* ════════════════════════════ SUB-COMPONENTS ════════════════════════════ */

// Hiện 1 badge duy nhất: ưu tiên evidence status nếu đã nộp, ngược lại hiện expenditure status
const CombinedStatusPill = ({ expStatus, evidenceStatus }: { expStatus: string; evidenceStatus?: string }) => {
    const evKey = (evidenceStatus ?? '').toUpperCase();
    const exKey = (expStatus ?? '').toUpperCase();
    // Nếu evidence đã nộp (SUBMITTED / APPROVED / REJECTED) → hiện badge evidence
    if (evKey && evKey !== 'NOT_SUBMITTED' && EVIDENCE_STATUS[evKey]) {
        const cfg = EVIDENCE_STATUS[evKey];
        return (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border"
                style={{ color: cfg.color, backgroundColor: cfg.bg, borderColor: `${cfg.color}30` }}>
                {cfg.label}
            </span>
        );
    }
    // Ngược lại hiện expenditure status
    const cfg = STATUS_EXP[exKey] ?? { label: 'Không rõ', color: '#6b7280', bg: '#f3f4f6' };
    return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border"
            style={{ color: cfg.color, backgroundColor: cfg.bg, borderColor: `${cfg.color}30` }}>
            {cfg.label}
        </span>
    );
};

const ItemTable = ({ items, totalExpected }: { items: ExpenditureItem[], totalExpected: number }) => (
    <table className="w-full text-left border-collapse table-fixed">
        <thead className="sticky top-0 bg-white z-10">
            <tr className="border-b border-gray-100">
                <th className="py-2 px-2 text-[10px] font-bold text-gray-400 uppercase w-1/3">Hạng mục</th>
                <th className="py-2 px-2 text-[10px] font-bold text-gray-400 uppercase text-right">Đơn giá</th>
                <th className="py-2 px-2 text-[10px] font-bold text-gray-400 uppercase text-right w-10">SL</th>
                <th className="py-2 px-2 text-[10px] font-bold text-gray-400 uppercase text-right w-1/4">Thành tiền</th>
                <th className="py-2 px-2 text-[10px] font-bold text-gray-400 uppercase text-right">Ghi chú</th>
            </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
            {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-2 text-[11px] font-medium text-gray-700 truncate">{item.category}</td>
                    <td className="py-2 px-2 text-right text-[11px] text-gray-500">{fmt(item.expectedPrice || item.price || 0)}</td>
                    <td className="py-2 px-2 text-right text-[11px] font-bold text-gray-600">{item.quantity}</td>
                    <td className="py-2 px-2 text-right text-[11px] font-bold text-gray-900">{fmt((item.expectedPrice || item.price || 0) * item.quantity)}</td>
                    <td className="py-2 px-2 text-right text-[10px] text-gray-400 truncate italic">{item.note || '—'}</td>
                </tr>
            ))}
        </tbody>
        <tfoot className="sticky bottom-0 bg-gray-50/50">
            <tr className="border-t border-gray-100">
                <td colSpan={3} className="py-2 px-2 text-[10px] font-bold text-gray-400 uppercase text-right">Tổng cộng</td>
                <td className="py-2 px-2 text-right text-[11px] font-bold text-blue-600">{fmt(totalExpected)}</td>
                <td></td>
            </tr>
        </tfoot>
    </table>
);

/* ══════════════════════════════ EXPENDITURE CARD ══════════════════════════════ */

function ExpenditureCard({ exp, campaignData, onUpdate }: { exp: Expenditure, campaignData: any, onUpdate: any }) {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<ExpenditureItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [analyzingAI, setAnalyzingAI] = useState(false);
    const [aiResult, setAiResult] = useState<any>(null);
    const [showReject, setShowReject] = useState(false);

    const loadItems = useCallback(async () => {
        if (!open || items.length) return;
        setLoading(true);
        try { setItems(await expenditureService.getItems(exp.id)); } finally { setLoading(false); }
    }, [open, exp.id, items.length]);

    useEffect(() => { loadItems(); }, [loadItems]);

    const handleAction = async (method: any, ...args: any) => {
        try {
            setLoading(true);
            const updated = await method(exp.id, ...args);
            onUpdate(updated);
            setShowReject(false);
            toast.success('Thành công');
        } catch { toast.error('Lỗi'); } finally { setLoading(false); }
    };

    const handleAIAnalyze = async () => {
        try {
            setAnalyzingAI(true);
            setAiResult(await expenditureService.analyzeWithAI(campaignData, exp, items));
        } catch (e: any) { toast.error(e.response?.data?.error || 'Lỗi AI'); } finally { setAnalyzingAI(false); }
    };

    return (
        <div className={`border rounded-xl transition-all mb-2 ${open ? 'border-emerald-100 bg-emerald-50/10' : 'border-gray-100 bg-white'}`}>
            <div onClick={() => setOpen(!open)} className="p-3 flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                    <div className={`h-6 w-6 rounded flex items-center justify-center transition-all ${open ? 'bg-[#446b5f] text-white' : 'bg-gray-50 text-gray-400'}`}>
                        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                    <div className="space-y-0.5">
                        <h5 className="text-[11px] font-bold text-gray-900 uppercase leading-none">{exp.plan}</h5>
                        <div className="flex items-center gap-2">
                            <CombinedStatusPill expStatus={exp.status || 'PENDING'} evidenceStatus={exp.evidenceStatus} />
                        </div>
                        {(exp.status === 'REJECTED' || exp.evidenceStatus === 'REJECTED') && exp.rejectReason && (
                            <p className="text-[9px] text-rose-600 font-bold mt-1 bg-rose-50/50 px-2 py-0.5 rounded border border-rose-100/50 italic leading-tight">
                                Lý do: {exp.rejectReason}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {open && (
                <div className="p-3 pt-0 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                        <div className="lg:col-span-8 space-y-3">
                            <div className="bg-white rounded-lg border border-gray-100 overflow-hidden min-h-[100px] max-h-[300px] overflow-y-auto custom-scrollbar">
                                {loading ? <div className="p-10 text-center text-[10px] font-bold text-gray-300 animate-pulse uppercase">Đang tải...</div>
                                    : items.length ? <ItemTable items={items} totalExpected={exp.totalExpectedAmount} />
                                    : <div className="p-10 text-center text-[10px] font-bold text-gray-300 uppercase">Không có dữ liệu</div>}
                            </div>
                        </div>
                        <div className="lg:col-span-4 space-y-3">
                            {exp.accountNumber && (
                                <div className="bg-[#446b5f] rounded-lg p-2.5 text-white">
                                    <p className="text-[9px] font-bold uppercase opacity-60 mb-1">Thụ hưởng</p>
                                    <p className="text-[11px] font-bold tracking-wider leading-none mb-1">{exp.accountNumber}</p>
                                    <p className="text-[10px] opacity-90 truncate">{exp.accountHolderName} • {exp.bankCode}</p>
                                </div>
                            )}
                            {exp.disbursementProofUrl && (
                                <div className="bg-white rounded-lg border border-gray-100 p-1.5">
                                    <a href={exp.disbursementProofUrl} target="_blank" rel="noreferrer" className="block aspect-video rounded-md overflow-hidden bg-gray-50">
                                        <img src={exp.disbursementProofUrl} alt="proof" className="w-full h-full object-cover" />
                                    </a>
                                </div>
                            )}
                            <div className="space-y-1.5">
                                <button onClick={handleAIAnalyze} disabled={analyzingAI} className="w-full h-8 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase flex items-center justify-center gap-2 border border-emerald-100 hover:bg-emerald-100 transition-colors">
                                    {analyzingAI ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} PHÂN TÍCH AI
                                </button>
                                <div className="flex gap-1.5">
                                    {(exp.status === 'PENDING' || exp.status === 'PENDING_REVIEW' || exp.evidenceStatus === 'SUBMITTED') && (
                                        <>
                                            <button onClick={() => setShowReject(true)} className="flex-1 h-8 rounded-lg border border-rose-100 text-rose-500 text-[10px] font-bold uppercase hover:bg-rose-50 transition-colors">TỪ CHỐI</button>
                                            <button onClick={() => exp.evidenceStatus === 'SUBMITTED' ? handleAction(expenditureService.updateEvidenceStatus, 'APPROVED') : handleAction(expenditureService.updateStatus, 'APPROVED')} className="flex-[2] h-8 rounded-lg bg-[#446b5f] text-white text-[10px] font-bold uppercase hover:bg-[#345249] transition-colors shadow-sm">DUYỆT</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showReject && <RejectModal onConfirm={(r: string) => exp.evidenceStatus === 'SUBMITTED' ? handleAction(expenditureService.updateEvidenceStatus, 'REJECTED', r) : handleAction(expenditureService.updateStatus, 'REJECTED', undefined, r)} onCancel={() => setShowReject(false)} />}
            {aiResult && <AIAnalysisModal result={aiResult} onClose={() => setAiResult(null)} />}
        </div>
    );
}

/* ══════════════════════════════ MAIN COMPONENT ══════════════════════════════ */

export default function ExpenditureRequestTab({ initialCampaignId }: { initialCampaignId?: number | null }) {
    const { user } = useAuth();
    const [grouped, setGrouped] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);
    const [selected, setSelected] = useState<any | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); 
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            // 1. Get staff tasks
            const tasks = await campaignService.getTasksByStaff(user.id);
            const expTasks = tasks.filter((t: any) => t.type === 'EXPENDITURE' && t.status !== 'COMPLETED');
            
            if (expTasks.length === 0) {
                setGrouped([]);
                setFiltered([]);
                return;
            }

            // 2. Fetch specific expenditures for these tasks
            const expenditures = await Promise.all(
                expTasks.map(t => expenditureService.getById(t.targetId).catch(() => null))
            );
            const validExps = expenditures.filter(e => e !== null) as Expenditure[];

            // 3. Group them by campaign and fetch needed campaigns
            const campaignIds = [...new Set(validExps.map(e => e.campaignId))];
            const campaigns = await Promise.all(
                campaignIds.map(id => campaignService.getById(id).catch(() => null))
            );
            const validCampaigns = campaigns.filter(c => c !== null);
            const campaignMap = new Map<number, any>();
            validCampaigns.forEach(c => campaignMap.set(c.id, c));

            const groupsMap = new Map<number, any>();
            validExps.forEach(exp => {
                const campaign = campaignMap.get(exp.campaignId);
                if (!campaign) return;

                if (!groupsMap.has(exp.campaignId)) {
                    groupsMap.set(exp.campaignId, {
                        key: `EXP-${campaign.id}`,
                        campaignId: campaign.id,
                        campaignTitle: campaign.title ?? '',
                        campaignType: campaign.type,
                        campaignBalance: campaign.balance ?? 0,
                        campaignRaised: campaign.raisedAmount ?? 0,
                        campaignProgress: (campaign.goalAmount > 0) ? ((campaign.raisedAmount ?? 0) / campaign.goalAmount) * 100 : 0,
                        campaignEnd: campaign.endDate || '',
                        campaignImageUrl: campaign.coverImageUrl,
                        expenditures: [],
                        needsAttention: false
                    });
                }

                const group = groupsMap.get(exp.campaignId);
                group.expenditures.push(exp);
                if (exp.status === 'PENDING' || exp.status === 'PENDING_REVIEW' || exp.evidenceStatus === 'SUBMITTED') {
                    group.needsAttention = true;
                }
            });

            const sorted = Array.from(groupsMap.values()).sort((a, b) => (a.needsAttention ? -1 : 1));
            setGrouped(sorted);
            setFiltered(sorted);

            // Auto-select initial campaign
            if (initialCampaignId) {
                const match = sorted.find(g => g.campaignId === Number(initialCampaignId));
                if (match) setSelected(match);
            }
        } catch (error) {
            console.error('Failed to load expenditure requests:', error);
            toast.error('Lỗi khi tải dữ liệu chi tiêu');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { loadData(); }, [loadData]);

    useEffect(() => {
        let list = grouped;
        if (statusFilter === 'PENDING') list = list.filter(g => g.needsAttention);
        else if (statusFilter === 'APPROVED') list = list.filter(g => !g.needsAttention);
        if (search) list = list.filter(g => g.campaignTitle.toLowerCase().includes(search.toLowerCase()));
        setFiltered(list);
    }, [grouped, statusFilter, search]);

    if (loading && !grouped.length) return <div className="flex-1 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-gray-200" /></div>;

    return (
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 flex-1 overflow-hidden">
                <div className={`flex flex-col border-r border-gray-100 ${selected ? 'lg:col-span-4' : 'lg:col-span-12'}`}>
                    <div className="p-4 border-b border-gray-50 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kiểm soát chi tiêu</h2>
                            <span className="text-[9px] font-bold text-gray-300">{filtered.length} chiến dịch</span>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
                            <input type="text" placeholder="Tìm tên chiến dịch..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-lg py-1.5 pl-9 pr-3 text-[11px] font-medium focus:bg-white focus:border-[#446b5f] transition-all outline-none" />
                        </div>
                        <div className="flex gap-2">
                            {['ALL', 'PENDING', 'APPROVED'].map(f => (
                                <button key={f} onClick={() => setStatusFilter(f)} className={`flex-1 h-7 rounded-md text-[9px] font-bold uppercase transition-all ${statusFilter === f ? 'bg-[#446b5f] text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                                    {f === 'ALL' ? 'Tất cả' : f === 'PENDING' ? 'Mới' : 'Đã duyệt'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className={`flex-1 overflow-y-auto p-4 ${!selected ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-start' : 'space-y-2'}`}>
                        {filtered.map(g => (
                            <div key={g.key} onClick={() => setSelected(g)} className={`p-3.5 rounded-xl border transition-all cursor-pointer h-fit ${selected?.key === g.key ? 'border-[#446b5f] bg-emerald-50/10 shadow-sm shadow-emerald-500/5' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100/50">{(CAM_TYPE as any)[g.campaignType] || 'Cộng đồng'}</span>
                                    {g.needsAttention && <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)] animate-pulse" />}
                                </div>
                                <h3 className={`text-[12px] font-bold uppercase leading-snug mb-3 line-clamp-2 ${selected?.key === g.key ? 'text-[#446b5f]' : 'text-gray-900'}`}>{g.campaignTitle}</h3>
                                <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="text-[8px] font-bold text-gray-400 uppercase">Ngân sách quỹ</p>
                                        <p className="text-[12px] font-bold text-gray-900 leading-none">{fmt(g.campaignBalance)}</p>
                                    </div>
                                    <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                        <HandCoins className="h-4 w-4 text-gray-300" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {selected && (
                    <div className="lg:col-span-8 flex flex-col bg-white overflow-hidden animate-in slide-in-from-right-4 duration-300">
                        <div className="relative h-[120px] flex-shrink-0 group overflow-hidden">
                            <img src={selected.campaignImageUrl || FALLBACK_IMAGE} alt="banner" className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 transition-all duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 h-7 w-7 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/50 transition-all"><X className="h-4 w-4" /></button>
                            <div className="absolute bottom-4 left-6 right-6">
                                <h1 className="text-sm font-bold text-white uppercase tracking-tight line-clamp-1">{selected.campaignTitle}</h1>
                                <p className="text-[9px] font-bold text-white/60 uppercase mt-1 tracking-widest">{selected.campaignType} • {fmtDate(selected.campaignEnd || '')}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 border-b border-gray-50 py-2.5 px-6">
                            <div className="space-y-0.5"><p className="text-[8px] font-bold text-gray-400 uppercase">Ngân sách</p><p className="text-[11px] font-bold text-emerald-600">{fmt(selected.campaignBalance)}</p></div>
                            <div className="space-y-0.5 border-l border-gray-100 pl-4"><p className="text-[8px] font-bold text-gray-400 uppercase">Tiến độ</p><p className="text-[11px] font-bold text-gray-900">{Math.round(selected.campaignProgress)}%</p></div>
                            <div className="space-y-0.5 border-l border-gray-100 pl-4"><p className="text-[8px] font-bold text-gray-400 uppercase">Trạng thái</p><span className="text-[9px] font-bold text-[#446b5f] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 uppercase">Quản lý</span></div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div className="flex items-center gap-2 mb-2 opacity-30"><LayoutDashboard className="h-3 w-3" /><span className="text-[9px] font-bold uppercase tracking-widest">Danh sách đợt chi</span></div>
                            {selected.expenditures.map((e: any) => <ExpenditureCard key={e.id} exp={e} campaignData={selected} onUpdate={(u: any) => {
                                setGrouped(prev => prev.map(g => g.campaignId === selected.campaignId ? { ...g, expenditures: g.expenditures.map((ex: any) => ex.id === u.id ? u : ex), needsAttention: g.expenditures.map((ex: any) => ex.id === u.id ? u : ex).some((nx: any) => nx.status === 'PENDING' || nx.status === 'PENDING_REVIEW' || nx.evidenceStatus === 'SUBMITTED') } : g));
                            }} />)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
