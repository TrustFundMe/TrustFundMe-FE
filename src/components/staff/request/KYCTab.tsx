'use client';

import { useState, useEffect } from 'react';
import { Shield, Search, CheckCircle, XCircle, Clock, User, Plus, Loader2, X, Eye, UserPlus, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { kycService } from '@/services/kycService';
import { KycResponse } from '@/types/kyc';
import { userService, UserInfo } from '@/services/userService';
import KYCInputForm from '@/components/staff/request/KYCInputForm';

type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface KycRequest {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  idType: string;
  idNumber: string;
  status: KycStatus;
  createdAt: string;
  updatedAt?: string;
}

interface UserWithKyc extends UserInfo {
  kycStatus?: KycStatus;
  kycId?: number;
  kycData?: KycRequest;
}

const statusConfig = {
  PENDING: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  APPROVED: { label: 'Đã duyệt', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  REJECTED: { label: 'Từ chối', color: 'bg-red-100 text-red-700', icon: XCircle },
};

interface KYCTabProps {
  initialUserId?: number | null;
  onModalToggle?: (open: boolean) => void;
}

export default function KYCTab({ initialUserId, onModalToggle }: KYCTabProps) {
  const [users, setUsers] = useState<UserWithKyc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithKyc | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'NO_KYC' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showKycForm, setShowKycForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  // Handle initial user selection only if intended
  useEffect(() => {
    if (initialUserId && users.length > 0 && !selectedUser) {
      const match = users.find(u => u.id === initialUserId);
      if (match) {
        setSelectedUser(match);
        setShowKycForm(true);
      }
    }
  }, [initialUserId, users]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [usersResult, kycData] = await Promise.all([
        userService.getAllUsers(0, 1000),
        kycService.getAll().catch(() => ({ content: [] as KycResponse[] }))
      ]);

      const kycMapNew = new Map<number, KycRequest>();
      const kycList = (kycData as any).content || [];
      kycList.forEach((kyc: KycRequest) => {
        kycMapNew.set(kyc.userId, kyc);
      });

      if (usersResult.success && usersResult.data && usersResult.data.content) {
        const regularUsers = usersResult.data.content.filter(user => user.role !== 'STAFF' && user.role !== 'ADMIN');

        const allUsersWithKyc: UserWithKyc[] = regularUsers.map(user => {
          const kyc = kycMapNew.get(user.id);
          return {
            ...user,
            kycStatus: kyc?.status,
            kycId: kyc?.id,
            kycData: kyc,
          };
        });
        setUsers(allUsersWithKyc);
      }
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Lỗi tải dữ liệu';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKycSuccess = async () => {
    setShowKycForm(false);
    toast.success('Gửi KYC thành công!');
    setRefreshKey(prev => prev + 1);
  };

  const filteredUsers = users.filter(user => {
    const kycStatus = user.kycStatus || 'NO_KYC';
    const matchesFilter = filter === 'ALL' ||
      (filter === 'NO_KYC' && !user.kycStatus) ||
      kycStatus === filter;

    const matchesSearch = searchTerm === '' ||
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toString().includes(searchTerm);

    return matchesFilter && matchesSearch;
  });

  const handleOpenForm = (user: UserWithKyc) => {
    setSelectedUser(user);
    setShowKycForm(true);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Filter & Search */}
      <div className="flex items-center justify-between gap-4 flex-shrink-0 bg-gray-50/50 p-2 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-2">
          {(['ALL', 'NO_KYC', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`inline-flex h-8 items-center rounded-full border px-4 text-[10px] font-black uppercase tracking-widest transition-all ${filter === s
                ? 'border-[#446b5f]/30 bg-[#446b5f]/10 text-[#446b5f] shadow-sm'
                : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                }`}
            >
              {s === 'ALL' ? 'Tất cả' : s === 'NO_KYC' ? 'Chưa KYC' : statusConfig[s as KycStatus]?.label || s}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-xl border border-gray-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#446b5f]/10 w-[500px] bg-white transition-all focus:w-[550px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        {/* Table Area */}
        <div className={`flex flex-col gap-3 overflow-hidden transition-all duration-300 ${showKycForm ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          <div className="flex items-center justify-between flex-shrink-0 px-1">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Danh sách người dùng ({filteredUsers.length})</h2>
          </div>
          <div className="flex-1 overflow-auto rounded-xl border border-gray-100 shadow-sm bg-white relative">
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead className="sticky top-0 z-20">
                <tr className="bg-[#446b5f] text-white">
                  <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest first:rounded-tl-xl last:rounded-tr-xl">Người dùng</th>
                  <th className={`px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest ${showKycForm ? 'hidden xl:table-cell' : ''}`}>Email</th>
                  <th className={`px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest ${showKycForm ? 'hidden xl:table-cell' : ''}`}>Số CCCD</th>
                  <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest">Trạng thái</th>
                  <th className="px-6 py-4 text-right text-[11px] font-black uppercase tracking-widest last:rounded-tr-xl">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-xs font-black text-gray-400 tracking-widest uppercase animate-pulse">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-xs font-black text-gray-400 tracking-widest uppercase">
                      Không tìm thấy người dùng
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const kycStatus = user.kycStatus;
                    const statusConfigEntry = kycStatus ? statusConfig[kycStatus] : null;
                    const StatusIcon = statusConfigEntry?.icon || Clock;
                    const isSelected = selectedUser?.id === user.id;

                    return (
                      <tr
                        key={user.id}
                        onClick={() => {
                          setSelectedUser(user);
                          if (!showKycForm) setShowKycForm(true);
                        }}
                        className={`group transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-[#446b5f]/10' 
                            : 'hover:bg-[#446b5f]/5'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-full flex items-center justify-center border-2 border-white shadow-sm transition-colors ${
                              isSelected ? 'bg-[#446b5f]/20 text-[#446b5f]' : 'bg-gray-100 text-gray-400 group-hover:bg-[#446b5f]/10 group-hover:text-[#446b5f]'
                            }`}>
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="font-black text-gray-900 text-xs uppercase tracking-tight">{user.fullName || 'N/A'}</div>
                                <div className="text-[10px] font-bold text-gray-400">ID: #{user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 text-xs font-bold text-gray-500 ${showKycForm ? 'hidden xl:table-cell' : ''}`}>
                          {user.email}
                        </td>
                        <td className={`px-6 py-4 text-xs font-black text-gray-500 ${showKycForm ? 'hidden xl:table-cell' : ''}`}>
                          {user.kycData?.idNumber
                            ? user.kycData.idNumber
                            : <span className="text-gray-400 font-bold italic text-[10px]">Chưa cập nhật</span>}
                        </td>

                        <td className="px-6 py-4">
                          {kycStatus && statusConfigEntry ? (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${statusConfigEntry.color} shadow-sm border border-white`}>
                              <StatusIcon className="h-3 w-3" />
                              {statusConfigEntry.label}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-50 text-red-600 shadow-sm border border-white">
                              <XCircle className="h-3 w-3" />
                              Chưa KYC
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenForm(user);
                            }}
                            className={`p-2.5 rounded-xl transition-all shadow-sm ${
                              isSelected ? 'bg-[#446b5f] text-white shadow-[#446b5f]/30' : 'bg-gray-100 text-gray-600 hover:bg-[#446b5f] hover:text-white'
                            }`}
                            title={kycStatus === 'APPROVED' ? 'Xem chi tiết' : 'Nhập KYC'}
                          >
                            {kycStatus === 'APPROVED' ? <Eye className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
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

        {/* Form Area */}
        <div className={`lg:col-span-5 flex flex-col gap-3 overflow-hidden transition-all duration-300 animate-in slide-in-from-right-4 ${showKycForm ? 'opacity-100' : 'hidden opacity-0'}`}>
           <div className="flex items-center justify-between flex-shrink-0 px-1">
             <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-[#446b5f] flex items-center justify-center text-white shadow-lg shadow-[#446b5f]/20">
                   <Shield className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-black text-gray-800 uppercase tracking-[0.1em]">
                  {selectedUser?.kycStatus === 'APPROVED' ? 'Thông tin xác thực (KYC)' : 'Thiết lập xác thực KYC'}
                </h2>
             </div>
             <button 
                onClick={() => setShowKycForm(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
             >
                <X className="h-4 w-4" />
             </button>
           </div>
           
           <div className="flex-1 overflow-auto rounded-2xl border border-gray-100 shadow-sm bg-white p-6 custom-scrollbar relative">
              {selectedUser ? (
                <div className="space-y-6">
                <KYCInputForm
                    userId={selectedUser.id}
                    userName={selectedUser.fullName}
                    onSuccess={handleKycSuccess}
                    onCancel={() => setShowKycForm(false)}
                    readOnly={selectedUser.kycStatus === 'APPROVED'}
                  />
                  {selectedUser.kycStatus === 'REJECTED' && (
                    <div className="mt-4 p-4 rounded-xl bg-orange-50 border border-orange-100">
                      <div className="flex items-center gap-2 text-orange-700 mb-1">
                        <Info className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Ghi chú từ chối</span>
                      </div>
                      <p className="text-xs text-orange-600 font-medium">{selectedUser.kycData?.updatedAt ? 'Dữ liệu không khớp hoặc ảnh mờ. Vui lòng cập nhật lại.' : 'Thông tin chưa đầy đủ.'}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-50 space-y-3">
                   <UserPlus className="h-12 w-12" />
                   <p className="text-[10px] font-black uppercase tracking-widest">Chọn người dùng để nhập KYC</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
