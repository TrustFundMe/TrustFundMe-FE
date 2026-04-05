'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Search, Trash2, Eye, ChevronLeft, ChevronRight, Loader2, AlertCircle,
  MessageSquare, RefreshCw, Pin, Lock, LockOpen, PinOff, Pencil,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/config/axios';
import { feedPostService } from '@/services/feedPostService';
import { dtoToFeedPost } from '@/lib/feedPostUtils';
import type { FeedPost } from '@/types/feedPost';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const STATUS_OPTIONS = ['ALL', 'PUBLISHED', 'DRAFT'];
const TYPE_OPTIONS = ['ALL', 'GENERAL', 'CAMPAIGN'];
const PAGE_SIZE = 15;

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
  const [editPost, setEditPost] = useState<PostWithFlags | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      let dtos;
      try {
        const res = await api.get(API_ENDPOINTS.FEED_POSTS.ADMIN_ALL + '?page=0&size=200');
        dtos = Array.isArray(res.data) ? res.data : (res.data.content ?? []);
      } catch {
        // Fallback
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
      await api.delete(API_ENDPOINTS.FEED_POSTS.ADMIN_DELETE(post.id));
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch {
      try {
        await feedPostService.delete(Number(post.id));
        setPosts((prev) => prev.filter((p) => p.id !== post.id));
      } catch (err) {
        alert('Xóa thất bại. Vui lòng thử lại.');
      }
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleTogglePin = async (post: PostWithFlags) => {
    setProcessingId(post.id);
    setProcessingAction('pin');
    try {
      const res = await api.patch(API_ENDPOINTS.FEED_POSTS.ADMIN_PIN(post.id));
      const updated = res.data;
      setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, isPinned: updated.isPinned } : p));
    } catch {
      alert('Thao tác ghim bài thất bại.');
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleToggleLock = async (post: PostWithFlags) => {
    setProcessingId(post.id);
    setProcessingAction('lock');
    try {
      const res = await api.patch(API_ENDPOINTS.FEED_POSTS.ADMIN_LOCK(post.id));
      const updated = res.data;
      setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, isLocked: updated.isLocked } : p));
    } catch {
      alert('Thao tác khóa bài thất bại.');
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const openEdit = (post: PostWithFlags) => {
    setEditPost(post);
    setEditTitle(post.title ?? '');
    setEditContent(post.content ?? '');
  };

  const handleSaveEdit = async () => {
    if (!editPost) return;
    const t = editTitle.trim();
    const c = editContent.trim();
    if (!t && !c) {
      alert('Cần có ít nhất tiêu đề hoặc nội dung.');
      return;
    }
    setEditSaving(true);
    try {
      const res = await api.patch(API_ENDPOINTS.FEED_POSTS.ADMIN_CONTENT(editPost.id), {
        title: t || '',
        content: c || '',
      });
      const u = dtoToFeedPost(res.data);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === editPost.id
            ? { ...p, title: u.title, content: u.content, updatedAt: u.updatedAt ?? p.updatedAt, status: u.status }
            : p
        )
      );
      setEditPost(null);
    } catch {
      alert('Lưu chỉnh sửa thất bại. Vui lòng thử lại.');
    } finally {
      setEditSaving(false);
    }
  };

  const normalizeType = (type: string) => type?.toUpperCase().includes('CAMPAIGN') ? 'CAMPAIGN' : 'GENERAL';

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
    <div className="flex flex-col flex-1 min-h-0 gap-1.5 p-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <h1 className="text-base font-black text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#1A685B]" />
          Quản lý bảng tin
        </h1>
        <button onClick={loadPosts} className="flex items-center gap-1 px-3 py-1 rounded-xl border border-slate-100 text-xs font-bold text-slate-500 hover:bg-slate-50">
          <RefreshCw className="w-3 h-3" />
          Làm mới
        </button>
      </div>

      {/* Compact Stats */}
      <div className="grid grid-cols-4 gap-1.5 flex-shrink-0">
        {[
          { label: 'Tổng bài viết', value: posts.length, color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-100' },
          { label: 'Đã đăng', value: posts.filter((p) => p.status === 'PUBLISHED').length, color: 'text-[#1A685B]', bg: 'bg-[#1A685B]/5', border: 'border-[#1A685B]/10' },
          { label: 'Đang ghim', value: pinnedCount, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
          { label: 'Đang khóa', value: lockedCount, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} ${stat.border} rounded-xl px-3 py-2 border flex items-center gap-2`}>
            <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-slate-500 font-bold leading-tight">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Compact Filter Bar */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full bg-white border border-slate-100 rounded-xl pl-8 pr-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#F84D43]/10 focus:border-[#F84D43] transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="rounded-xl border border-slate-100 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 cursor-pointer"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === 'ALL' ? 'Tất cả' : s === 'PUBLISHED' ? 'Đã đăng' : s === 'DRAFT' ? 'Bản nháp' : s}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
          className="rounded-xl border border-slate-100 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 cursor-pointer"
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>{t === 'ALL' ? 'Tất cả' : t === 'GENERAL' ? 'Chung' : t === 'CAMPAIGN' ? 'Chiến dịch' : t}</option>
          ))}
        </select>
        {(search !== '' || statusFilter !== 'ALL' || typeFilter !== 'ALL') && (
          <button onClick={() => { setSearch(''); setStatusFilter('ALL'); setTypeFilter('ALL'); setCurrentPage(1); }}
            className="px-2 py-1.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-200">
            Xóa lọc
          </button>
        )}
      </div>

      {/* Table - 80% height */}
      <div className="flex flex-col rounded-2xl border border-slate-100 bg-white relative flex-1 overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 bg-white/60 z-10 flex flex-col items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-500 mb-3" />
            <p className="text-xs font-bold text-slate-600">{error}</p>
            <button onClick={loadPosts} className="mt-3 text-red-500 text-xs font-bold hover:text-red-600">Thử lại</button>
          </div>
        )}

        <div className="h-full overflow-auto custom-scrollbar">
          <table className="min-w-full text-xs">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr className="text-left">
                <th className="py-2 pl-6 pr-3 text-[10px] font-black uppercase tracking-widest text-slate-400">STT</th>
                <th className="py-2 pr-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Bài viết</th>
                <th className="py-2 pr-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pagePosts.map((post, rowIndex) => (
                <tr key={post.id} className={`group hover:bg-slate-50/50 ${post.isPinned ? 'bg-orange-50/30' : ''}`}>
                  <td className="py-2 pl-6 pr-3 text-slate-400 font-mono">{(currentPage - 1) * PAGE_SIZE + rowIndex + 1}.</td>
                  <td className="py-2 pr-3">
                    <div className="flex items-start gap-1.5">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 truncate group-hover:text-[#F84D43]">{post.title || '(Không có tiêu đề)'}</div>
                        <div className="text-slate-400 text-[11px] truncate mt-0.5">
                          {post.author.name} · {post.likeCount} thích · {post.viewCount} xem
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {post.isPinned && <Pin className="w-3 h-3 text-orange-500" />}
                        {post.isLocked && <Lock className="w-3 h-3 text-red-500" />}
                      </div>
                    </div>
                  </td>
                  <td className="py-2 pr-6 text-right">
                    <div className="flex justify-end gap-0.5">
                      <Link href={`/post/${post.id}`} target="_blank"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-white transition-all" title="Xem">
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => openEdit(post)}
                        disabled={processingId === post.id}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#1A685B] hover:bg-[#1A685B]/10 transition-all disabled:opacity-50"
                        title="Sửa bài">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleTogglePin(post)} disabled={processingId === post.id}
                        className={`p-1.5 rounded-lg transition-all disabled:opacity-50 ${post.isPinned ? 'bg-orange-100 text-orange-600' : 'text-slate-400 hover:text-orange-600'}`}>
                        {isProcessing(post.id, 'pin') ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : post.isPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={() => handleToggleLock(post)} disabled={processingId === post.id}
                        className={`p-1.5 rounded-lg transition-all disabled:opacity-50 ${post.isLocked ? 'bg-red-100 text-red-600' : 'text-slate-400 hover:text-red-600'}`}>
                        {isProcessing(post.id, 'lock') ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : post.isLocked ? <LockOpen className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={() => handleDelete(post)} disabled={processingId === post.id}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 transition-all disabled:opacity-50">
                        {isProcessing(post.id, 'delete') ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                        <MessageSquare className="h-6 w-6 text-slate-300" />
                      </div>
                      <p className="font-bold text-slate-500">Không tìm thấy bài viết nào.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex-shrink-0 border-t border-slate-100 bg-slate-50/50 px-6 py-2 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase">
            Hiển thị {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} / {filtered.length} bài
          </span>
          <div className="flex items-center gap-1">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-900 disabled:opacity-30">
              <ChevronRight className="h-3.5 w-3.5 rotate-180" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .map((p, i, arr) => (
                <div key={p} className="flex items-center">
                  {i > 0 && arr[i - 1] !== p - 1 && <span className="px-1 text-slate-300 text-xs">...</span>}
                  <button onClick={() => setCurrentPage(p)}
                    className={`w-7 h-7 rounded-lg text-xs font-black transition-all ${currentPage === p ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    {p}
                  </button>
                </div>
              ))}
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-900 disabled:opacity-30">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <Dialog open={editPost !== null} onOpenChange={(open) => { if (!open) setEditPost(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sửa bài viết</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tiêu đề</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-100 px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#F84D43]/10 focus:border-[#F84D43]"
              placeholder="Tiêu đề (tuỳ chọn)"
            />
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nội dung</label>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={8}
              className="w-full rounded-xl border border-slate-100 px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#F84D43]/10 focus:border-[#F84D43] resize-y min-h-[120px]"
              placeholder="Nội dung bài viết"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditPost(null)}
                disabled={editSaving}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50">
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void handleSaveEdit()}
                disabled={editSaving || (!editTitle.trim() && !editContent.trim())}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#1A685B] hover:bg-[#155a4f] disabled:opacity-50 flex items-center gap-2">
                {editSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Lưu
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
