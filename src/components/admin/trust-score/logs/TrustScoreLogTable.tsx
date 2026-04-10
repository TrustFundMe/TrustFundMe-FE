'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Minus, Filter, Star, User as UserIcon, ExternalLink } from 'lucide-react';
import { trustScoreService } from '@/services/trustScoreService';
import { TrustScoreConfig } from '@/services/trustScoreService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface FilterState {
  userId: string;
  ruleKey: string;
  startDate: string;
  endDate: string;
}

export function TrustScoreLogTable() {
  const [filters, setFilters] = useState<FilterState>({
    userId: '',
    ruleKey: '',
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const [configs, setConfigs] = useState<TrustScoreConfig[]>([]);

  const { data: configsData } = useQuery({
    queryKey: ['trust-score-configs'],
    queryFn: () => trustScoreService.getConfigs(),
  });

  // Build query params
  const params: any = {
    page,
    size: pageSize,
  };
  if (filters.userId) params.userId = filters.userId;
  if (filters.ruleKey) params.ruleKey = filters.ruleKey;
  if (filters.startDate) params.startDate = filters.startDate + 'T00:00:00';
  if (filters.endDate) params.endDate = filters.endDate + 'T23:59:59';

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['trust-score-logs', filters, page],
    queryFn: () => trustScoreService.getLogs(params),
    placeholderData: (prev) => prev,
  });

  const logs = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  };

  return (
    <div className="flex flex-col">
      {/* Filter Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-slate-600">
            {totalElements > 0 ? `${totalElements} bản ghi` : 'Nhật ký điểm uy tín'}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`gap-1.5 text-xs ${showFilters ? 'text-amber-600' : 'text-slate-500'}`}
          >
            <Filter className="h-3.5 w-3.5" />
            Bộ lọc
          </Button>
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="border-slate-200 text-xs h-8"
          >
            Trước
          </Button>
          <span className="text-xs text-slate-500">
            {page + 1} / {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1}
            className="border-slate-200 text-xs h-8"
          >
            Sau
          </Button>
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 grid grid-cols-4 gap-3">
          <div>
            <Label className="text-xs text-slate-500 mb-1 block">User ID</Label>
            <Input
              type="number"
              placeholder="Lọc theo user ID..."
              value={filters.userId}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs text-slate-500 mb-1 block">Quy tắc</Label>
            <select
              value={filters.ruleKey}
              onChange={(e) => setFilters({ ...filters, ruleKey: e.target.value })}
              className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Tất cả</option>
              {(configsData ?? []).map((c) => (
                <option key={c.id} value={c.ruleKey}>
                  {c.ruleName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-xs text-slate-500 mb-1 block">Từ ngày</Label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs text-slate-500 mb-1 block">Đến ngày</Label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
          <div className="col-span-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilters({ userId: '', ruleKey: '', startDate: '', endDate: '' });
                setPage(0);
              }}
              className="border-slate-200 text-xs h-8"
            >
              Xóa lọc
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 380px)' }}>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-white sticky top-0 z-10">
              <th className="text-left py-3 px-4 font-semibold text-slate-600 text-[13px]">Người dùng</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600 text-[13px]">Quy tắc</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600 text-[13px]">Mô tả</th>
              <th className="text-center py-3 px-4 font-semibold text-slate-600 text-[13px]">Điểm</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600 text-[13px]">Liên kết</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600 text-[13px]">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {isLoading || isFetching ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">
                  Đang tải...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">
                  Chưa có nhật ký điểm uy tín nào.
                </td>
              </tr>
            ) : (
              logs.map((log: any) => {
                const href = log.referenceId
                  ? log.referenceType === 'CAMPAIGN'
                    ? `/campaigns-details?id=${log.referenceId}`
                    : log.referenceType === 'POST'
                      ? `/post/${log.referenceId}`
                      : log.referenceType === 'EXPENDITURE'
                        ? `/account/campaigns/expenditures?id=${log.referenceId}`
                        : null
                  : null;
                const linkLabel = log.referenceType === 'CAMPAIGN' ? 'Chiến dịch' : log.referenceType === 'POST' ? 'Bài viết' : log.referenceType === 'EXPENDITURE' ? 'Chi tiêu' : 'Chi tiết';
                return (
                <tr
                  key={log.id}
                  className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 text-sm">
                          {log.userFullName || `User #${log.userId}`}
                        </p>
                        <p className="text-xs text-slate-400">#{log.userId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <code className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                      {log.ruleKey}
                    </code>
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-[13px] max-w-xs">
                    {log.description || '-'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {log.pointsChange >= 0 ? (
                        <Plus className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Minus className="h-3.5 w-3.5 text-red-500" />
                      )}
                      <Badge
                        className={
                          log.pointsChange >= 0
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-red-50 text-red-600 border-red-100'
                        }
                      >
                        {log.pointsChange}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {linkLabel}
                      </a>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-xs">
                    {formatDate(log.createdAt)}
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
