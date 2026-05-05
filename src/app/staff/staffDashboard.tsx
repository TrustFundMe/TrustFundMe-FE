'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowTopRightIcon,
  BellIcon,
  CalendarIcon,
  ChatBubbleIcon,
  CheckCircledIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  FileTextIcon,
  IdCardIcon,
  LightningBoltIcon,
  Pencil2Icon,
  PersonIcon,
  ReaderIcon,
  ReloadIcon,
  RocketIcon,
  SewingPinFilledIcon,
  UpdateIcon,
} from '@radix-ui/react-icons';
import { useAuth } from '@/contexts/AuthContextProxy';
import { useRouter } from 'next/navigation';
import { api } from '@/config/axios';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { campaignService } from '@/services/campaignService';
import { notificationService } from '@/services/notificationService';
import { expenditureService } from '@/services/expenditureService';
import { useToast } from '@/components/ui/Toast';
import { AvatarUploader } from '@/components/ui/avatar-uploader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Notification } from '@/types/notification';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal';

interface DashboardTask {
  id: number;
  type: string;
  targetId?: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface DashboardAlert {
  id: string;
  title: string;
  meta: string;
  routeType: string;
  targetId?: number;
  tone: 'warning' | 'ok' | 'muted';
  timestamp?: string;
  notificationId?: number;
  isRead?: boolean;
}

interface StatItem {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: 'warning' | 'ok' | 'info' | 'muted';
}

interface AppointmentLike {
  id?: number;
  title?: string;
  campaignTitle?: string;
  startTime?: string;
  dateTime?: string;
  date?: string;
  status?: string;
}

interface PostLike {
  id: number;
}

interface ProfileUser {
  id: number;
  role?: string;
  fullName?: string;
  phoneNumber?: string;
  gender?: string;
  dob?: string;
  avatarUrl?: string;
  email?: string;
}

interface CampaignLite {
  id: number;
  title?: string;
}

interface ExpenditureDetailLite {
  id: number;
  campaignId?: number;
  plan?: string;
  startDate?: string;
  endDate?: string;
}

const StaffProfileModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');

  useEffect(() => {
    if (user && open) {
      setFullName(user.fullName || '');
      setPhone(user.phoneNumber || '');
      setGender(user.gender || '');
      setDob(user.dob ? user.dob.split('T')[0] : '');
      setAvatarPreview(user.avatarUrl || null);
    }
  }, [user, open]);

