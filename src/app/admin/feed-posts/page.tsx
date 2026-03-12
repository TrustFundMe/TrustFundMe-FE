'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Search, Trash2, Eye, ChevronLeft, ChevronRight, Loader2, AlertCircle,
  MessageSquare, Filter, RefreshCw, Pin, Lock, LockOpen, PinOff, Flag,
  CheckCircle, XCircle
} from 'lucide-react';
import Link from 'next/link';
import { feedPostService } from '@/services/feedPostService';
import { dtoToFeedPost } from '@/lib/feedPostUtils';
import type { FeedPost } from '@/types/feedPost';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';

const STATUS_OPTIONS = ['ALL', 'ACTIVE', 'DRAFT'];
const TYPE_OPTIONS = ['ALL', 'GENERAL', 'CAMPAIGN'];
const PAGE_SIZE = 15;

function StatusPill({ status }: { status: string }) {
  const base = 'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider';
  switch (status) {
    case 'ACTIVE':
      return <span className={`${base} bg-[#1A685B]/10 text-[#1A685B]`}><span className="h-1.5 w-1.5 rounded-full bg-[#1A685B] animate-pulse" />Đang hoạt động</span>;
    case 'DRAFT':
      return <span className={`${base} bg-amber-50 text-amber-700`}><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Bản nháp</span>;
    default:
      return <span className={`${base} bg-slate-100 text-slate-500`}>{status}</span>;
  }
}

function TypePill({ type }: { type: string }) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider';
  return type === 'CAMPAIGN'
    ? <span className={`${base} bg-blue-50 text-blue-700`}>Chiến dịch</span>
    : <span className={`${base} bg-slate-100 text-slate-500`}>Chung</span>;
}

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

interface PostWithFlags extends FeedPost {
  flagCount?: number;
}

