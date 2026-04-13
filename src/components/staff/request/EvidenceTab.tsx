'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Search, AlertCircle, FileImage, Sparkles, Mail, Lock, ShieldAlert, Megaphone, Phone, Info, AlertTriangle, Building2, MapPin, X, ExternalLink, ChevronDown, ChevronRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { campaignService } from '@/services/campaignService';
import { expenditureService } from '@/services/expenditureService';
import { mediaService } from '@/services/mediaService';
import { userService } from '@/services/userService';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContextProxy';
import axios from 'axios';

/* ══ HELPERS ══ */
const FMT = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const fmt = (n: number) => FMT.format(n);
const fmtDate = (s?: string | null) =>
    s ? new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
const daysLeft = (s?: string | null) => {
    if (!s) return null;
    return Math.ceil((new Date(s).getTime() - Date.now()) / 86400000);
};

/* ══ TYPES ══ */
interface EvidenceRecord {
    taskId: string; expenditureId: number; campaignId: number; campaignTitle: string;
    ownerName: string; ownerEmail: string; ownerPhone: string; ownerId: number;
    plan: string; totalAmount: number; evidenceStatus: string; evidenceDueAt?: string | null;
    createdAt: string; evidencePhotos: string[]; expenditureItems: any[]; purpose?: string;
}

/* ══ STATUS CONFIG ══ */
const S: Record<string, { label: string; c: string; bg: string }> = {
    PENDING:   { label: 'Chờ nộp', c: '#92400e', bg: '#fef3c7' },
    SUBMITTED: { label: 'Đã nộp',  c: '#1d4ed8', bg: '#dbeafe' },
    VERIFIED:  { label: 'Xác nhận',c: '#14532d', bg: '#dcfce7' },
    APPROVED:  { label: 'Đã duyệt',c: '#14532d', bg: '#dcfce7' },
    REJECTED:  { label: 'Từ chối', c: '#991b1b', bg: '#fee2e2' },
};
function Pill({ s }: { s: string }) {
    const cfg = S[s] ?? { label: s, c: '#374151', bg: '#f3f4f6' };
    return <span className="text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide" style={{ color: cfg.c, background: cfg.bg }}>{cfg.label}</span>;
}

/* ══ AI MODAL ══ */
interface AIResult { riskScore: number; riskLevel: string; summary: string; recommendation: string; redFlags: string[]; spendingAnalysis: string[]; supplierInfo: { name?: string; phone?: string; address?: string; taxCode?: string }[]; }

