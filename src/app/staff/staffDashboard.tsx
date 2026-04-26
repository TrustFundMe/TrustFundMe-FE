'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Clock,
  FileCheck,
  Calendar,
  MessageSquare,
  Flag,
  Receipt,
  HelpCircle,
  Activity,
  ArrowUpRight,
  ClipboardList,
  RefreshCw,
  Loader2,
  Save,
  Pencil,
  Bell,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextProxy';
import { useRouter } from 'next/navigation';
import { api } from '@/config/axios';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { campaignService } from '@/services/campaignService';
import { kycService } from '@/services/kycService';
import { expenditureService } from '@/services/expenditureService';
import { useToast } from '@/components/ui/Toast';
import { AvatarUploader } from '@/components/ui/avatar-uploader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal';

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
    } catch (err: any) {
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
    } catch (err: any) {
      toast(err.response?.data?.message || 'Lỗi khi lưu thông tin', 'error');
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
                  <Pencil className="h-3 w-3 text-white" />
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
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [campaignNames, setCampaignNames] = useState<Map<number, string>>(new Map());
  const [taskExpCampaignMap, setTaskExpCampaignMap] = useState<Map<number, number>>(new Map());

  const fetchDashboardData = useCallback(async () => {
    if (!currentUser?.id) return;
    setLoadingTasks(true);
    try {
      const [staffTasks, appRes, postRes, userRes, pendingKyc, pendingExpenditures] = await Promise.all([
        campaignService.getTasksByStaff(currentUser.id).catch(() => []),
        api.get(API_ENDPOINTS.APPOINTMENTS.BY_STAFF(currentUser.id)).catch(() => ({ data: [] })),
        api.get(API_ENDPOINTS.FEED_POSTS.BY_AUTHOR(currentUser.id)).catch(() => ({ data: [] })),
        api.get(API_ENDPOINTS.USERS.BY_ID(currentUser.id)).catch(() => ({ data: null })),
        kycService.getPending().catch(() => ({ content: [] })),
        expenditureService.getByStatus('PENDING_REVIEW').catch(() => []),
      ]);

      const rawTasks = staffTasks ?? [];
      const appData = appRes.data;
      const postData = postRes.data;

      setAllTasks(rawTasks);
      setTasks(rawTasks.filter((t: any) => t.status !== 'COMPLETED').slice(0, 10));
      setAppointments(Array.isArray(appData) ? appData : (appData?.content ?? []));
      setPosts(Array.isArray(postData) ? postData : (postData?.content ?? []));
      setUser(userRes.data);

      const newAlerts: any[] = [];
      const campaignIdsToFetch = new Set<number>();
      const kycList = pendingKyc.content || [];
      const expList = Array.isArray(pendingExpenditures) ? pendingExpenditures : [];

      expList.forEach((e: any) => { if (e.campaignId) campaignIdsToFetch.add(e.campaignId); });

      const expenditureIdsFromTasks = rawTasks
        .filter((t: any) => (t.type === 'EXPENDITURE' || t.type === 'EVIDENCE') && t.targetId)
        .map((t: any) => t.targetId);

      const taskExpResults = await Promise.all(
        expenditureIdsFromTasks.map(id => expenditureService.getById(id).catch(() => null))
      );
      const taskExpMap = new Map<number, any>();
      taskExpResults.forEach(e => {
        if (e) {
          taskExpMap.set(e.id, e);
          if (e.campaignId) campaignIdsToFetch.add(e.campaignId);
        }
      });

      rawTasks.forEach((t: any) => {
        if (t.type === 'CAMPAIGN' && t.targetId) campaignIdsToFetch.add(t.targetId);
      });

      const campaignResults = await Promise.all(
        Array.from(campaignIdsToFetch).map(id => campaignService.getById(id).catch(() => null))
      );
      const campaignNameMap = new Map<number, string>();
      campaignResults.forEach(c => { if (c) campaignNameMap.set(c.id, c.title); });
      setCampaignNames(campaignNameMap);

      const expCampaignMap = new Map<number, number>();
      taskExpMap.forEach((exp, expId) => { if (exp.campaignId) expCampaignMap.set(expId, exp.campaignId); });
      setTaskExpCampaignMap(expCampaignMap);

      kycList.slice(0, 10).forEach((kyc: any) => {
        newAlerts.push({
          id: `kyc-${kyc.id}`, title: `Xác thực KYC: ${kyc.fullName || 'Người dùng'}`,
          time: 'Định danh', category: 'KYC', color: 'orange', tab: 'KYC', targetId: kyc.userId,
        });
      });

      expList.slice(0, 10).forEach((exp: any) => {
        const campaignTitle = campaignNameMap.get(exp.campaignId) || `#${exp.campaignId}`;
        newAlerts.push({
          id: `exp-${exp.id}`, title: `Phê duyệt chi tiêu: ${campaignTitle}`,
          time: 'Tài chính', category: 'Ngân sách', color: 'rose', tab: 'EXPENDITURE', targetId: exp.campaignId,
        });
      });

      rawTasks.filter(t => t.status === 'PENDING').slice(0, 10).forEach((t: any) => {
        let title = '';
        let targetId = t.targetId;
        if (t.type === 'CAMPAIGN') {
          title = `Duyệt chiến dịch: ${campaignNameMap.get(t.targetId) || `#${t.targetId}`}`;
        } else if (t.type === 'EXPENDITURE' || t.type === 'EVIDENCE') {
          const exp = taskExpMap.get(t.targetId);
          const campaignTitle = exp ? (campaignNameMap.get(exp.campaignId) || `#${exp.campaignId}`) : 'chiến dịch';
          title = t.type === 'EXPENDITURE' ? `Phê duyệt chi tiêu: ${campaignTitle}` : `Kiểm tra minh chứng: ${campaignTitle}`;
          targetId = exp?.campaignId || t.targetId;
        } else {
          title = `Nhiệm vụ ${t.type} mới`;
        }
        newAlerts.push({
          id: `task-${t.id}`, title, time: 'Hệ thống', category: 'Nhiệm vụ', color: 'orange',
          tab: (t.type === 'EXPENDITURE' || t.type === 'EVIDENCE') ? 'EXPENDITURE' : 'CAMPAIGN', targetId,
        });
      });

      setAlerts(newAlerts.length > 0 ? newAlerts : [
        { id: 'empty', title: 'Không có thông báo mới', time: '-', category: 'Info', color: 'gray' },
      ]);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoadingTasks(false);
    }
  }, [currentUser]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const getTimeAgo = (dateStr: string) => {
    try {
      const diffInSecs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
      if (diffInSecs < 60) return 'Vừa xong';
      const mins = Math.floor(diffInSecs / 60);
      if (mins < 60) return `${mins} phút trước`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours} giờ trước`;
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch { return 'Gần đây'; }
  };

  const getTaskLabel = (type: string) => {
    switch (type) {
      case 'CAMPAIGN': return 'Chiến dịch';
      case 'KYC': return 'KYC';
      case 'EXPENDITURE': return 'Chi tiêu';
      case 'EVIDENCE': return 'Minh chứng';
      case 'SUPPORT': return 'Hỗ trợ';
      default: return 'Yêu cầu';
    }
  };

  const getTaskRoute = (type: string) => {
    switch (type) {
      case 'KYC': return '/staff/request?tab=KYC';
      case 'CAMPAIGN': return '/staff/request?tab=CAMPAIGN';
      case 'EXPENDITURE': return '/staff/request?tab=EXPENDITURE';
      case 'EVIDENCE': return '/staff/request?tab=EVIDENCE';
      case 'SUPPORT': return '/staff/request?tab=SUPPORT';
      default: return '/staff/request';
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'KYC': return ShieldCheck;
      case 'CAMPAIGN': return FileCheck;
      case 'EXPENDITURE': return Receipt;
      case 'EVIDENCE': return ClipboardList;
      default: return HelpCircle;
    }
  };

  const pendingCount = allTasks.filter(t => t.status === 'PENDING' || t.status !== 'COMPLETED').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const completedToday = allTasks.filter(t => t.status === 'COMPLETED' && (t.updatedAt || t.createdAt)?.startsWith(todayStr)).length;
  const todayAppointments = appointments.filter(a => {
    const d = new Date(a.startTime || a.dateTime || a.date);
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const stats = [
    { label: 'Đang chờ xử lý', value: pendingCount, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Hoàn thành hôm nay', value: completedToday, icon: Activity, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Lịch hẹn hôm nay', value: todayAppointments.length, icon: Calendar, color: 'text-blue-600 bg-blue-50' },
    { label: 'Bài đăng đã viết', value: posts.length, icon: MessageSquare, color: 'text-violet-600 bg-violet-50' },
  ];

  return (
    <div className="flex-1 bg-gray-50/50 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">
              Xin chào, {user?.fullName || currentUser?.fullName || 'Staff'}
            </h1>
            <p className="text-xs text-gray-400 font-bold mt-0.5">
              {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên kiểm duyệt'} · TrustFundMe
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => fetchDashboardData()} disabled={loadingTasks}
              className="h-9 w-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-brand hover:border-brand/20 transition-colors">
              <RefreshCw className={`h-4 w-4 ${loadingTasks ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 hover:border-brand/20 transition-colors">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="h-7 w-7 rounded-lg object-cover" />
              ) : (
                <div className="h-7 w-7 rounded-lg bg-brand/10 text-brand flex items-center justify-center text-xs font-black">
                  {(user?.fullName?.[0] || 'S').toUpperCase()}
                </div>
              )}
              <span className="text-[11px] font-bold text-gray-700 hidden sm:block">{user?.fullName || 'Hồ sơ'}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-black text-gray-900 leading-none">{loadingTasks ? '-' : stat.value}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-1">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-brand" />
                <h2 className="text-xs font-black text-gray-700 uppercase tracking-widest">Nhiệm vụ cần xử lý</h2>
              </div>
              <span className="text-[10px] font-black text-gray-400">{tasks.length} nhiệm vụ</span>
            </div>
            <div className="divide-y divide-gray-50 max-h-[420px] overflow-y-auto">
              {loadingTasks ? (
                <div className="p-8 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-brand" />
                </div>
              ) : tasks.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-xs font-bold text-gray-400">Không có nhiệm vụ nào đang chờ</p>
                </div>
              ) : (
                tasks.map((task, i) => {
                  const Icon = getTaskIcon(task.type);
                  return (
                    <div key={task.id || i}
                      onClick={() => router.push(`${getTaskRoute(task.type)}${task.targetId ? `&targetId=${task.targetId}` : ''}`)}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 cursor-pointer group">
                      <div className="h-8 w-8 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4 text-brand" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-gray-800 truncate">
                          {getTaskLabel(task.type)}: {(() => {
                            if (task.type === 'CAMPAIGN') return campaignNames.get(task.targetId) || `#${task.targetId}`;
                            if (task.type === 'EXPENDITURE' || task.type === 'EVIDENCE') {
                              const campId = taskExpCampaignMap.get(task.targetId);
                              return campId ? (campaignNames.get(campId) || `#${campId}`) : `#${task.targetId}`;
                            }
                            return `#${task.targetId || task.id}`;
                          })()}
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium mt-0.5">
                          {task.createdAt ? getTimeAgo(task.createdAt) : 'Gần đây'}
                        </div>
                      </div>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        task.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                        task.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {task.status === 'PENDING' ? 'Chờ' : task.status === 'COMPLETED' ? 'Xong' : task.status}
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-brand transition-colors" />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right column: Alerts + Quick Actions */}
          <div className="space-y-6">
            {/* Alerts */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Bell className="h-4 w-4 text-brand" />
                <h2 className="text-xs font-black text-gray-700 uppercase tracking-widest">Thông báo</h2>
              </div>
              <div className="divide-y divide-gray-50 max-h-[260px] overflow-y-auto">
                {loadingTasks ? (
                  <div className="p-6 flex justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-brand" />
                  </div>
                ) : (
                  alerts.slice(0, 8).map((alert) => (
                    <div key={alert.id}
                      onClick={() => {
                        const baseRoute = getTaskRoute(alert.tab || alert.category);
                        router.push(`${baseRoute}${alert.targetId ? `&targetId=${alert.targetId}` : ''}`);
                      }}
                      className="flex items-start gap-2.5 px-5 py-3 hover:bg-gray-50 cursor-pointer group">
                      <div className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${
                        alert.color === 'rose' ? 'bg-rose-500' : alert.color === 'orange' ? 'bg-brand' : 'bg-gray-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-bold text-gray-700 line-clamp-2 group-hover:text-brand transition-colors">
                          {alert.title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-bold text-gray-400">{alert.time}</span>
                          <span className="text-[9px] font-black text-brand uppercase">{alert.category}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-brand rounded-xl p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-orange-200" />
                <span className="text-[9px] font-black uppercase tracking-widest text-orange-200">Thao tác nhanh</span>
              </div>
              <div className="space-y-1.5">
                {[
                  { icon: ShieldCheck, label: 'Duyệt KYC mới', href: '/staff/request?tab=KYC' },
                  { icon: FileCheck, label: 'Duyệt Chiến dịch', href: '/staff/request?tab=CAMPAIGN' },
                  { icon: Receipt, label: 'Kiểm tra Khoản chi', href: '/staff/request?tab=EXPENDITURE' },
                  { icon: Flag, label: 'Xem Báo cáo', href: '/staff/flags' },
                  { icon: Calendar, label: 'Lịch hẹn', href: '/staff/schedule' },
                  { icon: MessageSquare, label: 'Đăng Tin tức', href: '/staff/feed-post' },
                ].map((action, i) => (
                  <button key={i} onClick={() => router.push(action.href)}
                    className="w-full flex items-center gap-3 py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-left">
                    <action.icon className="w-4 h-4 text-orange-200" />
                    <span className="text-[10px] font-bold text-orange-100">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Today's Appointments */}
            {todayAppointments.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <h2 className="text-xs font-black text-gray-700 uppercase tracking-widest">Lịch hẹn hôm nay</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {todayAppointments.slice(0, 5).map((apt, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3">
                      <span className="text-[10px] font-black text-gray-900 w-12 shrink-0">
                        {new Date(apt.startTime || apt.dateTime || apt.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-gray-700 truncate">{apt.title || apt.campaignTitle || 'Lịch hẹn'}</p>
                      </div>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                        apt.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {apt.status === 'APPROVED' ? 'Xác nhận' : 'Chờ'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <StaffProfileModal open={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </div>
  );
}