export default function AdminFeedPostsPage() {
  const [posts, setPosts] = useState<PostWithFlags[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      let dtos;
      try {
        const res = await fetch(API_ENDPOINTS.FEED_POSTS.ADMIN_ALL + '?page=0&size=200', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          dtos = Array.isArray(data) ? data : (data.content ?? []);
        } else {
          throw new Error('fallback');
        }
      } catch {
        dtos = await feedPostService.getAll();
      }
      setPosts(dtos.map((d: Parameters<typeof dtoToFeedPost>[0]) => dtoToFeedPost(d)));
    } catch (e: unknown) {
      setError((e as Error)?.message ?? 'Không tải được danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPosts(); }, []);

  const handleDelete = async (post: PostWithFlags) => {
    if (!confirm(`Bạn có chắc muốn xóa bài viết "${post.title ?? post.content.slice(0, 40)}..."?`)) return;
    setProcessingId(post.id);
    setProcessingAction('delete');
    try {
      const res = await fetch(API_ENDPOINTS.FEED_POSTS.ADMIN_DELETE(post.id), { method: 'DELETE', credentials: 'include' });
      if (!res.ok) await feedPostService.delete(Number(post.id));
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch {
      alert('Xóa thất bại. Vui lòng thử lại.');
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleTogglePin = async (post: PostWithFlags) => {
    setProcessingId(post.id);
    setProcessingAction('pin');
    try {
      const res = await fetch(API_ENDPOINTS.FEED_POSTS.ADMIN_PIN(post.id), { method: 'PATCH', credentials: 'include' });
      if (res.ok) {
        const updated = await res.json();
        setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, isPinned: updated.isPinned } : p));
      }
    } catch {
      alert('Thao tác thất bại.');
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleToggleLock = async (post: PostWithFlags) => {
    setProcessingId(post.id);
    setProcessingAction('lock');
    try {
      const res = await fetch(API_ENDPOINTS.FEED_POSTS.ADMIN_LOCK(post.id), { method: 'PATCH', credentials: 'include' });
      if (res.ok) {
        const updated = await res.json();
        setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, isLocked: updated.isLocked } : p));
      }
    } catch {
      alert('Thao tác thất bại.');
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleToggleStatus = async (post: PostWithFlags) => {
    const newStatus = post.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
    setProcessingId(post.id);
    setProcessingAction('status');
    try {
      const res = await fetch(API_ENDPOINTS.FEED_POSTS.ADMIN_STATUS(post.id), {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, status: newStatus } : p));
      }
    } catch {
      alert('Thao tác thất bại.');
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchSearch = !search ||
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.content.toLowerCase().includes(search.toLowerCase()) ||
        p.author.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const matchType = typeFilter === 'ALL' || p.type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [posts, search, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagePosts = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const pinnedCount = posts.filter((p) => p.isPinned).length;
  const lockedCount = posts.filter((p) => p.isLocked).length;

  const isProcessing = (id: string, action: string) =>
    processingId === id && processingAction === action;

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-[#1A685B]" />
            Quản lý bảng tin
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {posts.length} bài viết · {pinnedCount} đang ghim · {lockedCount} đang khóa
          </p>
        </div>
        <button
          onClick={loadPosts}
          className="flex items-center gap-2 px-5 py-2.5 rounded-3xl border-2 border-slate-100 text-sm font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-shrink-0">
        {[
          { label: 'Tổng bài viết', value: posts.length, color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-100' },
          { label: 'Đang hoạt động', value: posts.filter((p) => p.status === 'ACTIVE').length, color: 'text-[#1A685B]', bg: 'bg-[#1A685B]/5', border: 'border-[#1A685B]/10' },
          { label: 'Đang ghim', value: pinnedCount, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
          { label: 'Đang khóa', value: lockedCount, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} ${stat.border} rounded-2xl p-4 border shadow-sm`}>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1 font-bold">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-3 flex-shrink-0">
        <div className="relative group/search flex-[2] max-w-2xl w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within/search:text-[#F84D43] transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề, nội dung, tác giả..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full bg-white border-2 border-slate-100 rounded-3xl pl-12 pr-4 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-[#F84D43]/5 focus:border-[#F84D43] transition-all shadow-xl shadow-slate-100/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-full md:w-44 rounded-3xl border-2 border-slate-100 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#F84D43]/5 focus:border-[#F84D43] transition-all shadow-xl shadow-slate-100/50 cursor-pointer appearance-none"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2003/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1rem' }}
          >
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'Tất cả trạng thái' : s}</option>)}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            className="w-full md:w-44 rounded-3xl border-2 border-slate-100 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#F84D43]/5 focus:border-[#F84D43] transition-all shadow-xl shadow-slate-100/50 cursor-pointer appearance-none"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2003/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1rem' }}
          >
            {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t === 'ALL' ? 'Tất cả loại' : t}</option>)}
          </select>

          {(search !== '' || statusFilter !== 'ALL' || typeFilter !== 'ALL') && (
            <button
              onClick={() => { setSearch(''); setStatusFilter('ALL'); setTypeFilter('ALL'); setCurrentPage(1); }}
              className="px-6 py-3.5 rounded-3xl bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-200 hover:text-slate-900 transition-all ml-auto"
            >
              Xóa lọc
            </button>
          )}
        </div>
      </div>

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
            <button onClick={loadPosts} className="mt-4 text-red-500 text-sm font-black uppercase tracking-widest hover:text-red-600 transition-colors">Thử lại</button>
          </div>
        )}

        <div className="h-full overflow-auto custom-scrollbar">
          <table className="min-w-full text-sm border-separate border-spacing-0">
            <thead className="sticky top-0 z-30 bg-slate-50">
              <tr className="text-left">
                <th className="py-3.5 pl-8 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">ID</th>
                <th className="py-3.5 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Bài viết</th>
                <th className="py-3.5 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Tác giả</th>
                <th className="py-3.5 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Loại</th>
                <th className="py-3.5 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Trạng thái</th>
                <th className="py-3.5 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Flags</th>
                <th className="py-3.5 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Thống kê</th>
                <th className="py-3.5 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Ngày tạo</th>
                <th className="py-3.5 pr-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right border-b border-slate-100">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pagePosts.map((post) => (
                <tr key={post.id} className={`h-[68px] group hover:bg-slate-50/30 transition-colors ${post.isPinned ? 'bg-orange-50/30' : ''}`}>
                  <td className="py-2 pl-8 pr-4 text-slate-400 font-mono text-xs">#{post.id}</td>
                  <td className="py-2 pr-4 max-w-[220px]">
                    <div className="flex items-start gap-1.5">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 group-hover:text-[#F84D43] transition-colors truncate text-xs">
                          {post.title || '(Không có tiêu đề)'}
                        </div>
                        <div className="text-slate-400 text-xs truncate mt-0.5 font-medium">{post.content.replace(/<[^>]+>/g, '').slice(0, 55)}...</div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                        {post.isPinned && <Pin className="w-3 h-3 text-orange-500" />}
                        {post.isLocked && <Lock className="w-3 h-3 text-red-500" />}
                      </div>
                    </div>
                  </td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 flex-shrink-0">
                        {post.author.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-slate-700 font-bold text-xs truncate max-w-[90px]">{post.author.name}</span>
                    </div>
                  </td>
                  <td className="py-2 pr-4"><TypePill type={post.type} /></td>
                  <td className="py-2 pr-4">
                    <button
                      onClick={() => handleToggleStatus(post)}
                      disabled={processingId === post.id}
                      title={`Chuyển sang ${post.status === 'ACTIVE' ? 'Draft' : 'Active'}`}
                      className="hover:opacity-70 transition-opacity disabled:opacity-50"
                    >
                      <StatusPill status={post.status} />
                    </button>
                  </td>
                  <td className="py-2 pr-4">
                    {(post.flagCount ?? 0) > 0 ? (
                      <Link href="/admin/flags" className="inline-flex items-center gap-1 text-xs text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full hover:bg-red-100 transition-colors">
                        <Flag className="w-3 h-3" />
                        {post.flagCount}
                      </Link>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-2 pr-4 text-xs text-slate-500 space-y-0.5">
                    <div className="font-medium">{post.likeCount} likes · {post.replyCount} comments</div>
                    <div>{post.viewCount} views</div>
                  </td>
                  <td className="py-2 pr-4 text-xs text-slate-500 whitespace-nowrap font-medium">{formatDate(post.createdAt)}</td>
                  <td className="py-2 pr-8 text-right">
                    <div className="flex justify-end gap-1 transition-all">
                      {/* View */}
                      <Link href={`/post/${post.id}`} target="_blank"
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-lg transition-all" title="Xem bài viết">
                        <Eye className="h-4 w-4" />
                      </Link>

                      {/* Pin / Unpin */}
                      <button
                        onClick={() => handleTogglePin(post)}
                        disabled={processingId === post.id}
                        className={`p-2 rounded-xl transition-all disabled:opacity-50 ${post.isPinned ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' : 'text-slate-400 hover:text-orange-600 hover:bg-white hover:shadow-lg'}`}
                        title={post.isPinned ? 'Bỏ ghim' : 'Ghim bài viết'}
                      >
                        {isProcessing(post.id, 'pin') ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : post.isPinned ? (
                          <PinOff className="h-4 w-4" />
                        ) : (
                          <Pin className="h-4 w-4" />
                        )}
                      </button>

                      {/* Lock / Unlock */}
                      <button
                        onClick={() => handleToggleLock(post)}
                        disabled={processingId === post.id}
                        className={`p-2 rounded-xl transition-all disabled:opacity-50 ${post.isLocked ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'text-slate-400 hover:text-red-600 hover:bg-white hover:shadow-lg'}`}
                        title={post.isLocked ? 'Mở khóa' : 'Khóa bình luận'}
                      >
                        {isProcessing(post.id, 'lock') ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : post.isLocked ? (
                          <LockOpen className="h-4 w-4" />
                        ) : (
                          <Lock className="h-4 w-4" />
                        )}
                      </button>

                      {/* Toggle Status */}
                      <button
                        onClick={() => handleToggleStatus(post)}
                        disabled={processingId === post.id}
                        className={`p-2 rounded-xl transition-all disabled:opacity-50 ${post.status === 'ACTIVE' ? 'text-slate-400 hover:text-amber-600 hover:bg-white hover:shadow-lg' : 'text-slate-400 hover:text-[#1A685B] hover:bg-white hover:shadow-lg'}`}
                        title={post.status === 'ACTIVE' ? 'Chuyển về Draft' : 'Kích hoạt'}
                      >
                        {isProcessing(post.id, 'status') ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : post.status === 'ACTIVE' ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(post)}
                        disabled={processingId === post.id}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-white hover:shadow-lg transition-all disabled:opacity-50"
                        title="Xóa bài viết"
                      >
                        {isProcessing(post.id, 'delete') ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="h-8 w-8 text-slate-300" />
                      </div>
                      <p className="font-bold text-slate-500">Không tìm thấy bài viết nào.</p>
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
            Hiển thị {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} / {filtered.length} bài viết
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:shadow-md transition-all disabled:opacity-30 disabled:hover:shadow-none"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </button>
            <div className="flex gap-1">
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
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:shadow-md transition-all disabled:opacity-30 disabled:hover:shadow-none"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
