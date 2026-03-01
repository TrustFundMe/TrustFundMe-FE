'use client';

import { useState, useEffect } from 'react';
import { Shield, Search, CheckCircle, XCircle, Clock, User, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { kycService } from '@/services/kycService';

type KycStatus = 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';

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

const statusConfig = {
  PENDING: { label: 'Chưa nộp', color: 'bg-gray-100 text-gray-600', icon: Clock },
  SUBMITTED: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  VERIFIED: { label: 'Đã duyệt', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  REJECTED: { label: 'Từ chối', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function VerificationPage() {
  const [kycRequests, setKycRequests] = useState<KycRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<KycRequest | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
    fetchKycRequests();
    }, []);

  const fetchKycRequests = async () => {
    try {
      setLoading(true);
      const data = await kycService.getAll();
      setKycRequests(data.content || []);
    } catch (error) {
      console.error('Failed to fetch KYC requests:', error);
      toast.error('Failed to load KYC requests');
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = kycRequests.filter(req => {
    const matchesFilter = filter === 'ALL' || req.status === filter;
    const matchesSearch = searchTerm === '' || 
      req.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.idNumber.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: kycRequests.length,
    pending: kycRequests.filter(r => r.status === 'PENDING').length,
    submitted: kycRequests.filter(r => r.status === 'SUBMITTED').length,
    verified: kycRequests.filter(r => r.status === 'VERIFIED').length,
    };

    return (
        <div className="flex flex-col h-full bg-[#f1f5f9]">
      {/* Header */}
            <div className="flex items-end px-6 gap-2 h-14">
        <button className="relative px-6 py-2.5 text-sm font-bold transition-all duration-200 bg-white text-[#db5945] rounded-t-2xl shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.05)] z-20 h-11">
                    <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#db5945]" />
                        <span className="whitespace-nowrap">KYC Requests</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#db5945]/10 text-[#db5945]">
              {kycRequests.length}
                        </span>
                    </div>
          <div className="absolute -bottom-2 left-0 right-0 h-4 bg-white z-30" />
                </button>
            </div>

      {/* Body */}
      <div className="flex-1 bg-white mx-2 mb-2 rounded-[24px] shadow-sm border border-gray-100 overflow-hidden relative z-10 flex flex-col">
        <div className="flex-1 overflow-hidden p-6 flex flex-col gap-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-3 flex-shrink-0">
            {[
              { label: 'Tổng cộng', value: stats.total, color: 'from-[#446b5f] to-[#6a8d83]' },
              { label: 'Chưa nộp', value: stats.pending, color: 'from-gray-500 to-gray-400' },
              { label: 'Chờ duyệt', value: stats.submitted, color: 'from-[#db5945] to-[#f19082]' },
              { label: 'Đã duyệt', value: stats.verified, color: 'from-[#446b5f] to-[#5a8075]' },
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
              {(['ALL', 'PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED'] as const).map((s) => (
                            <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold shadow-sm transition ${
                    filter === s
                      ? 'border-[#db5945]/30 bg-[#db5945]/10 text-[#db5945]'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {s === 'ALL' ? 'Tất cả' : statusConfig[s]?.label || s}
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
                  <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-500">No requests found</td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => {
                    const StatusIcon = statusConfig[req.status]?.icon || Clock;
                    return (
                      <tr
                        key={req.id}
                        className={`cursor-pointer hover:bg-gray-50 ${selectedRequest?.id === req.id ? 'bg-orange-50/40' : ''}`}
                        onClick={() => setSelectedRequest(req)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-500" />
                            </div>
                                    <div>
                              <div className="font-semibold text-gray-900">{req.fullName}</div>
                              <div className="text-[10px] text-gray-500">ID: {req.userId}</div>
                            </div>
                            </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{req.email}</td>
                        <td className="px-4 py-3 text-gray-700">{req.idNumber}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[req.status]?.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig[req.status]?.label}
                          </span>
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
    );
}
