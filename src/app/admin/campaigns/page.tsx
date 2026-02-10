'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BadgeCheck,
  Ban,
  Eye,
  Folder,
  Pencil,
  Plus,
  Search,
  Tag,
  History,
  X,
  CreditCard,
  Calendar,
  User as UserIcon,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { campaignService } from '@/services/campaignService';
import { userService, UserInfo } from '@/services/userService';
import { mediaService } from '@/services/mediaService';
import { CampaignDto, FundraisingGoal } from '@/types/campaign';

function formatVnd(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function StatusPill({ status }: { status: string }) {
  const base = 'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider';

  switch (status) {
    case 'ACTIVE':
      return (
        <span className={`${base} bg-emerald-50 text-emerald-700`}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
        <span className={`${base} bg-rose-50 text-rose-700`}>
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
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
          let coverImage: string | null = null;
          try {
            const [goalsData, mediaData] = await Promise.all([
              campaignService.getGoalsByCampaignId(c.id),
              mediaService.getMediaByCampaignId(c.id)
            ]);
            goals = goalsData;
            // Get the first image as cover image
            if (mediaData && mediaData.length > 0) {
              const firstImage = mediaData.find(m => m.mediaType === 'PHOTO') || mediaData[0];
              coverImage = firstImage.url;
            }
          } catch (err) {
            console.warn(`Failed to fetch goals or media for campaign ${c.id}`, err);
          }
          return {
            ...c,
            ownerName: userMap[c.fundOwnerId] || `User #${c.fundOwnerId}`,
            activeGoal: goals.find((g) => g.isActive) || null,
            coverImage: coverImage
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
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Folder className="h-4 w-4" />
            <ChevronRight className="h-3 w-3" />
            <span>Quản lý nội dung</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Chiến dịch Gây quỹ</h1>
          <p className="text-slate-500 mt-2 font-medium">Theo dõi và phê duyệt các chiến dịch đang diễn ra trên hệ thống.</p>
        </div>

        <div className="bg-slate-100/50 p-1.5 rounded-[24px] flex items-center gap-1 shadow-inner">
          {(['ALL', 'PENDING', 'ACTIVE', 'PAUSED', 'CLOSED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-2xl transition-all ${statusFilter === s ? 'bg-white text-slate-900 shadow-xl shadow-slate-200/50' : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              {s === 'ALL' ? 'Tất cả' : s === 'PENDING' ? 'Chờ duyệt' : s === 'ACTIVE' ? 'Đang chạy' : s === 'PAUSED' ? 'Dừng' : 'Đã đóng'}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-10">
        <div className="relative group/search flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within/search:text-red-500 transition-colors" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên chiến dịch, ID hoặc người tạo..."
            className="w-full bg-white border-2 border-slate-100 rounded-[32px] pl-12 pr-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500 transition-all shadow-2xl shadow-slate-200/30"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full md:w-56 rounded-[32px] border-2 border-slate-100 bg-white px-6 py-4 text-sm font-black text-slate-700 outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500 transition-all shadow-2xl shadow-slate-200/30 cursor-pointer appearance-none"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2003/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 1.5rem center',
            backgroundSize: '1rem',
          }}
        >
          <option value="ALL">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c} value={c || ''}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Table Section */}
      <div className="rounded-[40px] border border-slate-100 bg-white shadow-2xl shadow-slate-200/40 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
            <Loader2 className="h-10 w-10 text-red-500 animate-spin" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left bg-slate-50/50">
                <th className="py-6 pl-10 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Chiến dịch</th>
                <th className="py-6 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Người đại diện</th>
                <th className="py-6 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tiến độ (Active Goal)</th>
                <th className="py-6 pr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Trạng thái</th>
                <th className="py-6 pr-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((c) => {
                const target = c.activeGoal?.targetAmount || 0;
                const balance = c.balance || 0;
                const pct = target > 0 ? Math.min(100, Math.round((balance / target) * 100)) : 0;

                return (
                  <tr key={c.id} className="group hover:bg-slate-50/40 transition-colors">
                    <td className="py-6 pl-10 pr-4">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-slate-100 overflow-hidden shadow-inner flex-shrink-0 ring-4 ring-white">
                          {c.coverImage ? (
                            <img src={c.coverImage} alt={c.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-300">
                              <Tag className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-black text-slate-900 group-hover:text-red-600 transition-colors truncate max-w-[200px]">{c.title}</div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{c.category || 'Chưa phân loại'}</span>
                            <span className="h-1 w-1 rounded-full bg-slate-200" />
                            <span className="text-[10px] font-bold text-slate-400">ID: {c.id}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-6 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-sm border border-white">
                          <UserIcon className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-bold text-slate-700">{c.ownerName}</span>
                      </div>
                    </td>

                    <td className="py-6 pr-4">
                      <div className="w-56">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                            {formatVnd(balance)} / <span className="text-slate-900">{target > 0 ? formatVnd(target) : '??'}</span>
                          </span>
                          <span className="text-[10px] font-black text-red-500 leading-none">{pct}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                          <div
                            className="h-full bg-gradient-to-r from-red-500 to-rose-400 rounded-full transition-all duration-1000"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        {!c.activeGoal && <div className="mt-1 text-[9px] font-bold text-rose-400 italic">Chưa có mục tiêu hoạt động</div>}
                      </div>
                    </td>

                    <td className="py-6 pr-4">
                      <StatusPill status={c.status} />
                    </td>

                    <td className="py-6 pr-10 text-right">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/campaigns-details?id=${c.id}`}
                          className="p-2.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-xl transition-all"
                          title="Xem thực tế"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>

                        <button
                          onClick={() => openHistory(c)}
                          className="p-2.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-xl transition-all"
                          title="Lịch sử mục tiêu"
                        >
                          <History className="h-5 w-5" />
                        </button>

                        <div className="w-px h-6 bg-slate-100 mx-1 self-center" />

                        <div className="relative group/status ml-1">
                          <select
                            value={c.status}
                            onChange={(e) => updateStatus(c.id, e.target.value)}
                            className="appearance-none bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-600 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all cursor-pointer pr-8 hover:bg-white hover:shadow-lg"
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

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-32 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                      <div className="bg-slate-50 p-6 rounded-[32px] mb-4 shadow-inner">
                        <Folder className="h-10 w-10 text-slate-200" />
                      </div>
                      <p className="font-bold text-slate-500">Không tìm thấy chiến dịch nào.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
                              Active
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
