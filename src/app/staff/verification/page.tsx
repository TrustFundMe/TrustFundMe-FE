'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Shield, Search, CheckCircle, XCircle, Clock, User, Plus, Loader2, X } from 'lucide-react';
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

export default function VerificationPage() {
  const [users, setUsers] = useState<UserWithKyc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithKyc | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'NO_KYC' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showKycForm, setShowKycForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const userIdParam = useSearchParams().get('userId');

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  useEffect(() => {
    if (userIdParam && users.length > 0) {
      const num = Number(userIdParam);
      if (!isNaN(num)) {
        const match = users.find(u => u.id === num);
        if (match) {
          setSelectedUser(match);
          // If user has no KYC, show form
          if (!match.kycStatus) {
            setShowKycForm(true);
          }
        }
      }
    }
  }, [userIdParam, users]);

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
        // Filter out STAFF and ADMIN roles, then map with KYC data
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
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load data';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKycSuccess = async () => {
    setShowKycForm(false);
    toast.success('KYC submitted successfully!');
    setRefreshKey(prev => prev + 1);
    fetchData();
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
  };

  return (
    <div className="flex flex-col h-full bg-[#f1f5f9]">
      {/* Header */}
      <div className="flex items-end px-6 gap-2 h-14">
        <button className="relative px-6 py-2.5 text-sm font-bold transition-all duration-200 bg-white text-[#db5945] rounded-t-2xl shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.05)] z-20 h-11">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#db5945]" />
            <span className="whitespace-nowrap">KYC Verification</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#db5945]/10 text-[#db5945]">
              {users.length}
            </span>
          </div>
          <div className="absolute -bottom-2 left-0 right-0 h-4 bg-white z-30" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 bg-white mx-2 mb-2 rounded-[24px] shadow-sm border border-gray-100 overflow-hidden relative z-10 flex flex-col">
        <div className="flex-1 overflow-hidden p-6 flex flex-col gap-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-5 gap-3 flex-shrink-0">
            {[
              { label: 'Tổng users', value: stats.total, color: 'from-[#446b5f] to-[#6a8d83]' },
              { label: 'Chưa có KYC', value: stats.noKyc, color: 'from-red-500 to-red-400' },
              { label: 'Chờ duyệt', value: stats.submitted, color: 'from-[#db5945] to-[#f19082]' },
              { label: 'Đã duyệt', value: stats.verified, color: 'from-green-500 to-green-400' },
              { label: 'Bị từ chối', value: users.filter(u => u.kycStatus === 'REJECTED').length, color: 'from-gray-500 to-gray-400' },
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

          {/* Filter & Search */}
          <div className="flex items-center justify-between gap-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              {(['ALL', 'NO_KYC', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold shadow-sm transition ${filter === s
                      ? 'border-[#db5945]/30 bg-[#db5945]/10 text-[#db5945]'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {s === 'ALL' ? 'Tất cả' : s === 'NO_KYC' ? 'Chưa có KYC' : statusConfig[s as KycStatus]?.label || s}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-[#db5945] w-64"
              />
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto rounded-xl border border-gray-100 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Người dùng</th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Số CCCD</th>
                  <th className="px-4 py-3 text-left font-semibold">Ngày tạo</th>
                  <th className="px-4 py-3 text-left font-semibold">Trạng thái KYC</th>
                  <th className="px-4 py-3 text-left font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-500">No users found</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const kycStatus = user.kycStatus;
                    const statusConfigEntry = kycStatus ? statusConfig[kycStatus] : null;
                    const StatusIcon = statusConfigEntry?.icon || Clock;
                    return (
                      <tr
                        key={user.id}
                        className={`cursor-pointer hover:bg-gray-50 ${selectedUser?.id === user.id ? 'bg-orange-50/40' : ''}`}
                        onClick={() => setSelectedUser(user)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-500" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{user.fullName || 'N/A'}</div>
                              <div className="text-[10px] text-gray-500">ID: {user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{user.email}</td>
                        <td className="px-4 py-3 text-gray-700">{user.kycData?.idNumber || '-'}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {user.kycData?.createdAt ? new Date(user.kycData.createdAt).toLocaleDateString('vi-VN') : '-'}
                        </td>
                        <td className="px-4 py-3">
                          {kycStatus && statusConfigEntry ? (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfigEntry.color}`}>
                              <StatusIcon className="h-3 w-3" />
                              {statusConfigEntry.label}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              <XCircle className="h-3 w-3" />
                              Chưa có KYC
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {!kycStatus && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCreateKYC(user);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
                            >
                              <Plus className="h-3 w-3" />
                              Nhập KYC
                            </button>
                          )}
                          {kycStatus === 'REJECTED' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCreateKYC(user);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-700 hover:bg-orange-200"
                            >
                              <Plus className="h-3 w-3" />
                              Nhập lại
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
        </div>
      </div>

      {/* KYC Form Modal */}
      {showKycForm && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto m-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">
                Nhập KYC cho {selectedUser.fullName || `User #${selectedUser.id}`}
              </h2>
              <button
                onClick={() => setShowKycForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <KYCInputForm
                userId={selectedUser.id}
                userName={selectedUser.fullName}
                onSuccess={handleKycSuccess}
                onCancel={() => setShowKycForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
