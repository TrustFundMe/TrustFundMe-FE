'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Star, Loader2, Plus, Minus } from 'lucide-react';
import { trustScoreService } from '@/services/trustScoreService';

interface TrustScoreLogsModalProps {
  userId: string | number;
  userName: string;
  onClose: () => void;
}

export default function TrustScoreLogsModal({ userId, userName, onClose }: TrustScoreLogsModalProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());
  const pageSize = 20;

  const toggleExpand = (id: number) => {
    const newSet = new Set(expandedLogs);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedLogs(newSet);
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  useEffect(() => {
    setLoading(true);
    trustScoreService.getLogs({ userId: Number(userId), page, size: pageSize })
      .then(res => {
        setLogs(res.content || []);
        setTotalPages(res.totalPages || 0);
      })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [userId, page]);

  const formatDate = (d: string) => new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(d));

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8"
      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: '90vh', animation: 'apptSlideUp .25s cubic-bezier(.34,1.56,.64,1)' }}
      >
        {/* Header */}
        <div
          className="relative flex items-center justify-between px-7 pt-6 pb-14"
          style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}
        >
          <div>
            <h2 className="text-xl font-bold text-white">Nhật Ký Điểm Uy Tín</h2>
            <p className="text-sm text-white/70 mt-0.5">{userName}</p>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/35 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1200 50" preserveAspectRatio="none" style={{ display: 'block', height: '36px' }}>
            <path d="M0,30 C150,50 350,8 600,26 C850,44 1050,4 1200,28 L1200,50 L0,50 Z" fill="white" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-amber-50">
                <Star className="h-7 w-7 text-amber-300" />
              </div>
              <p className="font-semibold text-gray-500 text-sm">Chưa có nhật ký điểm uy tín nào.</p>
            </div>
          ) : (
            <>
              <div style={{ maxHeight: 'calc(90vh - 220px)', overflowY: 'auto' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 sticky top-0">
                      <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs">Quy tắc</th>
                      <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs">Mô tả</th>
                      <th className="text-center py-3 px-5 font-semibold text-gray-500 text-xs">Điểm</th>
                      <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs">Liên kết</th>
                      <th className="text-right py-3 px-5 font-semibold text-gray-500 text-xs">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => {
                      const href = log.referenceId
                        ? log.referenceType === 'CAMPAIGN'
                          ? `/campaigns-details?id=${log.referenceId}`
                          : log.referenceType === 'POST'
                            ? `/post/${log.referenceId}`
                            : log.referenceType === 'EXPENDITURE'
                              ? `/account/campaigns/expenditures/${log.referenceId}`
                              : null
                        : null;
                      return (
                        <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="py-3 px-5">
                            <code className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {log.ruleKey}
                            </code>
                          </td>
                          <td className="py-3 px-5 text-gray-600 text-xs max-w-xl min-w-[200px]">
                            <div className={expandedLogs.has(log.id) ? "" : "line-clamp-2"}>
                              {log.description || '-'}
                            </div>
                            {(log.description && log.description.length > 50) && (
                              <button
                                onClick={() => toggleExpand(log.id)}
                                className="text-[10px] font-bold text-amber-600 hover:text-amber-700 mt-1 uppercase tracking-tight"
                              >
                                {expandedLogs.has(log.id) ? 'Thu gọn' : 'Xem thêm'}
                              </button>
                            )}
                          </td>
                          <td className="py-3 px-5 text-center">
                            <span className={`inline-flex items-center gap-0.5 font-bold text-sm ${log.pointsChange >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                              {log.pointsChange >= 0 ? <Plus className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                              {Math.abs(log.pointsChange)}
                            </span>
                          </td>
                          <td className="py-3 px-5">
                            {href ? (
                              <Link
                                href={href}
                                className="text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline"
                              >
                                Xem {log.referenceType === 'CAMPAIGN' ? 'chiến dịch' : log.referenceType === 'POST' ? 'bài viết' : log.referenceType === 'EXPENDITURE' ? 'chi tiêu' : 'chi tiết'}
                              </Link>
                            ) : (
                              <span className="text-xs text-gray-300">—</span>
                            )}
                          </td>
                          <td className="py-3 px-5 text-right text-xs text-gray-400">{formatDate(log.createdAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 py-4 border-t border-gray-100">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-4 py-1.5 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50"
                  >
                    Trước
                  </button>
                  <span className="text-sm text-gray-500">{page + 1} / {totalPages}</span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= totalPages - 1}
                    className="px-4 py-1.5 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
