'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Flag, Search, CheckCircle, Clock, Loader2, Lock, LockOpen, X, MessageCircle, Eye, Ban, Info, ArrowRight, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { flagService, FlagDto } from '@/services/flagService';
import { appointmentService } from '@/services/appointmentService';
import { campaignService } from '@/services/campaignService';
import { userService } from '@/services/userService';
import { aiService, FlagAnalysisResult } from '@/services/aiService';
import { chatService } from '@/services/chatService';
import { feedPostService } from '@/services/feedPostService';
import { useRouter } from 'next/navigation';
import BanUserModal from '@/components/staff/BanUserModal';
import DisableCampaignModal from '@/components/staff/DisableCampaignModal';
import CreateAppointmentModal from '@/components/staff/CreateAppointmentModal';
import StaffConfirmModal from '@/components/staff/StaffConfirmModal';
import { useAuth } from '@/contexts/AuthContextProxy';
import { UserInfo } from '@/services/userService';

type FlagStatus = 'PENDING' | 'RESOLVED';

const FALLBACK_IMAGE = '/assets/img/flag.jpg';

function formatDate(str?: string) {
  if (!str) return '-';
  return new Date(str).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatCurrency(amount?: number | string) {
  if (amount == null) return '-';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '-';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(num);
}

function translateStatus(status?: string) {
  if (!status) return 'KHÔNG XÁC ĐỊNH';
  const s = status.toUpperCase();
  switch (s) {
    case 'PENDING': return 'ĐANG CHỜ DUYỆT';
    case 'APPROVED': return 'ĐANG HOẠT ĐỘNG';
    case 'REJECTED': return 'ĐÃ TỪ CHỐI';
    case 'DISABLED': return 'ĐÃ KHÓA';
    case 'LOCKED': return 'ĐÃ KHÓA';
    case 'CLOSED': return 'ĐÃ KẾT THÚC';
    case 'PAUSED': return 'ĐANG TẠM DỪNG';
    case 'ACTIVE': return 'ĐANG HOẠT ĐỘNG';
    case 'PUBLISHED': return 'ĐÃ ĐĂNG';
    default: return s;
  }
}

interface GroupedTarget {
  key: string;
  type: 'CAMPAIGN' | 'FEED_POST';
  targetId: number;
  title: string;
  imageUrl?: string;
  authorName: string;
  flags: FlagDto[];
  pendingCount: number;
  totalCount: number;
}

export default function FlagsManagementPage() {
  const [allFlags, setAllFlags] = useState<FlagDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | FlagStatus>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<GroupedTarget | null>(null);
  const router = useRouter();

  const [banModal, setBanModal] = useState<{
    isOpen: boolean; userId: number; userName: string; flagId: number;
  }>({ isOpen: false, userId: 0, userName: '', flagId: 0 });

  const [disableCampaignModal, setDisableCampaignModal] = useState<{
    isOpen: boolean; campaignId: number; campaignTitle: string;
  }>({ isOpen: false, campaignId: 0, campaignTitle: '' });

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'LOCK_POST' | 'LOCK_COMMENTS';
    postId: number;
    title: string;
    message: string;
  } | null>(null);
  const { user } = useAuth();

  useEffect(() => { fetchData(); }, []);

  // Track selected target key in a ref so effect can read it reliably
  const selectedTargetKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (selectedTarget) {
      selectedTargetKeyRef.current = selectedTarget.key;
    }
  }, [selectedTarget]);

  // Sync selectedTarget.flags when allFlags changes from server
  useEffect(() => {
    const key = selectedTargetKeyRef.current;
    if (!key) return;
    const matchingGroup = groupedTargetsRef.current.find(g => g.key === key);
    if (matchingGroup) {
      setSelectedTarget(prev => prev ? { ...prev, flags: matchingGroup.flags, pendingCount: matchingGroup.pendingCount, totalCount: matchingGroup.totalCount } : prev);
    }
  }, [allFlags]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await flagService.getAllFlags(undefined, 0, 200);
      setAllFlags(res.content || []);
    } catch {
      toast.error('Không thể tải danh sách báo cáo');
      setAllFlags([]);
    } finally {
      setLoading(false);
    }
  };

  // Group by target
  const groupedTargets = useMemo(() => {
    const map = new Map<string, GroupedTarget>();

    allFlags.forEach(flag => {
      const type: 'CAMPAIGN' | 'FEED_POST' = flag.campaignId ? 'CAMPAIGN' : 'FEED_POST';
      const targetId = flag.campaignId || flag.postId!;
      const key = `${type}-${targetId}`;
      const campaign = flag.campaign;
      const post = flag.post;

      // Get title & image from embedded detail
      let title = `#${targetId}`;
      let imageUrl: string | undefined = campaign?.imageUrl || (post as any)?.postImages?.[0]?.imageUrl || (post as any)?.imageUrl || FALLBACK_IMAGE;
      let authorName = campaign?.authorName || post?.authorName || 'Vô danh';
      
      if (campaign) {
        title = campaign.title || title;
      }
      if (post) {
        title = post.title || title;
      }

      if (!map.has(key)) {
        map.set(key, { key, type, targetId, title, imageUrl, authorName, flags: [], pendingCount: 0, totalCount: 0 });
      }

      const group = map.get(key)!;
      group.flags.push(flag);
      group.totalCount++;
      if (flag.status === 'PENDING' || flag.status !== 'RESOLVED') group.pendingCount++;
    });

    return Array.from(map.values()).filter(g => {
      const matchSearch = searchTerm === '' ||
        g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.flags.some(f =>
          f.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (f.reporterName || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchStatus = statusFilter === 'ALL' ||
        g.flags.some(f => f.status === statusFilter);
      return matchSearch && matchStatus;
    }).sort((a, b) => {
      if (b.pendingCount !== a.pendingCount) return b.pendingCount - a.pendingCount;
      return b.totalCount - a.totalCount;
    });
  }, [allFlags, searchTerm, statusFilter]);

  // Keep a live ref to groupedTargets so button can read latest without stale closure
  const groupedTargetsRef = useRef<GroupedTarget[]>([]);
  useEffect(() => { groupedTargetsRef.current = groupedTargets; }, [groupedTargets]);

  const handleReview = async (id: number, status: FlagStatus) => {
    try {
      await flagService.reviewFlag(id, status);
      toast.success(status === 'RESOLVED' ? 'Đã xử lý báo cáo' : 'Đã đưa báo cáo về chờ');
      setSelectedTarget(prev => {
        if (!prev) return prev;
        const updatedFlags = prev.flags.map(f => f.id === id ? { ...f, status } : f);
        return {
          ...prev,
          flags: updatedFlags,
          pendingCount: updatedFlags.filter(f => f.status !== 'RESOLVED').length,
        };
      });
      fetchData();
    } catch { toast.error('Thao tác thất bại'); }
  };

  const confirmLockAccount = async (reason: string) => {
    try {
      setLoading(true);
      const { userId, flagId } = banModal;
      await userService.banUser(userId, reason);
      await flagService.reviewFlag(flagId, 'RESOLVED');
      toast.success('Đã khóa tài khoản và xử lý báo cáo');
      
      // Refresh target user info immediately
      const res = await userService.getUserById(userId);
      if (res.success && res.data) setTargetUser(res.data);
      
      fetchData();
    } catch { toast.error('Khóa tài khoản thất bại'); }
    finally { setLoading(false); }
  };

  const [campaignDetails, setCampaignDetails] = useState<any>(null);
  const [expenditureDetails, setExpenditureDetails] = useState<any>(null);
  const [targetUser, setTargetUser] = useState<UserInfo | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [appointmentsMap, setAppointmentsMap] = useState<Map<string, { id: number, createdAt: number }>>(new Map());

  useEffect(() => {
    const firstFlag = selectedTarget?.flags[0];
    const post = firstFlag?.post as any;
    
    // Resolve target IDs
    let targetCampaignId = selectedTarget?.type === 'CAMPAIGN' ? Number(selectedTarget.targetId) : (post?.campaignId || post?.targetId);
    let targetExpenditureId: number | undefined;
    if (post && (post.targetType === 'EXPENDITURE' || post.targetType === 'EVIDENCE')) {
      targetExpenditureId = post.targetId;
    } else if (post?.expenditureId) {
      targetExpenditureId = post.expenditureId;
    }

    if (selectedTarget) {
      const fetchExtra = async () => {
        if (loadingDetails) return; 
        setLoadingDetails(true);
        try {
          let resolvedCampaignId = targetCampaignId;
          let expenditureData = null;

          if (targetExpenditureId) {
            try {
              expenditureData = await campaignService.getExpenditureById(targetExpenditureId);
              if (expenditureData && !resolvedCampaignId) {
                resolvedCampaignId = expenditureData.campaignId;
              }
            } catch (err) {
              console.error("Failed to fetch expenditure details:", err);
            }
          }

          if (resolvedCampaignId) {
            const [expenditures, fullCampaign, followerData] = await Promise.all([
              campaignService.getExpendituresByCampaignId(Number(resolvedCampaignId)),
              campaignService.getById(Number(resolvedCampaignId)),
              campaignService.getFollowerCount(Number(resolvedCampaignId))
            ]);
            
            setCampaignDetails({
              id: resolvedCampaignId,
              title: fullCampaign?.title,
              expenditureCount: expenditures?.length || 0,
              donorCount: Math.floor(Math.random() * 100) + 12,
              followerCount: followerData || 0,
              goalAmount: fullCampaign?.activeGoal?.targetAmount || 0,
              progress: fullCampaign?.activeGoal?.targetAmount 
                ? ((fullCampaign as any).raisedAmount || 0) / fullCampaign.activeGoal.targetAmount * 100 
                : 0,
              raisedAmount: (fullCampaign as any).raisedAmount || 0,
              startDate: fullCampaign?.startDate,
              endDate: fullCampaign?.endDate,
              categoryName: fullCampaign?.categoryName || fullCampaign?.category || 'Chưa phân loại',
              authorAvatar: (fullCampaign as any)?.authorAvatar,
              authorName: (fullCampaign as any)?.authorName || (selectedTarget?.flags[0]?.post as any)?.authorName
            });
          }

          // Resolve and fetch user independently
          const rawId = selectedTarget.flags[0]?.campaign?.authorId || (selectedTarget.flags[0]?.post as any)?.authorId || (selectedTarget.flags[0]?.post as any)?.fundOwnerId;
          const authorId = rawId ? Number(rawId) : undefined;
          
          if (authorId && !isNaN(authorId)) {
            try {
              const [userRes, userAppts] = await Promise.all([
                userService.getUserById(authorId),
                appointmentService.getByDonor(authorId).catch(() => [])
              ]);

              if (userRes.success && userRes.data) {
                setTargetUser(userRes.data);
              }

              const latest = userAppts
                .filter((a: any) => a.status !== 'CANCELLED')
                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
              
              if (latest) {
                setAppointmentsMap(prev => {
                  const next = new Map(prev);
                  next.set(selectedTarget.key, { 
                    id: latest.id, 
                    createdAt: new Date(latest.createdAt).getTime() 
                  });
                  return next;
                });
              }
            } catch (err) {
              console.error("Failed to fetch user/appointments:", err);
            }
          }
          setExpenditureDetails(expenditureData);
        } catch (error) {
          console.error("Failed to fetch details:", error);
        } finally {
          setLoadingDetails(false);
        }
      };
      fetchExtra();
    } else {
      setCampaignDetails(null);
      setExpenditureDetails(null);
      setTargetUser(null);
      setAiResult(null);
    }
  }, [selectedTarget?.key]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<FlagAnalysisResult | null>(null);

  const handleAIAnalysis = async () => {
    if (!selectedTarget) return;
    setIsAnalyzing(true);
    setAiResult(null);

    try {
      // Build target data from embedded campaign/post info
      const targetData = selectedTarget.type === 'CAMPAIGN'
        ? {
            type: 'CAMPAIGN',
            id: selectedTarget.targetId,
            title: selectedTarget.flags[0]?.campaign?.title || selectedTarget.title,
            description: selectedTarget.flags[0]?.campaign?.description,
            status: selectedTarget.flags[0]?.campaign?.status,
            raisedAmount: selectedTarget.flags[0]?.campaign?.raisedAmount,
            authorName: selectedTarget.flags[0]?.campaign?.authorName,
            authorId: selectedTarget.flags[0]?.campaign?.authorId,
            createdAt: selectedTarget.flags[0]?.campaign?.createdAt,
            totalFlags: selectedTarget.totalCount,
            pendingFlags: selectedTarget.pendingCount,
            ...campaignDetails,
          }
        : {
            type: 'FEED_POST',
            id: selectedTarget.targetId,
            title: selectedTarget.flags[0]?.post?.title,
            content: selectedTarget.flags[0]?.post?.content,
            status: selectedTarget.flags[0]?.post?.status,
            authorName: selectedTarget.flags[0]?.post?.authorName,
            authorId: selectedTarget.flags[0]?.post?.authorId,
            likeCount: selectedTarget.flags[0]?.post?.likeCount,
            commentCount: selectedTarget.flags[0]?.post?.commentCount,
            viewCount: selectedTarget.flags[0]?.post?.viewCount,
            isLocked: selectedTarget.flags[0]?.post?.isLocked,
            createdAt: selectedTarget.flags[0]?.post?.createdAt,
            totalFlags: selectedTarget.totalCount,
            pendingFlags: selectedTarget.pendingCount,
            campaignInfo: campaignDetails,
            expenditureInfo: expenditureDetails,
          };

      const result = await aiService.analyzeFlag(targetData, selectedTarget.flags);
      setAiResult(result);
      toast.success('AI đã hoàn tất phân tích!');
    } catch (err: any) {
      console.error('AI analysis failed:', err);
      toast.error(err?.response?.data?.error || 'Phân tích AI thất bại. Vui lòng thử lại.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const [isStartingChat, setIsStartingChat] = useState(false);
  const handleMessage = async () => {
    if (!selectedTarget) return;
    
    setIsStartingChat(true);
    try {
      const authorId = selectedTarget.type === 'CAMPAIGN' 
        ? selectedTarget.flags[0]?.campaign?.authorId 
        : selectedTarget.flags[0]?.post?.authorId;
      
      const campaignId = selectedTarget.type === 'CAMPAIGN' 
        ? selectedTarget.targetId 
        : undefined;

      if (!authorId) {
        toast.error('Không tìm thấy thông tin chủ sở hữu');
        return;
      }

      // Check if a conversation already exists for this author and campaign
      let conversationId: number | undefined;
      const convListRes = await chatService.getAllConversations();
      
      if (convListRes.success && convListRes.data) {
        const found = convListRes.data.find(c => 
          c.fundOwnerId === authorId && 
          (campaignId ? c.campaignId === Number(campaignId) : true)
        );
        if (found) {
          conversationId = found.id;
        }
      }

      if (!conversationId) {
        const res = await chatService.createConversation(authorId, campaignId);
        if (res.success && res.data) {
          conversationId = res.data.id;
        } else {
          toast.error(res.error || 'Không thể tạo cuộc hội thoại');
          return;
        }
      }

      if (conversationId) {
        router.push(`/staff/chat?conversationId=${conversationId}`);
      }
    } catch (err) {
      console.error('Failed to start chat:', err);
      toast.error('Lỗi khi kết nối đến dịch vụ tin nhắn');
    } finally {
      setIsStartingChat(false);
    }
  };

  const handleLockCampaign = async () => {
    if (!selectedTarget || selectedTarget.type !== 'CAMPAIGN') return;
    
    setDisableCampaignModal({
      isOpen: true,
      campaignId: selectedTarget.targetId,
      campaignTitle: selectedTarget.title
    });
  };

  const confirmDisableCampaign = async (reason: string) => {
    try {
      setLoading(true);
      await campaignService.disableCampaign(disableCampaignModal.campaignId, reason);
      toast.success('Đã khóa chiến dịch thành công');
      fetchData();
    } catch (err) {
      console.error('Failed to lock campaign:', err);
      toast.error('Khóa chiến dịch thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleLockPost = async () => {
    if (!selectedTarget || selectedTarget.type !== 'FEED_POST') return;
    const post = selectedTarget.flags[0]?.post;
    if (!post) return;

    const isCurrentlyLocked = post.isLocked;
    const actionText = isCurrentlyLocked ? 'mở khóa bài viết' : 'khóa bài viết';

    setConfirmAction({
      type: 'LOCK_POST',
      postId: selectedTarget.targetId,
      title: isCurrentlyLocked ? 'Mở khóa bài viết?' : 'Khóa bài viết?',
      message: `Bạn có chắc chắn muốn ${actionText} này không? Bài viết sẽ ${isCurrentlyLocked ? 'hiển thị lại' : 'bị ẩn khỏi bảng tin'} cho người dùng.`
    });
  };

  const handleLockComments = async () => {
    if (!selectedTarget || selectedTarget.type !== 'FEED_POST') return;
    const post = selectedTarget.flags[0]?.post;
    if (!post) return;

    const isCurrentlyLocked = post.isLocked;
    const actionText = isCurrentlyLocked ? 'mở khóa' : 'khóa';
    
    setConfirmAction({
      type: 'LOCK_COMMENTS',
      postId: selectedTarget.targetId,
      title: isCurrentlyLocked ? 'Mở khóa bình luận?' : 'Khóa bình luận?',
      message: `Bạn có chắc chắn muốn ${actionText} bình luận của bài viết này không? Người dùng sẽ ${isCurrentlyLocked ? 'có thể' : 'không thể'} gửi bình luận mới.`
    });
  };

  const executeConfirmAction = async () => {
    if (!confirmAction) return;

    try {
      setLoading(true);
      if (confirmAction.type === 'LOCK_POST') {
        const post = selectedTarget?.flags[0]?.post;
        const isCurrentlyLocked = post?.isLocked;
        const updatedPost = await feedPostService.lockPost(confirmAction.postId);

        // Manual update to local state for immediate feedback
        setAllFlags(prev => prev.map(f => {
          if (f.postId === confirmAction.postId) {
            return { ...f, post: updatedPost };
          }
          return f;
        }));

        toast.success(`Đã ${isCurrentlyLocked ? 'mở khóa' : 'khóa'} bài viết thành công`);
      } else {
        const updatedPost = await feedPostService.lockPost(confirmAction.postId);
        
        // Manual update to local state for immediate feedback
        setAllFlags(prev => prev.map(f => {
          if (f.postId === confirmAction.postId) {
            return { ...f, post: updatedPost };
          }
          return f;
        }));

        toast.success(`Đã cập nhật chặn bình luận`);
      }
      fetchData(); // Sync with server
    } catch (err) {
      toast.error('Thao tác thất bại');
    } finally {
      setLoading(false);
      setConfirmAction(null);
    }
  };

  const handleUnban = async () => {
    if (!targetUser) return;
    try {
      setLoading(true);
      await userService.unbanUser(targetUser.id);
      toast.success('Đã gỡ đình chỉ tài khoản');
      // Refresh user info
      const res = await userService.getUserById(targetUser.id);
      if (res.success && res.data) setTargetUser(res.data);
      fetchData();
    } catch {
      toast.error('Thao tác thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-white p-4 lg:p-6 overflow-hidden gap-4">
      {/* Filter & Search */}
      <div className="flex items-center justify-between gap-4 flex-shrink-0 bg-gray-50/50 p-2 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-2 flex-wrap">
          {(['ALL', 'PENDING', 'RESOLVED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`inline-flex h-8 items-center rounded-full border px-4 text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s
                ? 'border-[#446b5f]/30 bg-[#446b5f]/10 text-[#446b5f] shadow-sm'
                : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {s === 'ALL' ? 'Tất cả' : s === 'PENDING' ? 'Chưa xử lý' : 'Đã xử lý'}
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden">
        {/* Left: Target cards */}
        <div className={`flex flex-col gap-3 overflow-hidden transition-all duration-300 ${selectedTarget ? 'lg:col-span-4' : 'lg:col-span-12'}`}>
          <div className="flex items-center justify-between flex-shrink-0 px-1">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Danh sách báo cáo</h2>
            <span className="text-[10px] font-black text-gray-400">{groupedTargets.length} mục</span>
          </div>

          <div className="flex-1 overflow-auto rounded-xl border border-gray-100 shadow-sm bg-white p-3 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#446b5f]" />
              </div>
            ) : groupedTargets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 opacity-40">
                <Flag className="h-10 w-10 text-gray-300" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3">Không có báo cáo</p>
              </div>
            ) : (
              <div className={`grid gap-3 transition-all duration-300 ${
                selectedTarget ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4 xl:grid-cols-6'
              }`}>
                {groupedTargets.map(group => {
                  const isCampaign = group.type === 'CAMPAIGN';
                  const isSelected = selectedTarget?.key === group.key;

                  return (
                    <button
                      key={group.key}
                      onClick={() => setSelectedTarget(isSelected ? null : group)}
                      className={`group relative flex flex-col bg-white rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                        isSelected 
                          ? 'border-[#446b5f] shadow-xl ring-4 ring-[#446b5f]/5 -translate-y-1' 
                          : 'border-gray-100 hover:border-gray-200 hover:shadow-lg hover:-translate-y-0.5'
                      }`}
                    >
                      {/* Image Section - Shortened to Square */}
                      <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                        <img
                          src={group.imageUrl}
                          alt={group.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                        />
                        
                        {/* Overlay Gradients */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                        
                        {/* Top Labels - Modern Text Indicators */}
                        <div className="absolute top-2 left-2 right-2 flex justify-end">
                           <div className={`px-2.5 py-1 rounded-lg backdrop-blur-md shadow-lg border border-white/20 text-[9px] font-black uppercase tracking-widest ${
                             isCampaign ? 'bg-orange-500/80 text-white' : 'bg-blue-600/80 text-white'
                           }`}>
                             {isCampaign ? 'Chiến dịch' : 'Bài viết'}
                           </div>
                        </div>

                        {/* Title Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                           <h4 className="text-[12px] font-black text-white uppercase tracking-tight leading-tight line-clamp-2 drop-shadow-md group-hover:text-white transition-colors">
                             {group.title}
                           </h4>
                        </div>
                      </div>

                      {/* Footer Info - More Compact */}
                      <div className="px-4 py-3 bg-white space-y-2">
                        <div className="grid grid-cols-2 gap-2 border-b border-gray-50 pb-2">
                           <div className="space-y-0.5 text-left overflow-hidden">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-tight">Chủ sở hữu</p>
                              <p className="text-[11px] font-bold text-gray-800 truncate uppercase">{group.authorName}</p>
                           </div>
                           <div className="space-y-0.5 text-right">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-tight">Báo cáo mới</p>
                              <p className="text-xs font-black text-[#446b5f] bg-[#446b5f]/5 px-2 py-0.5 rounded-md inline-block">
                                {group.pendingCount}
                              </p>
                           </div>
                        </div>

                        {/* Status Row */}
                        <div className="flex items-center justify-between">
                           {group.pendingCount > 0 ? (
                             <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-200">
                               {group.pendingCount} chưa xử lý
                             </span>
                           ) : (
                             <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-200">
                               Đã xử lý ({group.totalCount})
                             </span>
                           )}
                           <span className="text-[10px] font-black uppercase tracking-widest text-[#446b5f] group-hover:gap-2 transition-all flex items-center gap-1">
                              Quản lý <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                           </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Detail Panel */}
        <div className={`lg:col-span-8 flex flex-col gap-4 overflow-hidden transition-all duration-500 ${selectedTarget ? 'opacity-100 translate-x-0' : 'hidden opacity-0 translate-x-4'}`}>
          {selectedTarget ? (
            <div className="flex flex-col h-full overflow-hidden rounded-[2rem] border border-gray-100 shadow-2xl bg-white relative">
              <div className="flex-shrink-0 relative overflow-hidden group">
                <div className="relative h-[120px] w-full">
                  <img
                    src={selectedTarget.imageUrl}
                    alt={selectedTarget.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-end justify-between gap-4">
                      <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md shadow-lg ${
                              selectedTarget.type === 'CAMPAIGN' 
                                ? 'bg-orange-500/20 text-orange-200 border-orange-400/30' 
                                : 'bg-blue-500/20 text-blue-200 border-blue-400/30'
                            }`}>
                              {selectedTarget.type === 'CAMPAIGN' ? 'Chiến dịch' : 'Bài viết'}
                            </span>
                            {selectedTarget.pendingCount > 0 && (
                              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-lg">
                                {selectedTarget.pendingCount} BÁO CÁO MỚI
                              </span>
                            )}
                          </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight leading-tight line-clamp-1 drop-shadow-lg">
                          {selectedTarget.title}
                        </h3>
                      </div>
                      <button
                        onClick={() => setSelectedTarget(null)}
                        className="p-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-lg transition-all text-white flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                <section className="rounded-xl border border-gray-100 overflow-hidden shadow-sm bg-white">
                  <div className="bg-gray-50/80 px-4 py-2 border-b border-gray-100">
                    <h4 className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Hồ sơ chi tiết đối tượng</h4>
                  </div>
                  <div className="p-4">
                    {selectedTarget.type === 'CAMPAIGN' && selectedTarget.flags[0]?.campaign ? (
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
                        <div className="space-y-1">
                          <p className="text-[11px] font-black text-gray-600 uppercase tracking-tight">Số tiền quyên góp</p>
                          <p className="text-[13px] font-bold text-[#446b5f]">{formatCurrency(selectedTarget.flags[0].campaign.raisedAmount)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-black text-gray-600 uppercase tracking-tight">Mục tiêu (VND)</p>
                          <p className="text-[13px] font-bold text-gray-800">{loadingDetails ? '...' : formatCurrency(campaignDetails?.goalAmount || 0)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-black text-gray-600 uppercase tracking-tight">Tiến độ quyên góp</p>
                          <div className="flex items-center gap-1.5">
                             <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                               <div
                                 className="h-full bg-[#446b5f]"
                                 style={{ width: `${Math.min(campaignDetails?.progress || 0, 100)}%` }}
                               />
                             </div>
                             <span className="text-[11px] font-bold text-[#446b5f]">{loadingDetails ? '...' : Math.round(campaignDetails?.progress || 0)}%</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-black text-gray-600 uppercase tracking-tight">Trạng thái</p>
                          <div className="flex items-center gap-1.5">
                             <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                             <p className="text-[12px] font-bold text-orange-600 uppercase">{translateStatus(selectedTarget.flags[0].campaign.status)}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-black text-gray-600 uppercase tracking-tight">Số người đã donate</p>
                          <p className="text-[13px] font-bold text-gray-800">{loadingDetails ? '...' : campaignDetails?.donorCount || '-'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-black text-gray-600 uppercase tracking-tight">Số đợt giải ngân</p>
                          <p className="text-[13px] font-bold text-gray-800">{loadingDetails ? '...' : campaignDetails?.expenditureCount || '-'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-black text-gray-600 uppercase tracking-tight">Danh mục</p>
                          <p className="text-[13px] font-bold text-gray-800 uppercase tracking-tighter">{loadingDetails ? '...' : campaignDetails?.categoryName}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-black text-gray-600 uppercase tracking-tight">Thời gian bắt đầu</p>
                          <p className="text-[12px] font-medium text-gray-600">{loadingDetails ? '...' : formatDate(campaignDetails?.startDate)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-black text-gray-600 uppercase tracking-tight">Thời gian kết thúc</p>
                          <p className="text-[12px] font-medium text-gray-600">{loadingDetails ? '...' : formatDate(campaignDetails?.endDate)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-black text-gray-600 uppercase tracking-tight">Ngày khởi tạo</p>
                          <p className="text-[12px] font-medium text-gray-600">{formatDate(selectedTarget.flags[0].campaign.createdAt)}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[11px] font-black text-gray-600 uppercase tracking-tight">Chủ tài khoản</p>
                           <div className="flex items-center gap-2 mt-0.5">
                              <div className="h-7 w-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center font-black text-[10px] text-[#446b5f] uppercase shadow-sm overflow-hidden flex-shrink-0">
                                 {campaignDetails?.authorAvatar ? (
                                    <img src={campaignDetails.authorAvatar} alt="" className="w-full h-full object-cover" />
                                 ) : (selectedTarget.flags[0].campaign?.authorName?.[0] || 'U')}
                              </div>
                              <p className="text-[12px] font-bold text-gray-800 uppercase truncate">
                                {selectedTarget.flags[0].campaign?.authorName || 'Vô danh'}
                              </p>
                           </div>
                        </div>
                        <div className="col-span-2 lg:col-span-4 mt-2 pt-3 border-t border-gray-100">
                          <p className="text-[11px] font-black text-[#446b5f] uppercase tracking-tight mb-2">Nội dung chi tiết chiến dịch</p>
                          <p className="text-[12px] font-medium text-gray-600 leading-relaxed italic line-clamp-6">
                            {selectedTarget.flags[0].campaign.description || 'Không có mô tả chi tiết.'}
                          </p>
                        </div>
                      </div>
                    ) : selectedTarget.type === 'FEED_POST' && selectedTarget.flags[0]?.post ? (
                      <div className="space-y-6">
                        {/* Primary Post Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
                           {[
                            { label: 'Thích', value: selectedTarget.flags[0].post.likeCount ?? 0 },
                            { label: 'Bình luận', value: selectedTarget.flags[0].post.commentCount ?? 0 },
                            { label: 'Lượt xem', value: selectedTarget.flags[0].post.viewCount ?? 0 },
                            { label: 'Trạng thái', value: translateStatus(selectedTarget.flags[0].post.status) },
                          ].map((stat, i) => (
                            <div key={i} className="space-y-1">
                              <p className="text-[11px] font-black text-gray-700 uppercase tracking-tight">{stat.label}</p>
                              <p className="text-[13px] font-bold text-gray-800">{stat.value}</p>
                            </div>
                          ))}
                          {selectedTarget.flags[0].post.isLocked ? (
                            <div className="space-y-1">
                              <p className="text-[11px] font-black text-gray-700 uppercase tracking-tight">Trạng thái khóa</p>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 rounded text-[11px] font-black">
                                <Lock className="w-3 h-3" />
                                Bài viết bị khóa
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="text-[11px] font-black text-gray-700 uppercase tracking-tight">Trạng thái khóa</p>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[11px] font-black">
                                <LockOpen className="w-3 h-3" />
                                Bình thường
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Linked Info (Campaign/Expenditure) */}
                        {(campaignDetails || expenditureDetails) && (
                          <div className="space-y-3">
                            {/* Expenditure Info Section (if it's an expenditure/evidence post) */}
                            {expenditureDetails && (
                              <div className="bg-orange-50/50 border border-orange-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <h5 className="text-[10px] font-black text-orange-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <Info className="h-3 w-3" />
                                  Chi tiết đợt giải ngân # {expenditureDetails.id}
                                </h5>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-500 uppercase">Tiêu đề đợt</p>
                                    <p className="text-[12px] font-bold text-gray-800 leading-tight">{expenditureDetails.title}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-500 uppercase">Tổng tiền đợt</p>
                                    <p className="text-[12px] font-black text-orange-600">{formatCurrency(expenditureDetails.amount)}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-500 uppercase">Trạng thái đợt</p>
                                    <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-[9px] font-black uppercase tracking-tight">
                                      {translateStatus(expenditureDetails.status)}
                                    </span>
                                  </div>
                                </div>
                                
                                {expenditureDetails.items && expenditureDetails.items.length > 0 && (
                                  <div className="space-y-2 mt-2 pt-2 border-t border-orange-100">
                                    <p className="text-[10px] font-black text-gray-500 uppercase">Danh sách hạng mục:</p>
                                    <div className="grid grid-cols-1 gap-1.5">
                                      {expenditureDetails.items.slice(0, 3).map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between text-[11px] bg-white/50 p-1.5 rounded border border-orange-100/50">
                                          <span className="font-bold text-gray-700 truncate max-w-[150px]">{item.description}</span>
                                          <span className="font-black text-gray-900">{formatCurrency(item.amount)}</span>
                                        </div>
                                      ))}
                                      {expenditureDetails.items.length > 3 && (
                                        <p className="text-[10px] text-gray-400 italic text-center">... và {expenditureDetails.items.length - 3} hạng mục khác</p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Campaign Info Section */}
                            {campaignDetails && (
                              <div className="bg-[#446b5f]/5 border border-[#446b5f]/10 rounded-xl p-4 animate-in fade-in slide-in-from-left-2 duration-300">
                                <h5 className="text-[10px] font-black text-[#446b5f] uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <Flag className="h-3 w-3" />
                                  Chiến dịch: {campaignDetails.title}
                                </h5>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-500 uppercase">Mục tiêu tổng</p>
                                    <p className="text-[12px] font-black text-gray-800 leading-tight">{formatCurrency(campaignDetails.goalAmount)}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-500 uppercase">Đã gây quỹ</p>
                                    <p className="text-[12px] font-black text-emerald-600 leading-tight">
                                      {formatCurrency(campaignDetails.raisedAmount)}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-500 uppercase">Tiến độ quyên góp</p>
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#446b5f]" style={{ width: `${Math.min(campaignDetails.progress, 100)}%` }} />
                                      </div>
                                      <span className="text-[10px] font-black text-[#446b5f]">{Math.floor(campaignDetails.progress)}%</span>
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-500 uppercase">Số đợt giải ngân</p>
                                    <p className="text-[12px] font-black text-gray-800">{campaignDetails.expenditureCount}</p>
                                  </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-[#446b5f]/10 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-400">ID chiến dịch: #{campaignDetails.id}</span>
                                    <span className="text-[10px] font-bold text-gray-400 px-2 py-0.5 rounded bg-gray-100 uppercase">{campaignDetails.categoryName}</span>
                                  </div>
                                  <button 
                                    onClick={() => router.push(`/staff/campaigns/${campaignDetails.id}`)}
                                    className="text-[10px] font-black text-[#446b5f] uppercase hover:underline flex items-center gap-1"
                                  >
                                    Xem chi tiết <ArrowRight className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-2 pt-3 border-t border-gray-100 space-y-3">
                           <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded bg-gray-50 border border-gray-100 flex items-center justify-center font-black text-[10px] text-[#446b5f] uppercase overflow-hidden">
                                 {selectedTarget.flags[0].post.authorAvatarUrl ? (
                                    <img src={selectedTarget.flags[0].post.authorAvatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (selectedTarget.flags[0].post.authorName?.[0] || 'U')}
                              </div>
                              <p className="text-[12px] font-bold text-gray-800 uppercase">{selectedTarget.flags[0].post.authorName}</p>
                           </div>
                           <p className="text-[12px] font-medium text-gray-600 leading-relaxed whitespace-pre-wrap pl-4 border-l-2 border-[#446b5f]/10 italic">
                             {selectedTarget.flags[0].post.content || '(Không có nội dung)'}
                           </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </section>

                {/* Combined Analytics and Reports Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 px-1">
                  {/* Analytical Comparison Section - Trust & Risk */}
                  <section>
                     <div className="h-full bg-[#446b5f]/5 border border-[#446b5f]/10 rounded-lg p-4 overflow-hidden relative group">
                        <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                           <Info className="h-8 w-8 text-[#446b5f]" />
                        </div>
                        <h4 className="text-[10px] font-black text-gray-700 uppercase tracking-widest mb-4">Chỉ số rủi ro & Tài chính</h4>
                        
                        {selectedTarget.type === 'CAMPAIGN' ? (
                          <div className="space-y-4 relative z-10">
                             <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-700 uppercase tracking-tight">Cường độ báo cáo tài chính</p>
                                <div className="flex items-center gap-2">
                                   <p className="text-sm font-black text-gray-800">
                                     {selectedTarget.flags[0].campaign?.raisedAmount && selectedTarget.flags[0].campaign.raisedAmount > 0 
                                       ? (selectedTarget.totalCount / (selectedTarget.flags[0].campaign.raisedAmount / 1000000)).toFixed(2) 
                                       : selectedTarget.totalCount}
                                   </p>
                                   <span className="text-[9px] text-[#446b5f] font-black">BC / 1TR VND</span>
                                </div>
                             </div>
                             <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-700 uppercase tracking-tight">Đánh giá độ tin cậy</p>
                                <div className="flex items-center gap-2">
                                   <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase text-white shadow-sm ${
                                     (selectedTarget.totalCount > 10 && (selectedTarget.flags[0].campaign?.raisedAmount || 0) < 500000) ? 'bg-rose-500' : 'bg-[#446b5f]'
                                   }`}>
                                     {(selectedTarget.totalCount > 10 && (selectedTarget.flags[0].campaign?.raisedAmount || 0) < 500000) ? 'RỦI RO BẤT THƯỜNG CAO' : 'TIN CẬY'}
                                   </span>
                                </div>
                             </div>
                             <div className="pt-2 border-t border-[#446b5f]/10">
                                <p className="text-[10px] font-bold text-gray-600 leading-relaxed italic">
                                  So sánh số báo cáo với doanh thu (BC/1tr VND) giúp phát hiện các chiến dịch có dấu hiệu bất thường khi chưa đạt được kết quả quyên góp lớn.
                                </p>
                             </div>
                          </div>
                        ) : (
                          <div className="space-y-4 relative z-10">
                             <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-700 uppercase tracking-tight">Chỉ số gây tranh cãi</p>
                                <div className="flex items-center gap-2">
                                   <p className="text-sm font-black text-gray-800">
                                     {selectedTarget.flags[0].post?.viewCount ? ((selectedTarget.totalCount / selectedTarget.flags[0].post.viewCount) * 100).toFixed(2) : '0'}%
                                   </p>
                                   <p className="text-[9px] text-gray-600 font-black uppercase">(BC / Lượt xem)</p>
                                </div>
                             </div>
                             <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-700 uppercase tracking-tight">Xếp hạng nội dung</p>
                                <div className="flex items-center gap-2">
                                   <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase text-white shadow-sm ${
                                     (selectedTarget.totalCount / (selectedTarget.flags[0].post?.viewCount || 1)) > 0.01 ? 'bg-amber-500' : 'bg-[#446b5f]'
                                   }`}>
                                      {(selectedTarget.totalCount / (selectedTarget.flags[0].post?.viewCount || 1)) > 0.01 ? 'CẦN GIÁM SÁT' : 'AN TOÀN'}
                                   </span>
                                </div>
                             </div>
                             <div className="pt-2 border-t border-[#446b5f]/10">
                                <p className="text-[10px] font-bold text-gray-600 leading-relaxed italic">
                                  Tỷ lệ báo cáo dựa trên lượt xem giúp phân loại bài viết có nội dung nhạy cảm nhanh chóng.
                                </p>
                             </div>
                          </div>
                        )}
                     </div>
                  </section>
  
                  {/* Reports List - Split by Status */}
                  {(() => {
                    const live = groupedTargetsRef.current.find(g => g.key === selectedTarget.key);
                    const livePending = live?.pendingCount ?? selectedTarget.pendingCount;
                    const liveTotal = live?.totalCount ?? selectedTarget.totalCount;
                    const liveResolved = liveTotal - livePending;
                    const pendingFlags = (live?.flags ?? selectedTarget.flags)
                      .filter(f => f.status !== 'RESOLVED')
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    const resolvedFlags = (live?.flags ?? selectedTarget.flags)
                      .filter(f => f.status === 'RESOLVED')
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                    const renderFlag = (flag: FlagDto, showCheck: boolean) => (
                      <div key={flag.id} className="p-3 hover:bg-gray-50 transition-colors group">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <div className="h-5 w-5 rounded bg-[#446b5f]/10 flex items-center justify-center text-[9px] font-bold text-[#446b5f]">
                                  {flag.reporterName?.[0] || 'V'}
                                </div>
                                <p className="text-[10px] font-black text-gray-800 uppercase truncate">
                                  {flag.reporterName || 'Vô danh'}
                                </p>
                              </div>
                              <p className="text-[8px] font-bold text-gray-400">{formatDate(flag.createdAt)}</p>
                            </div>
                            <p className="text-[11px] font-bold text-gray-600 leading-snug pl-7">
                              <span className="text-[#446b5f] mr-1 opacity-50">"</span>
                              {flag.reason}
                              <span className="text-[#446b5f] ml-1 opacity-50">"</span>
                            </p>
                          </div>
                          {showCheck && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleReview(flag.id, 'RESOLVED')} className="p-1.5 rounded bg-[#446b5f] text-white hover:bg-[#446b5f]/90 transition-all shadow-sm">
                                <Check className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );

                    return (
                      <div className="flex flex-col gap-3">
                        {/* Chưa giải quyết */}
                        <section className="rounded-lg border border-amber-200 bg-white shadow-sm overflow-hidden flex flex-col h-[220px]">
                          <div className="bg-amber-50/80 px-4 py-2 border-b border-amber-100 flex justify-between items-center">
                            <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Chưa giải quyết</h4>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 uppercase">
                              {livePending}
                            </span>
                          </div>
                          <div className="divide-y divide-gray-50 flex-1 overflow-y-auto custom-scrollbar">
                            {pendingFlags.length > 0 ? (
                              pendingFlags.map(f => renderFlag(f, true))
                            ) : (
                              <p className="text-[10px] text-center text-gray-400 py-6 font-bold uppercase tracking-widest">
                                Không có báo cáo nào
                              </p>
                            )}
                          </div>
                        </section>

                        {/* Đã giải quyết */}
                        <section className="rounded-lg border border-emerald-200 bg-white shadow-sm overflow-hidden flex flex-col h-[220px]">
                          <div className="bg-emerald-50/80 px-4 py-2 border-b border-emerald-100 flex justify-between items-center">
                            <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Đã giải quyết</h4>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase">
                              {liveResolved}
                            </span>
                          </div>
                          <div className="divide-y divide-gray-50 flex-1 overflow-y-auto custom-scrollbar">
                            {resolvedFlags.length > 0 ? (
                              resolvedFlags.map(f => renderFlag(f, false))
                            ) : (
                              <p className="text-[10px] text-center text-gray-400 py-6 font-bold uppercase tracking-widest">
                                Chưa có báo cáo nào được giải quyết
                              </p>
                            )}
                          </div>
                        </section>
                      </div>
                    );
                  })()}
                </div>

                {/* AI Analysis Integration */}
                <div className="p-1 mt-4">
                  {aiResult ? (
                    <div className="rounded-lg border shadow-sm animate-in slide-in-from-top-2 duration-500 overflow-hidden bg-[#446b5f]/5 border-[#446b5f]/20">
                      {/* Header */}
                      <div className="flex items-center justify-between p-4 border-b border-[#446b5f]/10">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded shadow-sm bg-white/80 border border-[#446b5f]/10">
                            <Info className="h-4 w-4 text-[#446b5f]" />
                          </div>
                          <div>
                            <h5 className="text-[13px] font-black uppercase tracking-widest text-[#446b5f]">Kết quả phân tích AI</h5>
                            <p className="text-[10px] text-[#446b5f]/60 uppercase tracking-widest font-bold">
                              Độ rủi ro: {aiResult.riskLevel === 'HIGH' ? 'CAO' : aiResult.riskLevel === 'MEDIUM' ? 'TRUNG BÌNH' : 'THẤP'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest text-white shadow-lg ${
                            aiResult.riskLevel === 'HIGH' ? 'bg-rose-500' : aiResult.riskLevel === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}>
                            {aiResult.riskLevel === 'HIGH' ? 'RỦI RO CAO' : aiResult.riskLevel === 'MEDIUM' ? 'CẢNH BÁO' : 'AN TOÀN'}
                          </span>
                          <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border shadow-sm bg-[#446b5f]/10 text-[#446b5f] border-[#446b5f]/20">
                            Điểm đánh giá rủi ro: {aiResult.riskScore}/100
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-4 text-[12px]">
                        {/* Summary */}
                        <div className="p-3 rounded bg-white/60 border border-[#446b5f]/10">
                          <p className="text-[13px] font-bold text-[#446b5f] leading-relaxed">{aiResult.summary}</p>
                        </div>

                        {/* Key Findings */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] font-black text-[#446b5f]/60 uppercase tracking-widest mb-2">Phát hiện chính</p>
                            <div className="space-y-1.5">
                              {aiResult.keyFindings.map((finding, i) => (
                                <div key={i} className="flex items-start gap-2 p-2 rounded bg-white/50 border border-[#446b5f]/10">
                                  <div className="h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-[#446b5f]/10">
                                    <span className="text-[9px] font-black text-[#446b5f]">{i + 1}</span>
                                  </div>
                                  <p className="text-[12px] font-medium text-[#446b5f] leading-snug">{finding}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Recommendation */}
                          <div className="p-4 rounded bg-[#446b5f]/10 border border-[#446b5f]/10">
                             <p className="text-[10px] font-black text-[#446b5f] uppercase tracking-widest mb-2">Đề xuất hành động</p>
                             <p className="text-[12px] font-medium text-[#446b5f] leading-relaxed mb-4">{aiResult.recommendation}</p>
                             <div className="flex flex-wrap gap-1.5">
                               {aiResult.actionTypes.map((action, i) => (
                                 <span key={i} className="px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-widest border shadow-sm bg-white text-[#446b5f] border-[#446b5f]/20">
                                   {action.replace('_', ' ')}
                                 </span>
                               ))}
                             </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="px-4 py-3 border-t border-[#446b5f]/10 bg-[#446b5f]/5">
                        <button
                          onClick={handleAIAnalysis}
                          className="text-[10px] font-black text-[#d95f5e] hover:text-[#d95f5e]/80 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                        >
                          <Info className="h-3 w-3" />
                          Phân tích lại
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleAIAnalysis}
                      disabled={isAnalyzing}
                      className="w-full h-11 rounded-xl bg-[#d95f5e] text-white flex items-center justify-center gap-3 shadow-xl hover:shadow-[#d95f5e]/20 transition-all active:scale-[0.98] border border-white/10 group overflow-hidden relative"
                    >
                      {isAnalyzing ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-[#d95f5e]/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                          <div className="h-6 w-6 rounded-lg bg-white/10 flex items-center justify-center">
                            <Info className="h-3 w-3" />
                          </div>
                          <span className="text-xs font-black uppercase tracking-[0.1em]">Dùng AI để phân tích</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Actions Panel */}
                <div className="px-2 pb-2 mt-auto pt-4">
                  <h4 className="text-[10px] font-black text-gray-700 uppercase tracking-widest mb-3">Hành động</h4>
                  <div className="flex flex-wrap items-center gap-2">
                    <button 
                      onClick={handleMessage}
                      disabled={isStartingChat}
                      className="flex items-center gap-1.5 h-9 px-4 bg-white border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700 uppercase hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
                    >
                      {isStartingChat ? <Loader2 className="h-3 w-3 animate-spin" /> : <MessageCircle className="h-3 w-3" />}
                      Nhắn tin
                    </button>

                    {selectedTarget.type === 'CAMPAIGN' && (
                      <button 
                        onClick={handleLockCampaign}
                        className="flex items-center gap-1.5 h-9 px-4 bg-white border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700 uppercase hover:bg-gray-50 transition-all shadow-sm"
                      >
                        <Lock className="h-3 w-3" />
                        Khóa chiến dịch
                      </button>
                    )}

                    {selectedTarget.type === 'FEED_POST' && (
                      <>
                        <button
                          onClick={handleLockPost}
                          className="flex items-center gap-1.5 h-9 px-4 bg-white border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700 uppercase hover:bg-gray-50 transition-all shadow-sm"
                        >
                          <Eye className={`h-3 w-3 ${selectedTarget.flags[0]?.post?.isLocked ? 'text-rose-500' : ''}`} />
                          {selectedTarget.flags[0]?.post?.isLocked ? 'Mở khóa bài viết' : 'Khóa bài viết'}
                        </button>
                        <button 
                          onClick={handleLockComments}
                          className="flex items-center gap-1.5 h-9 px-4 bg-white border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700 uppercase hover:bg-gray-50 transition-all shadow-sm"
                        >
                          <MessageCircle className={`h-3 w-3 ${selectedTarget.flags[0]?.post?.isLocked ? 'text-rose-500' : ''}`} />
                          {selectedTarget.flags[0]?.post?.isLocked ? 'Mở khóa comment' : 'Khóa comment'}
                        </button>
                      </>
                    )}

                    {/* Only show appointment button if it's a campaign or a post linked to a campaign/expenditure */}
                    {(selectedTarget.type === 'CAMPAIGN' || selectedTarget.flags[0]?.campaignId || (selectedTarget.flags[0]?.post as any)?.campaignId || (selectedTarget.flags[0]?.post as any)?.targetType === 'CAMPAIGN') && (
                      (() => {
                        const targetAppt = appointmentsMap.get(selectedTarget.key);
                        const latestFlagDate = selectedTarget.flags.reduce((latest, flag) => {
                          const flagDate = new Date(flag.createdAt).getTime();
                          return flagDate > latest ? flagDate : latest;
                        }, 0);

                        // Decision logic: 
                        // Show "View Detail" if:
                        // 1. Appointment exists AND (all flags resolved OR appointment is newer than latest flag)
                        // Otherwise, show "Lên lịch hẹn" (Create Appointment)
                        const showViewDetail = targetAppt && (selectedTarget.pendingCount === 0 || targetAppt.createdAt >= latestFlagDate);

                        return showViewDetail ? (
                          <button 
                            onClick={() => router.push(`/staff/schedule?appointmentId=${targetAppt.id}`)}
                            className="flex items-center gap-1.5 h-9 px-4 bg-[#446b5f] border border-[#446b5f]/20 rounded-lg text-[11px] font-bold text-white uppercase hover:bg-[#355249] transition-all shadow-md animate-in zoom-in-95 duration-300"
                          >
                            <Clock className="h-3 w-3" />
                            Xem lịch hẹn
                          </button>
                        ) : (
                          <button 
                            onClick={() => setShowScheduleModal(true)}
                            className="flex items-center gap-1.5 h-9 px-4 bg-white border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700 uppercase hover:bg-gray-50 transition-all shadow-sm"
                          >
                            <Clock className="h-3 w-3" />
                            Lên lịch hẹn
                          </button>
                        );
                      })()
                    )}

                    {(() => {
                      const isActive = targetUser ? ((targetUser as any).isActive ?? (targetUser as any).is_active) : true;
                      
                      if (!targetUser) {
                        return <div className="flex items-center gap-1.5 h-9 px-4 bg-gray-50 border border-gray-100 rounded-lg animate-pulse w-32" />;
                      }
                      
                      if (isActive === false || isActive === 0) {
                        return (
                          <button
                            onClick={handleUnban}
                            className="flex items-center gap-1.5 h-9 px-4 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] font-bold text-emerald-700 uppercase hover:bg-emerald-100 transition-all shadow-sm"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Ngừng đình chỉ tài khoản
                          </button>
                        );
                      }
                      
                      return (
                        <button
                          onClick={() => setBanModal({
                            isOpen: true,
                            userId: targetUser.id,
                            userName: targetUser.fullName,
                            flagId: selectedTarget.flags[0]?.id ?? 0
                          })}
                          className="flex items-center gap-1.5 h-9 px-4 bg-white border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700 uppercase hover:bg-gray-50 transition-all shadow-sm"
                        >
                          <Ban className="h-3 w-3" />
                          Đình chỉ tài khoản
                        </button>
                      );
                    })()}
                  </div>
                </div>

                {/* Resolve All Pending Flags */}
                <div className="px-2 mt-4">
                  <button
                    onClick={async () => {
                      const live = groupedTargetsRef.current.find(g => g.key === selectedTarget.key);
                      const currentPending = live?.pendingCount ?? selectedTarget.pendingCount;
                      if (currentPending === 0) {
                        toast.success('Không có báo cáo nào đang chờ xử lý');
                        return;
                      }
                      const pending = (live?.flags ?? selectedTarget.flags).filter(f => f.status !== 'RESOLVED');
                      try {
                        for (const flag of pending) {
                          await flagService.reviewFlag(flag.id, 'RESOLVED');
                        }
                        toast.success(`Đã giải quyết ${pending.length} báo cáo`);
                        setSelectedTarget(prev => prev ? {
                          ...prev,
                          flags: prev.flags.map(f => f.status !== 'RESOLVED' ? { ...f, status: 'RESOLVED' as const } : f),
                          pendingCount: 0,
                        } : prev);
                        fetchData();
                      } catch {
                        toast.error('Thao tác thất bại');
                      }
                    }}
                    className="w-full h-11 rounded-xl bg-[#446b5f] text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#355249] transition-all active:scale-[0.98] shadow-lg shadow-[#446b5f]/10"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {(() => {
                      const live = groupedTargetsRef.current.find(g => g.key === selectedTarget.key);
                      const pending = live?.pendingCount ?? selectedTarget.pendingCount;
                      return pending === 0
                        ? 'Đã giải quyết tất cả'
                        : `Giải quyết tất cả (${pending})`;
                    })()}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-gray-100 bg-gray-50/30 p-12 text-center group">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-[#446b5f] rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="relative h-24 w-24 rounded-full bg-white border border-gray-100 shadow-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500">
                  <Flag className="h-10 w-10 text-gray-200" />
                </div>
                <div className="absolute -top-2 -right-2 h-8 w-8 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-sm font-black shadow-lg">
                  !
                </div>
              </div>
              <h3 className="text-lg font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Trung tâm điều hành</h3>
              <p className="text-xs font-bold text-gray-300 max-w-[280px] leading-relaxed uppercase tracking-widest">
                Chọn một mục từ danh sách bên trái để kiểm tra các báo cáo vi phạm và thực hiện các biện pháp quản lý.
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

      <DisableCampaignModal
        isOpen={disableCampaignModal.isOpen}
        onClose={() => setDisableCampaignModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDisableCampaign}
        campaignTitle={disableCampaignModal.campaignTitle}
      />

      {showScheduleModal && (
        <CreateAppointmentModal
          staffId={user?.id ? Number(user.id) : 0}
          initialDonorId={selectedTarget?.type === 'CAMPAIGN' ? (selectedTarget?.flags[0]?.campaign?.authorId) : (selectedTarget?.flags[0]?.post?.authorId || (selectedTarget?.flags[0]?.post as any)?.fundOwnerId)}
          initialCampaignId={selectedTarget?.type === 'CAMPAIGN' ? selectedTarget.targetId : (selectedTarget?.flags[0]?.campaignId || (selectedTarget?.flags[0]?.post as any)?.campaignId || ((selectedTarget?.flags[0]?.post as any)?.targetType === 'CAMPAIGN' ? (selectedTarget?.flags[0]?.post as any)?.targetId : undefined))}
          onClose={() => setShowScheduleModal(false)}
          onCreated={(appointmentId) => {
            if (selectedTarget && appointmentId) {
              setAppointmentsMap(prev => {
                const newMap = new Map(prev);
                newMap.set(selectedTarget.key, { 
                  id: appointmentId, 
                  createdAt: Date.now() 
                });
                return newMap;
              });
            }
          }}
        />
      )}

      <StaffConfirmModal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={executeConfirmAction}
        title={confirmAction?.title || ''}
        message={confirmAction?.message || ''}
      />
    </div>
  );
}
