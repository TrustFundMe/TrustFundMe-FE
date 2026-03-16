'use client';

import { useState, useEffect } from 'react';
import { Flag, Search, CheckCircle, XCircle, Clock, MessageSquare, ExternalLink, Loader2, User, Lock } from 'lucide-react';
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
  PENDING: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  RESOLVED: { label: 'Đã giải quyết', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  DISMISSED: { label: 'Đã bác bỏ', color: 'bg-red-100 text-red-700', icon: XCircle },
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
    <div className="flex flex-col h-full bg-[#f1f5f9]">
      {/* Header - EXACT REPLICA OF OTHER PAGES */}
      <div className="flex items-end px-6 gap-2 h-14">
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
      </div>

      {/* Body - EXACT REPLICA */}
      <div className="flex-1 bg-white mx-2 mb-2 rounded-[24px] shadow-sm border border-gray-100 overflow-hidden relative z-10 flex flex-col">
        <div className="flex-1 overflow-hidden p-6 flex flex-col gap-6">
          
          {/* Stats Cards - EXACT REPLICA WITH WAVES */}
          <div className="grid grid-cols-4 gap-3 flex-shrink-0">
            {[
              { label: 'Tổng số báo cáo', value: stats.total, color: 'from-[#446b5f] to-[#6a8d83]' },
              { label: 'Chờ xử lý', value: stats.pending, color: 'from-[#db5945] to-[#f19082]' },
              { label: 'Đã giải quyết', value: stats.resolved, color: 'from-[#446b5f] to-[#5a8075]' },
              { label: 'Đã bác bỏ', value: stats.dismissed, color: 'from-gray-500 to-gray-400' },
            ].map(s => (
              <div key={s.label} className={`relative bg-gradient-to-br ${s.color} rounded-2xl p-4 text-white overflow-hidden`}>
                <span className="text-white/70 text-xs font-medium block mb-1">{s.label}</span>
                <p className="text-2xl font-black relative z-10">{s.value}</p>
                <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 200 40" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0,20 C40,35 80,5 120,20 C160,35 180,10 200,20 L200,40 L0,40 Z" fill="white" fillOpacity="0.1" />
                  <path d="M0,28 C50,15 100,38 150,25 C170,20 185,30 200,28 L200,40 L0,40 Z" fill="white" fillOpacity="0.05" />
                </svg>
              </div>
            ))}
          </div>

          {/* Filter & Search - EXACT REPLICA */}
          <div className="flex items-center justify-between gap-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              {(['ALL', 'PENDING', 'RESOLVED', 'DISMISSED'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold shadow-sm transition ${filter === s
                      ? 'border-[#db5945]/30 bg-[#db5945]/10 text-[#db5945]'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {s === 'ALL' ? 'Tất cả' : statusConfig[s as FlagStatus]?.label || s}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm lý do, người báo cáo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-[#db5945] w-64"
              />
            </div>
          </div>

          {/* Table - EXACT REPLICA */}
          <div className="flex-1 overflow-auto rounded-xl border border-gray-100 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Đối tượng</th>
                  <th className="px-4 py-3 text-left font-semibold">Người báo cáo</th>
                  <th className="px-5 py-4 text-left font-semibold">Lý do</th>
                  <th className="px-4 py-3 text-left font-semibold">Ngày gửi</th>
                  <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
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
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-500">Không tìm thấy tố cáo nào</td>
                  </tr>
                ) : (
                  filteredFlags.map((flag) => {
                    const cfg = statusConfig[flag.status];
                    const Icon = cfg.icon;
                    const isCampaign = !!flag.campaignId;
                    const targetId = flag.campaignId || flag.postId;
                    const viewUrl = isCampaign ? `/campaigns-details?id=${targetId}` : `/post/${targetId}`;

                    return (
                      <tr key={flag.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isCampaign ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                              {isCampaign ? <Flag className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 leading-tight">
                                {isCampaign ? 'Chiến dịch' : 'Bài viết Feed'}
                              </div>
                              <div className="text-[10px] text-gray-500 flex items-center gap-1">
                                ID: {targetId}
                                <Link href={viewUrl} target="_blank" className="hover:text-blue-500 transition-colors">
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <div className="flex items-center gap-2">
                             <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center">
                               <User className="h-3.5 w-3.5 text-gray-400" />
                             </div>
                             <span className="font-medium">{flag.userName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-600 italic text-[13px]">
                           "{flag.reason}"
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(flag.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                            <Icon className="h-3 w-3" />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {flag.status === 'PENDING' && (
                            <div className="flex items-center justify-end gap-1.5">
                              {isCampaign ? (
                                <Link
                                  href={`/staff/request?campaignId=${flag.campaignId}`}
                                  className="px-4 py-1.5 rounded-lg text-[11px] font-bold bg-[#db5945] text-white hover:bg-[#c44d3b] transition-all shadow-sm shadow-[#db5945]/20 flex items-center gap-1.5"
                                >
                                  Xử lý tố cáo
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                              ) : flag.postType === 'DISCUSSION' ? (
                                /* Nếu là post tự đăng (DISCUSSION) thì hiện nút khóa tài khoản */
                                <button
                                  onClick={() => flag.targetUser && handleLockAccount(flag.targetUser.id, flag.targetUser.fullName, flag.id)}
                                  disabled={flag.targetUser?.isActive === false}
                                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                                    flag.targetUser?.isActive === false
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-red-600 text-white hover:bg-red-700 shadow-red-200'
                                  }`}
                                >
                                  <Lock className="h-3 w-3" />
                                  {flag.targetUser?.isActive === false ? 'Đã khóa' : 'Khóa tài khoản'}
                                </button>
                              ) : flag.expenditureId ? (
                                /* Nếu là post minh chứng (POST + expenditureId) thì hiện nút dẫn qua expenditure */
                                <Link
                                  href={`/staff/request?campaignId=${flag.expenditureId || '0'}&tab=EXPENDITURE`}
                                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-[#446b5f] text-white hover:bg-[#5a8075] transition-all shadow-sm shadow-[#446b5f]/20 flex items-center gap-1.5"
                                >
                                  Xem chi tiêu
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                              ) : null}

                              <button
                                onClick={() => handleReview(flag.id, 'RESOLVED')}
                                className="px-2.5 py-1.5 rounded-md text-[11px] font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                Đã xử lý
                              </button>
                              <button
                                onClick={() => handleReview(flag.id, 'DISMISSED')}
                                className="px-2.5 py-1.5 rounded-md text-[11px] font-bold bg-white border border-gray-200 text-red-600 hover:bg-red-50 transition-colors"
                              >
                                Bác bỏ
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
