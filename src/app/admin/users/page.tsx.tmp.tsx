'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  Eye,
  Search,
  Ban,
  CheckCircle2,
  ShieldAlert,
  UserRound,
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
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DISABLED'>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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

  const columns: ColumnDef<UserInfo>[] = useMemo(() => [
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
              <div className="h-10 w-10 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs">
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
          <Badge variant={isActive ? "success" : "secondary"} className="uppercase tracking-wider text-[10px] font-black">
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
        let variant: "default" | "destructive" | "outline" | "secondary" | "success" | "warning" = "outline";
        if (role === 'ADMIN') variant = "destructive";
        else if (role === 'STAFF') variant = "default";
        else if (role === 'FUND_OWNER') variant = "success";
        
        return (
          <Badge variant={variant as any} className="uppercase tracking-widest text-[10px] font-black">
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
      header: () => <div className="text-right pr-4">Thao tác</div>,
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
  ], []);

  const filteredData = useMemo(() => {
    return users.filter((u) => {
      const q = query.trim().toLowerCase();
      const matchesSearch = !q || 
        u.fullName.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q) || 
        (u.phoneNumber && u.phoneNumber.includes(q));
      
      const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? u.isActive : !u.isActive);
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const isNotAdmin = u.role !== 'ADMIN';

      return matchesSearch && matchesStatus && matchesRole && isNotAdmin;
    });
  }, [users, query, statusFilter, roleFilter]);

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-2 flex-shrink-0">
        <div className="relative group/search flex-1 max-w-xl w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within/search:text-primary transition-colors" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên, email hoặc số điện thoại..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:border-primary transition-all cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="DISABLED">Đã khóa</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:border-primary transition-all cursor-pointer"
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="STAFF">Nhân viên</option>
            <option value="FUND_OWNER">Chủ quỹ</option>
            <option value="USER">Người dùng</option>
          </select>
          
          {(query || statusFilter !== 'ALL' || roleFilter !== 'ALL') && (
            <Button variant="ghost" onClick={() => { setQuery(''); setStatusFilter('ALL'); setRoleFilter('ALL'); }} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">
              Xóa lọc
            </Button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-1 min-h-0">
        <DataTable
          columns={columns}
          data={filteredData}
          isLoading={loading}
          searchPlaceholder="tên..."
          onRowClick={handleViewDetails}
        />
      </div>

      {/* Modals - Reuse existing ones */}
      <UserDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        user={selectedUser}
        onUpdate={(updatedUser) => {
          setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
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

// Copy existing sub-components from the original file but simplify styles to match new theme
// (UserDetailsModal, ConfirmDialog, etc.)
// For brevity, I'll only include the main structure change here, 
// and in the next step I'll provide the full file with all sub-components.

// ... (Rest of UserDetailsModal, ConfirmDialog sub-components)
