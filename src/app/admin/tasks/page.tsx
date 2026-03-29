'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, Filter, RefreshCw, 
  ChevronRight, AlertCircle, CheckCircle, 
  Clock, Shield, UserPlus, ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { campaignService } from '@/services/campaignService';
import { userService, UserInfo } from '@/services/userService';

import { DataTable } from '@/components/admin/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TooltipWrapper } from '@/components/TooltipWrapper';

// Types from our system
interface ApprovalTask {
  id: number;
  type: 'CAMPAIGN' | 'EXPENDITURE' | 'EVIDENCE' | 'FLAG';
  targetId: number;
  staffId: number | null;
  status: 'PENDING' | 'COMPLETED' | 'REASSIGNED';
  createdAt: string;
  updatedAt: string;
}

const TYPE_CONFIG = {
  CAMPAIGN: { label: 'Chiến dịch', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50' },
  EXPENDITURE: { label: 'Kế hoạch chi', icon: Shield, color: 'text-orange-600', bg: 'bg-orange-50' },
  EVIDENCE: { label: 'Minh chứng', icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
  FLAG: { label: 'Báo cáo vi phạm', icon: Shield, color: 'text-red-600', bg: 'bg-red-50' },
};

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<ApprovalTask[]>([]);
  const [staffs, setStaffs] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Tasks (uses axios/api-backend rewrite)
      let allTasks = [];
      try {
        allTasks = await campaignService.getAllTasks();
      } catch (taskErr) {
        console.error("Task fetch error:", taskErr);
        toast('Lỗi kết nối máy chủ khi tải nhiệm vụ', 'error');
      }

      // 2. Fetch Users (uses fetch/api proxy route)
      let allUsers: { success: boolean, data?: { content: any[] }, error?: string } = { success: false };
      try {
        const usersRes = await userService.getAllUsers();
        allUsers = usersRes as any;
      } catch (userErr) {
        console.error("User fetch error:", userErr);
      }
      
      setTasks(allTasks || []);
      if (allUsers.success && allUsers.data && Array.isArray(allUsers.data.content)) {
        setStaffs(allUsers.data.content.filter((u: UserInfo) => u.role === 'STAFF' && u.isActive));
      } else if (allUsers.error) {
        toast(allUsers.error || 'Lỗi tải danh sách nhân viên', 'error');
      }
    } catch (err) {
      console.error("loadData unexpected error:", err);
      toast('Có lỗi bất ngờ xảy ra khi tải dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleReassign = async (taskId: number, newStaffId: number) => {
    if (!newStaffId) return;
    try {
      await campaignService.reassignTask(taskId, newStaffId);
      toast('Giao việc thành công', 'success');
      
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, staffId: newStaffId, status: 'REASSIGNED' } : t));
    } catch (err) {
      toast('Giao việc thất bại', 'error');
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchType = typeFilter === 'ALL' || t.type === typeFilter;
      return matchStatus && matchType;
    });
  }, [tasks, statusFilter, typeFilter]);

  const columns: ColumnDef<ApprovalTask>[] = useMemo(() => [
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
      accessorKey: "type",
      header: "Nhiệm vụ",
      meta: { title: "Nhiệm vụ" },
      cell: ({ row }) => {
        const t = row.original;
        const cfg = TYPE_CONFIG[t.type] || { label: t.type, icon: Shield, color: 'text-gray-500', bg: 'bg-gray-50' };
        return (
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl ${cfg.bg} flex items-center justify-center ${cfg.color} shadow-sm`}>
              <cfg.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{cfg.label}</p>
              <p className="text-[10px] font-bold text-gray-400">Tạo: {new Date(t.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "targetId",
      header: "Đối tượng (ID)",
      meta: { title: "Đối tượng (ID)" },
      cell: ({ row }) => (
        <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-black">
          #{row.original.targetId}
        </span>
      )
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      meta: { title: "Trạng thái" },
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
            status === 'COMPLETED' ? 'bg-green-50 text-green-600' :
            status === 'REASSIGNED' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
          }`}>
            {status === 'COMPLETED' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
            {status}
          </span>
        );
      }
    },
    {
      accessorKey: "staffId",
      header: "Nhân viên phụ trách",
      meta: { title: "Nhân viên phụ trách" },
      cell: ({ row }) => {
        const t = row.original;
        const currentStaff = staffs.find(s => s.id === t.staffId);
        return (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-100 border border-white shadow-sm flex items-center justify-center text-[10px] font-black text-gray-400 overflow-hidden">
              {currentStaff?.avatarUrl ? <img src={currentStaff.avatarUrl} alt="A" className="w-full h-full object-cover" /> : currentStaff?.fullName[0] || '?'}
            </div>
            <div>
              <p className="text-xs font-black text-gray-800 tracking-tight">{currentStaff?.fullName || 'CHƯA GIAO'}</p>
              <p className="text-[9px] font-medium text-gray-400">{currentStaff?.email || 'N/A'}</p>
            </div>
          </div>
        );
      }
    },
    {
      id: "actions",
      header: () => <div className="text-right pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Giao lại việc</div>,
      cell: ({ row }) => {
        const t = row.original;
        
        if (t.status === 'COMPLETED') {
          return (
            <div className="flex justify-end pr-4">
              <span className="text-[10px] font-black text-gray-300 uppercase italic">Nhiệm vụ kết thúc</span>
            </div>
          );
        }

        return (
          <div className="flex justify-end pr-4">
            <select 
              value={t.staffId || ''}
              onChange={(e) => handleReassign(t.id, Number(e.target.value))}
              className="w-full max-w-[200px] text-xs font-bold border border-gray-100 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#db5945]/10 bg-gray-50/50 hover:bg-white transition-all cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="">Chọn nhân viên...</option>
              {staffs.map(s => (
                <option key={s.id} value={s.id}>{s.fullName}</option>
              ))}
            </select>
          </div>
        );
      }
    }
  ], [page, pageSize, staffs]);

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4 h-full">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
            <Users className="h-8 w-8 text-[#db5945]" />
            Quản lý Điều phối Nhiệm vụ
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Điều phối công việc cho đội ngũ nhân viên (Staff)</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-2">
        {[
          { label: 'Tổng nhiệm vụ', value: tasks.length, color: 'text-gray-600', bg: 'bg-gray-100' },
          { label: 'Đang xử lý', value: tasks.filter(t => t.status !== 'COMPLETED').length, color: 'text-orange-600', bg: 'bg-orange-100' },
          { label: 'Đã hoàn thành', value: tasks.filter(t => t.status === 'COMPLETED').length, color: 'text-green-600', bg: 'bg-green-100' },
          { label: 'Tổng Staff', value: staffs.length, color: 'text-blue-600', bg: 'bg-blue-100' },
        ].map(s => (
          <div key={s.label} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredTasks || []}
        isLoading={loading}
        manualPagination={false}
        pageIndex={page}
        pageSize={pageSize}
        totalPage={Math.ceil(filteredTasks.length / pageSize)}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        isSearch={true}
        searchValue={['targetId', 'type']}
        searchPlaceholder="Tìm theo ID..."
        headerActions={
          <div className="flex gap-2">
             <Button
              variant="outline"
              className="h-10 px-4 rounded-xl font-bold text-slate-600 border-slate-200 hover:bg-slate-50 gap-2"
              onClick={loadData}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Tải lại</span>
            </Button>
          </div>
        }
        filterContent={
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Trạng thái</label>
              <select 
                value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="text-xs h-10 border border-slate-200 rounded-xl px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600 font-bold shadow-sm w-full"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PENDING">Đang chờ</option>
                <option value="REASSIGNED">Đã chuyển giao</option>
                <option value="COMPLETED">Đã xong</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Loại nhiệm vụ</label>
              <select 
                value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                className="text-xs h-10 border border-slate-200 rounded-xl px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600 font-bold shadow-sm w-full"
              >
                <option value="ALL">Tất cả loại</option>
                <option value="CAMPAIGN">Chiến dịch</option>
                <option value="EXPENDITURE">Chi tiêu</option>
                <option value="EVIDENCE">Minh chứng</option>
                <option value="FLAG">Báo cáo</option>
              </select>
            </div>

            {(statusFilter !== 'ALL' || typeFilter !== 'ALL') && (
              <Button variant="ghost" className="h-10 mt-2 rounded-xl text-xs font-black uppercase text-rose-500 hover:bg-rose-50 w-full" onClick={() => { setStatusFilter('ALL'); setTypeFilter('ALL'); }}>
                Xóa bộ lọc
              </Button>
            )}
          </div>
        }
      />
    </div>
  );
}
