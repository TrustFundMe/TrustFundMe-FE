'use client';

import { useMemo, useState } from 'react';
import {
  Eye,
  Folder,
  Tag,
  History,
  X,
  Calendar,
  User as UserIcon,
  Loader2,
  TrendingUp,
  MoreHorizontal,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';

import { campaignService } from '@/services/campaignService';
import { userService, UserInfo } from '@/services/userService';
import { CampaignDto, FundraisingGoal } from '@/types/campaign';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'react-hot-toast';

function formatVnd(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'APPROVED':
    case 'ACTIVE':
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
          Đang chạy
        </Badge>
      );
    case 'PENDING':
      return (
        <Badge className="bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-50">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1.5" />
          Chờ duyệt
        </Badge>
      );
    case 'PAUSED':
      return (
        <Badge className="bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-50">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400 mr-1.5" />
          Tạm dừng
        </Badge>
      );
    case 'CLOSED':
      return (
        <Badge className="bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-50">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mr-1.5" />
          Đã đóng
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

interface CampaignEnriched extends CampaignDto {
  ownerName?: string;
  activeGoal?: FundraisingGoal | null;
}

export default function AdminCampaignsPage() {
  // Goal History Modal
  const [historyCampaign, setHistoryCampaign] = useState<CampaignEnriched | null>(null);
  const [historyGoals, setHistoryGoals] = useState<FundraisingGoal[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const { data: campaignsRes, isLoading, refetch } = useQuery({
    queryKey: ['admin-campaigns', page, pageSize],
    queryFn: () => campaignService.getAll(page, pageSize),
  });

  const campaignsRaw = campaignsRes?.content || [];
  const totalPages = campaignsRes?.totalPages || 0;

  // Enrichment (chỉ fetch goals, ownerName đã có từ Response backend)
  const { data: rawEnrichedData, isLoading: isEnriching } = useQuery({
    queryKey: ['admin-campaigns-enriched', campaignsRaw?.length, campaignsRaw],
    queryFn: async () => {
      if (!campaignsRaw || campaignsRaw.length === 0) return [];
      const enriched = await Promise.all(
        campaignsRaw.map(async (c: any) => {
          let goals: FundraisingGoal[] = [];
          try {
            const goalsData = await campaignService.getGoalsByCampaignId(c.id);
            goals = goalsData;
          } catch (err) {
            console.warn(`Failed to fetch goals for campaign ${c.id}`, err);
          }
          return {
            ...c,
            ownerName: c.ownerName || `Chủ quỹ #${c.fundOwnerId}`,
            activeGoal: goals.find((g) => g.isActive) || null,
          };
        })
      );
      return enriched;
    },
    enabled: !!campaignsRaw && campaignsRaw.length > 0,
  });

  const campaigns = useMemo(() => {
    let list = rawEnrichedData || [];
    if (statusFilter !== 'ALL') {
      list = list.filter(c => c.status.toUpperCase() === statusFilter);
    }
    return list;
  }, [rawEnrichedData, statusFilter]);

  const updateStatus = async (id: number, status: string) => {
    try {
      if (status === 'PAUSED') {
        await campaignService.pauseCampaign(id);
      } else if (status === 'CLOSED') {
        await campaignService.closeCampaign(id);
      } else {
        await campaignService.update(id, { status });
      }
      toast.success('Cập nhật trạng thái thành công');
      refetch();
    } catch (err) {
      console.error('Update status error:', err);
      toast.error('Cập nhật trạng thái thất bại');
    }
  };

  const openHistory = async (campaign: CampaignEnriched) => {
    setHistoryCampaign(campaign);
    setHistoryLoading(true);
    try {
      const goals = await campaignService.getGoalsByCampaignId(campaign.id);
      setHistoryGoals(goals.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
    } catch (err) {
      toast.error('Không thể tải lịch sử mục tiêu');
    } finally {
      setHistoryLoading(false);
    }
  };

  const columns: ColumnDef<CampaignEnriched>[] = useMemo(() => [
    {
      id: "index",
      header: () => <div className="text-center font-black uppercase tracking-[0.2em] text-slate-400 text-[10px] w-8">STT</div>,
      cell: ({ row }) => (
        <div className="text-center text-xs font-bold text-slate-500 w-8">
          {page * pageSize + row.index + 1}
        </div>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Chiến dịch',
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-100 overflow-hidden shadow-inner flex-shrink-0 ring-1 ring-slate-200">
              {c.coverImageUrl ? (
                <img src={c.coverImageUrl} alt={c.title} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-300">
                  <Tag className="h-4 w-4" />
                </div>
              )}
            </div>
            <div className="leading-tight overflow-hidden">
              <div className="font-bold text-slate-900 truncate max-w-[200px]">{c.title}</div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {c.category || 'Chưa phân loại'}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'ownerName',
      header: 'Người đại diện',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-white shadow-sm">
            <UserIcon className="h-3.5 w-3.5" />
          </div>
          <span className="font-bold text-slate-700 text-xs">{row.original.ownerName}</span>
        </div>
      ),
    },
    {
      id: 'progress',
      header: 'Tiến độ',
      cell: ({ row }) => {
        const c = row.original;
        const target = c.activeGoal?.targetAmount || 0;
        const balance = c.balance || 0;
        const pct = target > 0 ? Math.min(100, Math.round((balance / target) * 100)) : 0;

        return (
          <div className="w-44">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                {formatVnd(balance)} / {target > 0 ? formatVnd(target) : '??'}
              </span>
              <span className="text-[10px] font-black text-slate-900">{pct}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F84D43] rounded-full transition-all duration-1000"
                style={{ width: `${pct}%` }}
              />
            </div>
            {!c.activeGoal && <div className="mt-1 text-[9px] font-bold text-rose-500 italic">Chưa có mục tiêu</div>}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex justify-end items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-blue-600"
              onClick={() => openHistory(c)}
              title="Lịch sử mục tiêu"
            >
              <History className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px] rounded-xl">
                <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400">Trạng thái mới</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => updateStatus(c.id, 'PENDING')} className="text-xs font-bold">
                  Chờ duyệt
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus(c.id, 'ACTIVE')} className="text-xs font-bold">
                  Kích hoạt (Đang chạy)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus(c.id, 'PAUSED')} className="text-xs font-bold">
                  Tạm dừng
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus(c.id, 'CLOSED')} className="text-xs font-bold text-rose-600">
                  Đóng chiến dịch
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    }
  ], [page, pageSize]);

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4 h-full">
      <DataTable
        columns={columns}
        data={campaigns || []}
        isLoading={isLoading || isEnriching}
        manualPagination={true}
        pageIndex={page}
        pageSize={pageSize}
        totalPage={totalPages}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        isSearch={true}
        searchValue={['title', 'ownerName']}
        searchPlaceholder="tên chiến dịch hoặc người tạo..."
        filterContent={
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs h-10 border border-slate-200 rounded-xl px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600 font-bold shadow-sm w-full"
              >
                <option value="ALL">Tất cả</option>
                <option value="APPROVED">Đang chạy</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="PENDING_APPROVAL">Chờ duyệt</option>
                <option value="PENDING">Chờ xử lý</option>
                <option value="PAUSED">Tạm dừng</option>
                <option value="DISABLED">Đã khóa</option>
                <option value="REJECTED">Đã từ chối</option>
                <option value="CLOSED">Đã đóng</option>
              </select>
            </div>
            {statusFilter !== 'ALL' && (
              <Button variant="ghost" className="h-10 mt-2 rounded-xl text-xs font-black uppercase text-rose-500 hover:bg-rose-50 w-full" onClick={() => setStatusFilter('ALL')}>
                Xóa bộ lọc
              </Button>
            )}
          </div>
        }
      />

      {/* Goal History Modal */}
      {historyCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setHistoryCampaign(null)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">Lịch sử Mục tiêu</h2>
                <p className="text-slate-500 font-bold mt-1 text-xs">{historyCampaign.title}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setHistoryCampaign(null)}
                className="rounded-full h-10 w-10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
              {historyLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-10 w-10 text-rose-500 animate-spin" />
                </div>
              ) : historyGoals.length === 0 ? (
                <div className="text-center py-20">
                  <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-slate-200" />
                  </div>
                  <p className="font-bold text-slate-400 italic text-sm">Chưa có mục tiêu gây quỹ nào.</p>
                </div>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:left-[11px] before:border-l-2 before:border-slate-100">
                  {historyGoals.map((goal) => (
                    <div key={goal.id} className="relative pl-10">
                      <div className={`absolute left-0 top-1 h-6 w-6 rounded-full border-4 border-white shadow-sm z-10 ${goal.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                        }`} />
                      <div className={`p-5 rounded-2xl border ${goal.isActive ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-slate-100'
                        }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="text-lg font-black text-slate-900">{formatVnd(goal.targetAmount)}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="h-3 w-3 text-slate-400" />
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                {new Date(goal.createdAt || '').toLocaleDateString('vi-VN', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                          {goal.isActive && (
                            <Badge className="bg-emerald-500 text-white border-none text-[9px] font-black uppercase">
                              Hiện tại
                            </Badge>
                          )}
                        </div>
                        {goal.description && <p className="text-xs text-slate-600 font-medium leading-relaxed">{goal.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <Button
                onClick={() => setHistoryCampaign(null)}
                className="rounded-xl px-8 font-black uppercase tracking-widest text-xs h-12"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
