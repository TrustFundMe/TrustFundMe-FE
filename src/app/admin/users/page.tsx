'use client';

import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast, Toaster } from 'react-hot-toast';
import {
  Eye,
  Ban,
  CheckCircle2,
  ShieldAlert,
  UserRound,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  FileDown,
  FileUp,
  Plus,
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
import { DataTable } from '@/components/admin/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TooltipWrapper } from '@/components/TooltipWrapper';

export default function AdminUsersPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
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

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DISABLED'>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await userService.exportUsers();

      let filename = `quanlynguoidung_${new Date().toISOString().slice(0, 10)}.xlsx`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Xuất file Excel thành công');
    } catch (error: any) {
      toast.error('Lỗi khi xuất file Excel');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await userService.downloadUsersTemplate();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template_import_nguoidung.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Đã tải file mẫu');
    } catch (error) {
      toast.error('Lỗi khi tải file mẫu');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[handleImport] triggered, files:', e.target.files);
    const file = e.target.files?.[0];
    if (!file) {
      console.log('[handleImport] no file selected');
      return;
    }
    console.log('[handleImport] file:', file.name, file.size);

    try {
      setIsImporting(true);
      const loadingToast = toast.loading('Đang xử lý file Excel...');
      const res = await userService.importUsers(file);
      toast.dismiss(loadingToast);

      if (res.success) {
        console.log('[handleImport] success:', res.message);
        if (res.imported === 0 && res.skipped && res.skipped > 0) {
          // All rows skipped
          toast(res.message || 'Tất cả dòng bị bỏ qua', {
            icon: '⚠️',
            style: { maxWidth: '500px', whiteSpace: 'pre-line' },
          });
        } else {
          toast.success(res.message || 'Nhập dữ liệu thành công');
        }
        refetch();
      } else {
        console.log('[handleImport] failed:', res.error);
        toast.error(res.error || 'Lỗi khi nhập dữ liệu');
      }
    } catch (error: any) {
      console.error('[handleImport] catch error:', error);
      toast.error('Lỗi khi nhập dữ liệu: ' + (error?.message || ''));
    } finally {
      setIsImporting(false);
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  const { data: usersData, isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: ['admin-users', page, pageSize],
    queryFn: async () => {
      const res = await userService.getAllUsers(page, pageSize);
      if (!res.success) throw new Error(res.error || 'Failed to fetch users');
      return res.data;
    }
  });

  const error = queryError ? (queryError as Error).message : null;
  const totalPages = usersData?.totalPages || 0;

  // DEBUG pagination
  console.log('[DEBUG] usersData.content.length:', usersData?.content?.length, '| pageSize prop:', pageSize, '| totalPages:', totalPages);

  // Áp dụng bộ lọc Role/Status và cắt gộp nếu API BE bị cứng pageSize=10
  const users = useMemo(() => {
    let list = usersData?.content || [];
    
    // Client-side Filter
    list = list.filter(u => {
      const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? u.isActive : !u.isActive);
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const isNotAdmin = u.role !== 'ADMIN';
      return matchesStatus && matchesRole && isNotAdmin;
    });

    return list;
  }, [usersData, statusFilter, roleFilter]);

  const handleBanClick = (u: UserInfo) => {
    setConfirmConfig({
      show: true,
      title: 'Khóa tài khoản',
      message: `Bạn có chắc muốn khóa tài khoản ${u.fullName}? Hành động này sẽ tạm dừng quyền truy cập của họ vào hệ thống.`,
      isDestructive: true,
      onConfirm: async () => {
        const res = await userService.banUser(u.id);
        if (res.success) {
          refetch();
          toast.success('Đã khóa tài khoản');
        } else {
          toast.error(res.error || 'Lỗi khi khóa người dùng');
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
          refetch();
          toast.success('Đã mở khóa tài khoản');
        } else {
          toast.error(res.error || 'Lỗi khi mở khóa người dùng');
        }
        setConfirmConfig(prev => ({ ...prev, show: false }));
      }
    });
  };

  const handleViewDetails = (u: UserInfo) => {
    setSelectedUser(u);
    setIsDetailsOpen(true);
  };

  const columns: ColumnDef<UserInfo>[] = useMemo(() => [
    {
      id: "index",
      header: () => <div className="text-center font-black uppercase tracking-[0.2em] text-slate-400 text-[10px] w-10">STT</div>,
      cell: ({ row }) => (
        <div className="text-center text-xs font-bold text-slate-500 w-10">
          {page * pageSize + row.index + 1}
        </div>
      ),
      size: 40,
    },
    {
      accessorKey: "fullName",
      header: "Người dùng",
      meta: { title: "Người dùng" },
      cell: ({ row }) => {
        const u = row.original;
        const initials = u.fullName
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((p) => p[0]?.toUpperCase())
          .join('');
        return (
          <div className="flex items-center gap-3">
            {u.avatarUrl ? (
              <img src={u.avatarUrl} alt={u.fullName} className="h-10 w-10 rounded-2xl object-cover shadow-sm" />
            ) : (
              <div className="h-10 w-10 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs leading-none">
                {initials || <UserRound className="h-5 w-5" />}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 leading-tight">{u.fullName}</span>
              <span className="text-[11px] text-slate-400 font-medium">{u.email}</span>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "isActive",
      header: "Trạng thái",
      meta: { title: "Trạng thái" },
      cell: ({ row }) => {
        const isActive = row.getValue("isActive");
        return (
          <Badge variant="secondary" className={`uppercase tracking-wider text-[10px] font-black ${isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
            {isActive ? "Hoạt động" : "Đã khóa"}
          </Badge>
        );
      }
    },
    {
      accessorKey: "role",
      header: "Vai trò",
      meta: { title: "Vai trò" },
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        
        return (
          <Badge variant="outline" className={`uppercase tracking-widest text-[10px] font-black ${
            role === 'ADMIN' ? 'border-red-500 text-red-600 bg-red-50' : 
            role === 'STAFF' ? 'border-blue-500 text-blue-600 bg-blue-50' : 
            role === 'FUND_OWNER' ? 'border-orange-500 text-orange-600 bg-orange-50' : ''
          }`}>
            {role}
          </Badge>
        );
      }
    },
    {
      accessorKey: "phoneNumber",
      header: "Liên lạc",
      meta: { title: "Liên lạc" },
      cell: ({ row }) => <span className="text-sm font-bold text-slate-700">{row.getValue("phoneNumber") || '—'}</span>
    },
    {
      id: "actions",
      header: () => <div className="text-right pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Thao tác</div>,
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex justify-end gap-1">
            <TooltipWrapper content="Chi tiết">
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleViewDetails(u); }} className="h-8 w-8 text-slate-400 hover:text-slate-900">
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipWrapper>
            {u.isActive ? (
              <TooltipWrapper content="Khóa tài khoản">
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleBanClick(u); }} className="h-8 w-8 text-slate-400 hover:text-red-500">
                  <Ban className="h-4 w-4" />
                </Button>
              </TooltipWrapper>
            ) : (
              <TooltipWrapper content="Mở khóa tài khoản">
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleUnbanClick(u); }} className="h-8 w-8 text-slate-400 hover:text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              </TooltipWrapper>
            )}
          </div>
        );
      }
    }
  ], [page, pageSize]);

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4 h-full">
      <DataTable
        columns={columns}
        data={users || []}
        isLoading={loading}
        manualPagination={true}
        pageIndex={page}
        pageSize={pageSize}
        totalPage={totalPages}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        isSearch={true}
        searchValue={['fullName', 'email', 'phoneNumber']}
        searchPlaceholder="Tên, email, sđt..."
        onRowClick={handleViewDetails}
        headerActions={
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              className="h-10 px-4 rounded-xl font-bold text-white bg-blue-700 hover:bg-blue-800 gap-2 shadow-sm"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span>Tạo mới</span>
            </Button>
            <Button
              variant="outline"
              className="h-10 px-4 rounded-xl font-bold text-slate-600 border-slate-200 hover:bg-slate-50 gap-2"
              onClick={handleExport}
              disabled={isExporting}
            >
              <FileDown className="h-4 w-4" />
              <span>{isExporting ? 'Đang xuất...' : 'Xuất Excel'}</span>
            </Button>
            <div className="relative">
              <input
                type="file"
                accept=".xlsx, .xls"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleImport}
                disabled={isImporting}
              />
              <Button
                variant="outline"
                className="h-10 px-4 rounded-xl font-bold text-slate-600 border-slate-200 hover:bg-slate-50 gap-2 pointer-events-none"
                disabled={isImporting}
              >
                <FileUp className="h-4 w-4" />
                <span>{isImporting ? 'Đang nhập...' : 'Nhập Excel'}</span>
              </Button>
            </div>
            <button
              onClick={handleDownloadTemplate}
              disabled={isExporting || isImporting}
              className="text-xs font-black text-[#1A685B] hover:text-[#155349] hover:underline disabled:opacity-40 disabled:no-underline transition-all cursor-pointer"
            >
              Tải mẫu
            </button>
          </div>
        }
        filterContent={
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs h-10 border border-slate-200 rounded-xl px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600 font-bold shadow-sm w-full"
              >
                <option value="ALL">Tất cả</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="DISABLED">Đã khóa</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Vai trò</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-xs h-10 border border-slate-200 rounded-xl px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600 font-bold shadow-sm w-full"
              >
                <option value="ALL">Tất cả</option>
                <option value="STAFF">Nhân viên</option>
                <option value="FUND_OWNER">Chủ quỹ</option>
                <option value="USER">Người dùng</option>
              </select>
            </div>

            {(statusFilter !== 'ALL' || roleFilter !== 'ALL') && (
              <Button variant="ghost" className="h-10 mt-2 rounded-xl text-xs font-black uppercase text-rose-500 hover:bg-rose-50 w-full" onClick={() => { setStatusFilter('ALL'); setRoleFilter('ALL'); }}>
                Xóa bộ lọc
              </Button>
            )}
          </div>
        }
      />
      <Toaster position="top-right" />

      {/* Modals */}
      <UserDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        user={selectedUser}
        onUpdate={(updatedUser) => {
          refetch();
          setSelectedUser(updatedUser);
        }}
      />

      <ConfirmDialog
        isOpen={confirmConfig.show}
        onClose={() => setConfirmConfig(prev => ({ ...prev, show: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        isDestructive={confirmConfig.isDestructive}
      />

      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          refetch();
          setIsCreateOpen(false);
        }}
      />

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center gap-4 flex-shrink-0 shadow-sm">
          <ShieldAlert className="h-5 w-5" />
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Lỗi hệ thống</p>
            <p className="text-sm font-bold">{error}</p>
          </div>
        </div>
      )}
    </div>
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
      if (nameTrimmed.length < 3 || nameTrimmed.length > 50) {
        newErrors.fullName = 'Tên phải từ 3 đến 50 ký tự';
        isValid = false;
      }
      else if (!/^[\p{L}][\p{L}0-9._ ]*$/u.test(nameTrimmed)) {
        newErrors.fullName = 'Tên phải bắt đầu bằng chữ cái; chỉ cho phép chữ, số, dấu gạch dưới, dấu chấm và khoảng trắng';
        isValid = false;
      }
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

function CreateUserModal({ isOpen, onClose, onSuccess }: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    email: '',
    fullName: '',
    phoneNumber: '',
    role: 'USER',
  });
  const [errors, setErrors] = useState({
    email: '',
    fullName: '',
    phoneNumber: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setForm({ email: '', fullName: '', phoneNumber: '', role: 'USER' });
    setErrors({ email: '', fullName: '', phoneNumber: '' });
  };

  useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen]);

  const validate = () => {
    const newErrors = { email: '', fullName: '', phoneNumber: '' };
    let isValid = true;

    const emailTrimmed = form.email.trim();
    if (!emailTrimmed) {
      newErrors.email = 'Email không được để trống';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      newErrors.email = 'Email không hợp lệ';
      isValid = false;
    }

    const nameTrimmed = form.fullName.trim();
    if (!nameTrimmed) {
      newErrors.fullName = 'Họ tên không được để trống';
      isValid = false;
    } else if (nameTrimmed.length < 2 || nameTrimmed.length > 100) {
      newErrors.fullName = 'Họ tên phải từ 2 đến 100 ký tự';
      isValid = false;
    }

    const phoneTrimmed = form.phoneNumber.trim();
    if (phoneTrimmed && !/^0[0-9]{9}$/.test(phoneTrimmed)) {
      newErrors.phoneNumber = 'SĐT phải có 10 chữ số và bắt đầu bằng số 0';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    const res = await userService.createUser({
      email: form.email.trim(),
      fullName: form.fullName.trim(),
      phoneNumber: form.phoneNumber.trim() || undefined,
      role: form.role || 'USER',
    });

    if (res.success) {
      toast.success('Tạo người dùng thành công');
      onSuccess();
    } else {
      const msg = res.error || '';
      // Map field-specific validation errors from BE
      const fieldErrors = (res as any).errors;
      if (fieldErrors) {
        const newErrors = { email: '', fullName: '', phoneNumber: '' };
        if (fieldErrors.email) newErrors.email = fieldErrors.email;
        if (fieldErrors.fullName) newErrors.fullName = fieldErrors.fullName;
        if (fieldErrors.phoneNumber) newErrors.phoneNumber = fieldErrors.phoneNumber;
        if (Object.values(newErrors).some(e => e)) {
          setErrors(newErrors);
          setIsSubmitting(false);
          return;
        }
      }
      // Generic error
      toast.error(msg || 'Lỗi khi tạo người dùng');
    }
    setIsSubmitting(false);
  };

  const field = (name: 'email' | 'fullName' | 'phoneNumber') => ({
    value: form[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => ({ ...prev, [name]: e.target.value }));
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    },
    error: errors[name],
  });

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle className="text-slate-900 flex items-center gap-2">
            <UserRound className="h-5 w-5 text-blue-700" />
            Tạo người dùng mới
          </ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4 py-2">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="nguoidung@example.com"
                className={`w-full h-11 rounded-xl border bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition-all
                  focus:outline-none focus:ring-2 focus:ring-blue-200
                  ${errors.email ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-blue-400'}`}
                {...field('email')}
              />
              {errors.email && <p className="text-[10px] text-red-500 font-bold pl-1">{errors.email}</p>}
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">
                Họ tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                className={`w-full h-11 rounded-xl border bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition-all
                  focus:outline-none focus:ring-2 focus:ring-blue-200
                  ${errors.fullName ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-blue-400'}`}
                {...field('fullName')}
              />
              {errors.fullName && <p className="text-[10px] text-red-500 font-bold pl-1">{errors.fullName}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                placeholder="0912345678"
                className={`w-full h-11 rounded-xl border bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition-all
                  focus:outline-none focus:ring-2 focus:ring-blue-200
                  ${errors.phoneNumber ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-blue-400'}`}
                {...field('phoneNumber')}
              />
              {errors.phoneNumber && <p className="text-[10px] text-red-500 font-bold pl-1">{errors.phoneNumber}</p>}
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">
                Vai trò
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value }))}
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
              >
                <option value="USER">Người dùng</option>
                <option value="FUND_OWNER">Chủ quỹ</option>
                <option value="STAFF">Nhân viên</option>
              </select>
            </div>

            {/* Password hint */}
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
              <p className="text-[10px] font-bold text-blue-600 leading-relaxed">
                Mật khẩu mặc định: <span className="font-mono font-black">TrustFund123@</span>. Người dùng có thể đổi sau khi đăng nhập.
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-100 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-black uppercase tracking-widest shadow-sm transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Đang tạo...' : 'Tạo người dùng'}
          </button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
