'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  UserPlus,
  TrendingUp,
  RefreshCw,
  LayoutGrid,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  MoreHorizontal,
  Plus,
  X,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Aurora from '@/components/ui/Aurora';
import { userService, UserInfo } from '@/services/userService';
import { kycService } from '@/services/kycService';
import { toast } from 'react-hot-toast';
import KYCInputForm from '@/components/staff/request/KYCInputForm';

// --- Sub-components (Dashboard Style) ---

const StatCard = ({ icon: Icon, label, value, progress, footer, bgColor, iconColor }: any) => (
  <div className={`p-4 rounded-[20px] ${bgColor} border border-white/50 backdrop-blur-md flex flex-col justify-between shadow-sm`}>
    <div className="flex justify-between items-start">
      <div className={`h-8 w-8 rounded-xl bg-white flex items-center justify-center ${iconColor} shadow-sm`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-right">
        <div className="text-[10px] text-gray-400 font-black uppercase tracking-tight">{label}</div>
        <div className="text-sm font-black text-gray-900">{value}</div>
      </div>
    </div>
    <div className="mt-4">
      <div className="text-[10px] font-black text-gray-700 mb-2 uppercase tracking-widest">{footer}</div>
      <div className="h-1.5 w-full bg-white/60 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className={`h-full ${iconColor.replace('text-', 'bg-')} rounded-full shadow-[0_0_8px_rgba(0,0,0,0.05)]`}
        />
      </div>
    </div>
  </div>
);

// --- Main Page Implementation ---

export default function StaffUserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [kycs, setKycs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showKycForm, setShowKycForm] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Stats calculation
  const stats = useMemo(() => {
    const total = users.length;
    const pendingKyc = kycs.filter(k => k.status === 'PENDING').length;
    const approvedKyc = kycs.filter(k => k.status === 'APPROVED').length;
    const owners = users.filter(u => u.role === 'FUND_OWNER').length;

    return [
      { icon: Users, label: 'Tổng người dùng', value: total, progress: 100, footer: 'Đang hoạt động', bgColor: 'bg-blue-50/50', iconColor: 'text-blue-500' },
      { icon: ShieldCheck, label: 'Đang chờ KYC', value: pendingKyc, progress: (pendingKyc / (total || 1)) * 100, footer: `${pendingKyc} yêu cầu ưu tiên`, bgColor: 'bg-orange-50/50', iconColor: 'text-orange-500' },
      { icon: CheckCircle, label: 'Đã xác thực', value: approvedKyc, progress: (approvedKyc / (total || 1)) * 100, footer: 'Xác thực định danh', bgColor: 'bg-emerald-50/50', iconColor: 'text-emerald-500' },
      { icon: TrendingUp, label: 'Chủ quỹ', value: owners, progress: (owners / (total || 1)) * 100, footer: 'Tổ chức/Cá nhân', bgColor: 'bg-violet-50/50', iconColor: 'text-violet-500' },
    ];
  }, [users, kycs]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uRes, kRes] = await Promise.all([
        userService.getAllUsers(0, 1000), // Load a good chunk for the dashboard
        kycService.getAll().catch(() => ({ content: [] }))
      ]);

      if (uRes.success) {
        setUsers(uRes.data?.content || []);
      }
      setKycs((kRes as any).content || []);
    } catch (e) {
      toast.error('Lỗi nạp dữ liệu người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const kyc = kycs.find(k => k.userId === u.id);
      const kStatus = kyc?.status || 'NO_KYC';
      
      const matchesFilter = filterStatus === 'ALL' || kStatus === filterStatus || (filterStatus === 'NO_KYC' && !kyc);
      const matchesSearch = !searchTerm || 
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });
  }, [users, kycs, searchTerm, filterStatus]);

  const handleOpenKyc = (user: any) => {
    setSelectedUser(user);
    setShowKycForm(true);
  };

  return (
    <div className="h-full relative flex flex-col p-4 lg:p-6 bg-slate-50/40 dark:bg-zinc-950/40 overflow-hidden gap-6">
      {/* Background Aurora */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <Aurora
          colorStops={["#3b82f6", "#8b5cf6", "#4ade80"]}
          blend={0.5}
          amplitude={1.2}
          speed={0.5}
        />
      </div>

      <div className="relative z-10 flex flex-col h-full gap-5">
        
        {/* Header Section */}
        <div className="flex items-center justify-between px-2 flex-shrink-0">
            <div className="flex flex-col">
                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                    <Users className="w-6 h-6 text-[#1A685B]" />
                    Quản lý người dùng
                </h1>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1 ml-9">Xác thực KYC & Phân quyền tài khoản</p>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#1A685B] transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Tìm người dùng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-2xl border border-white/50 bg-white/80 backdrop-blur-md shadow-sm text-xs font-bold w-[300px] focus:outline-none focus:ring-2 focus:ring-[#1A685B]/20 transition-all"
                    />
                </div>
                <button 
                  onClick={fetchData}
                  className="h-10 w-10 rounded-2xl border border-white/50 bg-white/80 backdrop-blur-md flex items-center justify-center text-gray-400 hover:text-[#1A685B] transition shadow-sm group active:scale-95"
                >
                  <RefreshCw className={`h-5 w-5 transition-transform ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                </button>
            </div>
        </div>

        {/* Dynamic Display Layout */}
        <div className="flex-1 min-h-0 flex gap-6">
          
          {/* LEFT COLUMN: Stats & Chart */}
          <div className="flex-[3.5] flex flex-col gap-6">
             <div className="grid grid-cols-2 gap-4">
                {stats.map((s, i) => (
                    <StatCard key={i} {...s} />
                ))}
             </div>
             
             {/* Simple Performance/Growth Placeholder */}
             <div className="flex-1 bg-white/60 backdrop-blur-md rounded-[32px] p-6 border border-white/40 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Tăng trưởng</h3>
                   <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black">+12.5%</div>
                </div>
                <div className="flex-1 flex items-end gap-1.5 h-full min-h-[140px]">
                   {[40, 60, 45, 90, 65, 85, 100, 75, 80, 55, 70, 95].map((h, i) => (
                       <motion.div 
                         key={i}
                         initial={{ height: 0 }}
                         animate={{ height: `${h}%` }}
                         className={`flex-1 rounded-t-lg ${i === 6 ? 'bg-[#1A685B]' : 'bg-[#1A685B]/20'} hover:bg-[#1A685B]/40 transition-colors`}
                       />
                   ))}
                </div>
                <div className="mt-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Biểu đồ người dùng mới (12 tháng qua)</div>
             </div>
          </div>

          {/* RIGHT COLUMN: Table Area */}
          <div className="flex-[8.5] bg-white/60 backdrop-blur-md rounded-[32px] border border-white/40 shadow-sm flex flex-col overflow-hidden">
             
             {/* Table Filters Header */}
             <div className="p-6 pb-2 flex items-center justify-between border-b border-gray-100/50">
                <div className="flex items-center gap-2">
                   {['ALL', 'PENDING', 'APPROVED', 'NO_KYC'].map(s => (
                       <button 
                         key={s}
                         onClick={() => setFilterStatus(s)}
                         className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-[#1A685B] text-white shadow-md shadow-[#1A685B]/20' : 'bg-white text-gray-400 border border-gray-100'}`}
                       >
                          {s === 'ALL' ? 'Tất cả' : s === 'PENDING' ? 'Mới' : s === 'APPROVED' ? 'Đã xác thực' : 'Chưa định danh'}
                       </button>
                   ))}
                </div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{filteredUsers.length} người dùng</div>
             </div>

             {/* The Actual Table */}
             <div className="flex-1 overflow-auto custom-scrollbar p-6">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                       <th className="pb-4 pt-1 px-2">Hồ sơ</th>
                       <th className="pb-4 pt-1 px-2">Email</th>
                       <th className="pb-4 pt-1 px-2 text-center">Vai trò</th>
                       <th className="pb-4 pt-1 px-2 text-center">KYC</th>
                       <th className="pb-4 pt-1 px-2 text-right">Tác vụ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                       Array.from({ length: 5 }).map((_, i) => (
                           <tr key={i} className="animate-pulse">
                              <td colSpan={5} className="py-4 h-16 bg-gray-50/50 rounded-2xl mb-2" />
                           </tr>
                       ))
                    ) : filteredUsers.length === 0 ? (
                       <tr>
                         <td colSpan={5} className="py-20 text-center">
                            <AlertCircle className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Không tìm thấy người dùng phù hợp</p>
                         </td>
                       </tr>
                    ) : (
                        filteredUsers.map((user) => {
                            const kyc = kycs.find(k => k.userId === user.id);
                            return (
                                <tr key={user.id} className="group hover:bg-[#1A685B]/5 transition-colors">
                                    <td className="py-4 px-2">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-2xl bg-[#1A685B]/10 flex items-center justify-center text-[#1A685B] font-black text-xs shadow-inner">
                                                {user.fullName?.charAt(0) || 'U'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-gray-900 group-hover:text-[#1A685B] transition-colors">{user.fullName || 'Người dùng mới'}</span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">ID: #{user.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-2 text-xs font-bold text-gray-500">{user.email}</td>
                                    <td className="py-4 px-2 text-center">
                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${user.role === 'USER' ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-4 px-2 text-center">
                                        {kyc ? (
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight ${kyc.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                                                <div className={`h-1.5 w-1.5 rounded-full ${kyc.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-orange-500 animate-pulse'}`} />
                                                {kyc.status === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt'}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-black text-gray-300 uppercase italic">Chưa KYC</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-2 text-right">
                                        <button 
                                          onClick={() => handleOpenKyc(user)}
                                          className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-[#1A685B] hover:text-white transition-all shadow-sm group-hover:shadow-md"
                                        >
                                            {kyc?.status === 'APPROVED' ? <Eye className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                        </button>
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
      </div>

      {/* KYC MODAL (GLASSED) */}
      <AnimatePresence>
        {showKycForm && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowKycForm(false)}
               className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-[500px] h-full bg-white shadow-2xl flex flex-col p-8 gap-8"
            >
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-2xl bg-[#1A685B] flex items-center justify-center text-white shadow-xl shadow-[#1A685B]/20">
                        <ShieldCheck className="w-6 h-6" />
                     </div>
                     <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Xác thực danh tính</h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedUser.fullName}</p>
                     </div>
                  </div>
                  <button 
                    onClick={() => setShowKycForm(false)}
                    className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-red-500 transition-colors"
                  >
                     <X className="h-5 w-5" />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    <KYCInputForm 
                      userId={selectedUser.id}
                      userName={selectedUser.fullName}
                      onSuccess={() => { setShowKycForm(false); fetchData(); }}
                      onCancel={() => setShowKycForm(false)}
                      readOnly={kycs.find(k => k.userId === selectedUser.id)?.status === 'APPROVED'}
                      onImageClick={setLightboxImage}
                    />
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-8 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <img
            src={lightboxImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
          />
          <button className="absolute top-8 right-8 text-white p-2 bg-white/10 rounded-full hover:bg-white/20">
             <X className="h-8 w-8" />
          </button>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
