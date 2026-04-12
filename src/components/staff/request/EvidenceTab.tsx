'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
    Search, AlertCircle, Phone, CheckCircle, X
} from 'lucide-react';
import { campaignService } from '@/services/campaignService';
import { expenditureService } from '@/services/expenditureService';
import { mediaService } from '@/services/mediaService';
import { userService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContextProxy';
import type { EvidenceRequest } from './RequestTypes';

const FMT = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const fmt = (n: number) => FMT.format(n);

const EVIDENCE_STATUS_MAP: Record<string, string> = {
    PENDING: 'CHỜ BẰNG CHỨNG',
    SUBMITTED: 'CHỜ DUYỆT',
    VERIFIED: 'ĐÃ XÁC NHẬN',
    APPROVED: 'ĐÃ DUYỆT',
    REJECTED: 'TỪ CHỐI'
};

export default function EvidenceTab() {
    const [requests, setRequests] = useState<EvidenceRequest[]>([]);
    const [filtered, setFiltered] = useState<EvidenceRequest[]>([]);
    const [selected, setSelected] = useState<EvidenceRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { user } = useAuth();

    const loadData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const tasks = await campaignService.getTasksByStaff(user.id);
            const evidenceTasks = tasks.filter(t => t.type === 'EVIDENCE' && t.status !== 'COMPLETED');
            
            const detailedRequests = await Promise.all(
                evidenceTasks.map(async (task) => {
                    try {
                        const exp = await expenditureService.getById(task.targetId);
                        const camp = await campaignService.getById(exp.campaignId);
                        const owner = await userService.getUserById(camp.fundOwnerId);
                        const media = await mediaService.getMediaByExpenditureId(exp.id);
                        
                        return {
                            id: task.id.toString(),
                            createdAt: exp.createdAt || new Date().toISOString(),
                            status: (exp.evidenceStatus || 'PENDING') as any,
                            type: 'EVIDENCE' as const,
                            expenditureId: exp.id,
                            campaignId: camp.id,
                            campaignTitle: camp.title,
                            requesterName: owner.data?.fullName || `Owner #${camp.fundOwnerId}`,
                            phoneNumber: owner.data?.phoneNumber || '',
                            plan: exp.plan || `Đợt chi #${exp.id}`,
                            totalAmount: exp.totalAmount || 0,
                            evidenceStatus: exp.evidenceStatus || 'PENDING',
                            evidencePhotos: media.map(m => m.url)
                        } as EvidenceRequest;
                    } catch (err) {
                        return null;
                    }
                })
            );

            const valid = detailedRequests.filter((r): r is EvidenceRequest => r !== null);
            setRequests(valid);
            setFiltered(valid);
            if (valid.length > 0) setSelected(valid[0]);
        } catch (err) {
            toast.error('Lỗi tải danh sách minh chứng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [user]);

    useEffect(() => {
        const list = requests.filter(r => 
            r.campaignTitle.toLowerCase().includes(search.toLowerCase()) ||
            r.requesterName.toLowerCase().includes(search.toLowerCase()) ||
            r.plan.toLowerCase().includes(search.toLowerCase())
        );
        setFiltered(list);
    }, [search, requests]);

    const handleVerify = async (status: 'APPROVED' | 'REJECTED') => {
        if (!selected) return;
        try {
            await expenditureService.updateEvidenceStatus(selected.expenditureId, status);
            toast.success(status === 'APPROVED' ? 'Đã duyệt minh chứng' : 'Đã từ chối minh chứng');
            setRequests(prev => prev.filter(r => r.expenditureId !== selected.expenditureId));
            setSelected(null);
        } catch (err) {
            toast.error('Cập nhật thất bại');
        }
    };

    if (loading) return <div className="p-10 text-center text-xs font-black text-gray-400 animate-pulse tracking-widest">ĐANG TẢI...</div>;

    return (
        <div className="flex-1 flex gap-4 h-full overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 flex-shrink-0 flex flex-col border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white">
                <div className="px-4 py-3 flex-shrink-0" style={{ background: 'linear-gradient(135deg,#446b5f,#6a8d83)' }}>
                    <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Xác minh Minh chứng</h3>
                </div>
                <div className="p-3 border-b border-gray-50 flex-shrink-0">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm..."
                            className="w-full pl-8 pr-3 py-2 text-xs font-semibold rounded-xl border border-gray-100 bg-gray-50/50" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {filtered.map(r => (
                        <button key={r.id} onClick={() => setSelected(r)}
                            className={`w-full text-left p-4 border-b border-gray-50 transition-all ${selected?.id === r.id ? 'bg-[#db5945]/5' : 'hover:bg-gray-50/50'}`}>
                            <div className="flex gap-3">
                                <div className={`h-10 w-10 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-black ${selected?.id === r.id ? 'bg-[#db5945] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    {r.campaignTitle[0]}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-black text-gray-800 line-clamp-1 uppercase tracking-tighter">{r.plan}</p>
                                    <p className="text-[10px] font-bold text-gray-400 truncate">{r.campaignTitle}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-black text-[#446b5f]">{fmt(r.totalAmount)}</span>
                                        <span className="text-[10px] text-gray-300">•</span>
                                        <span className="text-[9px] font-bold text-blue-500 uppercase">{EVIDENCE_STATUS_MAP[r.evidenceStatus] || r.evidenceStatus}</span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                    {filtered.length === 0 && (
                        <div className="p-10 text-center opacity-20">
                            <AlertCircle className="h-8 w-8 mx-auto" />
                            <p className="text-[10px] font-black mt-2 uppercase">Trống</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col border border-gray-100 rounded-2xl shadow-sm bg-white">
                {selected ? (
                    <div className="flex-1 flex flex-col h-full">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex-shrink-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-[#446b5f] uppercase tracking-widest mb-1">CHIẾN DỊCH: {selected.campaignTitle}</p>
                                    <h2 className="text-xl font-black text-gray-900 uppercase leading-none">{selected.plan}</h2>
                                    <p className="text-xs font-bold text-gray-400 mt-2">Người nộp: {selected.requesterName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">TỔNG TIỀN</p>
                                    <p className="text-2xl font-black text-gray-900 leading-none">{fmt(selected.totalAmount)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
                            {/* Step 1: Call Verification */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="h-6 w-6 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                        <Phone className="h-3.5 w-3.5" />
                                    </div>
                                    <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Bước 1: Liên hệ xác minh</h3>
                                </div>
                                <div className="p-4 rounded-2xl border-2 border-dashed border-blue-100 bg-blue-50/30 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-gray-600">Số điện thoại liên hệ:</p>
                                        <p className="text-lg font-black text-blue-700">
                                            {selected.phoneNumber || <span className="text-gray-400 font-bold italic text-sm">Chưa cập nhật</span>}
                                        </p>
                                    </div>
                                    <a 
                                        href={selected.phoneNumber ? `tel:${selected.phoneNumber}` : '#'} 
                                        onClick={(e) => !selected.phoneNumber && e.preventDefault()}
                                        className={`px-6 py-2.5 rounded-xl text-white text-xs font-black shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
                                            selected.phoneNumber ? 'bg-blue-600 hover:shadow-blue-200' : 'bg-gray-300 cursor-not-allowed shadow-none'
                                        }`}
                                    >
                                        <Phone className="h-5 w-5" /> GỌI NGAY
                                    </a>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 italic">* Vui lòng gọi điện cho các bên liên quan (người nộp hoặc nơi bán) để xác thực tính chính xác của hóa đơn.</p>
                            </section>

                            {/* Step 2: Evidence Photos */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="h-6 w-6 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                        <AlertCircle className="h-3.5 w-3.5" />
                                    </div>
                                    <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Bước 2: Kiểm tra Minh chứng</h3>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {selected.evidencePhotos.map((url, i) => (
                                        <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-zoom-in">
                                            <img src={url} alt="Evidence" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                    {selected.evidencePhotos.length === 0 && (
                                        <div className="col-span-full py-10 text-center text-xs text-gray-300 italic">Không có ảnh minh chứng</div>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Actions */}
                        <div className="p-6 border-t border-gray-50 flex gap-4 bg-gray-50/30 flex-shrink-0">
                            <button onClick={() => handleVerify('REJECTED')}
                                className="flex-1 py-4 rounded-2xl border-2 border-gray-200 text-gray-600 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-red-500 hover:border-red-100 transition-all shadow-sm flex items-center justify-center gap-2">
                                <X className="h-5 w-5" /> TỪ CHỐI MINH CHỨNG
                            </button>
                            <button onClick={() => handleVerify('APPROVED')}
                                className="flex-[2] py-4 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-green-100 hover:shadow-green-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                <CheckCircle className="h-5 w-5" /> XÁC NHẬN ĐÃ GỌI & DUYỆT
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-20">
                        <AlertCircle className="h-10 w-10" />
                        <p className="text-[10px] font-black uppercase mt-2 tracking-widest">Chọn minh chứng để duyệt</p>
                    </div>
                )}
            </div>
        </div>
    );
}
