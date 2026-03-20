'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Search, Trash2, Eye, ChevronLeft, ChevronRight, Loader2, AlertCircle,
  MessageSquare, Filter, RefreshCw, Pin, Lock, LockOpen, PinOff, Flag,
  // status toggle removed (PUBLISHED/DRAFT now read-only in table)
} from 'lucide-react';
import Link from 'next/link';
import { feedPostService } from '@/services/feedPostService';
import { dtoToFeedPost } from '@/lib/feedPostUtils';
import type { FeedPost } from '@/types/feedPost';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContextProxy';

const STATUS_OPTIONS = ['ALL', 'PUBLISHED', 'DRAFT'];
const TYPE_OPTIONS = ['ALL', 'GENERAL', 'CAMPAIGN'];
const PAGE_SIZE = 15;

function StatusPill({ status }: { status: string }) {
  const base = 'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider';
  switch (status) {
    case 'PUBLISHED':
      return <span className={`${base} bg-[#1A685B]/10 text-[#1A685B]`}><span className="h-1.5 w-1.5 rounded-full bg-[#1A685B] animate-pulse" />Đã đăng</span>;
    case 'DRAFT':
      return <span className={`${base} bg-amber-50 text-amber-700`}><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Bản nháp</span>;
    default:
      return <span className={`${base} bg-zinc-100 text-zinc-500`}>{status}</span>;
  }
}

function normalizeType(type: string) {
  return type?.toUpperCase().includes('CAMPAIGN') ? 'CAMPAIGN' : 'GENERAL';
}

function TypePill({ type }: { type: string }) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider';
  const normalized = normalizeType(type);
  return normalized === 'CAMPAIGN'
    ? <span className={`${base} bg-blue-50 text-blue-700`}>Chiến dịch</span>
    : <span className={`${base} bg-zinc-100 text-zinc-500`}>Chung</span>;
}

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

interface PostWithFlags extends FeedPost {
  flagCount?: number;
}

