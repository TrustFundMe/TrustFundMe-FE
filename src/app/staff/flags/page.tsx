'use client';

import { useState, useEffect, useMemo } from 'react';
import { Flag, Search, CheckCircle, XCircle, Clock, ExternalLink, Loader2, User, Lock, LockOpen, Megaphone, FileText, X, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { flagService, FlagDto } from '@/services/flagService';
import { userService } from '@/services/userService';
import { feedPostService } from '@/services/feedPostService';
import Link from 'next/link';
import BanUserModal from '@/components/staff/BanUserModal';

type FlagStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';

interface FlagWithMeta extends FlagDto {
  userName?: string;
  postTitle?: string;
  campaignTitle?: string;
  targetUser?: { id: number; fullName: string; isActive?: boolean };
}

interface GroupedTarget {
  key: string;       // "campaign-{id}" or "post-{id}"
  type: 'CAMPAIGN' | 'FEED_POST';
  targetId: number;
  title: string;
  flags: FlagWithMeta[];
  pendingCount: number;
  totalCount: number;
}

type StatusConfigValue = { label: string; color: string; icon: React.ElementType };
const statusConfig: Record<FlagStatus, StatusConfigValue> = {
  PENDING:    { label: 'Chờ xử lý',  color: 'bg-yellow-50 text-yellow-700 border-yellow-100', icon: Clock },
  RESOLVED:   { label: 'Đã giải quyết', color: 'bg-[#446b5f]/10 text-[#446b5f] border-[#446b5f]/20', icon: CheckCircle },
  DISMISSED:  { label: 'Đã bác bỏ', color: 'bg-gray-100 text-gray-500 border-gray-200', icon: XCircle },
};

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function FlagsManagementPage() {
  const [allFlags, setAllFlags] = useState<FlagWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | FlagStatus>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTarget, setExpandedTarget] = useState<string | null>(null);
  const [selectedFlag, setSelectedFlag] = useState<FlagWithMeta | null>(null);

  const [banModal, setBanModal] = useState<{
    isOpen: boolean; userId: number; userName: string; flagId: number;
  }>({ isOpen: false, userId: 0, userName: '', flagId: 0 });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await flagService.getAllFlags(undefined, 0, 200);
      const flagList = res.content || [];

      const flagsWithMeta = await Promise.all(flagList.map(async (flag) => {
        let userName = `User #${flag.userId}`;
        let postTitle: string | undefined;
        let campaignTitle: string | undefined;
        let targetUser: FlagWithMeta['targetUser'] = undefined;

        try {
          const userRes = await userService.getUserById(flag.userId);
          if (userRes.data) userName = userRes.data.fullName;
        } catch { /* ignore */ }

        if (flag.campaignId) {
          try {
            const cr = await fetch(`/api-backend/api/campaigns/${flag.campaignId}`, { credentials: 'include' as RequestCredentials });
            if (cr.ok) { const c = await cr.json(); campaignTitle = c.title; }
          } catch { /* ignore */ }
        }

        if (flag.postId) {
          try {
            const post = await feedPostService.getById(flag.postId);
            postTitle = post.title;
            if (post.authorId) {
              try {
                const ar = await userService.getUserById(post.authorId);
                if (ar.data) targetUser = { id: ar.data.id, fullName: ar.data.fullName, isActive: ar.data.isActive };
              } catch { /* ignore */ }
            }
          } catch { /* ignore */ }
        }

        return { ...flag, userName, postTitle, campaignTitle, targetUser } as FlagWithMeta;
      }));

      setAllFlags(flagsWithMeta);
    } catch {
      toast.error('Không thể tải danh sách tố cáo');
      setAllFlags([]);
    } finally {
      setLoading(false);
    }
  };

  // Group flags by target (campaign or post)
  const groupedTargets = useMemo(() => {
    const map = new Map<string, GroupedTarget>();

    allFlags.forEach(flag => {
      const type: 'CAMPAIGN' | 'FEED_POST' = flag.campaignId ? 'CAMPAIGN' : 'FEED_POST';
      const targetId = flag.campaignId || flag.postId!;
      const key = `${type}-${targetId}`;

      if (!map.has(key)) {
        map.set(key, {
          key,
          type,
          targetId,
          title: type === 'CAMPAIGN' ? (flag.campaignTitle || `#${targetId}`) : (flag.postTitle || `#${targetId}`),
          flags: [],
          pendingCount: 0,
          totalCount: 0,
        });
      }

      const group = map.get(key)!;
      group.flags.push(flag);
      group.totalCount++;
      if (flag.status === 'PENDING') group.pendingCount++;
    });

    // Filter by search / status
    return Array.from(map.values()).filter(g => {
      const matchSearch = searchTerm === '' ||
        g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.flags.some(f =>
          f.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.userName?.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchStatus = statusFilter === 'ALL' ||
        g.flags.some(f => f.status === statusFilter);

      return matchSearch && matchStatus;
    }).sort((a, b) => {
      // PENDING first, then by totalCount desc
      if (b.pendingCount !== a.pendingCount) return b.pendingCount - a.pendingCount;
      return b.totalCount - a.totalCount;
    });
  }, [allFlags, searchTerm, statusFilter]);

  const handleReview = async (id: number, status: 'RESOLVED' | 'DISMISSED') => {
    try {
      await flagService.reviewFlag(id, status);
      toast.success(status === 'RESOLVED' ? 'Đã giải quyết tố cáo' : 'Đã bác bỏ tố cáo');
      fetchData();
    } catch { toast.error('Thao tác thất bại'); }
  };

  const handleLockAccount = (flag: FlagWithMeta) => {
    if (!flag.targetUser) return;
    setBanModal({ isOpen: true, userId: flag.targetUser.id, userName: flag.targetUser.fullName, flagId: flag.id });
  };

  const confirmLockAccount = async (reason: string) => {
    try {
      setLoading(true);
      const { userId, flagId } = banModal;
      await userService.banUser(userId, reason);
      await flagService.reviewFlag(flagId, 'RESOLVED');
      toast.success('Đã khóa tài khoản và giải quyết tố cáo');
      fetchData();
    } catch { toast.error('Khóa tài khoản thất bại'); }
    finally { setLoading(false); }
  };

  const renderFlagItem = (flag: FlagWithMeta) => {
    const cfg = statusConfig[flag.status as FlagStatus];
    const isSelected = selectedFlag?.id === flag.id;
    const isCampaign = !!flag.campaignId;

    return (
      <button
        key={flag.id}
        onClick={() => setSelectedFlag(isSelected ? null : flag)}
        className={`w-full rounded-xl border overflow-hidden transition-all hover:shadow-sm flex-shrink-0 ${isSelected
          ? 'border-[#446b5f]/30 ring-1 ring-[#446b5f]/20'
          : 'border-gray-100 hover:border-gray-200'
        }`}
        style={{ width: 200 }}
      >
        <div className={`h-1.5 w-full ${isCampaign ? 'bg-orange-400' : 'bg-blue-400'}`} />
        <div className="p-3">
          <p className="text-[10px] text-gray-500 italic line-clamp-2 mb-2 leading-snug min-h-[32px]">
            "{flag.reason}"
          </p>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${cfg.color}`}>
            <cfg.icon className="h-2.5 w-2.5" />
            {cfg.label}
          </span>
          <div className="border-t border-gray-100 pt-1.5 mt-2">
            <div className="flex items-center gap-1 mb-0.5">
              <User className="h-2.5 w-2.5 text-gray-400" />
              <span className="text-[9px] font-semibold text-gray-500 truncate">{flag.userName}</span>
            </div>
            <p className="text-[9px] text-gray-400 text-right">{formatDate(flag.createdAt)}</p>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white p-4 lg:p-6 overflow-hidden gap-4">
      {/* Filter & Search */}
      <div className="flex items-center justify-between gap-4 flex-shrink-0 bg-gray-50/50 p-2 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-2 flex-wrap">
          {(['ALL', 'PENDING', 'RESOLVED', 'DISMISSED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`inline-flex h-8 items-center rounded-full border px-4 text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s
                ? 'border-[#446b5f]/30 bg-[#446b5f]/10 text-[#446b5f] shadow-sm'
                : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {s === 'ALL' ? 'Tất cả' : statusConfig[s].label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm chiến dịch, bài viết, lý do..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-xl border border-gray-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#446b5f]/10 bg-white w-[300px]"
          />
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 overflow-hidden">
        {/* Left: Grouped target cards */}
        <div className={`flex flex-col gap-3 overflow-hidden transition-all duration-300 ${selectedFlag ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          <div className="flex items-center justify-between flex-shrink-0 px-1">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Danh sách báo cáo</h2>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{groupedTargets.length} mục</span>
          </div>

          <div className="flex-1 overflow-auto rounded-xl border border-gray-100 shadow-sm bg-white p-4 space-y-3 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-[#446b5f]" />
              </div>
            ) : groupedTargets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 opacity-40">
                <Flag className="h-10 w-10 text-gray-300" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3">Không có báo cáo nào</p>
              </div>
            ) : (
              groupedTargets.map(group => {
                const isCampaign = group.type === 'CAMPAIGN';
                const isExpanded = expandedTarget === group.key;

                return (
                  <div key={group.key} className={`rounded-xl border overflow-hidden transition-all ${isExpanded ? 'border-[#446b5f]/20' : 'border-gray-100 hover:border-gray-200'}`}>
                    {/* Target header */}
                    <button
                      onClick={() => { setExpandedTarget(isExpanded ? null : group.key); setSelectedFlag(null); }}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${isCampaign ? 'bg-orange-100' : 'bg-blue-100'}`}>
                          {isCampaign
                            ? <Megaphone className="h-5 w-5 text-orange-600" />
                            : <FileText className="h-5 w-5 text-blue-600" />
                          }
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <p className="text-[11px] font-black text-gray-800 uppercase tracking-tight">{group.title}</p>
                            {group.pendingCount > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-yellow-50 text-yellow-700 border border-yellow-100">
                                {group.pendingCount} chờ
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-500">{group.totalCount} báo cáo</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-gray-400 uppercase">{isCampaign ? 'Chiến dịch' : 'Bài viết'}</span>
                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {/* Expanded: individual flags */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                          {group.flags.map(flag => renderFlagItem(flag))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Detail Panel */}
        <div className={`lg:col-span-5 flex flex-col gap-3 overflow-hidden transition-all duration-300 ${selectedFlag ? 'opacity-100' : 'hidden opacity-0'}`}>
          {selectedFlag ? (
            <div className="flex flex-col h-full overflow-hidden rounded-2xl border border-gray-100 shadow-sm bg-white">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${selectedFlag.campaignId ? 'bg-orange-50 border border-orange-100 text-orange-600' : 'bg-blue-50 border border-blue-100 text-blue-600'}`}>
                    {selectedFlag.campaignId ? <Megaphone className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {selectedFlag.campaignId ? 'Chiến dịch' : 'Bài viết'}
                    </p>
                    <p className="text-xs font-bold text-gray-800 leading-tight">
                      {selectedFlag.campaignId
                        ? (selectedFlag.campaignTitle || `#${selectedFlag.campaignId}`)
                        : (selectedFlag.postTitle || `#${selectedFlag.postId}`)
                      }
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedFlag(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {(() => {
                  const cfg = statusConfig[selectedFlag.status as FlagStatus];
                  return (
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${cfg.color}`}>
                      <cfg.icon className="h-3 w-3" />
                      {cfg.label}
                    </span>
                  );
                })()}

                <div className="rounded-xl bg-gray-50/80 p-3 border border-gray-100/50 space-y-2">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Người báo cáo</p>
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-3 w-3 text-gray-400" />
                      </div>
                      <span className="text-[11px] font-bold text-gray-700">{selectedFlag.userName}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Ngày báo cáo</p>
                    <p className="text-[11px] font-bold text-gray-700">{formatDate(selectedFlag.createdAt)}</p>
                  </div>
                  {selectedFlag.targetUser && (
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Tác giả</p>
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="h-3 w-3 text-gray-400" />
                        </div>
                        <span className="text-[11px] font-bold text-gray-700">{selectedFlag.targetUser.fullName}</span>
                        {selectedFlag.targetUser.isActive === false && (
                          <span className="text-[9px] font-black text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-100">Đã khóa</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-xl bg-gray-50/80 p-3 border border-gray-100/50">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Lý do báo cáo</p>
                  <p className="text-[11px] font-medium text-gray-700 italic leading-relaxed whitespace-pre-wrap">"{selectedFlag.reason}"</p>
                </div>

                {selectedFlag.campaignId && (
                  <Link href={`/staff/request?campaignId=${selectedFlag.campaignId}`}
                    className="w-full py-2.5 rounded-xl bg-[#446b5f] text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#355249] transition-all active:scale-[0.98] shadow-sm">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Xem & xử lý chiến dịch
                  </Link>
                )}

                {selectedFlag.postId && (
                  <div className="rounded-xl bg-blue-50/50 p-3 border border-blue-100">
                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1.5">Liên kết</p>
                    <div className="flex flex-col gap-1.5">
                      <Link href={`/post/${selectedFlag.postId}`} target="_blank"
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#446b5f] hover:underline">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Xem bài viết
                      </Link>
                      <Link href={`/staff/feed-post`}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#446b5f] hover:underline">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Quản lý bài viết
                      </Link>
                    </div>
                  </div>
                )}

                {selectedFlag.status === 'PENDING' && (
                  <div className="pt-2 border-t border-gray-100 space-y-2">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Hành động</p>

                    {selectedFlag.postId && selectedFlag.targetUser && (
                      <button
                        onClick={() => handleLockAccount(selectedFlag)}
                        disabled={selectedFlag.targetUser?.isActive === false}
                        className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm ${
                          selectedFlag.targetUser?.isActive === false
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        <Lock className="h-3.5 w-3.5" />
                        {selectedFlag.targetUser?.isActive === false ? 'Đã khóa tài khoản' : 'Khóa tài khoản tác giả'}
                      </button>
                    )}

                    {selectedFlag.postId && selectedFlag.targetUser && selectedFlag.targetUser?.isActive === false && (
                      <button
                        onClick={async () => {
                          try {
                            await userService.unbanUser(selectedFlag.targetUser!.id);
                            toast.success('Đã mở khóa tài khoản');
                            fetchData();
                          } catch { toast.error('Thao tác thất bại'); }
                        }}
                        className="w-full py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 transition-all active:scale-[0.98]"
                      >
                        <LockOpen className="h-3.5 w-3.5" />
                        Mở khóa tài khoản
                      </button>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReview(selectedFlag.id, 'DISMISSED')}
                        className="flex-1 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all active:scale-[0.98]"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Bác bỏ
                      </button>
                      <button
                        onClick={() => handleReview(selectedFlag.id, 'RESOLVED')}
                        className="flex-1 py-2.5 rounded-xl bg-[#446b5f] text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-[#355249] transition-all active:scale-[0.98]"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Xác nhận
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-20 rounded-2xl border border-dashed border-gray-100">
              <Flag className="h-10 w-10 text-gray-300" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3 text-center px-4">
                Chọn một báo cáo<br />để xem chi tiết
              </p>
            </div>
          )}
        </div>
      </div>

      <BanUserModal
        isOpen={banModal.isOpen}
        onClose={() => setBanModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmLockAccount}
        userName={banModal.userName}
      />
    </div>
  );
}