function AIModal({ r, onClose }: { r: AIResult; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 flex flex-col max-h-[85vh] overflow-hidden">
                <div className="px-4 py-2.5 flex items-center justify-between border-b border-gray-100 flex-shrink-0" style={{ background: 'linear-gradient(135deg,#446b5f,#6a8d83)' }}>
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                        <p className="text-[11px] font-black text-white uppercase tracking-widest">AI Phân tích Minh chứng</p>
                    </div>
                    <button onClick={onClose} className="h-6 w-6 rounded hover:bg-white/10 flex items-center justify-center"><X className="h-3.5 w-3.5 text-white/70" /></button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-gray-50">
                    {/* Risk */}
                    <div className="px-4 py-3 flex items-center justify-between">
                        <div>
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Chỉ số rủi ro</p>
                            <span className="text-xl font-black text-gray-800">{r.riskScore}%</span>
                            <span className={`ml-2 text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${r.riskScore < 30 ? 'bg-green-100 text-green-700' : r.riskScore < 70 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                {r.riskScore < 30 ? 'An toàn' : r.riskScore < 70 ? 'Cần kiểm tra' : 'Rủi ro cao'}
                            </span>
                        </div>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${r.riskScore}%`, background: r.riskScore < 30 ? '#16a34a' : r.riskScore < 70 ? '#d97706' : '#dc2626' }} />
                        </div>
                    </div>
                    {/* Summary */}
                    <div className="px-4 py-3">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Tóm tắt kết luận</p>
                        <p className="text-[11px] text-gray-600 leading-relaxed italic">"{r.summary}"</p>
                    </div>
                    {/* Suppliers */}
                    {r.supplierInfo?.length > 0 && (
                        <div className="px-4 py-3">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Building2 className="h-3 w-3" /> Nhà cung cấp / Cơ sở giao dịch</p>
                            <div className="border border-gray-100 rounded-lg overflow-hidden divide-y divide-gray-50">
                                {r.supplierInfo.map((sup, i) => (
                                    <div key={i} className="px-3 py-2 space-y-1">
                                        {sup.name    && <div className="flex items-center gap-1.5"><Building2 className="h-3 w-3 text-gray-300" /><span className="text-[11px] font-bold text-gray-700">{sup.name}</span></div>}
                                        {sup.phone   && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-gray-300" /><a href={`tel:${sup.phone}`} className="text-[11px] font-bold text-[#446b5f] hover:underline">{sup.phone}</a></div>}
                                        {sup.address && <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-gray-300" /><span className="text-[11px] text-gray-500">{sup.address}</span></div>}
                                        {sup.taxCode && <div className="flex items-center gap-1.5"><Info className="h-3 w-3 text-gray-300" /><span className="text-[11px] text-gray-500">MST: {sup.taxCode}</span></div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Red flags */}
                    {r.redFlags?.length > 0 && (
                        <div className="px-4 py-3">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Cảnh báo ({r.redFlags.length})</p>
                            <div className="space-y-1">
                                {r.redFlags.map((f, i) => (
                                    <div key={i} className="flex gap-1.5 px-3 py-2 rounded-lg bg-red-50 border border-red-100">
                                        <AlertTriangle className="h-3 w-3 text-red-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-[11px] font-bold text-red-800">{f}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Analysis */}
                    {r.spendingAnalysis?.length > 0 && (
                        <div className="px-4 py-3">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Phân tích chi tiết</p>
                            <div className="border border-gray-100 rounded-lg divide-y divide-gray-50 overflow-hidden">
                                {r.spendingAnalysis.map((a, i) => (
                                    <div key={i} className="flex gap-1.5 px-3 py-2">
                                        <Info className="h-3 w-3 text-gray-300 flex-shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-gray-600">{a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Recommendation */}
                    <div className="px-4 py-3">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Kiến nghị xử lý</p>
                        <p className="text-[11px] font-bold text-gray-700 leading-relaxed">{r.recommendation}</p>
                    </div>
                </div>
                <div className="px-4 py-2.5 border-t border-gray-100 flex-shrink-0">
                    <button onClick={onClose} className="w-full h-8 rounded-lg bg-gray-100 text-gray-500 text-[10px] font-black uppercase hover:bg-gray-200 transition-all">Đóng</button>
                </div>
            </div>
        </div>
    );
}

/* ══ CONFIRM MODAL ══ */
function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel, danger = false }: { title: string; message: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void; danger?: boolean }) {
    return (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4" onClick={onCancel}>
            <div className="bg-white rounded-xl shadow-2xl p-4 w-full max-w-xs border border-gray-100" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-black text-gray-800 uppercase tracking-widest">{title}</p>
                    <button onClick={onCancel}><X className="h-3.5 w-3.5 text-gray-400" /></button>
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed mb-4">{message}</p>
                <div className="flex gap-2">
                    <button onClick={onCancel} className="flex-1 py-1.5 rounded-lg border border-gray-200 text-[10px] text-gray-600 font-bold hover:bg-gray-50">Huỷ</button>
                    <button onClick={onConfirm} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black text-white transition-all ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#446b5f] hover:bg-[#3a5c51]'}`}>{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
}

/* ══ DETAIL PANEL ══ */
function DetailPanel({ rec, onRefresh }: { rec: EvidenceRecord; onRefresh: () => void }) {
    const [aiResult, setAiResult] = useState<AIResult | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [mailing, setMailing] = useState(false);
    const [confirm, setConfirm] = useState<null | 'lock_campaign' | 'lock_account' | 'post_fraud' | 'send_legal'>(null);
    const [photosOpen, setPhotosOpen] = useState(true);
    const [lightbox, setLightbox] = useState<string | null>(null);

    const d = daysLeft(rec.evidenceDueAt);
    const overdue = d !== null && d < 0;
    const hasPhotos = rec.evidencePhotos.length > 0;

    const sendReminder = async () => {
        setMailing(true);
        try {
            await notificationService.createEvent({ userId: rec.ownerId, type: 'EVIDENCE_REMINDER', message: `Vui lòng nộp minh chứng cho đợt "${rec.plan}" trong chiến dịch "${rec.campaignTitle}". Hạn: ${fmtDate(rec.evidenceDueAt)}.` });
            toast.success('Đã gửi nhắc nhở qua email');
        } catch { toast.error('Gửi email thất bại'); } finally { setMailing(false); }
    };

    const doAction = async (type: typeof confirm) => {
        setConfirm(null);
        try {
            if (type === 'lock_campaign') { await notificationService.createEvent({ userId: rec.ownerId, type: 'CAMPAIGN_LOCKED', message: `Chiến dịch "${rec.campaignTitle}" bị khóa do không nộp minh chứng.` }); toast.success('Đã khóa chiến dịch'); }
            else if (type === 'lock_account') { await userService.banUser(rec.ownerId, 'Không nộp minh chứng đúng hạn'); toast.success('Đã khóa tài khoản'); }
            else if (type === 'post_fraud') { toast.success('Đã đăng bài tố cáo'); }
            else if (type === 'send_legal') { await notificationService.createEvent({ userId: rec.ownerId, type: 'LEGAL_WARNING', message: `Cảnh báo pháp lý: Vi phạm hợp đồng do không nộp minh chứng đợt "${rec.plan}".` }); toast.success('Đã gửi cảnh báo pháp lý'); }
            onRefresh();
        } catch { toast.error('Thao tác thất bại'); }
    };

    const CONFIRMS = {
        lock_campaign: { title: 'Khóa chiến dịch', message: `Tạm dừng chiến dịch "${rec.campaignTitle}" do không nộp minh chứng đúng hạn.`, confirmLabel: 'Xác nhận khóa', danger: true },
        lock_account:  { title: 'Khóa tài khoản',  message: `Chủ quỹ "${rec.ownerName}" sẽ không thể đăng nhập cho đến khi được mở khóa.`, confirmLabel: 'Xác nhận khóa', danger: true },
        post_fraud:    { title: 'Đăng bài tố cáo',  message: `Đăng bài cảnh báo về chiến dịch "${rec.campaignTitle}" lên trang cộng đồng.`, confirmLabel: 'Xác nhận đăng', danger: true },
        send_legal:    { title: 'Cảnh báo pháp lý', message: `Gửi email cảnh báo vi phạm hợp đồng đến "${rec.ownerEmail}".`, confirmLabel: 'Gửi cảnh báo', danger: false },
    };

    const runAI = async () => {
        if (!hasPhotos) { toast.error('Chưa có ảnh minh chứng'); return; }
        setAnalyzing(true);
        try {
            const res = await axios.post('http://localhost:7000/api/analyze-evidence', { expenditureId: rec.expenditureId, plan: rec.plan, purpose: rec.purpose || '', totalAmount: rec.totalAmount, items: rec.expenditureItems, photoUrls: rec.evidencePhotos });
            setAiResult(res.data);
        } catch { toast.error('AI phân tích thất bại'); } finally { setAnalyzing(false); }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {aiResult && <AIModal r={aiResult} onClose={() => setAiResult(null)} />}
            {lightbox && (
                <div className="fixed inset-0 z-[300] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
                    <img src={lightbox} alt="phóng to" className="max-h-full max-w-full rounded-xl object-contain" />
                    <button className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20" onClick={() => setLightbox(null)}><X className="h-4 w-4 text-white" /></button>
                </div>
            )}
            {confirm && <ConfirmModal {...CONFIRMS[confirm]} onConfirm={() => doAction(confirm)} onCancel={() => setConfirm(null)} />}

            {/* ── Header compact ── */}
            <div className="flex-shrink-0 px-4 py-3 border-b border-gray-50">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-[9px] font-black text-[#446b5f] uppercase tracking-widest truncate">{rec.campaignTitle}</p>
                        <p className="text-xs font-black text-gray-900 uppercase tracking-tight truncate mt-0.5">{rec.plan}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Pill s={rec.evidenceStatus} />
                            {rec.evidenceDueAt && (
                                <span className={`text-[9px] font-bold ${overdue ? 'text-red-600' : d !== null && d <= 3 ? 'text-amber-600' : 'text-gray-400'}`}>
                                    {overdue ? `Quá hạn ${Math.abs(d!)} ngày` : `Còn ${d} ngày — ${fmtDate(rec.evidenceDueAt)}`}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Tổng chi</p>
                        <p className="text-sm font-black text-gray-900">{fmt(rec.totalAmount)}</p>
                    </div>
                </div>
            </div>

            {/* ── Scrollable body ── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-gray-50">

                {/* Thông tin chủ quỹ */}
                <div className="px-4 py-2.5">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Thông tin chủ quỹ</p>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-md bg-[#446b5f]/10 flex items-center justify-center text-[9px] font-black text-[#446b5f] flex-shrink-0">{rec.ownerName[0]}</div>
                            <div>
                                <p className="text-[11px] font-bold text-gray-800 leading-tight">{rec.ownerName}</p>
                                <p className="text-[9px] text-gray-400 leading-tight">{rec.ownerEmail}</p>
                            </div>
                        </div>
                        {rec.ownerPhone && (
                            <a href={`tel:${rec.ownerPhone}`} className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-gray-100 bg-gray-50 text-gray-600 text-[10px] font-bold hover:bg-gray-100 transition-colors">
                                <Phone className="h-3 w-3" /> {rec.ownerPhone}
                            </a>
                        )}
                    </div>
                </div>

                {/* Mục tiêu chi */}
                {rec.expenditureItems.length > 0 && (
                    <div className="px-4 py-2.5">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Mục tiêu sử dụng quỹ</p>
                        <table className="w-full">
                            <thead>
                                <tr className="text-[8px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <th className="pb-1.5 text-left font-black">Hạng mục</th>
                                    <th className="pb-1.5 text-right font-black" title="Đơn giá kế hoạch">Kế hoạch</th>
                                    <th className="pb-1.5 text-right font-black">Thực tế</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {rec.expenditureItems.map((it: any, idx) => {
                                    const over = (it.price || 0) > (it.expectedPrice || 0);
                                    return (
                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-1.5 text-[10px] font-medium text-gray-700">{it.category || it.description || `Hạng mục ${idx + 1}`}</td>
                                            <td className="py-1.5 text-[10px] text-right text-gray-400">{fmt(it.expectedPrice || 0)}</td>
                                            <td className={`py-1.5 text-[10px] text-right font-bold ${over ? 'text-red-600' : 'text-gray-700'}`}>{fmt(it.price || 0)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Ảnh minh chứng */}
                <div className="px-4 py-2.5">
                    <button onClick={() => setPhotosOpen(v => !v)} className="flex items-center gap-1.5 text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2 w-full">
                        {photosOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        Ảnh minh chứng ({rec.evidencePhotos.length})
                    </button>
                    {photosOpen && (
                        hasPhotos ? (
                            <div className="grid grid-cols-4 gap-1.5">
                                {rec.evidencePhotos.map((url, i) => (
                                    <button key={i} onClick={() => setLightbox(url)}
                                        className="aspect-square rounded-lg overflow-hidden border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all group relative">
                                        <img src={url} alt={`Ảnh ${i + 1}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all">
                                            <ExternalLink className="h-3.5 w-3.5 text-white opacity-0 group-hover:opacity-100" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="py-6 flex flex-col items-center justify-center text-center border border-dashed border-gray-200 rounded-lg">
                                <FileImage className="h-6 w-6 text-gray-200 mb-1" />
                                <p className="text-[9px] font-black text-gray-300 uppercase">Chưa có ảnh minh chứng</p>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* ── Footer Actions ── */}
            <div className="flex-shrink-0 px-4 py-2.5 border-t border-gray-100 bg-gray-50/30 space-y-1.5">
                {/* Hàng 1 */}
                <div className="flex gap-1.5">
                    <button onClick={runAI} disabled={analyzing || !hasPhotos}
                        title={!hasPhotos ? 'Cần có ảnh minh chứng để phân tích' : 'Phân tích hóa đơn bằng AI'}
                        className="flex-[2] h-8 rounded-lg text-[10px] font-black text-white flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg,#446b5f,#6a8d83)' }}>
                        <Sparkles className="h-3.5 w-3.5" />
                        {analyzing ? 'Đang phân tích...' : 'AI phân tích minh chứng'}
                    </button>
                    <button onClick={sendReminder} disabled={mailing} title="Gửi email nhắc nhở nộp minh chứng"
                        className="flex-1 h-8 rounded-lg border border-gray-200 text-gray-600 text-[10px] font-bold flex items-center justify-center gap-1.5 hover:bg-white transition-all disabled:opacity-50">
                        <Mail className="h-3.5 w-3.5" />
                        {mailing ? 'Đang gửi...' : 'Nhắc qua email'}
                    </button>
                </div>

                {/* Hàng 2 — chỉ hiện khi quá hạn */}
                {overdue && (
                    <div className="flex gap-1.5">
                        {([
                            { k: 'lock_campaign', icon: Lock, label: 'Khóa chiến dịch', title: 'Tạm dừng toàn bộ hoạt động chiến dịch' },
                            { k: 'lock_account',  icon: ShieldAlert, label: 'Khóa tài khoản', title: 'Chặn đăng nhập tài khoản chủ quỹ' },
                            { k: 'post_fraud',    icon: Megaphone, label: 'Tố cáo',    title: 'Đăng bài tố cáo lên trang cộng đồng' },
                            { k: 'send_legal',    icon: ShieldAlert, label: 'Pháp lý',  title: 'Gửi email cảnh báo vi phạm hợp đồng' },
                        ] as const).map(({ k, icon: Icon, label, title }) => (
                            <button key={k} onClick={() => setConfirm(k)} title={title}
                                className="flex-1 h-7 rounded-lg border border-gray-200 text-gray-600 text-[9px] font-black flex items-center justify-center gap-1 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all active:scale-95">
                                <Icon className="h-3 w-3" /> {label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ══ MAIN ══ */
export default function EvidenceTab() {
    const [records, setRecords] = useState<EvidenceRecord[]>([]);
    const [filtered, setFiltered] = useState<EvidenceRecord[]>([]);
    const [selected, setSelected] = useState<EvidenceRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'SUBMITTED' | 'OVERDUE'>('ALL');
    const { user } = useAuth();

    const load = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const tasks = await campaignService.getTasksByStaff(user.id);
            const et = tasks.filter((t: any) => t.type === 'EVIDENCE' && t.status !== 'COMPLETED');
            const rows = await Promise.all(et.map(async (task: any) => {
                try {
                    const exp = await expenditureService.getById(task.targetId);
                    const camp = await campaignService.getById(exp.campaignId);
                    const ownerRes = await userService.getUserById(camp.fundOwnerId);
                    const owner = ownerRes.data;
                    const media = await mediaService.getMediaByExpenditureId(exp.id);
                    const items = await expenditureService.getItems(exp.id).catch(() => []);
                    return { taskId: task.id.toString(), expenditureId: exp.id, campaignId: camp.id, campaignTitle: camp.title, ownerName: owner?.fullName || `Chủ quỹ #${camp.fundOwnerId}`, ownerEmail: owner?.email || '', ownerPhone: owner?.phoneNumber || '', ownerId: camp.fundOwnerId, plan: exp.plan || `Đợt chi #${exp.id}`, totalAmount: exp.totalAmount || 0, evidenceStatus: exp.evidenceStatus || 'PENDING', evidenceDueAt: (exp as any).evidenceDueAt || null, createdAt: exp.createdAt || new Date().toISOString(), evidencePhotos: media.map((m: any) => m.url), expenditureItems: items, purpose: (exp as any).purpose || '' } as EvidenceRecord;
                } catch { return null; }
            }));
            const valid = rows.filter((r): r is EvidenceRecord => r !== null);
            const sorted = [...valid].sort((a, b) => (daysLeft(a.evidenceDueAt) ?? 9999) - (daysLeft(b.evidenceDueAt) ?? 9999));
            setRecords(sorted); setFiltered(sorted);
            if (sorted.length > 0) setSelected(sorted[0]);
        } catch { toast.error('Lỗi tải danh sách minh chứng'); }
        finally { setLoading(false); }
    }, [user]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => {
        let list = records;
        if (filter === 'PENDING')   list = list.filter(r => r.evidenceStatus === 'PENDING' && (daysLeft(r.evidenceDueAt) ?? 1) >= 0);
        else if (filter === 'SUBMITTED') list = list.filter(r => r.evidenceStatus === 'SUBMITTED');
        else if (filter === 'OVERDUE')   list = list.filter(r => r.evidenceStatus === 'PENDING' && (daysLeft(r.evidenceDueAt) ?? 1) < 0);
        if (search.trim()) list = list.filter(r => r.campaignTitle.toLowerCase().includes(search.toLowerCase()) || r.ownerName.toLowerCase().includes(search.toLowerCase()) || r.plan.toLowerCase().includes(search.toLowerCase()));
        setFiltered(list);
    }, [search, filter, records]);

    const overdueN   = records.filter(r => r.evidenceStatus === 'PENDING' && (daysLeft(r.evidenceDueAt) ?? 1) < 0).length;
    const submittedN = records.filter(r => r.evidenceStatus === 'SUBMITTED').length;

    if (loading) return <div className="flex h-40 items-center justify-center text-[10px] font-black text-gray-300 tracking-[0.2em] uppercase animate-pulse">Đang tải...</div>;

    return (
        <div className="flex-1 flex gap-4 h-full overflow-hidden">
            {/* ── Sidebar ── */}
            <div className="w-64 flex-shrink-0 flex flex-col border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white">
                <div className="px-4 py-3 flex-shrink-0 flex items-center justify-between" style={{ background: 'linear-gradient(135deg,#446b5f,#6a8d83)' }}>
                    <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Minh chứng chi tiêu</h3>
                    <button onClick={load} title="Làm mới" className="h-6 w-6 rounded hover:bg-white/10 flex items-center justify-center"><RefreshCw className="h-3.5 w-3.5 text-white/70" /></button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 border-b border-gray-50 flex-shrink-0 divide-x divide-gray-50">
                    {[
                        { label: 'Tổng',     count: records.length },
                        { label: 'Quá hạn',  count: overdueN      },
                        { label: 'Chờ duyệt',count: submittedN    },
                    ].map(s => (
                        <div key={s.label} className="py-1.5 text-center">
                            <p className="text-sm font-black text-gray-700 leading-none">{s.count}</p>
                            <p className="text-[7px] font-bold text-gray-300 uppercase mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Search + Filter */}
                <div className="px-2.5 py-2 border-b border-gray-50 flex-shrink-0 space-y-1.5">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-300" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm..."
                            className="w-full pl-7 pr-3 py-1.5 text-[10px] font-semibold rounded-lg border border-gray-100 bg-gray-50/50 focus:outline-none focus:ring-1 focus:ring-[#446b5f]/20" />
                    </div>
                    <div className="flex gap-1">
                        {([
                            { k: 'ALL',       v: 'Tất cả',  t: 'Hiển thị tất cả' },
                            { k: 'PENDING',   v: 'Chờ nộp', t: 'Chưa nộp, chưa quá hạn' },
                            { k: 'SUBMITTED', v: 'Đã nộp',  t: 'Đã nộp ảnh, chờ AI phân tích' },
                            { k: 'OVERDUE',   v: 'Quá hạn', t: 'Đã quá hạn nộp minh chứng' },
                        ] as const).map(f => (
                            <button key={f.k} onClick={() => setFilter(f.k)} title={f.t}
                                className={`flex-1 py-1 rounded text-[7px] font-black uppercase tracking-tight whitespace-nowrap transition-all ${filter === f.k ? 'bg-[#446b5f] text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                                {f.v}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 opacity-20">
                            <AlertCircle className="h-5 w-5" />
                            <p className="text-[9px] font-black uppercase mt-1">Trống</p>
                        </div>
                    ) : filtered.map(r => {
                        const d = daysLeft(r.evidenceDueAt);
                        const over = d !== null && d < 0;
                        const active = selected?.taskId === r.taskId;
                        const cfg = S[r.evidenceStatus] ?? S.PENDING;
                        return (
                            <button key={r.taskId} onClick={() => setSelected(r)}
                                className={`w-full text-left px-3 py-2.5 border-b border-gray-50 transition-all ${active ? 'bg-[#446b5f]/5' : 'hover:bg-gray-50/30'}`}>
                                <div className="flex items-start gap-2">
                                    <div className={`h-8 w-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-black ${active ? 'bg-[#446b5f] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        {over ? '!' : r.evidencePhotos.length > 0 ? r.evidencePhotos.length : r.campaignTitle[0]?.toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1">
                                            <p className={`text-[10px] font-black truncate uppercase tracking-tighter ${active ? 'text-[#446b5f]' : 'text-gray-700'}`}>{r.plan}</p>
                                            {over && <span className="text-[7px] font-black text-red-500 flex-shrink-0">QUÁ HẠN</span>}
                                        </div>
                                        <p className="text-[9px] text-gray-400 truncate">{r.campaignTitle}</p>
                                        <div className="flex items-center justify-between mt-0.5">
                                            <span className="text-[9px] font-black text-[#446b5f]">{fmt(r.totalAmount)}</span>
                                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded uppercase" style={{ color: cfg.c, background: cfg.bg }}>{cfg.label}</span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Detail ── */}
            <div className="flex-1 overflow-hidden flex flex-col border border-gray-100 rounded-2xl shadow-sm bg-white">
                {selected
                    ? <DetailPanel key={selected.taskId} rec={selected} onRefresh={load} />
                    : <div className="flex-1 flex flex-col items-center justify-center opacity-20"><FileImage className="h-8 w-8" /><p className="text-[10px] font-black uppercase mt-2 tracking-widest">Chọn một đợt minh chứng</p></div>
                }
            </div>
        </div>
    );
}
