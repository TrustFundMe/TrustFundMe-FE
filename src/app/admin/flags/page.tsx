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
      return <span className={`${base} bg-zinc-100 text-zinc-400`}><span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />Từ chối</span>;
    default:
      return <span className={`${base} bg-zinc-100 text-zinc-500`}>{status}</span>;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
            <Flag className="w-6 h-6 text-[#F84D43]" />
            Flag Management
            {pendingCount > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-[#F84D43] text-white text-xs font-black px-2.5 py-0.5 min-w-[24px]">
                {pendingCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">{flags.length} báo cáo · {pendingCount} đang chờ xử lý</p>
        </div>
        <button onClick={loadFlags} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors">
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo lý do, ID bài viết..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A685B]/20 focus:border-[#1A685B]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="text-sm border border-zinc-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1A685B]/20">
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'Tất cả trạng thái' : s === 'PENDING' ? 'Chờ duyệt' : s === 'RESOLVED' ? 'Đã xử lý' : 'Từ chối'}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Table */}
        <div className={`bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden ${selectedFlag ? 'flex-1' : 'w-full'}`}>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#1A685B]" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-500">
              <AlertCircle className="w-8 h-8" />
              <p className="text-sm font-semibold">{error}</p>
              <button onClick={loadFlags} className="text-sm text-[#1A685B] underline">Thử lại</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-400">
              <Flag className="w-10 h-10 opacity-30" />
              <p className="text-sm font-semibold">Không có báo cáo nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/60">
                    <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">ID</th>
                    <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Lý do</th>
                    <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Đối tượng</th>
                    <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Người báo cáo</th>
                    <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Trạng thái</th>
                    <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Ngày tạo</th>
                    <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {pageFlags.map((flag) => (
                    <tr key={flag.id}
                      onClick={() => setSelectedFlag(selectedFlag?.id === flag.id ? null : flag)}
                      className={`hover:bg-zinc-50/50 transition-colors cursor-pointer ${selectedFlag?.id === flag.id ? 'bg-[#1A685B]/5 border-l-2 border-[#1A685B]' : ''}`}>
                      <td className="px-5 py-4 text-zinc-400 font-mono text-xs">#{flag.id}</td>
                      <td className="px-5 py-4 max-w-[200px]">
                        <p className="text-zinc-700 text-xs truncate font-medium">{flag.reason}</p>
                      </td>
                      <td className="px-5 py-4">
                        {flag.postId && (
                          <Link href={`/post/${flag.postId}`} target="_blank" onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium">
                            Post #{flag.postId} <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                        {flag.campaignId && (
                          <Link href={`/campaigns-details?id=${flag.campaignId}`} target="_blank" onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-xs text-[#1A685B] hover:underline font-medium ml-1">
                            Campaign #{flag.campaignId} <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-zinc-500 font-mono">User #{flag.userId}</td>
                      <td className="px-5 py-4"><StatusPill status={flag.status} /></td>
                      <td className="px-5 py-4 text-xs text-zinc-500 whitespace-nowrap">{formatDate(flag.createdAt)}</td>
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        {flag.status === 'PENDING' ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleReview(flag.id, 'RESOLVED')}
                              disabled={processingId === flag.id}
                              className="p-2 rounded-xl hover:bg-[#1A685B]/10 text-zinc-400 hover:text-[#1A685B] transition-colors disabled:opacity-50"
                              title="Duyệt (Resolved)"
                            >
                              {processingId === flag.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleReview(flag.id, 'DISMISSED')}
                              disabled={processingId === flag.id}
                              className="p-2 rounded-xl hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors disabled:opacity-50"
                              title="Từ chối (Dismissed)"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedFlag && (
          <div className="w-72 flex-shrink-0 bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 space-y-4 self-start sticky top-0">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-zinc-900 text-sm">Chi tiết báo cáo #{selectedFlag.id}</h3>
              <button onClick={() => setSelectedFlag(null)} className="text-zinc-400 hover:text-zinc-700 text-xs">✕</button>
            </div>
            <StatusPill status={selectedFlag.status} />
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Lý do</p>
                <p className="text-zinc-700 leading-relaxed">{selectedFlag.reason}</p>
              </div>
              {selectedFlag.postId && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Bài viết liên quan</p>
                  <Link href={`/post/${selectedFlag.postId}`} target="_blank"
                    className="inline-flex items-center gap-1.5 text-blue-600 hover:underline font-semibold text-sm">
                    Xem bài viết #{selectedFlag.postId} <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
              {selectedFlag.campaignId && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Chiến dịch liên quan</p>
                  <Link href={`/campaigns-details?id=${selectedFlag.campaignId}`} target="_blank"
                    className="inline-flex items-center gap-1.5 text-[#1A685B] hover:underline font-semibold text-sm">
                    Xem chiến dịch #{selectedFlag.campaignId} <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Người báo cáo</p>
                <p className="text-zinc-700 font-mono">User #{selectedFlag.userId}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Ngày báo cáo</p>
                <p className="text-zinc-700">{formatDate(selectedFlag.createdAt)}</p>
              </div>
            </div>
            {selectedFlag.status === 'PENDING' && (
              <div className="flex flex-col gap-2 pt-2 border-t border-zinc-100">
                <button
                  onClick={() => handleReview(selectedFlag.id, 'RESOLVED')}
                  disabled={processingId === selectedFlag.id}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1A685B] text-white text-sm font-bold hover:bg-[#155a4d] transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Duyệt báo cáo
                </button>
                <button
                  onClick={() => handleReview(selectedFlag.id, 'DISMISSED')}
                  disabled={processingId === selectedFlag.id}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 text-sm font-bold hover:bg-zinc-50 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Từ chối
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">Hiển thị {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} / {filtered.length} báo cáo</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 disabled:opacity-40 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = currentPage <= 3 ? i + 1 : currentPage + i - 2;
              if (page < 1 || page > totalPages) return null;
              return (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors ${page === currentPage ? 'bg-[#1A685B] text-white' : 'border border-zinc-200 hover:bg-zinc-50 text-zinc-600'}`}>
                  {page}
                </button>
              );
            })}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 disabled:opacity-40 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
