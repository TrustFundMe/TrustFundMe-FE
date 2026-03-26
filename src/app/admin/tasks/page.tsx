'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, Filter, RefreshCw, 
  ChevronRight, AlertCircle, CheckCircle, 
  Clock, Shield, UserPlus, ArrowRight
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { campaignService } from '@/services/campaignService';
import { userService, UserInfo } from '@/services/userService';

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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [reassigningId, setReassigningId] = useState<number | null>(null);
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [allTasks, allUsers] = await Promise.all([
        campaignService.getAllTasks(),
        userService.getAllUsers()
      ]);
      
      setTasks(allTasks);
      if (allUsers.success && allUsers.data) {
        setStaffs(allUsers.data.filter(u => u.role === 'STAFF' && u.isActive));
      }
    } catch (err) {
      toast('Lỗi tải dữ liệu nhiệm vụ', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchSearch = String(t.targetId).includes(search) || t.type.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchType = typeFilter === 'ALL' || t.type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [tasks, search, statusFilter, typeFilter]);

  const handleReassign = async (taskId: number, newStaffId: number) => {
    if (!newStaffId) return;
    try {
      await campaignService.reassignTask(taskId, newStaffId);
      toast('Giao việc thành công', 'success');
      
      // Update local state instead of full data reload
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, staffId: newStaffId, status: 'REASSIGNED' } : t));
      setReassigningId(null);
    } catch (err) {
      toast('Giao việc thất bại', 'error');
    }
  };

  if (loading) return <div className="p-10 text-center text-xs font-black text-gray-400 animate-pulse tracking-widest uppercase">ĐANG TẢI...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
            <Users className="h-8 w-8 text-[#db5945]" />
            Quản lý Điều phối Nhiệm vụ
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Điều phối công việc cho đội ngũ nhân viên (Staff)</p>
        </div>
        <button onClick={loadData} className="p-2.5 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-95">
          <RefreshCw className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Tổng nhiệm vụ', value: tasks.length, color: 'bg-gray-100 text-gray-600' },
          { label: 'Đang xử lý', value: tasks.filter(t => t.status !== 'COMPLETED').length, color: 'bg-orange-100 text-orange-600' },
          { label: 'Đã hoàn thành', value: tasks.filter(t => t.status === 'COMPLETED').length, color: 'bg-green-100 text-green-600' },
          { label: 'Tổng Staff', value: staffs.length, color: 'bg-blue-100 text-blue-600' },
        ].map(s => (
          <div key={s.label} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color.split(' ')[1]}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
          <input 
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo ID hoặc loại nhiệm vụ..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#db5945]/10 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400 mr-2" />
          <select 
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-xs font-black uppercase tracking-wider focus:outline-none"
          >
            <option value="ALL">TẤT CẢ TRẠNG THÁI</option>
            <option value="PENDING">ĐANG CHỜ</option>
            <option value="REASSIGNED">ĐÃ CHUYỂN GIAO</option>
            <option value="COMPLETED">ĐÃ XONG</option>
          </select>
          
          <select 
            value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-xs font-black uppercase tracking-wider focus:outline-none"
          >
            <option value="ALL">TẤT CẢ LOẠI</option>
            <option value="CAMPAIGN">CHIẾN DỊCH</option>
            <option value="EXPENDITURE">CHI TIÊU</option>
            <option value="EVIDENCE">MINH CHỨNG</option>
            <option value="FLAG">BÁO CÁO</option>
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-auto custom-scrollbar">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
              <th className="px-6 py-4">Nhiệm vụ</th>
              <th className="px-6 py-4">Đối tượng (ID)</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4">Nhân viên phụ trách</th>
              <th className="px-6 py-4 text-right" style={{ width: '250px' }}>Giao lại việc</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredTasks.map(t => {
              const cfg = TYPE_CONFIG[t.type] || { label: t.type, color: 'text-gray-500', bg: 'bg-gray-50' };
              const currentStaff = staffs.find(s => s.id === t.staffId);
              
              return (
                <tr key={t.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl ${cfg.bg} flex items-center justify-center ${cfg.color} shadow-sm`}>
                        <cfg.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{cfg.label}</p>
                        <p className="text-[10px] font-bold text-gray-400">Tạo: {new Date(t.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-black">#{t.targetId}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      t.status === 'COMPLETED' ? 'bg-green-50 text-green-600' :
                      t.status === 'REASSIGNED' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {t.status === 'COMPLETED' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-100 border border-white shadow-sm flex items-center justify-center text-[10px] font-black text-gray-400 overflow-hidden">
                        {currentStaff?.avatarUrl ? <img src={currentStaff.avatarUrl} alt="V" className="w-full h-full object-cover" /> : currentStaff?.fullName[0] || '?'}
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-800 tracking-tight">{currentStaff?.fullName || 'CHƯA GIAO'}</p>
                        <p className="text-[9px] font-medium text-gray-400">{currentStaff?.email || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    {t.status !== 'COMPLETED' ? (
                      <div className="flex justify-end">
                        <select 
                          value={t.staffId || ''}
                          onChange={(e) => handleReassign(t.id, Number(e.target.value))}
                          className="w-full max-w-[200px] text-xs font-bold border border-gray-100 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#db5945]/10 bg-gray-50/50 hover:bg-white transition-all cursor-pointer"
                        >
                          <option value="">Chọn nhân viên...</option>
                          {staffs.map(s => (
                            <option key={s.id} value={s.id}>{s.fullName}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <span className="text-[10px] font-black text-gray-300 uppercase italic">Nhiệm vụ kết thúc</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredTasks.length === 0 && (
          <div className="py-20 text-center opacity-20">
            <AlertCircle className="h-12 w-12 mx-auto" />
            <p className="text-sm font-black uppercase mt-4 tracking-widest">Không có nhiệm vụ nào</p>
          </div>
        )}
      </div>

      {/* Reassignment Modal Concept (Optional enhancement) */}
    </div>
  );
}
