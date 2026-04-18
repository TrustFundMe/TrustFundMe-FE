'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Search, Trash2, Eye, EyeOff, Loader2, AlertCircle,
  MessageSquare, Pin, Lock, LockOpen, Flag, X, PinOff, Pencil
} from 'lucide-react';
import Link from 'next/link';
import { feedPostService } from '@/services/feedPostService';
import { commentService, type CommentDto } from '@/services/commentService';
import { campaignService } from '@/services/campaignService';
import { expenditureService } from '@/services/expenditureService';
import { dtoToFeedPost } from '@/lib/feedPostUtils';
import type { FeedPost } from '@/types/feedPost';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { useAuth } from '@/contexts/AuthContextProxy';
import { api } from '@/config/axios';
import { toast } from 'react-hot-toast';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@/components/ui/modal';
import { Plus, Save, Send } from 'lucide-react';

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
  const [filter, setFilter] = useState('ALL');
  
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const PAGE_SIZE = 20;

  const [selectedPost, setSelectedPost] = useState<PostWithFlags | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [creating, setCreating] = useState(false);

  const [targetDetails, setTargetDetails] = useState<{ campaignTitle?: string; expenditureTitle?: string; expenditureEvidenceStatus?: string } | null>(null);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use proper server-side pagination (assuming the backend supports it)
      const res = await api.get(API_ENDPOINTS.FEED_POSTS.ADMIN_ALL, {
        params: {
          page: currentPage,
          size: PAGE_SIZE,
          // If searching or filtering is done on server, add them here. 
          // Otherwise keep them for client filter but load a sane amount.
        }
      });
      
      const data = res.data;
      const dtos = Array.isArray(data) ? data : (data.content ?? []);
      const total = Array.isArray(data) ? data.length : (data.totalPages ?? 1);
      
      const mappedPosts = dtos.map((d: any) => dtoToFeedPost(d) as PostWithFlags);
      setPosts(mappedPosts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setTotalPages(total);
    } catch (e: unknown) {
      console.error('Failed to load posts:', e);
      setError('Không thể tải bài viết. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (user) {
      loadPosts(); 
    }
  }, [currentPage, user]); 

  useEffect(() => {
    if (selectedPost) {
      setLoadingComments(true);
      commentService.getComments(selectedPost.id, 0, 1000)
        .then(setComments)
        .catch(() => setComments([]))
        .finally(() => setLoadingComments(false));

      if (selectedPost.targetType === 'CAMPAIGN' && selectedPost.targetId) {
        campaignService.getById(selectedPost.targetId)
          .then(c => setTargetDetails({ campaignTitle: c.title }))
          .catch(() => setTargetDetails(null));
      } else if (selectedPost.targetType === 'EXPENDITURE' && selectedPost.targetId) {
        expenditureService.getById(selectedPost.targetId)
          .then(exp => {
            campaignService.getById(exp.campaignId)
              .then(c => setTargetDetails({ expenditureTitle: exp.plan, campaignTitle: c.title, expenditureEvidenceStatus: exp.evidenceStatus }))
              .catch(() => setTargetDetails({ expenditureTitle: exp.plan, expenditureEvidenceStatus: exp.evidenceStatus }));
          })
          .catch(() => setTargetDetails(null));
      } else {
        setTargetDetails(null);
      }
    } else {
      setComments([]);
      setTargetDetails(null);
    }
  }, [selectedPost?.id]);

  const filteredPosts = useMemo(() => {
    // Keep local filtering for search/filter for instant feedback, 
    // though ideally these should be server-side too.
    return posts.filter((p) => {
      const matchSearch = !search ||
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.content.toLowerCase().includes(search.toLowerCase()) ||
        p.author.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filter === 'ALL' || p.status === filter;
      return matchSearch && matchStatus;
    });
  }, [posts, search, filter]);

  // Use the server-provided posts for the current view
  const pagePosts = filteredPosts; 

  const handleOpenDetail = (post: PostWithFlags) => {
    setSelectedPost(post);
    setShowDetail(true);
  };

  const handleToggleHide = async (post: PostWithFlags) => {
    const isHidden = post.status === 'HIDDEN';
    const newStatus = isHidden ? 'PUBLISHED' : 'HIDDEN';
    
    setProcessingAction('hide');
    try {
      const res = await api.patch(`/api/feed-posts/admin/${post.id}/status`, { status: newStatus });
      const updated = res.data;
      
      setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, status: updated.status } : p));
      if (selectedPost?.id === post.id) {
        setSelectedPost(prev => prev ? { ...prev, status: updated.status } : prev);
      }
      toast.success(isHidden ? 'Đã hiển thị lại bài viết' : 'Đã đưa bài viết vào trạng thái Ẩn');
    } catch {
      toast.error('Thao tác thất bại');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleTogglePin = async (post: PostWithFlags) => {
    const role = String(user?.role || '').toUpperCase().replace(/^ROLE_/, '');
    if (role === 'USER') {
      toast.error('Bạn không có quyền ghim bài viết.');
      return;
    }
    setProcessingAction('pin');
    try {
      const res = await api.patch(API_ENDPOINTS.FEED_POSTS.ADMIN_PIN(post.id));
      const updated = res.data;
      setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, isPinned: updated.isPinned } : p));
      if (selectedPost?.id === post.id) {
        setSelectedPost(prev => prev ? { ...prev, isPinned: updated.isPinned } : prev);
      }
      toast.success(updated.isPinned ? 'Đã ghim bài viết' : 'Đã bỏ ghim bài viết');
    } catch {
      toast.error('Ghim bài thất bại');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleToggleLock = async (post: PostWithFlags) => {
    setProcessingAction('lock');
    try {
      const res = await api.patch(API_ENDPOINTS.FEED_POSTS.ADMIN_LOCK(post.id));
      const updated = res.data;
      setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, isLocked: updated.isLocked } : p));
      if (selectedPost?.id === post.id) {
        setSelectedPost(prev => prev ? { ...prev, isLocked: updated.isLocked } : prev);
      }
      toast.success(updated.isLocked ? 'Đã khóa bài viết' : 'Đã mở khóa bài viết');
    } catch {
    } finally {
      setProcessingAction(null);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) {
      toast.error('Nội dung không được để trống');
      return;
    }
    setCreating(true);
    try {
      await feedPostService.create({
        title: newPostTitle.trim() || null,
        content: newPostContent.trim(),
        type: 'NEWS',
        visibility: 'PUBLIC',
        status: 'PUBLISHED'
      });
      toast.success('Đăng bài thành công');
      setShowCreateModal(false);
      setNewPostTitle('');
      setNewPostContent('');
      loadPosts();
    } catch {
      toast.error('Lỗi khi đăng bài');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateExpStatus = async (post: PostWithFlags, isCurrentlyAllowed: boolean) => {
    if (post.targetType !== 'EXPENDITURE' || !post.targetId) return;
    setProcessingAction('status');
    try {
      const expStatus = isCurrentlyAllowed ? 'SUBMITTED' : 'ALLOWED_EDIT';
      const res = await expenditureService.updateEvidenceStatus(post.targetId, expStatus);
      setTargetDetails(prev => prev ? { ...prev, expenditureEvidenceStatus: res.evidenceStatus } : prev);
      toast.success(isCurrentlyAllowed ? 'Đã thu hồi quyền chỉnh sửa' : 'Đã cấp quyền chỉnh sửa');
    } catch (err) {
      console.error(err);
      toast.error('Cập nhật trạng thái thất bại');
    } finally {
      setProcessingAction(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 flex-1 p-4 lg:p-6 bg-white overflow-hidden">
      {/* Search & Filter Top Bar */}
      <div className="flex items-center justify-between gap-4 flex-shrink-0 bg-gray-50/50 p-2 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-2">
          {(['ALL', 'PUBLISHED', 'DRAFT', 'ALLOWED_EDIT'] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setFilter(s); setCurrentPage(0); }}
              className={`inline-flex h-8 items-center rounded-full border px-4 text-[10px] font-black uppercase tracking-widest transition-all ${filter === s
                ? 'border-[#446b5f]/30 bg-[#446b5f]/10 text-[#446b5f] shadow-sm'
                : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                }`}
            >
              {s === 'ALL' ? 'Tất cả' : s === 'PUBLISHED' ? 'Đã đăng' : s === 'ALLOWED_EDIT' ? 'Cho sửa' : 'Bản nháp'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề, nội dung, tác giả..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(0); }}
              className="pl-10 pr-4 py-2 rounded-xl border border-gray-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#446b5f]/10 w-[300px] lg:w-[400px] bg-white transition-all focus:w-[450px]"
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="h-10 px-6 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            Đăng bài mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 overflow-hidden">
        {/* Table Area */}
        <div className={`flex flex-col gap-3 overflow-hidden transition-all duration-300 ${showDetail ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          <div className="flex items-center justify-between flex-shrink-0 px-1">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Danh sách bài viết</h2>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{filteredPosts.length} kết quả</span>
          </div>

          <div className="flex-1 overflow-auto rounded-xl border border-gray-100 shadow-sm bg-white relative">
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead className="sticky top-0 z-20">
                <tr className="bg-[#446b5f] text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                  <th className="px-4 py-3 text-left first:rounded-tl-xl w-[50px] border-r border-white/5" title="Số thứ tự">STT</th>
                  <th className="px-4 py-3 text-left border-r border-white/5">NỘI DUNG</th>
                  <th className={`px-4 py-3 text-left border-r border-white/5 ${showDetail ? 'hidden xl:table-cell' : ''}`}>TÁC GIẢ</th>
                  <th className={`px-4 py-3 border-r border-white/5 text-center ${showDetail ? 'hidden 2xl:table-cell' : ''}`}>THỐNG KÊ</th>
                  <th className={`px-4 py-3 border-r border-white/5 text-center ${showDetail ? 'hidden xl:table-cell' : ''}`}>NGÀY TẠO</th>
                  <th className={`px-4 py-3 border-r border-white/5 text-center ${showDetail ? 'hidden 2xl:table-cell' : ''}`}>TRẠNG THÁI</th>
                  <th className="px-4 py-3 text-center last:rounded-tr-xl w-[80px]">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading && pagePosts.length === 0 ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="animate-pulse border-b border-gray-50">
                      <td className="px-4 py-3"><div className="h-2 w-4 bg-gray-100 rounded" /></td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          <div className="h-3 w-48 bg-gray-100 rounded" />
                          <div className="h-2 w-32 bg-gray-50 rounded" />
                        </div>
                      </td>
                      <td className="px-4 py-3"><div className="h-3 w-20 bg-gray-100 rounded" /></td>
                      <td className="px-4 py-3"><div className="h-2 w-24 bg-gray-50 rounded" /></td>
                      <td className="px-4 py-3 text-center"><div className="h-2 w-16 bg-gray-50 rounded mx-auto" /></td>
                      <td className="px-4 py-3 text-center"><div className="h-4 w-12 bg-gray-100 rounded-full mx-auto" /></td>
                      <td className="px-4 py-3 px-4 py-3 text-center"><div className="h-8 w-8 bg-gray-100 rounded-lg mx-auto" /></td>
                    </tr>
                  ))
                ) : filteredPosts.length === 0 ? (
                   <tr>
                     <td colSpan={7} className="px-6 py-32 text-center text-xs font-black text-gray-400 tracking-widest uppercase flex flex-col items-center justify-center gap-4">
                       <AlertCircle className="h-10 w-10 opacity-20" />
                       <div className="flex flex-col gap-1">
                          <p>Hệ thống không tìm thấy bài viết nào</p>
                          <p className="text-[8px] font-bold opacity-50 underline cursor-pointer" onClick={() => {setSearch(''); setFilter('ALL');}}>Thiết lập lại bộ lọc</p>
                       </div>
                     </td>
                   </tr>
                ) : (
                  pagePosts.map((post, i) => {
                    const isSelected = selectedPost?.id === post.id;
                    const stt = currentPage * PAGE_SIZE + i + 1;
                    
                    return (
                      <tr
                        key={post.id}
                        onClick={() => handleOpenDetail(post)}
                        className={`group transition-all cursor-pointer ${
                          isSelected ? 'bg-[#446b5f]/10' : 'hover:bg-[#446b5f]/5'
                        } ${post.isPinned ? 'bg-orange-50/20 hover:bg-orange-50/50' : ''}`}
                      >
                        <td className="px-4 py-3 text-[10px] font-black text-gray-400 border-r border-gray-50/50">
                          {String(stt).padStart(2, '0')}
                        </td>
                        <td className="px-4 py-3 border-r border-gray-50/50 max-w-[200px]">
                          <div className="flex items-start gap-2">
                             {post.isPinned && <Pin className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />}
                             <div className="flex flex-col min-w-0">
                               <span className="font-black text-gray-900 text-[11px] uppercase tracking-tight line-clamp-1">{post.title || '(Không có tiêu đề)'}</span>
                               <span className="text-[10px] font-medium text-gray-500 line-clamp-1 mt-0.5" dangerouslySetInnerHTML={{ __html: post.content.slice(0, 50) }} />
                             </div>
                          </div>
                        </td>
                        <td className={`px-4 py-3 border-r border-gray-50/50 ${showDetail ? 'hidden xl:table-cell' : ''}`}>
                          <div className="flex flex-col">
                             <div className="font-bold text-gray-700 text-[11px] truncate whitespace-nowrap max-w-[120px]">{post.author.name}</div>
                          </div>
                        </td>
                        <td className={`px-4 py-3 border-r border-gray-50/50 text-center ${showDetail ? 'hidden 2xl:table-cell' : ''}`}>
                             <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-tight space-y-0.5">
                               <div>{post.likeCount} Thích • {post.replyCount} <span title="Bình luận (Comment)" className="cursor-help">cmt</span></div>
                               <div className="text-gray-400">{post.viewCount} Lượt Xem</div>
                             </div>
                        </td>
                        <td className={`px-4 py-3 border-r border-gray-50/50 text-center ${showDetail ? 'hidden xl:table-cell' : ''}`}>
                           <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{formatDate(post.createdAt)}</span>
                        </td>
                        <td className={`px-4 py-3 border-r border-gray-50/50 text-center ${showDetail ? 'hidden 2xl:table-cell' : ''}`}>
                          {post.status === 'PUBLISHED' ? (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#446b5f]/10 text-[#446b5f] border border-[#446b5f]/20 whitespace-nowrap`}>
                              Đã đăng
                            </span>
                          ) : post.status === 'ALLOWED_EDIT' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200 whitespace-nowrap">
                              Cho sửa
                            </span>
                          ) : post.status === 'HIDDEN' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-50 text-purple-600 border border-purple-200 whitespace-nowrap">
                              Đã ẩn
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-200 whitespace-nowrap">
                              Nháp
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetail(post);
                            }}
                            className={`p-1.5 rounded-lg transition-all shadow-sm border ${
                              isSelected ? 'bg-[#446b5f] text-white border-[#446b5f]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#446b5f]/30 hover:bg-[#446b5f]/5 hover:text-[#446b5f]'
                            }`}
                            title="Xem chi tiết"
                          >
                             <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-2 pt-2 border-t border-gray-50 flex-shrink-0">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Trang {currentPage + 1} / {totalPages || 1}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-[10px] font-black text-gray-600 uppercase hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-[10px] font-black text-gray-600 uppercase hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Sau
              </button>
            </div>
          </div>
        </div>

        {/* Detail Panel Area */}
        {selectedPost && (
          <div className={`lg:col-span-4 flex flex-col gap-3 overflow-hidden transition-all duration-500 animate-in slide-in-from-right-4 ${showDetail ? 'opacity-100' : 'hidden opacity-0'}`}>
            <div className="flex items-center justify-between flex-shrink-0 px-1">
               <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-[#446b5f] flex items-center justify-center text-white shadow-sm">
                     <MessageSquare className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-black text-gray-800 uppercase tracking-[0.1em]">
                    Chi tiết bài đăng
                  </h2>
               </div>
               <button 
                  onClick={() => setShowDetail(false)}
                  className="p-1.5 border border-gray-200 bg-white hover:bg-gray-50 rounded-lg transition-colors text-gray-400 shadow-sm"
               >
                  <X className="h-4 w-4" />
               </button>
            </div>

            <div className="flex-1 overflow-auto rounded-2xl border border-gray-200 bg-white shadow-sm p-4 custom-scrollbar">
              <div className="space-y-4">
                 {/* Khung nội dung chính */}
                 <div className="rounded-xl bg-gray-50/80 p-3.5 border border-gray-100/50">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nội dung</p>
                    {selectedPost.title && (
                       <h3 className="font-bold text-sm text-gray-900 mb-2 leading-snug">{selectedPost.title}</h3>
                    )}
                    <div className="text-xs font-semibold text-gray-700 whitespace-pre-wrap leading-relaxed pb-2" dangerouslySetInnerHTML={{ __html: selectedPost.content }} />
                 </div>

                 {/* Cột thông tin thẻ KYC style */}
                 {[
                    { label: 'Tác giả', value: <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-600 text-[10px] shadow-sm">
                            {selectedPost.author.name.charAt(0)}
                        </div>
                        <span className="font-bold text-xs">{selectedPost.author.name}</span>
                    </div> },
                    { label: 'Ngày đăng', value: formatDate(selectedPost.createdAt) },
                 ].map((item, idx) => (
                    <div key={idx} className="rounded-xl bg-gray-50/80 p-2.5 border border-gray-100/50">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                        <div className="text-xs font-bold text-gray-800">{item.value}</div>
                    </div>
                 ))}

                 {targetDetails?.campaignTitle && (
                    <div className="rounded-xl bg-gray-50/80 p-2.5 border border-gray-100/50">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Chiến dịch</p>
                        <div className="text-xs font-bold text-gray-800 line-clamp-2">{targetDetails.campaignTitle}</div>
                    </div>
                 )}
                 {targetDetails?.expenditureTitle && (
                    <div className="rounded-xl bg-gray-50/80 p-2.5 border border-gray-100/50">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Khoản chi tiêu</p>
                        <div className="text-xs font-bold text-gray-800 line-clamp-2">{targetDetails.expenditureTitle}</div>
                    </div>
                 )}

                 {/* Thống kê thẻ grid */}
                 <div className="grid grid-cols-3 gap-2">
                   {[
                     { label: 'Thích', value: selectedPost.likeCount },
                     { label: 'Bình luận', value: selectedPost.replyCount },
                     { label: 'Lượt xem', value: selectedPost.viewCount },
                   ].map(stat => (
                      <div key={stat.label} className="rounded-xl bg-gray-50/80 p-2 text-center border border-gray-100/50">
                         <div className="text-lg font-black text-gray-800 leading-none mb-1">{stat.value}</div>
                         <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
                      </div>
                   ))}
                 </div>

                 <div className="rounded-xl bg-gray-50/80 p-3 border border-gray-100/50">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Trạng thái hiện tại</p>
                    <div className="flex items-center gap-2 flex-wrap">
                       {selectedPost.isPinned ? (
                         <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center border border-orange-100 gap-1"><Pin className="w-3 h-3"/> Đang ghim</span>
                       ) : <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-wider border border-gray-200">Không ghim</span>}

                       {selectedPost.isLocked ? (
                         <span className="px-2 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center border border-red-100 gap-1"><Lock className="w-3 h-3"/> Bình luận bị khóa</span>
                       ) : <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-emerald-100 flex items-center gap-1"><LockOpen className="w-3 h-3"/> Bình luận mở</span>}
                    </div>
                 </div>

                 {/* Comments Section */}
                 <div className="rounded-xl bg-gray-50/80 p-3 border border-gray-100/50 flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tất cả bình luận</p>
                      <span className="text-[9px] font-black text-[#446b5f] bg-[#446b5f]/10 px-2 py-0.5 rounded-full">{comments.length}</span>
                    </div>
                    <div className="space-y-3 p-2 max-h-[300px] overflow-y-auto custom-scrollbar bg-white rounded-lg border border-gray-100 shadow-sm flex-shrink-0">
                      {loadingComments ? (
                        <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-gray-300" /></div>
                      ) : comments.length === 0 ? (
                        <div className="text-[10px] text-gray-300 font-bold text-center py-4 uppercase tracking-widest">Không có bình luận nào</div>
                      ) : (
                        comments.map(c => (
                          <div key={c.id} className="flex gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center text-[10px] font-black text-gray-500">{c.authorName?.[0] || 'U'}</div>
                            <div className="flex flex-col min-w-0 flex-1 border-b border-gray-50 pb-2">
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-[11px] font-bold text-gray-800 line-clamp-1">{c.authorName || 'Người dùng ẩn danh'}</span>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{formatDate(c.createdAt)}</span>
                              </div>
                              <p className="text-[11px] font-medium text-gray-600 mt-0.5 break-words leading-relaxed">{c.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                 </div>

                 {/* Hành động */}
                 <div className="pt-2 border-t border-gray-50 space-y-2 pb-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Tác vụ</p>
                    
                    <button
                        onClick={() => handleTogglePin(selectedPost)}
                        disabled={processingAction !== null}
                        className="w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                    >
                        {processingAction === 'pin' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Pin className="w-3.5 h-3.5" />}
                        {selectedPost.isPinned ? 'Bỏ ghim bài viết' : 'Ghim bài viết'}
                    </button>

                    <button
                        onClick={() => handleToggleLock(selectedPost)}
                        disabled={processingAction !== null}
                        className="w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                    >
                        {processingAction === 'lock' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : selectedPost.isLocked ? <LockOpen className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        {selectedPost.isLocked ? 'Mở khóa bình luận' : 'Khóa bình luận'}
                    </button>

                    {selectedPost.targetType === 'EXPENDITURE' && (
                        <button
                            onClick={() => handleUpdateExpStatus(selectedPost, targetDetails?.expenditureEvidenceStatus === 'ALLOWED_EDIT')}
                            disabled={processingAction !== null || !targetDetails}
                            className="w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                        >
                            {processingAction === 'status' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Pencil className="w-3.5 h-3.5" />}
                            {targetDetails?.expenditureEvidenceStatus === 'ALLOWED_EDIT' ? 'Thu hồi quyền sửa bài' : 'Cấp quyền sửa bài'}
                        </button>
                    )}

                    <button
                        onClick={() => handleToggleHide(selectedPost)}
                        disabled={processingAction !== null}
                        className="w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                    >
                        {processingAction === 'hide' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : selectedPost.status === 'HIDDEN' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        {selectedPost.status === 'HIDDEN' ? 'Hiện lại bài viết' : 'Ẩn bài viết'}
                    </button>
                    
                    <div className="pt-3 text-center">
                       <Link href={`/post/${selectedPost.id}`} target="_blank" className="text-[10px] font-black text-[#446b5f] opacity-80 hover:opacity-100 hover:underline uppercase tracking-widest inline-flex items-center gap-1">
                          Xem bài đăng <Eye className="w-3 h-3" />
                       </Link>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Create Post Modal */}
      <Modal open={showCreateModal} onOpenChange={setShowCreateModal}>
        <ModalContent className="max-w-2xl bg-white rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-emerald-600 px-8 py-6 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <ModalTitle className="text-lg font-black uppercase tracking-tight leading-none mb-1 text-white">Tạo bài đăng mới</ModalTitle>
                <p className="text-[9px] font-bold text-emerald-100 uppercase tracking-widest">Tiếp cận cộng đồng TrustFundMe</p>
              </div>
            </div>
            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreatePost}>
            <ModalBody className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tiêu đề bài viết (Không bắt buộc)</label>
                <input 
                  type="text"
                  value={newPostTitle}
                  onChange={e => setNewPostTitle(e.target.value)}
                  placeholder="Nhập tiêu đề thu hút..."
                  className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-emerald-50 focus:border-emerald-200 transition-all outline-none shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nội dung bài đăng</label>
                <textarea 
                  required
                  value={newPostContent}
                  onChange={e => setNewPostContent(e.target.value)}
                  placeholder="Hôm nay bạn muốn chia sẻ điều gì với cộng đồng?"
                  className="w-full min-h-[150px] px-6 py-5 rounded-[24px] bg-gray-50 border border-gray-100 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-emerald-50 focus:border-emerald-200 transition-all outline-none shadow-sm resize-none leading-relaxed"
                />
              </div>

              <div className="flex gap-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                <AlertCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-[10px] font-bold text-emerald-800 leading-relaxed uppercase tracking-tight">
                  Lưu ý: Bài đăng sẽ được hiển thị công khai ngay lập tức sau khi bạn nhấn nút "Đăng bài". Hãy đảm bảo nội dung tuân thủ quy tắc cộng đồng.
                </p>
              </div>
            </ModalBody>

            <ModalFooter className="p-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-widest hover:bg-gray-100 transition-all"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={creating}
                className="h-12 px-8 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Đăng bài ngay
              </button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
