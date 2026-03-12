'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Eye,
  Folder,
  Search,
  Tag,
  History,
  X,
  Calendar,
  User as UserIcon,
  ChevronRight,
  Loader2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { campaignService } from '@/services/campaignService';
import { userService, UserInfo } from '@/services/userService';
import { CampaignDto, FundraisingGoal } from '@/types/campaign';

function formatVnd(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function StatusPill({ status }: { status: string }) {
  const base = 'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider';

  switch (status) {
    case 'APPROVED':
    case 'ACTIVE':
      return (
        <span className={`${base} bg-[#1A685B]/10 text-[#1A685B]`}>
          <span className="h-1.5 w-1.5 rounded-full bg-[#1A685B] animate-pulse" />
          Đang chạy
        </span>
      );
    case 'PENDING':
      return (
        <span className={`${base} bg-amber-50 text-amber-800`}>
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Chờ duyệt
        </span>
      );
    case 'PAUSED':
      return (
        <span className={`${base} bg-slate-100 text-slate-500`}>
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          Tạm dừng
        </span>
      );
    case 'CLOSED':
      return (
        <span className={`${base} bg-[#F84D43]/10 text-[#F84D43]`}>
          <span className="h-1.5 w-1.5 rounded-full bg-[#F84D43]" />
          Đã đóng
        </span>
      );
    default:
      return (
        <span className={`${base} bg-blue-50 text-blue-700`}>
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          {status}
        </span>
      );
  }
}

interface CampaignEnriched extends CampaignDto {
  ownerName?: string;
  activeGoal?: FundraisingGoal | null;
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignEnriched[]>([]);
  const [users, setUsers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Goal History Modal
  const [historyCampaign, setHistoryCampaign] = useState<CampaignEnriched | null>(null);
  const [historyGoals, setHistoryGoals] = useState<FundraisingGoal[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [campaignRes, userRes] = await Promise.all([
        campaignService.getAll(),
        userService.getAllUsers(),
      ]);

      // Map users for easy lookup
      const userMap: Record<number, string> = {};
      if (userRes.success && userRes.data) {
        userRes.data.forEach((u: UserInfo) => {
          userMap[u.id] = u.fullName;
        });
      }
      setUsers(userMap);

      // Fetch active goals and cover image for each campaign
      const enriched = await Promise.all(
        campaignRes.map(async (c) => {
          let goals: FundraisingGoal[] = [];
          try {
            const goalsData = await campaignService.getGoalsByCampaignId(c.id);
            goals = goalsData;
          } catch (err) {
            console.warn(`Failed to fetch goals for campaign ${c.id}`, err);
          }
          return {
            ...c,
            ownerName: userMap[c.fundOwnerId] || `User #${c.fundOwnerId}`,
            activeGoal: goals.find((g) => g.isActive) || null,
          };
        })
      );

      setCampaigns(enriched);
    } catch (err) {
      console.error(err);
      setError('Không thể tải dữ liệu chiến dịch.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return campaigns.filter((c) => {
      const matchesQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        (c.ownerName && c.ownerName.toLowerCase().includes(q)) ||
        c.id.toString().includes(q);

      const matchesStatus = statusFilter === 'ALL' ? true : c.status === statusFilter;
      const matchesCategory = categoryFilter === 'ALL' ? true : c.category === categoryFilter;

      return matchesQuery && matchesStatus && matchesCategory;
    });
  }, [campaigns, query, statusFilter, categoryFilter]);

  const categories = useMemo(() => {
    const set = new Set(campaigns.map((c) => c.category).filter(Boolean));
    return Array.from(set).sort();
  }, [campaigns]);

  const totalPages = useMemo(() => Math.ceil(filtered.length / ITEMS_PER_PAGE), [filtered, ITEMS_PER_PAGE]);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage, ITEMS_PER_PAGE]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, statusFilter, categoryFilter]);

  const hasActiveFilters = query !== '' || statusFilter !== 'ALL' || categoryFilter !== 'ALL';

  const clearFilters = () => {
    setQuery('');
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
  };

  const updateStatus = async (id: number, status: string) => {
    if (!confirm(`Bạn có chắc muốn chuyển trạng thái sang ${status}?`)) return;

    try {
      const res = await campaignService.update(id, { status });
      setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: res.status } : c)));
    } catch (err) {
      console.error('Update status error:', err);
      alert('Cập nhật trạng thái thất bại.');
    }
  };

  const openHistory = async (campaign: CampaignEnriched) => {
    setHistoryCampaign(campaign);
    setHistoryLoading(true);
    try {
      const goals = await campaignService.getGoalsByCampaignId(campaign.id);
      setHistoryGoals(goals.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
    } catch (err) {
      alert('Không thể tải lịch sử mục tiêu.');
    } finally {
      setHistoryLoading(false);
    }
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
            placeholder="Tìm theo tên chiến dịch, ID hoặc người tạo..."
            className="w-full bg-white border-2 border-slate-100 rounded-3xl pl-12 pr-4 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-[#F84D43]/5 focus:border-[#F84D43] transition-all shadow-xl shadow-slate-100/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-44 rounded-3xl border-2 border-slate-100 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#F84D43]/5 focus:border-[#F84D43] transition-all shadow-xl shadow-slate-100/50 cursor-pointer appearance-none"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2003/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1rem' }}
          >
            <option value="ALL">Trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="ACTIVE">Đang chạy</option>
            <option value="PAUSED">Tạm dừng</option>
            <option value="CLOSED">Đã đóng</option>
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

      {/* Table Section */}
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
                <th className="py-3.5 pl-8 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Chiến dịch</th>
                <th className="py-3.5 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Người đại diện</th>
                <th className="py-3.5 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Tiến độ</th>
                <th className="py-3.5 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Trạng thái</th>
                <th className="py-3.5 pr-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right border-b border-slate-100">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedData.map((c) => {
                const target = c.activeGoal?.targetAmount || 0;
                const balance = c.balance || 0;
                const pct = target > 0 ? Math.min(100, Math.round((balance / target) * 100)) : 0;

                return (
                  <tr key={c.id} className="h-[68px] group hover:bg-slate-50/30 transition-colors">
                    <td className="py-2 pl-8 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-slate-100 overflow-hidden shadow-inner flex-shrink-0 ring-2 ring-white">
                          {c.coverImageUrl ? (
                            <img src={c.coverImageUrl} alt={c.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-300">
                              <Tag className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div className="leading-tight">
                          <div className="font-bold text-slate-900 group-hover:text-[#F84D43] transition-colors truncate max-w-[150px]">{c.title}</div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{c.category || 'Chưa phân loại'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-sm border border-white">
                          <UserIcon className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-bold text-slate-700 text-xs">{c.ownerName}</span>
                      </div>
                    </td>

                    <td className="py-2 pr-4">
                      <div className="w-40">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                            {formatVnd(balance)} / <span className="text-slate-900">{target > 0 ? formatVnd(target) : '??'}</span>
                          </span>
                          <span className="text-[9px] font-black text-[#F84D43] leading-none">{pct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                          <div
                            className="h-full bg-gradient-to-r from-[#F84D43] to-[#F84D43]/60 rounded-full transition-all duration-1000"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        {!c.activeGoal && <div className="mt-0.5 text-[8px] font-bold text-[#F84D43]/80 italic">Chưa có mục tiêu</div>}
                      </div>
                    </td>

                    <td className="py-2 pr-4">
                      <StatusPill status={c.status} />
                    </td>

                    <td className="py-2 pr-8 text-right">
                      <div className="flex justify-end gap-1 transition-all">
                        {/* <Link
                          href={`/campaigns-details?id=${c.id}`}
                          className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-lg transition-all"
                          title="Xem thực tế"
                        >
                          <Eye className="h-4 w-4" />
                        </Link> */}

                        <button
                          onClick={() => openHistory(c)}
                          className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-lg transition-all"
                          title="Lịch sử mục tiêu"
                        >
                          <History className="h-4 w-4" />
                        </button>

                        <div className="w-px h-5 bg-slate-100 mx-1 self-center" />

                        <div className="relative group/status">
                          <select
                            value={c.status}
                            onChange={(e) => updateStatus(c.id, e.target.value)}
                            className="appearance-none bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-slate-600 outline-none focus:ring-2 focus:ring-[#F84D43]/20 focus:border-[#F84D43] transition-all cursor-pointer pr-6 hover:bg-white hover:shadow-md"
                            style={{
                              backgroundImage:
                                'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2003/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")',
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 0.75rem center',
                              backgroundSize: '0.75rem',
                            }}
                          >
                            <option value="PENDING">Chờ duyệt</option>
                            <option value="ACTIVE">Đang chạy</option>
                            <option value="PAUSED">Tạm dừng</option>
                            <option value="CLOSED">Đã đóng</option>
                          </select>
                        </div>
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
                        <Folder className="h-8 w-8 text-slate-300" />
                      </div>
                      <p className="font-bold text-slate-500">Không tìm thấy chiến dịch nào.</p>
                    </div>
                  </td>
                </tr>
              )}
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

        {/* Pagination Section */}
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

      {/* Goal History Modal */}
      {historyCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setHistoryCampaign(null)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">Lịch sử Mục tiêu</h2>
                <p className="text-slate-500 font-bold mt-1 text-sm">{historyCampaign.title}</p>
              </div>
              <button
                onClick={() => setHistoryCampaign(null)}
                className="p-4 rounded-3xl text-slate-400 hover:text-slate-900 hover:bg-white shadow-xl shadow-slate-200/20 transition-all hover:scale-110"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-10 overflow-y-auto flex-1 custom-scrollbar">
              {historyLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                </div>
              ) : historyGoals.length === 0 ? (
                <div className="text-center py-20">
                  <div className="bg-slate-50 w-20 h-20 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                    <TrendingUp className="h-10 w-10 text-slate-200" />
                  </div>
                  <p className="font-bold text-slate-500 italic">Chưa có mục tiêu gây quỹ nào được tạo.</p>
                </div>
              ) : (
                <div className="space-y-8 relative before:absolute before:inset-0 before:left-6 before:border-l-2 before:border-slate-100 before:border-dashed">
                  {historyGoals.map((goal) => (
                    <div key={goal.id} className="relative pl-14 group">
                      <div className={`absolute left-4 top-1 h-4 w-4 rounded-full border-2 border-white ring-4 shadow-md z-10 ${goal.isActive ? 'bg-emerald-500 ring-emerald-100 animate-pulse' : 'bg-slate-300 ring-slate-100'
                        }`} />

                      <div className={`p-6 rounded-[32px] border transition-all ${goal.isActive ? 'bg-emerald-50/10 border-emerald-100 shadow-xl shadow-emerald-500/5' : 'bg-white border-slate-100'
                        }`}>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="text-2xl font-black text-slate-900">{formatVnd(goal.targetAmount)}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
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
                            <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                              Đang hoạt động
                            </span>
                          )}
                        </div>
                        {goal.description && <p className="text-sm text-slate-600 font-medium leading-relaxed">{goal.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex justify-end">
              <button
                onClick={() => setHistoryCampaign(null)}
                className="px-10 py-5 rounded-[24px] bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-slate-900/20"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-10 p-8 rounded-[40px] bg-rose-50 border-2 border-rose-100 text-rose-600 flex items-center gap-6 shadow-2xl shadow-rose-500/5">
          <div className="h-16 w-16 bg-white rounded-3xl flex items-center justify-center shadow-md shadow-rose-500/5">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] mb-1">Dữ liệu không phản hồi</p>
            <p className="text-lg font-black">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