  const handleAvatarUpload = async (file: File): Promise<{ success: boolean }> => {
    if (!user) throw new Error('Bạn chưa đăng nhập');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('userId', String(user.id));
      const upRes = await fetch('/api/upload/avatar', { method: 'POST', credentials: 'include', body: fd });
      const upJson = await upRes.json();
      if (!upRes.ok) throw new Error(upJson.error || 'Tải ảnh lên thất bại');
      const avatarUrl = upJson.avatarUrl as string;
      updateUser({ avatarUrl });
      setAvatarPreview(avatarUrl);
      await api.put(API_ENDPOINTS.USERS.BY_ID(user.id), { avatarUrl });
      toast('Cập nhật ảnh đại diện thành công', 'success');
      return { success: true };
    } catch (err: unknown) {
      toast('Cập nhật ảnh đại diện thất bại', 'error');
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { toast('Vui lòng nhập Họ & Tên', 'error'); return; }
    setSaving(true);
    try {
      if (!user?.id) throw new Error('Session expired');
      await api.put(API_ENDPOINTS.USERS.BY_ID(user.id), {
        fullName: fullName.trim(),
        phoneNumber: phone.trim() || undefined,
        gender: gender || undefined,
        dob: dob || undefined,
      });
      updateUser({ fullName: fullName.trim(), phoneNumber: phone.trim(), gender, dob });
      toast('Cập nhật hồ sơ thành công', 'success');
      onClose();
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast(message || 'Lỗi khi lưu thông tin', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onClose}>
      <ModalContent className="max-w-2xl p-0 overflow-hidden bg-white rounded-2xl border-none shadow-2xl">
        <div className="flex flex-col md:flex-row overflow-hidden">
          <div className="md:w-[220px] bg-gray-50 p-6 flex flex-col items-center text-center border-r border-gray-100 shrink-0">
            <AvatarUploader onUpload={handleAvatarUpload} onError={m => toast(m, 'error')}>
              <div className="relative group cursor-pointer mb-4">
                <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
                  <AvatarImage src={avatarPreview ?? undefined} />
                  <AvatarFallback className="bg-white text-2xl font-black text-gray-400">
                    {(user?.fullName?.[0] || 'S').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 bg-brand p-1.5 rounded-lg shadow-lg border-2 border-white">
                  <Pencil2Icon className="h-3 w-3 text-white" />
                </div>
              </div>
            </AvatarUploader>
            <h2 className="text-sm font-black text-gray-900 mb-1">{user?.fullName}</h2>
            <p className="text-[8px] font-black text-brand uppercase tracking-widest mb-4">Thành viên hệ thống</p>
            <div className="w-full p-3 bg-white rounded-xl border border-gray-100">
              <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</div>
              <div className="text-[10px] font-bold text-gray-600 truncate">{user?.email}</div>
            </div>
          </div>

          <div className="flex-1 p-8 bg-white">
            <ModalHeader className="mb-6 p-0">
              <ModalTitle className="text-lg font-black text-gray-900 uppercase tracking-tight">Cập nhật tài khoản</ModalTitle>
            </ModalHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Họ & Tên</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nhập Họ và Tên"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand/30" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Số điện thoại</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="09xx xxx xxx"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand/30" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Giới tính</label>
                  <select value={gender} onChange={e => setGender(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand/30 appearance-none cursor-pointer">
                    <option value="">Chọn</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Ngày sinh</label>
                  <input type="date" value={dob} onChange={e => setDob(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand/30 cursor-pointer" />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <button type="submit" disabled={saving}
                  className="flex-1 h-12 bg-brand text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-brand-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <ReloadIcon className="w-4 h-4 animate-spin" /> : <CheckCircledIcon className="w-4 h-4" />}
                  Lưu thay đổi
                </button>
                <button type="button" onClick={onClose}
                  className="flex-1 h-12 bg-gray-100 text-gray-500 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-200 transition-colors">
                  Đóng
                </button>
              </div>
            </form>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default function StaffDashboard() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [tasks, setTasks] = useState<DashboardTask[]>([]);
  const [allTasks, setAllTasks] = useState<DashboardTask[]>([]);
  const [appointments, setAppointments] = useState<AppointmentLike[]>([]);
  const [posts, setPosts] = useState<PostLike[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [campaignNames, setCampaignNames] = useState<Map<number, string>>(new Map());
  const [unreadCount, setUnreadCount] = useState(0);
  const [expenditureDetailsById, setExpenditureDetailsById] = useState<Map<number, ExpenditureDetailLite>>(new Map());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const mapNotificationRouteType = (notification: Notification): string => {
    const targetType = (notification.targetType || '').toUpperCase();
    const type = (notification.type || '').toUpperCase();

    if (targetType.includes('KYC') || type.includes('KYC')) return 'KYC';
    if (targetType.includes('EXPENDITURE') || type.includes('EXPENDITURE') || targetType.includes('EVIDENCE')) return 'EXPENDITURE';
    if (targetType.includes('CAMPAIGN') || type.includes('CAMPAIGN')) return 'CAMPAIGN';
    if (targetType.includes('SUPPORT') || type.includes('SUPPORT')) return 'SUPPORT';
    if (targetType.includes('FLAG') || type.includes('FLAG')) return 'FLAG';
    return 'DEFAULT';
  };

  const fetchDashboardData = useCallback(async () => {
    if (!currentUser?.id) return;
    setLoadingTasks(true);

    try {
      const [
        staffTasksRes,
        appointmentRes,
        postRes,
        profileRes,
        latestNotificationsRes,
        unreadCountRes,
      ] = await Promise.allSettled([
        campaignService.getTasksByStaff(currentUser.id),
        api.get(API_ENDPOINTS.APPOINTMENTS.BY_STAFF(currentUser.id)),
        api.get(API_ENDPOINTS.FEED_POSTS.BY_AUTHOR(currentUser.id)),
        api.get(API_ENDPOINTS.USERS.BY_ID(currentUser.id)),
        notificationService.getLatest(currentUser.id),
        notificationService.getUnreadCount(currentUser.id),
      ]);

      const rawTasks: DashboardTask[] = staffTasksRes.status === 'fulfilled' ? (staffTasksRes.value ?? []) : [];
      const pendingTasks = rawTasks.filter((task) => task.status !== 'COMPLETED').slice(0, 8);

      const appointmentsRaw =
        appointmentRes.status === 'fulfilled'
          ? (Array.isArray(appointmentRes.value.data) ? appointmentRes.value.data : (appointmentRes.value.data?.content ?? []))
          : [];

      const postsRaw =
        postRes.status === 'fulfilled'
          ? (Array.isArray(postRes.value.data) ? postRes.value.data : (postRes.value.data?.content ?? []))
          : [];

      const profileRaw = profileRes.status === 'fulfilled' ? profileRes.value.data : null;
      const latestNotifications: Notification[] = latestNotificationsRes.status === 'fulfilled' ? (latestNotificationsRes.value ?? []) : [];
      const unread = unreadCountRes.status === 'fulfilled' ? Number(unreadCountRes.value || 0) : 0;

      setAllTasks(rawTasks);
      setTasks(pendingTasks);
      setAppointments(appointmentsRaw);
      setPosts(postsRaw);
      setUser(profileRaw);
      setUnreadCount(unread);

      const campaignIdsToFetch = new Set<number>();
      pendingTasks.forEach((task) => {
        if (task.type === 'CAMPAIGN' && task.targetId) {
          campaignIdsToFetch.add(task.targetId);
        }
      });

      const expenditureTaskIds = Array.from(
        new Set(
          pendingTasks
            .filter((task) => (task.type === 'EXPENDITURE' || task.type === 'EVIDENCE') && task.targetId)
            .map((task) => Number(task.targetId))
            .filter((id) => Number.isFinite(id))
        )
      ).slice(0, 8);

      const expenditureResults = await Promise.allSettled(
        expenditureTaskIds.map(async (id) => {
          try {
            return await expenditureService.getById(id);
          } catch (err: any) {
            if (err.response?.status === 404) {
              return null;
            }
            throw err;
          }
        })
      );

      const expDetailsMap = new Map<number, ExpenditureDetailLite>();
      expenditureResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value?.id) {
          const expenditure = result.value as ExpenditureDetailLite;
          expDetailsMap.set(expenditure.id, expenditure);
          if (expenditure.campaignId) {
            campaignIdsToFetch.add(expenditure.campaignId);
          }
        }
      });
      setExpenditureDetailsById(expDetailsMap);

      const campaignResults = await Promise.allSettled(
        Array.from(campaignIdsToFetch)
          .slice(0, 12)
          .map(async (id) => {
            try {
              return await campaignService.getById(id);
            } catch (err: any) {
              if (err.response?.status === 404) {
                return null;
              }
              throw err;
            }
          })
      );

      const campaignNameMap = new Map<number, string>();
      campaignResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          const campaign = result.value as CampaignLite;
          campaignNameMap.set(campaign.id, campaign.title || `#${campaign.id}`);
        }
      });

      setCampaignNames(campaignNameMap);

      const nextAlerts: DashboardAlert[] = latestNotifications.slice(0, 15).map((notification) => ({
        id: `notification-${notification.id}`,
        notificationId: notification.id,
        title: notification.title || 'Thông báo hệ thống',
        meta: notification.content || 'Bạn có thông báo mới',
        routeType: mapNotificationRouteType(notification),
        targetId: notification.targetId,
        tone: notification.isRead ? 'muted' : 'warning',
        timestamp: notification.createdAt || notification.updatedAt,
        isRead: notification.isRead,
      }));

      if (nextAlerts.length === 0) {
        nextAlerts.push({
          id: 'empty-alert',
          title: 'Không có thông báo mới',
          meta: 'Dashboard đã đồng bộ',
          routeType: 'DEFAULT',
          tone: 'muted',
        });
      }

      const sortedAlerts = [...nextAlerts].sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return dateB - dateA;
      });

      setAlerts(sortedAlerts);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoadingTasks(false);
    }
  }, [currentUser]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const getTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Gần đây';
    try {
      const diffInSecs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
      if (diffInSecs < 60) return 'Vừa xong';
      const mins = Math.floor(diffInSecs / 60);
      if (mins < 60) return `${mins} phút trước`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours} giờ trước`;
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch {
      return 'Gần đây';
    }
  };

  const getTaskLabel = (type: string) => {
    switch (type) {
      case 'CAMPAIGN': return 'Chiến dịch';
      case 'KYC': return 'Danh tính';
      case 'EXPENDITURE': return 'Chi tiêu';
      case 'EVIDENCE': return 'Minh chứng';
      default: return 'Yêu cầu';
    }
  };

  const getTaskRoute = (type: string) => {
    switch (type) {
      case 'KYC': return '/staff/kyc';
      case 'CAMPAIGN': return '/staff/request?tab=CAMPAIGN';
      case 'EXPENDITURE': return '/staff/request?tab=EXPENDITURE';
      case 'EVIDENCE': return '/staff/request?tab=EVIDENCE';
      case 'FLAG': return '/staff/flags';
      default: return '/staff/request';
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'KYC':
        return IdCardIcon;
      case 'CAMPAIGN':
        return RocketIcon;
      case 'EXPENDITURE':
        return FileTextIcon;
      case 'EVIDENCE':
        return ReaderIcon;
      default:
        return ExclamationTriangleIcon;
    }
  };

  const formatBatchLabel = (expenditure?: ExpenditureDetailLite) => {
    if (!expenditure) return '';
    if (expenditure.plan && expenditure.plan.trim()) return expenditure.plan.trim();
    if (expenditure.startDate || expenditure.endDate) {
      const start = expenditure.startDate
        ? new Date(expenditure.startDate).toLocaleDateString('vi-VN')
        : '?';
      const end = expenditure.endDate
        ? new Date(expenditure.endDate).toLocaleDateString('vi-VN')
        : '?';
      return `Đợt ${start} - ${end}`;
    }
    return '';
  };

  const { pendingCount, todayAppointments, stats, completionRate } = useMemo(() => {
    const pending = allTasks.filter((task) => task.status !== 'COMPLETED').length;
    const totalTasks = allTasks.length;
    const todayStr = new Date().toISOString().split('T')[0];
    const completed = allTasks.filter(
      (task) => task.status === 'COMPLETED' && (task.updatedAt || task.createdAt || '').startsWith(todayStr)
    ).length;

    const appointmentToday = appointments.filter((appointment) => {
      const sourceDate = appointment.startTime || appointment.dateTime || appointment.date;
      if (!sourceDate) return false;
      const value = new Date(sourceDate);
      const now = new Date();
      return (
        value.getDate() === now.getDate()
        && value.getMonth() === now.getMonth()
        && value.getFullYear() === now.getFullYear()
      );
    });

    const completion = totalTasks > 0 ? Math.min(100, Math.round((completed / totalTasks) * 100)) : 0;
    const nextStats: StatItem[] = [
      {
        label: 'Đang chờ xử lý',
        value: pending,
        icon: ClockIcon,
        tone: 'warning',
      },
      {
        label: 'Hoàn thành hôm nay',
        value: completed,
        icon: CheckCircledIcon,
        tone: 'ok',
      },
      {
        label: 'Lịch hẹn hôm nay',
        value: appointmentToday.length,
        icon: CalendarIcon,
        tone: 'info',
      },
      {
        label: 'Bài đăng đã viết',
        value: posts.length,
        icon: ChatBubbleIcon,
        tone: 'muted',
      },
    ];

    return {
      pendingCount: pending,
      todayAppointments: appointmentToday,
      stats: nextStats,
      completionRate: completion,
    };
  }, [allTasks, appointments, posts.length]);

  const openTask = (type: string, targetId?: number) => {
    const route = getTaskRoute(type);
    const normalizedType = type.toUpperCase();
    const separator = route.includes('?') ? '&' : '?';
    if (targetId) {
      router.push(`${route}${separator}targetId=${targetId}`);
      return;
    }
    if (normalizedType === 'EXPENDITURE' || normalizedType === 'EVIDENCE') {
      router.push(route);
      return;
    }
    router.push(route);
  };

  const badgeToneClass = (tone: DashboardAlert['tone']) => {
    if (tone === 'warning') return 'bg-amber-500';
    if (tone === 'ok') return 'bg-emerald-500';
    return 'bg-zinc-400';
  };

  const expenditureTitleById = useMemo(() => {
    const map = new Map<number, string>();
    alerts.forEach((alert) => {
      if (alert.routeType === 'EXPENDITURE' && alert.targetId && alert.title) {
        map.set(alert.targetId, alert.title);
      }
    });
    return map;
  }, [alerts]);

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-50 min-h-[100dvh]">
      <div className="max-w-[1400px] mx-auto px-4 py-2 md:px-6 md:py-3 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8">
            <div className="rounded-[1.5rem] bg-black/5 p-1.5 ring-1 ring-black/5">
              <div className="rounded-[calc(1.5rem-0.375rem)] bg-white px-4 py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.65)]">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-zinc-100">
                      <SewingPinFilledIcon className="h-3 w-3" />
                      Trung tâm điều phối
                    </div>
                    <h1 className="mt-2 text-[2rem] md:text-[2.2rem] tracking-tight font-black text-zinc-900 leading-none">
                      Staff Dashboard
                    </h1>
                    <p className="mt-1 text-sm font-medium text-zinc-500">
                      Xin chào {user?.fullName || currentUser?.fullName || 'Staff'} · {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên kiểm duyệt'}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-zinc-400">
                      {lastUpdated ? `Cập nhật lần cuối: ${lastUpdated.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : 'Đang đồng bộ dữ liệu'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start">
                    <button
                      type="button"
                      onClick={() => fetchDashboardData()}
                      disabled={loadingTasks}
                      className="group inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-zinc-800 active:scale-[0.98]"
                    >
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-white/15 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px]">
                        <ReloadIcon className={`h-4 w-4 ${loadingTasks ? 'animate-spin' : ''}`} />
                      </span>
                      Làm mới
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowProfileModal(true)}
                      className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-zinc-700 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-zinc-300 hover:text-zinc-900 active:scale-[0.98]"
                    >
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-zinc-100 text-zinc-700">
                        <PersonIcon className="h-4 w-4" />
                      </span>
                      Hồ sơ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-4">
            <div className="rounded-[1.5rem] bg-black/5 p-1.5 ring-1 ring-black/5 h-full">
              <div className="rounded-[calc(1.5rem-0.375rem)] bg-zinc-900 p-3 text-zinc-100 h-full">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em]">
                  <LightningBoltIcon className="h-3 w-3" />
                  Thao tác nhanh
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  {[
                    { icon: IdCardIcon, label: 'Duyệt danh tính', href: '/staff/kyc' },
                    { icon: RocketIcon, label: 'Duyệt chiến dịch', href: '/staff/request?tab=CAMPAIGN' },
                    { icon: FileTextIcon, label: 'Duyệt khoản chi', href: '/staff/request?tab=EXPENDITURE' },
                    { icon: ExclamationTriangleIcon, label: 'Báo cáo vi phạm', href: '/staff/flags' },
                    { icon: CalendarIcon, label: 'Lịch hẹn', href: '/staff/schedule' },
                    { icon: ChatBubbleIcon, label: 'Feed nội bộ', href: '/staff/feed-post' },
                  ].map((action) => (
                    <button
                      key={action.href}
                      type="button"
                      onClick={() => router.push(action.href)}
                      className="group flex w-full items-center justify-between rounded-lg bg-white/8 px-2.5 py-2 text-left transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/15 active:scale-[0.98]"
                    >
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold">
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-white/12 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px]">
                          <action.icon className="h-3.5 w-3.5" />
                        </span>
                        {action.label}
                      </span>
                      <ArrowTopRightIcon className="h-3.5 w-3.5 text-zinc-300" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2.5">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const toneClass =
              stat.tone === 'warning'
                ? 'bg-amber-100 text-amber-700'
                : stat.tone === 'ok'
                  ? 'bg-emerald-100 text-emerald-700'
                  : stat.tone === 'info'
                    ? 'bg-sky-100 text-sky-700'
                    : 'bg-zinc-100 text-zinc-700';

            return (
              <div key={stat.label} className="rounded-[1.25rem] bg-black/5 p-1 ring-1 ring-black/5">
                <div className="rounded-[calc(1.25rem-0.25rem)] bg-white p-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.65)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-zinc-400">{stat.label}</span>
                    <span className={`grid h-8 w-8 place-items-center rounded-full ${toneClass}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="mt-2 text-3xl font-black tracking-tight text-zinc-900">
                    {loadingTasks ? '...' : stat.value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
          <div className="xl:col-span-8 rounded-[1.5rem] bg-black/5 p-1.5 ring-1 ring-black/5">
            <div className="rounded-[calc(1.5rem-0.375rem)] bg-white overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.65)] min-h-[calc(100dvh-220px)]">
              <div className="flex items-center justify-between px-5 py-2.5 border-b border-zinc-100">
                <div>
                  <h2 className="text-lg font-black tracking-tight text-zinc-900">Nhiệm vụ cần xử lý</h2>
                </div>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-semibold text-zinc-600">
                  {pendingCount} đang mở
                </span>
              </div>

              <div className="divide-y divide-zinc-100 max-h-[calc(100dvh-320px)] overflow-y-auto">
                {loadingTasks ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <div key={`task-skeleton-${index}`} className="px-6 py-4 animate-pulse">
                      <div className="h-3 w-40 rounded bg-zinc-100" />
                      <div className="mt-2 h-2.5 w-56 rounded bg-zinc-100" />
                    </div>
                  ))
                ) : tasks.length === 0 ? (
                  <div className="px-6 py-10 text-center">
                    <p className="text-sm font-semibold text-zinc-500">Không có nhiệm vụ cần xử lý.</p>
                  </div>
                ) : (
                  tasks
                    .filter((task) => {
                      // Filter out tasks with missing targets that result in 404
                      if (task.type === 'CAMPAIGN') return campaignNames.has(task.targetId);
                      if (task.type === 'EXPENDITURE' || task.type === 'EVIDENCE') return task.targetId && expenditureDetailsById.has(Number(task.targetId));
                      return true;
                    })
                    .map((task) => {
                      const TaskIcon = getTaskIcon(task.type);
                      const isExpenseTask = task.type === 'EXPENDITURE' || task.type === 'EVIDENCE';
                      const expenditureDetail =
                        isExpenseTask && task.targetId ? expenditureDetailsById.get(Number(task.targetId)) : undefined;
                      const mappedCampaignId = expenditureDetail?.campaignId;
                      const campaignTitle = mappedCampaignId
                        ? (campaignNames.get(mappedCampaignId) || `#${mappedCampaignId}`)
                        : undefined;
                      const batchLabel = formatBatchLabel(expenditureDetail);
                      const taskTitle =
                        task.type === 'CAMPAIGN' && task.targetId
                          ? (campaignNames.get(task.targetId) || `#${task.targetId}`)
                          : isExpenseTask && campaignTitle
                            ? `${campaignTitle}${batchLabel ? ` · ${batchLabel}` : ''}`
                            : isExpenseTask && task.targetId && expenditureTitleById.get(task.targetId)
                              ? (expenditureTitleById.get(task.targetId) || `#${task.targetId}`)
                              : `#${task.targetId || task.id}`;

                      const resolvedTargetId = isExpenseTask ? (mappedCampaignId || task.targetId) : task.targetId;

                      return (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => openTask(task.type, resolvedTargetId)}
                          className="group flex w-full items-center gap-3 px-5 py-3 text-left transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-zinc-50"
                        >
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-700 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px]">
                            <TaskIcon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-zinc-800">
                              {getTaskLabel(task.type)} · {taskTitle}
                            </span>
                            <span className="mt-1 block text-xs text-zinc-500">
                              Cập nhật {getTimeAgo(task.updatedAt || task.createdAt)}
                            </span>
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${task.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-700'
                              : task.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-zinc-100 text-zinc-600'
                              }`}>
                              {task.status}
                            </span>
                            <ArrowTopRightIcon className="h-4 w-4 text-zinc-400" />
                          </span>
                        </button>
                      );
                    })
                )}
              </div>
            </div>
          </div>

          <div className="xl:col-span-4 space-y-3">
            <div className="rounded-[1.5rem] bg-black/5 p-1.5 ring-1 ring-black/5">
              <div className="rounded-[calc(1.5rem-0.375rem)] bg-white overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.65)]">
                <div className="px-5 py-2.5 border-b border-zinc-100">
                  <h3 className="inline-flex items-center gap-2 text-lg font-black tracking-tight text-zinc-900">
                    <BellIcon className="h-4 w-4" />
                    Thông báo
                    <span className="ml-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600">
                      {unreadCount}
                    </span>
                  </h3>
                </div>
                <div className="divide-y divide-zinc-100 max-h-[210px] overflow-y-auto">
                  {loadingTasks ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <div key={`alert-skeleton-${index}`} className="px-5 py-4 animate-pulse">
                        <div className="h-2.5 w-44 rounded bg-zinc-100" />
                        <div className="mt-2 h-2.5 w-28 rounded bg-zinc-100" />
                      </div>
                    ))
                  ) : (
                    alerts.slice(0, 8).map((alert) => (
                      <button
                        key={alert.id}
                        type="button"
                        onClick={() => openTask(alert.routeType, alert.targetId)}
                        className="group flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-zinc-50 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                      >
                        <span className={`mt-2 h-2.5 w-2.5 rounded-full ${badgeToneClass(alert.tone)}`} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-zinc-800 line-clamp-2">{alert.title}</span>
                          <span className="mt-1 block text-xs text-zinc-500">
                            {alert.timestamp ? `Cập nhật ${getTimeAgo(alert.timestamp)} · ` : ''}
                            {alert.meta}
                          </span>
                        </span>
                        <ArrowTopRightIcon className="h-4 w-4 text-zinc-400" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-black/5 p-1.5 ring-1 ring-black/5">
              <div className="rounded-[calc(1.5rem-0.375rem)] bg-white overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.65)]">
                <div className="px-5 py-3 border-b border-zinc-100">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-zinc-400">Today</p>
                  <h3 className="mt-1 inline-flex items-center gap-2 text-lg font-black tracking-tight text-zinc-900">
                    <UpdateIcon className="h-4 w-4" />
                    Lịch hẹn hôm nay
                  </h3>
                  <p className="mt-1 text-[11px] text-zinc-500 font-medium">Tỷ lệ xử lý hôm nay: {completionRate}%</p>
                </div>
                <div className="divide-y divide-zinc-100">
                  {todayAppointments.length === 0 ? (
                    <div className="px-5 py-6 text-sm font-medium text-zinc-500">Chưa có lịch hẹn trong hôm nay.</div>
                  ) : (
                    todayAppointments.slice(0, 5).map((appointment, index) => {
                      const sourceDate = appointment.startTime || appointment.dateTime || appointment.date;
                      const viewTime = sourceDate
                        ? new Date(sourceDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                        : '--:--';

                      return (
                        <div key={`${sourceDate}-${index}`} className="px-5 py-4 flex items-center gap-3">
                          <span className="inline-flex min-w-14 justify-center rounded-full bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-700">
                            {viewTime}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-zinc-800">
                              {appointment.title || appointment.campaignTitle || 'Lịch hẹn'}
                            </span>
                            <span className="mt-0.5 block text-xs text-zinc-500">
                              Trạng thái: {appointment.status || 'PENDING'}
                            </span>
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StaffProfileModal open={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </div>
  );
}
