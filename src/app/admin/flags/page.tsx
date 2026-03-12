'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Flag, CheckCircle, XCircle, Eye, ChevronLeft, ChevronRight, Loader2, AlertCircle, ExternalLink, RefreshCw, Filter } from 'lucide-react';
import Link from 'next/link';
import { flagService, FlagDto } from '@/services/flagService';

const STATUS_OPTIONS = ['ALL', 'PENDING', 'RESOLVED', 'DISMISSED'];
const PAGE_SIZE = 15;

function StatusPill({ status }: { status: string }) {
  const base = 'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider';
  switch (status) {
    case 'PENDING':
      return <span className={`${base} bg-amber-50 text-amber-700`}><span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />Chờ duyệt</span>;
    case 'RESOLVED':
      return <span className={`${base} bg-[#1A685B]/10 text-[#1A685B]`}><span className="h-1.5 w-1.5 rounded-full bg-[#1A685B]" />Đã xử lý</span>;
    case 'DISMISSED':
      return <span className={`${base} bg-slate-100 text-slate-400`}><span className="h-1.5 w-1.5 rounded-full bg-slate-400" />Từ chối</span>;
    default:
      return <span className={`${base} bg-slate-100 text-slate-500`}>{status}</span>;
  }
}

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminFlagsPage() {
  const [flags, setFlags] = useState<FlagDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [selectedFlag, setSelectedFlag] = useState<FlagDto | null>(null);

  const loadFlags = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await flagService.getPendingFlags();
      setFlags(data);
    } catch (e: unknown) {
      setError((e as Error)?.message ?? 'Không tải được danh sách báo cáo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFlags(); }, []);

  const handleReview = async (flagId: number, status: 'RESOLVED' | 'DISMISSED') => {
    setProcessingId(flagId);
    try {
      const updated = await flagService.reviewFlag(flagId, status);
      setFlags((prev) => prev.map((f) => f.id === flagId ? updated : f));
      if (selectedFlag?.id === flagId) setSelectedFlag(updated);
    } catch {
      alert('Xử lý thất bại. Vui lòng thử lại.');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = useMemo(() => {
    return flags.filter((f) => {
      const matchSearch = !search ||
        f.reason.toLowerCase().includes(search.toLowerCase()) ||
        String(f.postId ?? '').includes(search) ||
        String(f.campaignId ?? '').includes(search);
      const matchStatus = statusFilter === 'ALL' || f.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [flags, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageFlags = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const pendingCount = flags.filter((f) => f.status === 'PENDING').length;

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Flag className="w-6 h-6 text-[#F84D43]" />
            Quản lý báo cáo
            {pendingCount > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-[#F84D43] text-white text-xs font-black px-2.5 py-0.5 min-w-[24px]">
                {pendingCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{flags.length} báo cáo · {pendingCount} đang chờ xử lý</p>
        </div>
        <button onClick={loadFlags} className="flex items-center gap-2 px-5 py-2.5 rounded-3xl border-2 border-slate-100 text-sm font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all">
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-3 flex-shrink-0">
        <div className="relative group/search flex-[2] max-w-2xl w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within/search:text-[#F84D43] transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm theo lý do, ID bài viết..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full bg-white border-2 border-slate-100 rounded-3xl pl-12 pr-4 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-[#F84D43]/5 focus:border-[#F84D43] transition-all shadow-xl shadow-slate-100/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-shrink-0">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-full md:w-48 rounded-3xl border-2 border-slate-100 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#F84D43]/5 focus:border-[#F84D43] transition-all shadow-xl shadow-slate-100/50 cursor-pointer appearance-none"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2003/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1rem' }}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'Tất cả trạng thái' : s === 'PENDING' ? 'Chờ duyệt' : s === 'RESOLVED' ? 'Đã xử lý' : 'Từ chối'}</option>)}
          </select>

          {(search !== '' || statusFilter !== 'ALL') && (
            <button
              onClick={() => { setSearch(''); setStatusFilter('ALL'); setCurrentPage(1); }}
              className="px-6 py-3.5 rounded-3xl bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-200 hover:text-slate-900 transition-all ml-auto"
            >
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Table */}
        <div className="flex flex-col rounded-[32px] border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 relative flex-1 min-h-0 overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <Loader2 className="h-10 w-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
              <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
              <p className="text-sm font-bold text-slate-600">{error}</p>
              <button onClick={loadFlags} className="mt-4 text-red-500 text-sm font-black uppercase tracking-widest hover:text-red-600 transition-colors">Thử lại</button>
            </div>
          )}

          <div className="h-full overflow-auto custom-scrollbar">
            <table className="min-w-full text-sm border-separate border-spacing-0">
              <thead className="bg-slate-50">
                <tr className="text-left">
                  <th className="py-3.5 pl-8 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">ID</th>
                  <th className="py-3.5 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Lý do</th>
                  <th className="py-3.5 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Đối tượng</th>
                  <th className="py-3.5 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Người báo cáo</th>
                  <th className="py-3.5 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Trạng thái</th>
                  <th className="py-3.5 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Ngày tạo</th>
                  <th className="py-3.5 pr-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right border-b border-slate-100">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pageFlags.map((flag) => (
                  <tr key={flag.id}
                    onClick={() => setSelectedFlag(selectedFlag?.id === flag.id ? null : flag)}
                    className={`h-[68px] group hover:bg-slate-50/30 transition-colors cursor-pointer ${selectedFlag?.id === flag.id ? 'bg-[#1A685B]/5 border-l-4 border-[#1A685B]' : ''}`}>
                    <td className="py-2 pl-8 pr-4 text-slate-400 font-mono text-xs">#{flag.id}</td>
                    <td className="py-2 pr-4 max-w-[200px]">
                      <p className="text-slate-700 text-xs truncate font-bold">{flag.reason}</p>
                    </td>
                    <td className="py-2 pr-4">
                      {flag.postId && (
                        <Link href={`/post/${flag.postId}`} target="_blank" onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-bold">
                          Post #{flag.postId} <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                      {flag.campaignId && (
                        <Link href={`/campaigns-details?id=${flag.campaignId}`} target="_blank" onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs text-[#1A685B] hover:underline font-bold ml-1">
                          Campaign #{flag.campaignId} <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-xs text-slate-500 font-mono font-bold">User #{flag.userId}</td>
                    <td className="py-2 pr-4"><StatusPill status={flag.status} /></td>
                    <td className="py-2 pr-4 text-xs text-slate-500 whitespace-nowrap font-medium">{formatDate(flag.createdAt)}</td>
                    <td className="py-2 pr-8 text-right" onClick={(e) => e.stopPropagation()}>
                      {flag.status === 'PENDING' ? (
                        <div className="flex justify-end gap-1 transition-all">
                          <button
                            onClick={() => handleReview(flag.id, 'RESOLVED')}
                            disabled={processingId === flag.id}
                            className="p-2 rounded-xl text-slate-400 hover:text-[#1A685B] hover:bg-white hover:shadow-lg transition-all disabled:opacity-50"
                            title="Duyệt (Resolved)"
                          >
                            {processingId === flag.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleReview(flag.id, 'DISMISSED')}
                            disabled={processingId === flag.id}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-white hover:shadow-lg transition-all disabled:opacity-50"
                            title="Từ chối (Dismissed)"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}

                {!loading && !error && filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-24 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                          <Flag className="h-8 w-8 text-slate-300" />
                        </div>
                        <p className="font-bold text-slate-500">Không có báo cáo nào.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Section - Always visible at bottom */}
          <div className="flex-shrink-0 border-t border-slate-100 bg-slate-50/50 px-8 py-3 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Hiển thị {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} / {filtered.length} báo cáo
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:shadow-md transition-all disabled:opacity-30 disabled:hover:shadow-none">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, i, arr) => (
                  <div key={p} className="flex items-center">
                    {i > 0 && arr[i - 1] !== p - 1 && <span className="px-1 text-slate-300">...</span>}
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${currentPage === p ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                    >
                      {p}
                    </button>
                  </div>
                ))}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:shadow-md transition-all disabled:opacity-30 disabled:hover:shadow-none">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        {selectedFlag && (
          <div className="w-80 flex-shrink-0 bg-white rounded-[32px] border border-slate-100 shadow-2xl shadow-slate-200/50 p-6 space-y-4 self-start sticky top-0">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-sm">Chi tiết báo cáo #{selectedFlag.id}</h3>
              <button onClick={() => setSelectedFlag(null)} className="text-slate-400 hover:text-slate-700 text-xs">✕</button>
            </div>
            <StatusPill status={selectedFlag.status} />
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Lý do</p>
                <p className="text-slate-700 leading-relaxed font-medium">{selectedFlag.reason}</p>
              </div>
              {selectedFlag.postId && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Bài viết liên quan</p>
                  <Link href={`/post/${selectedFlag.postId}`} target="_blank"
                    className="inline-flex items-center gap-1.5 text-blue-600 hover:underline font-bold text-sm">
                    Xem bài viết #{selectedFlag.postId} <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
              {selectedFlag.campaignId && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Chiến dịch liên quan</p>
                  <Link href={`/campaigns-details?id=${selectedFlag.campaignId}`} target="_blank"
                    className="inline-flex items-center gap-1.5 text-[#1A685B] hover:underline font-bold text-sm">
                    Xem chiến dịch #{selectedFlag.campaignId} <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Người báo cáo</p>
                <p className="text-slate-700 font-mono font-bold">User #{selectedFlag.userId}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Ngày báo cáo</p>
                <p className="text-slate-700 font-medium">{formatDate(selectedFlag.createdAt)}</p>
              </div>
            </div>
            {selectedFlag.status === 'PENDING' && (
              <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleReview(selectedFlag.id, 'RESOLVED')}
                  disabled={processingId === selectedFlag.id}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#1A685B] text-white text-xs font-black uppercase tracking-widest hover:bg-[#155a4d] transition-all shadow-lg shadow-[#1A685B]/20 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Duyệt báo cáo
                </button>
                <button
                  onClick={() => handleReview(selectedFlag.id, 'DISMISSED')}
                  disabled={processingId === selectedFlag.id}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Từ chối
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
