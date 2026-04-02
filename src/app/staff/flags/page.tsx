'use client';

import { useState, useEffect } from 'react';
import { Flag, Search, CheckCircle, XCircle, Clock, MessageSquare, ExternalLink, Loader2, User, Lock, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { flagService, FlagDto } from '@/services/flagService';
import { userService, UserInfo } from '@/services/userService';
import { feedPostService } from '@/services/feedPostService';
import Link from 'next/link';
import BanUserModal from '@/components/staff/BanUserModal';

type FlagStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';

interface FlagWithUser extends FlagDto {
  userName?: string;
  postType?: string;
  expenditureId?: number | null;
  targetUser?: UserInfo;
}

const statusConfig = {
  PENDING: { label: 'Chờ xử lý', color: 'bg-yellow-50 text-yellow-700 border-yellow-100', icon: Clock },
  RESOLVED: { label: 'Đã giải quyết', color: 'bg-[#446b5f]/10 text-[#446b5f] border-[#446b5f]/20', icon: CheckCircle },
  DISMISSED: { label: 'Đã bác bỏ', color: 'bg-gray-100 text-gray-500 border-gray-200', icon: XCircle },
};

export default function FlagsManagementPage() {
  const [flags, setFlags] = useState<FlagWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | FlagStatus>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, dismissed: 0 });
  
  // Ban Modal State
  const [banModal, setBanModal] = useState<{
    isOpen: boolean;
    userId: number;
    userName: string;
    flagId: number;
  }>({
    isOpen: false,
    userId: 0,
    userName: '',
    flagId: 0
  });

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await flagService.getAllFlags(filter === 'ALL' ? undefined : filter, 0, 100);
      const flagList = res.content || [];
      
      const flagsWithUsers = await Promise.all(flagList.map(async (flag) => {
        let userName = `User #${flag.userId}`;
        let postType = undefined;
        let expenditureId: number | null = null;
        let targetUser = undefined;

        try {
          const userRes = await userService.getUserById(flag.userId);
          if (userRes.data) {
            userName = userRes.data.fullName;
            targetUser = userRes.data;
          }
        } catch (e) {
          console.error("Error fetching user for flag", flag.userId, e);
        }

        if (flag.postId) {
          try {
            const post = await feedPostService.getById(flag.postId);
            postType = post.type;
            expenditureId = post.expenditureId ?? null;

            // Target user is the post author
            if (post.authorId) {
               const authorRes = await userService.getUserById(post.authorId);
               if (authorRes.data) {
                 targetUser = authorRes.data;
               }
            }
          } catch (e) {
             console.error("Error fetching post for flag", flag.postId, e);
          }
        }

        return {
          ...flag,
          userName,
          postType,
          expenditureId,
          targetUser
        };
      }));

      setFlags(flagsWithUsers);
      
      // Update stats based on full list (ideally backend provides these)
      setStats({
        total: flagsWithUsers.length,
        pending: flagsWithUsers.filter(f => f.status === 'PENDING').length,
        resolved: flagsWithUsers.filter(f => f.status === 'RESOLVED').length,
        dismissed: flagsWithUsers.filter(f => f.status === 'DISMISSED').length,
      });

    } catch (error: any) {
      console.error('Failed to fetch flags:', error);
      toast.error('Không thể tải danh sách tố cáo');
      setFlags([]);
      setStats({ total: 0, pending: 0, resolved: 0, dismissed: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: number, status: 'RESOLVED' | 'DISMISSED') => {
    try {
      await flagService.reviewFlag(id, status);
      toast.success(status === 'RESOLVED' ? 'Đã giải quyết tố cáo' : 'Đã bác bỏ tố cáo');
      fetchData();
    } catch (error: any) {
      toast.error('Thao tác thất bại');
    }
  };

  const handleLockAccount = (userId: number, userName: string, flagId: number) => {
    setBanModal({
      isOpen: true,
      userId,
      userName,
      flagId
    });
  };

  const confirmLockAccount = async (reason: string) => {
    try {
      setLoading(true);
      const { userId, flagId } = banModal;
      await userService.banUser(userId, reason);
      await flagService.reviewFlag(flagId, 'RESOLVED');
      toast.success("Đã khóa tài khoản và giải quyết tố cáo");
      fetchData();
    } catch (error: any) {
      toast.error("Khóa tài khoản thất bại");
    } finally {
      setLoading(false);
    }
  };

  const filteredFlags = flags.filter(flag => {
    const matchesSearch = searchTerm === '' || 
      flag.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (flag.userName && flag.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (flag.campaignId?.toString() === searchTerm) ||
      (flag.postId?.toString() === searchTerm);
    return matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header - EXACT REPLICA OF OTHER PAGES */}
      <div className="flex items-end justify-between px-4 h-14 relative z-20">
        <button className="relative px-6 py-2.5 text-sm font-bold transition-all duration-200 bg-white text-[#db5945] rounded-t-2xl shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.05)] z-20 h-11">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-[#db5945]" />
            <span className="whitespace-nowrap">Quản lý Báo cáo</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#db5945]/10 text-[#db5945]">
              {stats.pending}
            </span>
          </div>
          <div className="absolute -bottom-2 left-0 right-0 h-4 bg-white z-30" />
        </button>

        <button 
          onClick={fetchData}
          disabled={loading}
          className="mb-1 h-10 w-10 rounded-2xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-[#db5945] hover:border-[#db5945]/20 transition shadow-sm group active:scale-95"
          title="Làm mới trang"
        >
          <RefreshCw className={`h-5 w-5 transition-transform group-hover:rotate-180 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Body - EXACT REPLICA */}
      <div className="flex-1 bg-white mx-2 mb-2 rounded-[24px] shadow-lg border border-gray-100 overflow-hidden relative z-10 flex flex-col">
        <div className="flex-1 overflow-hidden p-4 flex flex-col gap-4 bg-white">
          
          {/* Filter & Search - ĐỒNG BỘ 100% VỚI STAFF REQUEST */}
          <div className="flex items-center justify-between gap-4 flex-shrink-0 bg-white p-1 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-2">
              {(['ALL', 'PENDING', 'RESOLVED', 'DISMISSED'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`inline-flex h-8 items-center rounded-full border px-4 text-[10px] font-black uppercase tracking-widest transition-all ${filter === s
                      ? 'border-[#db5945]/30 bg-[#db5945]/10 text-[#db5945] shadow-sm'
                      : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                >
                  {s === 'ALL' ? 'Tất cả' : statusConfig[s as FlagStatus]?.label || s}
                </button>
              ))}
            </div>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm nội dung lý do, người báo cáo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-[#db5945] focus:ring-4 focus:ring-[#db5945]/5 transition-all shadow-sm bg-white"
              />
            </div>
          </div>

          {/* Table - EXACT REPLICA */}
          <div className="flex-1 overflow-auto rounded-xl border border-gray-100 shadow-sm">
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead className="sticky top-0 z-10 bg-[#446b5f] text-white border-b border-white/10 shadow-sm">
                <tr className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                  <th className="px-4 py-2 text-left w-[50px] border-r border-white/5" title="Số Thứ Tự">STT</th>
                  <th className="px-4 py-2 text-left w-[20%] border-r border-white/5">ĐỐI TƯỢNG</th>
                  <th className="px-4 py-2 text-left w-[15%] border-r border-white/5">NGƯỜI BÁO CÁO</th>
                  <th className="px-4 py-2 text-left border-r border-white/5">NỘI DUNG LÝ DO</th>
                  <th className="px-4 py-2 text-left w-[12%] border-r border-white/5">THỜI GIAN</th>
                  <th className="px-4 py-2 text-left w-[12%] border-r border-white/5">TRẠNG THÁI</th>
                  <th className="px-4 py-2 text-right w-[20%]">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#db5945]" />
                    </td>
                  </tr>
                ) : filteredFlags.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-500">Không tìm thấy tố cáo nào</td>
                  </tr>
                ) : (
                  filteredFlags.map((flag, i) => {
                    const cfg = statusConfig[flag.status as FlagStatus];
                    const Icon = cfg.icon;
                    const isCampaign = !!flag.campaignId;
                    const targetId = flag.campaignId || flag.postId;
                    const viewUrl = isCampaign ? `/campaigns-details?id=${targetId}` : `/post/${targetId}`;

                    return (
                      <tr key={flag.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2 text-[11px] font-black text-gray-400 border-r border-gray-50/50">
                          {String(i + 1).padStart(2, '0')}
                        </td>
                        <td className="px-4 py-2 border-r border-gray-50/50">
                          <div className="flex items-center gap-2">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 ${isCampaign ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                              {isCampaign ? <Flag className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                            </div>
                            <div className="min-w-0">
                              <div className="font-black text-gray-900 text-[11px] uppercase tracking-tight truncate">
                                {isCampaign ? 'Chiến dịch' : 'Bài viết Feed'}
                              </div>
                              <div className="text-[9px] font-bold text-gray-400 flex items-center gap-1">
                                ID: {targetId}
                                <Link href={viewUrl} target="_blank" className="hover:text-blue-500 transition-colors">
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          <div className="flex items-center gap-2">
                             <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                               <User className="h-3 w-3 text-gray-400" />
                             </div>
                             <span className="font-bold text-xs truncate max-w-[120px]">{flag.userName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-gray-600 italic text-[11px] max-w-[300px] truncate">
                           "{flag.reason}"
                        </td>
                        <td className="px-4 py-2 text-gray-500 text-[11px] font-bold whitespace-nowrap">
                          {new Date(flag.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-4 py-2 flex-shrink-0">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${cfg.color}`}>
                            <Icon className="h-3 w-3" />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right">
                          {flag.status === 'PENDING' && (
                            <div className="flex items-center justify-end gap-1.5">
                              {isCampaign ? (
                                <Link
                                  href={`/staff/request?campaignId=${flag.campaignId}`}
                                  className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-[#db5945] to-[#f19082] text-white hover:brightness-110 transition-all active:scale-95 flex items-center gap-1.5"
                                >
                                  XỬ LÝ
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Link>
                              ) : flag.postType === 'DISCUSSION' ? (
                                <button
                                  onClick={() => flag.targetUser && handleLockAccount(flag.targetUser.id, flag.targetUser.fullName, flag.id)}
                                  disabled={flag.targetUser?.isActive === false}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all active:scale-95 ${
                                    flag.targetUser?.isActive === false
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-red-600 text-white hover:bg-red-700'
                                  }`}
                                >
                                  <Lock className="h-3.5 w-3.5" />
                                  {flag.targetUser?.isActive === false ? 'ĐÃ KHÓA' : 'KHÓA'}
                                </button>
                              ) : flag.expenditureId ? (
                                <Link
                                  href={`/staff/request?campaignId=${flag.expenditureId || '0'}&tab=EXPENDITURE`}
                                  className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-[#446b5f] text-white hover:bg-[#355249] transition-all active:scale-95 flex items-center gap-1.5"
                                >
                                  XEM
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Link>
                              ) : null}

                              <button
                                onClick={() => handleReview(flag.id, 'RESOLVED')}
                                className="px-2 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white border border-gray-200 text-gray-500 hover:text-green-600 hover:border-green-100 transition-all"
                              >
                                XONG
                              </button>
                              <button
                                onClick={() => handleReview(flag.id, 'DISMISSED')}
                                className="px-2 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white border border-gray-200 text-red-400 hover:text-red-600 hover:border-red-100 transition-all"
                              >
                                BỎ
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Ban User Modal */}
      <BanUserModal
        isOpen={banModal.isOpen}
        onClose={() => setBanModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmLockAccount}
        userName={banModal.userName}
      />
    </div>
  );
}
