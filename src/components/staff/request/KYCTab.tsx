'use client';

import { useState, useEffect } from 'react';
import { Shield, Search, CheckCircle, XCircle, Clock, User, Plus, Loader2, X, Eye } from 'lucide-react';
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

  useEffect(() => {
    if (initialUserId && users.length > 0) {
      const match = users.find(u => u.id === initialUserId);
      if (match) {
        setSelectedUser(match);
        if (!match.kycStatus) {
          setShowKycForm(true);
          onModalToggle?.(true);
        }
      }
    }
  }, [initialUserId, users, onModalToggle]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [usersResult, kycData] = await Promise.all([
        userService.getAllUsers(),
        kycService.getAll().catch(() => ({ content: [] as KycResponse[] }))
      ]);

      const kycMapNew = new Map<number, KycRequest>();
      const kycList = (kycData as any).content || [];
      kycList.forEach((kyc: KycRequest) => {
        kycMapNew.set(kyc.userId, kyc);
      });

      if (usersResult.success && usersResult.data) {
        const regularUsers = usersResult.data.filter(user => user.role !== 'STAFF' && user.role !== 'ADMIN');

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
    onModalToggle?.(false);
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

  const stats = {
    total: users.length,
    noKyc: users.filter(u => !u.kycStatus).length,
    submitted: users.filter(u => u.kycStatus === 'PENDING').length,
    verified: users.filter(u => u.kycStatus === 'APPROVED').length,
  };

  const handleCreateKYC = (user: UserWithKyc) => {
    setSelectedUser(user);
    setShowKycForm(true);
    onModalToggle?.(true);
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-3 flex-shrink-0">
        {[
          { label: 'Tổng người dùng', value: stats.total, color: 'from-[#446b5f] to-[#6a8d83]' },
          { label: 'Chưa có KYC', value: stats.noKyc, color: 'from-red-500 to-red-400' },
          { label: 'Chờ duyệt', value: stats.submitted, color: 'from-[#db5945] to-[#f19082]' },
          { label: 'Đã duyệt', value: stats.verified, color: 'from-[#446b5f] to-[#5a8075]' },
          { label: 'Bị từ chối', value: users.filter(u => u.kycStatus === 'REJECTED').length, color: 'from-gray-500 to-gray-400' },
        ].map(s => (
          <div key={s.label} className={`relative bg-gradient-to-br ${s.color} rounded-2xl p-4 text-white overflow-hidden shadow-sm`}>
            <span className="text-white/70 text-[10px] font-black uppercase tracking-wider block mb-1">{s.label}</span>
            <p className="text-2xl font-black relative z-10">{s.value}</p>
            <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 200 40" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,20 C40,35 80,5 120,20 C160,35 180,10 200,20 L200,40 L0,40 Z" fill="white" fillOpacity="0.1" />
              <path d="M0,28 C50,15 100,38 150,25 C170,20 185,30 200,28 L200,40 L0,40 Z" fill="white" fillOpacity="0.05" />
            </svg>
          </div>
        ))}
      </div>

      {/* Filter & Search */}
      <div className="flex items-center justify-between gap-4 flex-shrink-0 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-2">
          {(['ALL', 'NO_KYC', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`inline-flex h-8 items-center rounded-full border px-4 text-[10px] font-black uppercase tracking-widest transition-all ${filter === s
                  ? 'border-[#db5945]/30 bg-[#db5945]/10 text-[#db5945] shadow-sm'
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
            className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#db5945]/10 w-64 bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4 text-left">Người dùng</th>
              <th className="px-6 py-4 text-left">Email</th>
              <th className="px-6 py-4 text-left">Số CCCD</th>
              <th className="px-6 py-4 text-left">Ngày tạo</th>
              <th className="px-6 py-4 text-left">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-xs font-black text-gray-400 tracking-widest uppercase animate-pulse">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-xs font-black text-gray-400 tracking-widest uppercase">
                  Không tìm thấy người dùng
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const kycStatus = user.kycStatus;
                const statusConfigEntry = kycStatus ? statusConfig[kycStatus] : null;
                const StatusIcon = statusConfigEntry?.icon || Clock;
                return (
                  <tr
                    key={user.id}
                    className={`group hover:bg-gray-50/30 transition-colors ${selectedUser?.id === user.id ? 'bg-orange-50/20' : ''}`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white shadow-sm">
                          <User className="h-4 w-4 text-gray-400" />
                        </div>
                        <div>
                          <div className="font-black text-gray-900 text-xs uppercase tracking-tight">{user.fullName || 'N/A'}</div>
                          <div className="text-[10px] font-bold text-gray-400">ID: #{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-xs font-black text-gray-500">{user.kycData?.idNumber || '-'}</td>
                    <td className="px-6 py-4 text-[10px] font-bold text-gray-400">
                      {user.kycData?.createdAt ? new Date(user.kycData.createdAt).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {kycStatus && statusConfigEntry ? (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusConfigEntry.color} shadow-sm border border-white`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfigEntry.label}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-600 shadow-sm border border-white">
                          <XCircle className="h-3 w-3" />
                          Chưa KYC
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!kycStatus && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateKYC(user);
                          }}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <Plus className="h-3 w-3" />
                          Nhập KYC
                        </button>
                      )}
                      {kycStatus && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                            setShowKycForm(true);
                            onModalToggle?.(true);
                          }}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                            kycStatus === 'REJECTED'
                              ? 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <Eye className="h-3 w-3" />
                          {kycStatus === 'REJECTED' ? 'Nhập lại' : 'Xem chi tiết'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* KYC Form Modal */}
      {showKycForm && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                  Nhập KYC cho {selectedUser.fullName || `User #${selectedUser.id}`}
                </h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Thông tin định danh người dùng</p>
              </div>
              <button
                onClick={() => {
                  setShowKycForm(false);
                  onModalToggle?.(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>
            <div className="p-6 overflow-auto custom-scrollbar" style={{ maxHeight: 'calc(90vh - 100px)' }}>
              <KYCInputForm
                userId={selectedUser.id}
                userName={selectedUser.fullName}
                onSuccess={handleKycSuccess}
                onCancel={() => {
                  setShowKycForm(false);
                  onModalToggle?.(false);
                }}
                readOnly={selectedUser.kycStatus === 'APPROVED'}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