export default function StaffFeedPostPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostWithFlags[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [createdAtOpen, setCreatedAtOpen] = useState(false);
  const [createdAtDetails, setCreatedAtDetails] = useState<{ postTitle?: string; createdAt: string } | null>(null);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      let dtos: Parameters<typeof dtoToFeedPost>[0][];
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
      setPosts(dtos.map((d) => dtoToFeedPost(d) as PostWithFlags));
    } catch (e: unknown) {
      setError('Không thể tải báo cáo bài viết. Vui lòng thử lại sau.');
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
    const role = String(user?.role || '').toUpperCase().replace(/^ROLE_/, '');
    if (role === 'USER') {
      alert('Bạn không có quyền ghim bài viết.');
      return;
    }
    setProcessingId(post.id);
    setProcessingAction('pin');
    try {
      const res = await fetch(API_ENDPOINTS.FEED_POSTS.ADMIN_PIN(post.id), { method: 'PATCH', credentials: 'include' });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Không thể ghim/bỏ ghim bài viết.');
      }
      const updated = await res.json();
      setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, isPinned: updated.isPinned } : p));
    } catch {
      alert('Ghim bài thất bại. Vui lòng thử lại.');
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

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchSearch = !search ||
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.content.toLowerCase().includes(search.toLowerCase()) ||
        p.author.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const matchType = typeFilter === 'ALL' || normalizeType(p.type) === typeFilter;
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-[#1A685B]" />
            Quản lý bài viết
          </h1>
        </div>
        <button
          onClick={loadPosts}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Tổng bài viết', value: posts.length, color: 'text-zinc-700', bg: 'bg-zinc-50' },
          { label: 'Đã đăng', value: posts.filter((p) => p.status === 'PUBLISHED').length, color: 'text-[#1A685B]', bg: 'bg-[#1A685B]/5' },
          { label: 'Đang ghim', value: pinnedCount, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Đang khóa', value: lockedCount, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-2xl p-4 border border-zinc-100`}>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-zinc-500 mt-1 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề, nội dung, tác giả..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A685B]/20 focus:border-[#1A685B]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="text-sm border border-zinc-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1A685B]/20"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL'
                  ? 'Tất cả trạng thái'
                  : s === 'PUBLISHED'
                    ? 'Đã đăng'
                    : s === 'DRAFT'
                      ? 'Bản nháp'
                      : s}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            className="text-sm border border-zinc-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1A685B]/20"
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t === 'ALL' ? 'Tất cả loại' : t === 'GENERAL' ? 'Chung' : t === 'CAMPAIGN' ? 'Chiến dịch' : t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex-1 min-h-0 flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center py-20 flex-1 min-h-0">
            <Loader2 className="w-8 h-8 animate-spin text-[#1A685B]" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-500 flex-1 min-h-0">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm font-semibold">{error}</p>
            <button onClick={loadPosts} className="text-sm text-[#1A685B] underline">Thử lại</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-400 flex-1 min-h-0">
            <MessageSquare className="w-10 h-10 opacity-30" />
            <p className="text-sm font-semibold">Không tìm thấy bài viết nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/60">
                  <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">STT</th>
                  <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Bài viết</th>
                  <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Tác giả</th>
                  <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Loại</th>
                  <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Trạng thái</th>
                  <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Flags</th>
                  <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Thống kê</th>
                  <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Ngày tạo</th>
                  <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {pagePosts.map((post, rowIndex) => (
                  <tr key={post.id} className={`hover:bg-zinc-50/50 transition-colors group ${post.isPinned ? 'bg-orange-50/30' : ''}`}>
                    <td className="px-5 py-4 text-zinc-400 font-mono text-xs">
                      {(currentPage - 1) * PAGE_SIZE + rowIndex + 1}.
                    </td>
                    <td className="px-5 py-4 max-w-[220px]">
                      <div className="flex items-start gap-1.5">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-zinc-900 truncate text-xs">
                            {post.title || '(Không có tiêu đề)'}
                          </div>
                          <div className="text-zinc-400 text-xs truncate mt-0.5">{post.content.replace(/<[^>]+>/g, '').slice(0, 55)}...</div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                          {post.isPinned && <Pin className="w-3 h-3 text-orange-500" />}
                          {post.isLocked && <Lock className="w-3 h-3 text-red-500" />}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-black text-zinc-500 flex-shrink-0">
                          {post.author.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-zinc-700 font-medium text-xs truncate max-w-[90px]">{post.author.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4"><TypePill type={post.type} /></td>
                    <td className="px-5 py-4">
                      <StatusPill status={post.status} />
                    </td>
                    <td className="px-5 py-4">
                      {(post.flagCount ?? 0) > 0 ? (
                        <Link href="/staff/flags" className="inline-flex items-center gap-1 text-xs text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full hover:bg-red-100 transition-colors">
                          <Flag className="w-3 h-3" />
                          {post.flagCount}
                        </Link>
                      ) : (
                        <span className="text-zinc-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-zinc-500 space-y-0.5">
                      <div>{post.likeCount} likes · {post.replyCount} comments</div>
                      <div>{post.viewCount} views</div>
                    </td>
                    <td className="px-5 py-4 text-xs text-zinc-500 whitespace-nowrap">
                      <button
                        type="button"
                        className="hover:text-[#1A685B] transition-colors"
                        onClick={() => {
                          setCreatedAtDetails({ postTitle: post.title ?? undefined, createdAt: post.createdAt });
                          setCreatedAtOpen(true);
                        }}
                        aria-label="Xem chi tiết ngày tạo"
                      >
                        {formatDate(post.createdAt)}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <Link href={`/post/${post.id}`} target="_blank"
                          className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors" title="Xem bài viết">
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleTogglePin(post)}
                          disabled={processingId === post.id}
                          className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${post.isPinned ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' : 'hover:bg-orange-50 text-zinc-400 hover:text-orange-500'}`}
                          title={post.isPinned ? 'Bỏ ghim' : 'Ghim bài viết'}
                        >
                          {isProcessing(post.id, 'pin') ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : post.isPinned ? (
                            <PinOff className="w-3.5 h-3.5" />
                          ) : (
                            <Pin className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleToggleLock(post)}
                          disabled={processingId === post.id}
                          className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${post.isLocked ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'hover:bg-red-50 text-zinc-400 hover:text-red-500'}`}
                          title={post.isLocked ? 'Mở khóa' : 'Khóa bình luận'}
                        >
                          {isProcessing(post.id, 'lock') ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : post.isLocked ? (
                            <LockOpen className="w-3.5 h-3.5" />
                          ) : (
                            <Lock className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(post)}
                          disabled={processingId === post.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors disabled:opacity-50"
                          title="Xóa bài viết"
                        >
                          {isProcessing(post.id, 'delete') ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={createdAtOpen} onOpenChange={setCreatedAtOpen}>
        <DialogContent className="max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Chi tiết ngày tạo</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="text-sm text-zinc-600">
              {createdAtDetails?.postTitle ? (
                <span className="font-bold text-zinc-900">Bài viết:</span>
              ) : null}
              {createdAtDetails?.postTitle ?? '—'}
            </div>
            <div className="text-sm text-zinc-900 font-bold">
              {createdAtDetails?.createdAt
                ? new Date(createdAtDetails.createdAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                : '—'}
            </div>
            <div className="text-xs text-zinc-500 break-all">
              Raw: {createdAtDetails?.createdAt ?? '—'}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            Hiển thị {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} / {filtered.length} bài viết
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = currentPage <= 3 ? i + 1 : currentPage + i - 2;
              if (page < 1 || page > totalPages) return null;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors ${page === currentPage ? 'bg-[#1A685B] text-white' : 'border border-zinc-200 hover:bg-zinc-50 text-zinc-600'}`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
