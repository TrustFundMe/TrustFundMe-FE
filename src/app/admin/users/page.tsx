'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Eye,
  Search,
  Ban,
  CheckCircle2,
  MoreVertical,
  UserRound,
  Users,
  ChevronRight,
  ShieldAlert,
  Mail,
  Phone,
  Calendar,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import { userService, UserInfo } from '@/services/userService';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@/components/ui/modal';

const ITEMS_PER_PAGE = 7;

function StatusPill({ status }: { status: string | boolean | number }) {
  const isActive = status === 'ACTIVE' || status === true || status === 1 || status === '1';
  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1A685B]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#1A685B]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#1A685B] animate-pulse" />
        Hoạt động
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Đã khóa
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const cls =
    role === 'ADMIN'
      ? 'text-[#F84D43] bg-[#F84D43]/5 border-[#F84D43]/10'
      : role === 'STAFF'
        ? 'text-blue-600 bg-blue-50 border-blue-100'
        : role === 'FUND_OWNER'
          ? 'text-[#1A685B] bg-[#1A685B]/5 border-[#1A685B]/10'
          : 'text-slate-600 bg-slate-50 border-slate-100';

  return (
    <span className={`inline-flex rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest border shadow-sm ${cls}`}>
      {role}
    </span>
  );
}

