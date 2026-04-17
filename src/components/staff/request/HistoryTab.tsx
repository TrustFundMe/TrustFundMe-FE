'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, History, CheckCircle, XCircle, Clock, FileText, Eye, Flag, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { campaignService } from '@/services/campaignService';
import { expenditureService } from '@/services/expenditureService';
import { userService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContextProxy';
import RequestTable from '@/components/staff/request/RequestTable';
import RequestDetailPanel from '@/components/staff/request/RequestDetailPanel';

const FMT = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const fmt = (n: number) => FMT.format(n);

const TASK_TYPE_MAP: Record<string, string> = {
  CAMPAIGN: 'CHIẾN DỊCH',
  EXPENDITURE: 'CHI TIÊU',
  EVIDENCE: 'MINH CHỨNG',
  FLAG: 'FLAG',
};

const TASK_TYPE_ICON: Record<string, any> = {
  CAMPAIGN: FileText,
  EXPENDITURE: Clock,
  EVIDENCE: CheckCircle,
  FLAG: Flag,
};

export default function HistoryTab() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();
  const { user } = useAuth();

  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 15;

  const loadHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const allTasks = await campaignService.getTasksByStaff(user.id);
      // Filter for COMPLETED tasks and sort by date desc
      const completedTasks = allTasks
        .filter(t => t.status === 'COMPLETED')
        .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
      
      // Paginate the tasks before enriching them
      const paginatedTasks = completedTasks.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

      // Cache to avoid redundant requests for the same target/owner
      const campCache = new Map<number, any>();
      const userCache = new Map<number, any>();
      const expCache = new Map<number, any>();

      const enriched = await Promise.all(
        paginatedTasks.map(async (task) => {
          try {
            let targetTitle = `Mã #${task.targetId}`;
            let requester = 'N/A';
            let amount = 0;

            if (task.type === 'CAMPAIGN') {
              let camp = campCache.get(task.targetId);
              if (!camp) {
                camp = await campaignService.getById(task.targetId);
                campCache.set(task.targetId, camp);
              }
              targetTitle = camp.title;

              let owner = userCache.get(camp.fundOwnerId);
              if (!owner) {
                const ownerRes = await userService.getUserById(camp.fundOwnerId);
                owner = ownerRes.data;
                userCache.set(camp.fundOwnerId, owner);
              }
              requester = owner?.fullName || `Owner #${camp.fundOwnerId}`;

            } else if (task.type === 'EXPENDITURE' || task.type === 'EVIDENCE') {
              let exp = expCache.get(task.targetId);
              if (!exp) {
                exp = await expenditureService.getById(task.targetId);
                expCache.set(task.targetId, exp);
              }
              targetTitle = task.type === 'EXPENDITURE' 
                ? (exp.plan || `Chi tiêu #${exp.id}`)
                : `Minh chứng: ${exp.plan || exp.id}`;
              amount = exp.totalAmount;

              let camp = campCache.get(exp.campaignId);
              if (!camp) {
                camp = await campaignService.getById(exp.campaignId);
                campCache.set(exp.campaignId, camp);
              }

              let owner = userCache.get(camp.fundOwnerId);
              if (!owner) {
                const ownerRes = await userService.getUserById(camp.fundOwnerId);
                owner = ownerRes.data;
                userCache.set(camp.fundOwnerId, owner);
              }
              requester = owner?.fullName || `Owner #${camp.fundOwnerId}`;
            }

            return {
              ...task,
              id: `HIST_${task.id}`,
              realId: task.id,
              targetTitle,
              requester,
              amount,
              processedAt: task.updatedAt || task.createdAt,
            };
          } catch (err) {
            return {
              ...task,
              id: `HIST_${task.id}`,
              realId: task.id,
              targetTitle: `Mã #${task.targetId}`,
              requester: 'N/A',
              processedAt: task.updatedAt || task.createdAt,
            };
          }
        })
      );

      setTasks(enriched);
      // We still want total count for pagination logic
      const totalCount = completedTasks.length;
      (window as any)._totalHistoryTasks = totalCount; // Simple way to pass it to render

      if (enriched.length > 0 && !selectedTaskId) setSelectedTaskId(enriched[0].id);
    } catch (err) {
      toast.error('Lỗi tải lịch sử nhiệm vụ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadHistory(); }, [user, currentPage]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => 
      t.targetTitle.toLowerCase().includes(search.toLowerCase()) ||
      t.requester.toLowerCase().includes(search.toLowerCase()) ||
      t.type.toLowerCase().includes(search.toLowerCase())
    );
  }, [tasks, search]);

  const selectedTask = useMemo(() => tasks.find(t => t.id === selectedTaskId), [tasks, selectedTaskId]);

  if (loading) return <div className="p-10 text-center text-xs font-black text-gray-400 animate-pulse tracking-widest uppercase">ĐANG TẢI LỊCH SỬ...</div>;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 h-full overflow-hidden">
      <div className={`overflow-hidden flex flex-col gap-3 transition-all duration-500 ${selectedTaskId ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
        <div className="flex items-center justify-between flex-shrink-0 bg-gray-50/50 p-2 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-2 px-3">
            <History className="h-4 w-4 text-gray-400" />
            <h2 className="text-xs font-black text-gray-800 uppercase tracking-widest">Lịch sử nhiệm vụ đã xử lý</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl border border-gray-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#db5945]/10 w-64 bg-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto rounded-xl border border-gray-100 shadow-sm bg-white flex flex-col">
          <div className="flex-1 overflow-auto">
            <RequestTable
              rows={filteredTasks}
              selectedId={selectedTaskId}
              onSelect={(r) => setSelectedTaskId(r.id)}
              statusClassName={selectedTaskId ? 'hidden 2xl:table-cell' : ''}
              columns={[
                {
                  key: 'type',
                  title: 'Loại',
                  className: selectedTaskId ? 'hidden 2xl:table-cell' : 'whitespace-nowrap',
                  render: (r) => {
                    const Icon = TASK_TYPE_ICON[r.type] || FileText;
                    return (
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-[10px] font-black text-gray-500 uppercase">{TASK_TYPE_MAP[r.type] || r.type}</span>
                      </div>
                    );
                  }
                },
                {
                  key: 'target',
                  title: 'Nội dung',
                  render: (r) => (
                    <div>
                      <div className="font-black text-gray-900 text-xs uppercase tracking-tight line-clamp-1">{r.targetTitle}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mã gốc: #{r.targetId}</div>
                    </div>
                  ),
                },
                {
                  key: 'requester',
                  title: 'Người yêu cầu',
                  className: selectedTaskId ? 'hidden 2xl:table-cell' : 'whitespace-nowrap',
                  render: (r) => <span className="text-xs font-bold text-gray-700">{r.requester}</span>,
                },
                {
                  key: 'date',
                  title: 'Hoàn thành lúc',
                  className: selectedTaskId ? 'hidden 2xl:table-cell' : 'whitespace-nowrap',
                  render: (r) => <span className="text-[10px] font-black text-gray-400 uppercase">{new Date(r.processedAt).toLocaleString('vi-VN')}</span>,
                },
              ]}
              actionColumn={{
                key: 'actions',
                title: 'THAO TÁC',
                className: 'text-center w-[80px]',
                render: (r) => (
                  <div className="flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTaskId(r.id);
                      }}
                      className={`p-1.5 rounded-lg transition-all border shadow-sm ${
                        selectedTaskId === r.id 
                          ? 'bg-[#446b5f] text-white border-transparent' 
                          : 'bg-white text-gray-500 border-gray-200 hover:border-[#446b5f]/30 hover:bg-[#446b5f]/5 hover:text-[#446b5f]'
                      }`}
                      title="Xem chi tiết"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                ),
              }}
            />
          </div>
          
          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50 mt-auto flex-shrink-0">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Trang {currentPage + 1} / {Math.ceil(((window as any)._totalHistoryTasks || 0) / pageSize) || 1}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-[10px] font-black text-gray-600 uppercase hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={filteredTasks.length < pageSize}
                className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-[10px] font-black text-gray-600 uppercase hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedTaskId && (
        <div className="lg:col-span-4 overflow-auto pb-4 custom-scrollbar animate-in slide-in-from-right-4 transition-all duration-500">
          <div className="rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-gray-50 pb-3">
              <div className="flex items-center gap-3">
                <div className="text-sm font-black text-gray-900 uppercase tracking-tight">Chi tiết nhiệm vụ</div>
                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-black text-green-700 uppercase tracking-wider ring-1 ring-inset ring-green-600/20">COMPLETED</span>
              </div>
              <button
                onClick={() => setSelectedTaskId(undefined)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                title="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'Loại nhiệm vụ', value: selectedTask ? (TASK_TYPE_MAP[selectedTask.type] || selectedTask.type) : '-' },
                { label: 'Nội dung', value: selectedTask?.targetTitle },
                { label: 'Người gửi', value: selectedTask?.requester },
                { label: 'Số tiền (nếu có)', value: selectedTask?.amount ? fmt(selectedTask.amount) : '-' },
                { label: 'Hoàn thành ngày', value: selectedTask?.processedAt ? new Date(selectedTask.processedAt).toLocaleString('vi-VN') : '-' },
              ].map((f) => (
                <div key={f.label} className="rounded-xl bg-gray-50/80 p-2 border border-gray-100/50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{f.label}</p>
                  <div className="text-xs font-bold text-gray-700 leading-tight">
                    {f.value || <span className="text-gray-300 font-medium italic text-[10px]">Chưa cập nhật</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Info block */}
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <History className="h-4 w-4 text-blue-500" />
                <h4 className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Thông tin xử lý</h4>
              </div>
              <p className="text-xs text-blue-600 leading-relaxed font-medium">
                Nhiệm vụ này đã được bạn xử lý thành công. Để xem chi tiết kỹ thuật hoặc thay đổi trạng thái (nếu cần), vui lòng liên hệ Admin.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
