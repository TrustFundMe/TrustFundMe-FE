'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Trash2, Eye, ChevronLeft, ChevronRight, Loader2, AlertCircle, MessageSquare, Filter, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { feedPostService } from '@/services/feedPostService';
import { dtoToFeedPost } from '@/lib/feedPostUtils';
import type { FeedPost } from '@/types/feedPost';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';

const STATUS_OPTIONS = ['ALL', 'ACTIVE', 'DRAFT'];
const TYPE_OPTIONS = ['ALL', 'GENERAL', 'CAMPAIGN'];

function StatusPill({ status }: { status: string }) {
  const base = 'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider';
  switch (status) {
    case 'ACTIVE':
      return <span className={`${base} bg-[#1A685B]/10 text-[#1A685B]`}><span className="h-1.5 w-1.5 rounded-full bg-[#1A685B] animate-pulse" />Active</span>;
    case 'DRAFT':
      return <span className={`${base} bg-amber-50 text-amber-700`}><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Draft</span>;
    default:
      return <span className={`${base} bg-zinc-100 text-zinc-500`}>{status}</span>;
  }
}

function TypePill({ type }: { type: string }) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider';
  return type === 'CAMPAIGN'
    ? <span className={`${base} bg-blue-50 text-blue-700`}>Campaign</span>
    : <span className={`${base} bg-zinc-100 text-zinc-500`}>General</span>;
}

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const PAGE_SIZE = 15;

export default function AdminFeedPostsPage() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try admin endpoint first, fall back to regular
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

  const handleDelete = async (post: FeedPost) => {
    if (!confirm(`Bạn có chắc muốn xóa bài viết "${post.title ?? post.content.slice(0, 40)}..."?`)) return;
    setDeletingId(post.id);
    try {
      // Try admin delete first
      const res = await fetch(API_ENDPOINTS.FEED_POSTS.ADMIN_DELETE(post.id), { method: 'DELETE', credentials: 'include' });
      if (!res.ok) await feedPostService.delete(Number(post.id));
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch {
      alert('Xóa thất bại. Vui lòng thử lại.');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.content.toLowerCase().includes(search.toLowerCase()) || p.author.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const matchType = typeFilter === 'ALL' || p.type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [posts, search, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagePosts = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-[#1A685B]" />
            Feed Post Management
          </h1>
          <p className="text-sm text-zinc-500 mt-1">{posts.length} bài viết trong hệ thống</p>
        </div>
        <button onClick={loadPosts} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors">
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
            placeholder="Tìm kiếm theo tiêu đề, nội dung, tác giả..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A685B]/20 focus:border-[#1A685B]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="text-sm border border-zinc-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1A685B]/20">
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'Tất cả trạng thái' : s}</option>)}
          </select>
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            className="text-sm border border-zinc-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1A685B]/20">
            {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t === 'ALL' ? 'Tất cả loại' : t}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#1A685B]" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-500">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm font-semibold">{error}</p>
            <button onClick={loadPosts} className="text-sm text-[#1A685B] underline">Thử lại</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-400">
            <MessageSquare className="w-10 h-10 opacity-30" />
            <p className="text-sm font-semibold">Không tìm thấy bài viết nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/60">
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">ID</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Tiêu đề / Nội dung</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Tác giả</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Loại</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Thống kê</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Ngày tạo</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {pagePosts.map((post) => (
                  <tr key={post.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-6 py-4 text-zinc-400 font-mono text-xs">#{post.id}</td>
                    <td className="px-6 py-4 max-w-[260px]">
                      <div className="font-semibold text-zinc-900 truncate">{post.title || '(Không có tiêu đề)'}</div>
                      <div className="text-zinc-400 text-xs truncate mt-0.5">{post.content.slice(0, 60)}...</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-black text-zinc-500 flex-shrink-0">
                          {post.author.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-zinc-700 font-medium text-xs truncate max-w-[100px]">{post.author.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><TypePill type={post.type} /></td>
                    <td className="px-6 py-4"><StatusPill status={post.status} /></td>
                    <td className="px-6 py-4 text-xs text-zinc-500 space-y-0.5">
                      <div>{post.likeCount} likes · {post.replyCount} comments</div>
                      <div>{post.viewCount} views</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500 whitespace-nowrap">{formatDate(post.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/post/${post.id}`} target="_blank"
                          className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors" title="Xem bài viết">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(post)}
                          disabled={deletingId === post.id}
                          className="p-2 rounded-xl hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors disabled:opacity-50"
                          title="Xóa bài viết"
                        >
                          {deletingId === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">Hiển thị {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} / {filtered.length} bài viết</p>
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