export default function AdminUsersPage() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DISABLED'>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => { },
  });


  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await userService.getAllUsers();
    if (res.success && res.data) {
      setUsers(res.data);
    } else {
      setError(res.error || 'Failed to load users');
    }
    setLoading(false);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = users.filter((u) => {
      const isSearchMatch =
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phoneNumber && u.phoneNumber.includes(q));

      const matchesStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'ACTIVE'
            ? u.isActive
            : !u.isActive;

      const matchesRole = roleFilter === 'ALL' ? true : u.role === roleFilter;

      // Never show ADMIN accounts in this list
      const isNotAdmin = u.role !== 'ADMIN';

      return isSearchMatch && matchesStatus && matchesRole && isNotAdmin;
    });
    return result;
  }, [query, users, statusFilter, roleFilter]);

  const totalPages = useMemo(() => Math.ceil(filtered.length / ITEMS_PER_PAGE), [filtered, ITEMS_PER_PAGE]);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage, ITEMS_PER_PAGE]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, statusFilter, roleFilter]);

  const hasActiveFilters = query !== '' || statusFilter !== 'ALL' || roleFilter !== 'ALL';

  const clearFilters = () => {
    setQuery('');
    setStatusFilter('ALL');
    setRoleFilter('ALL');
  };

  const handleBanClick = (u: UserInfo) => {
    setConfirmConfig({
      show: true,
      title: 'Khóa tài khoản',
      message: `Bạn có chắc muốn khóa tài khoản ${u.fullName}? Hành động này sẽ tạm dừng quyền truy cập của họ vào hệ thống.`,
      isDestructive: true,
      onConfirm: async () => {
        const res = await userService.banUser(u.id);
        if (res.success) {
          setUsers((prev) => prev.map((user) => (user.id === u.id ? { ...user, isActive: false } : user)));
        } else {
          setError(res.error || 'Lỗi khi khóa người dùng');
        }
        setConfirmConfig(prev => ({ ...prev, show: false }));
      }
    });
  };

  const handleUnbanClick = (u: UserInfo) => {
    setConfirmConfig({
      show: true,
      title: 'Mở khóa tài khoản',
      message: `Bạn có chắc muốn khôi phục quyền truy cập cho ${u.fullName}?`,
      isDestructive: false,
      onConfirm: async () => {
        const res = await userService.unbanUser(u.id);
        if (res.success) {
          setUsers((prev) => prev.map((user) => (user.id === u.id ? { ...user, isActive: true } : user)));
        } else {
          setError(res.error || 'Lỗi khi mở khóa người dùng');
        }
        setConfirmConfig(prev => ({ ...prev, show: false }));
      }
    });
  };

  const handleViewDetails = (u: UserInfo) => {
    setSelectedUser(u);
    setIsDetailsOpen(true);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-3 flex-shrink-0">
        <div className="relative group/search flex-[2] max-w-2xl w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within/search:text-[#F84D43] transition-colors" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên, email hoặc số điện thoại..."
            className="w-full bg-white border-2 border-slate-100 rounded-3xl pl-12 pr-4 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-[#F84D43]/5 focus:border-[#F84D43] transition-all shadow-xl shadow-slate-100/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full md:w-44 rounded-3xl border-2 border-slate-100 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#F84D43]/5 focus:border-[#F84D43] transition-all shadow-xl shadow-slate-100/50 cursor-pointer appearance-none"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2003/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1rem' }}
          >
            <option value="ALL">Trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="DISABLED">Đã khóa</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full md:w-48 rounded-3xl border-2 border-slate-100 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#F84D43]/5 focus:border-[#F84D43] transition-all shadow-xl shadow-slate-100/50 cursor-pointer appearance-none"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2003/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1rem' }}
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="STAFF">Nhân viên</option>
            <option value="FUND_OWNER">Chủ quỹ</option>
            <option value="USER">Người dùng</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-6 py-3.5 rounded-3xl bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-200 hover:text-slate-900 transition-all ml-auto"
            >
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col rounded-[32px] border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 relative flex-1 min-h-0 overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="h-10 w-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div className="h-full overflow-auto custom-scrollbar">
          <table className="min-w-full text-sm border-separate border-spacing-0">
            <thead className="bg-slate-50">
              <tr className="text-left">
                <th className="py-3.5 pl-8 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Người dùng</th>
                <th className="py-3.5 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Trạng thái</th>
                <th className="py-3.5 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Vai trò</th>
                <th className="py-3.5 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Liên lạc</th>
                <th className="py-3.5 pr-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right border-b border-slate-100">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedData.map((u) => {
                const initials = u.fullName
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((p) => p[0]?.toUpperCase())
                  .join('');

                return (
                  <tr key={u.id} className="h-[68px] group hover:bg-slate-50/30 transition-colors">
                    <td className="py-2 pl-8 pr-4">
                      <div className="flex items-center gap-3">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt={u.fullName} className="h-10 w-10 rounded-2xl object-cover shadow-md ring-2 ring-white" />
                        ) : (
                          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 flex items-center justify-center font-black text-xs shadow-md ring-2 ring-white">
                            {initials || <UserRound className="h-5 w-5" />}
                          </div>
                        )}
                        <div className="leading-tight">
                          <div className="font-bold text-slate-900 group-hover:text-[#F84D43] transition-colors">{u.fullName}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5 font-medium">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 pr-4">
                      <StatusPill status={u.isActive} />
                    </td>

                    <td className="py-3 pr-4">
                      <RoleBadge role={u.role} />
                    </td>

                    <td className="py-3 pr-4">
                      <span className="text-sm font-bold text-slate-700">{u.phoneNumber || '—'}</span>
                    </td>

                    <td className="py-3 pr-8 text-right">
                      <div className="flex justify-end gap-1 transition-all">
                        <button
                          onClick={() => handleViewDetails(u)}
                          title="Chi tiết"
                          className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-lg transition-all"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {u.isActive ? (
                          <button
                            onClick={() => handleBanClick(u)}
                            title="Khóa tài khoản"
                            className="p-2 rounded-xl text-slate-400 hover:text-[#F84D43] hover:bg-white hover:shadow-lg transition-all"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnbanClick(u)}
                            title="Mở khóa tài khoản"
                            className="p-2 rounded-xl text-slate-400 hover:text-[#1A685B] hover:bg-white hover:shadow-lg transition-all"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && paginatedData.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Search className="h-8 w-8 text-slate-300" />
                      </div>
                      <p className="font-bold text-slate-500">Không tìm thấy người dùng phù hợp.</p>
                      <button onClick={clearFilters} className="mt-4 text-red-500 text-sm font-black uppercase tracking-widest hover:text-red-600 transition-colors">
                        Thử xóa bộ lọc
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              {/* Spacer to maintain height if less than 7 items */}
              {!loading && paginatedData.length < ITEMS_PER_PAGE && paginatedData.length > 0 && (
                Array.from({ length: ITEMS_PER_PAGE - paginatedData.length }).map((_, i) => (
                  <tr key={`spacer-${i}`} className="h-[68px] border-none">
                    <td colSpan={5}></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section - Always visible at bottom */}
        <div className="flex-shrink-0 border-t border-slate-100 bg-slate-50/50 px-8 py-3 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Trang {currentPage} / {totalPages} (Tổng {filtered.length})
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:shadow-md transition-all disabled:opacity-30 disabled:hover:shadow-none"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, i, arr) => (
                  <div key={p} className="flex items-center">
                    {i > 0 && arr[i - 1] !== p - 1 && <span className="px-1 text-slate-300">...</span>}
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${currentPage === p ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                    >
                      {p}
                    </button>
                  </div>
                ))}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:shadow-md transition-all disabled:opacity-30 disabled:hover:shadow-none"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <UserDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        user={selectedUser}
        onUpdate={(updatedUser) => {
          setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
          setSelectedUser(updatedUser);
        }}
      />

      {/* Custom Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmConfig.show}
        onClose={() => setConfirmConfig(prev => ({ ...prev, show: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        isDestructive={confirmConfig.isDestructive}
      />

      {error && (
        <div className="mt-4 p-4 rounded-[20px] bg-red-50 border-2 border-red-100 text-red-600 flex items-center gap-4 flex-shrink-0 shadow-xl shadow-red-500/5">
          <div className="h-10 w-10 bg-white rounded-2xl flex items-center justify-center shadow-md">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Cảnh báo hệ thống</p>
            <p className="text-sm font-bold">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}


function UserDetailsModal({
  isOpen,
  onClose,
  user,
  onUpdate
}: {
  isOpen: boolean;
  onClose: () => void;
  user: UserInfo | null;
  onUpdate: (u: UserInfo) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', phoneNumber: '' });
  const [errors, setErrors] = useState({ fullName: '', phoneNumber: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setEditForm({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || ''
      });
      setErrors({ fullName: '', phoneNumber: '' });
      setIsEditing(false);
    }
  }, [user, isOpen]);

  if (!user) return null;

  const validate = () => {
    const newErrors = { fullName: '', phoneNumber: '' };
    let isValid = true;

    const nameTrimmed = editForm.fullName.trim();
    if (!nameTrimmed) {
      newErrors.fullName = 'Tên không được để trống';
      isValid = false;
    } else {
      // 1. Độ dài (Length) 3-50 (tăng lên để chứa được tên đầy đủ có dấu cách)
      if (nameTrimmed.length < 3 || nameTrimmed.length > 50) {
        newErrors.fullName = 'Tên phải từ 3 đến 50 ký tự';
        isValid = false;
      }
      // 2. Định dạng khởi đầu (Bắt đầu bằng chữ cái) & Ký tự cho phép (Unicode chữ, số, dấu gạch dưới, dấu chấm và khoảng trắng)
      else if (!/^[\p{L}][\p{L}0-9._ ]*$/u.test(nameTrimmed)) {
        newErrors.fullName = 'Tên phải bắt đầu bằng chữ cái; chỉ cho phép chữ, số, dấu gạch dưới, dấu chấm và khoảng trắng';
        isValid = false;
      }
      // 3. Danh sách từ cấm (Banned words)
      else {
        const lowerName = nameTrimmed.toLowerCase();
        const bannedWords = ['admin', 'support', 'root'];
        if (bannedWords.some(w => lowerName.includes(w))) {
          newErrors.fullName = 'Tên không được chứa các từ cấm (admin, support, root)';
          isValid = false;
        }
      }
    }

    if (editForm.phoneNumber.trim()) {
      const phoneRegex = /^0[0-9]{9}$/;
      if (!phoneRegex.test(editForm.phoneNumber.trim())) {
        newErrors.phoneNumber = 'Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    const res = await userService.updateUser(user.id, {
      ...editForm,
      phoneNumber: editForm.phoneNumber.trim() || undefined
    });

    if (res.success && res.data) {
      onUpdate(res.data);
      setIsEditing(false);
    } else {
      const errorMsg = res.error || '';
      if (errorMsg.toLowerCase().includes('phone number already exists')) {
        setErrors(prev => ({ ...prev, phoneNumber: 'Số điện thoại này đã được sử dụng' }));
      } else if (errorMsg.toLowerCase().includes('email already exists')) {
        alert('Email này đã được sử dụng');
      } else {
        alert(errorMsg || 'Lỗi khi cập nhật thông tin');
      }
    }
    setIsSaving(false);
  };

  const initials = user.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <ModalTitle>Chi tiết người dùng</ModalTitle>
        </ModalHeader>
        <ModalBody className="p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 h-24 border-b border-slate-100" />
          <div className="px-8 pb-8">
            <div className="relative -mt-10 flex items-end gap-5 mb-6">
              <div className="relative">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName} className="h-24 w-24 rounded-[24px] object-cover ring-4 ring-white shadow-lg" />
                ) : (
                  <div className="h-24 w-24 rounded-[24px] bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 flex items-center justify-center font-bold text-2xl ring-4 ring-white shadow-lg">
                    {initials || <UserRound className="h-10 w-10" />}
                  </div>
                )}
                <div className={`absolute bottom-1.5 right-1.5 h-4 w-4 rounded-full border-2 border-white ${user.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              </div>
              <div className="flex-1 pb-1">
                <div className="flex items-center gap-2 mb-0.5">
                  {isEditing ? (
                    <div className="flex-1">
                      <input
                        value={editForm.fullName}
                        onChange={(e) => {
                          setEditForm(prev => ({ ...prev, fullName: e.target.value }));
                          if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
                        }}
                        className={`text-xl font-black text-slate-900 bg-white border-b-2 outline-none px-1 w-full ${errors.fullName ? 'border-red-500' : 'border-[#F84D43]'}`}
                        placeholder="Nhập họ tên..."
                        autoFocus
                      />
                      {errors.fullName && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.fullName}</p>}
                    </div>
                  ) : (
                    <h2 className="text-xl font-black text-slate-900">{user.fullName}</h2>
                  )}
                  <RoleBadge role={user.role} />
                </div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">#{user.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Thông tin liên hệ</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/50 border border-slate-100">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400">Email</p>
                      <p className="text-xs font-bold text-slate-700">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/50 border border-slate-100">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <div className="flex-1">
                      <p className="text-[9px] font-black uppercase text-slate-400">Số điện thoại</p>
                      {isEditing ? (
                        <div className="flex-1">
                          <input
                            value={editForm.phoneNumber}
                            onChange={(e) => {
                              setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }));
                              if (errors.phoneNumber) setErrors(prev => ({ ...prev, phoneNumber: '' }));
                            }}
                            className={`w-full bg-transparent text-xs font-bold text-slate-700 border-b outline-none py-0.5 ${errors.phoneNumber ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#F84D43]'}`}
                            placeholder="Nhập số điện thoại..."
                          />
                          {errors.phoneNumber && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.phoneNumber}</p>}
                        </div>
                      ) : (
                        <p className="text-xs font-bold text-slate-700">{user.phoneNumber || 'N/A'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Trạng thái tài khoản</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/50 border border-slate-100">
                    <CheckCircle className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400">Xác minh</p>
                      <p className={`text-xs font-bold ${user.verified ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {user.verified ? 'Đã xác minh' : 'Chưa xác minh'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/50 border border-slate-100">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400">Ngày tham gia</p>
                      <p className="text-xs font-bold text-slate-700">12/01/2026</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="justify-between">
          {isEditing ? (
            <div className="flex gap-2">
              <button
                disabled={isSaving}
                onClick={handleSave}
                className="px-6 py-2 rounded-xl bg-[#1A685B] text-white text-xs font-black uppercase tracking-widest hover:bg-[#155349] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              <button
                disabled={isSaving}
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 rounded-xl border-2 border-slate-100 text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                Hủy
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 rounded-xl border-2 border-slate-900 text-slate-900 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              Chỉnh sửa Profile
            </button>
          )}
          {!isEditing && (
            <button onClick={onClose} className="px-6 py-2 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
              Đóng
            </button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// Confirmation Dialog Component
function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, isDestructive }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isDestructive?: boolean;
}) {
  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle className={isDestructive ? 'text-red-600' : 'text-slate-900'}>{title}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p className="text-sm font-bold text-slate-600 leading-relaxed text-center">{message}</p>
        </ModalBody>
        <ModalFooter className="gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-100 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all ${isDestructive ? 'bg-red-600 hover:bg-red-700 shadow-red-100' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-100'
              }`}
          >
            Xác nhận
          </button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
