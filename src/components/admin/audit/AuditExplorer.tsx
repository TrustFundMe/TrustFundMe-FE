import React, { useState, useEffect } from 'react';
import {
  Hash,
  Search,
  ShieldCheck,
  Clock,
  Database,
  Activity,
  FileText,
  Lock,
  ChevronRight,
  ChevronLeft,
  Info,
  CheckCircle2,
  Copy,
  ExternalLink,
  RefreshCw,
  Box,
  AlertCircle,
  XCircle,
  Link2Off,
  AlertTriangle
} from 'lucide-react';
import { auditService, AuditLog } from '@/services/auditService';
import { campaignService } from '@/services/campaignService';
import { paymentService } from '@/services/paymentService';
import { expenditureService } from '@/services/expenditureService';
import { kycService } from '@/services/kycService';
import { useToast } from '@/components/ui/Toast';

export default function AuditExplorer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<AuditLog | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [integrityResult, setIntegrityResult] = useState<{ valid: boolean; currentHash?: string; dataValid?: boolean; chainValid?: boolean; storedHash?: string; actualHash?: string; tamperedEntity?: string } | null>(null);
  const [stats, setStats] = useState({ total: 0, integrity: '100%' });
  const [hasSearched, setHasSearched] = useState(false);
  const [isCheckingLive, setIsCheckingLive] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 10;
  const { toast } = useToast();

  const fetchLogs = async (query = '', page = 0) => {
    setIsLoading(true);
    try {
      const data = await auditService.getAll(page, PAGE_SIZE, query.trim());
      setAuditLogs(data.content);
      setCurrentPage(data.number);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);

      // Also fetch global stats
      const globalStats = await auditService.getGlobalStatus();
      setStats({
        total: globalStats.total,
        integrity: globalStats.integrity
      });

      if (query) setHasSearched(true);
    } catch (err) {
      console.error('Fetch logs error:', err);
      toast('Không thể kết nối đến máy chủ kiểm toán', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAudit = async (log: AuditLog) => {
    setSelectedAudit(log);
    setIsVerifying(true);
    setIntegrityResult(null);
    try {
      const result = await auditService.verifyIntegrity(log.id);
      setIntegrityResult(result);
    } catch (err) {
      console.error('Verify error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    if (!searchTerm.trim()) {
      fetchLogs('', 0);
      setHasSearched(false);
      return;
    }
    fetchLogs(searchTerm.trim(), 0);
  };

  const goToPage = (page: number) => {
    if (page < 0 || page >= totalPages) return;
    fetchLogs(hasSearched ? searchTerm.trim() : '', page);
  };

  const checkLiveData = async () => {
    if (!selectedAudit) return;
    setIsCheckingLive(true);
    try {
      let liveData: any = null;
      // Resolve real entityId from snapshot (same logic as ReconciliationTab)
      const snap = JSON.parse(selectedAudit.dataSnapshot || '{}');
      const targetId = snap.id || selectedAudit.entityId;
      const entityId = Number(targetId);

      switch (selectedAudit.entityType) {
        case 'CAMPAIGN':
        case 'CAMPAIGN_APPROVAL':
          try {
            liveData = await campaignService.getById(entityId);
          } catch (e: any) {
            if (e.response?.status === 404) liveData = null;
            else throw e;
          }
          break;
        case 'DONATION':
          try {
            liveData = await paymentService.getDonation(entityId);
          } catch (e: any) {
            if (e.response?.status === 404) liveData = null;
            else throw e;
          }
          break;
        case 'DONATION_TRANSACTION':
          // entityId is campaignId for DONATION_TRANSACTION (set by CassoWebhookService)
          // Fetch the actual Casso transaction by tid from the snapshot
          try {
            const txTid = snap.tid;
            const campaignId = Number(selectedAudit.entityId);
            if (txTid && campaignId) {
              const cassoTxs = await paymentService.getCassoTransactionsByCampaign(campaignId);
              liveData = cassoTxs.find((tx: any) => String(tx.tid) === String(txTid)) || null;
            }
          } catch (e: any) {
            if (e.response?.status === 404) liveData = null;
            else throw e;
          }
          break;
        case 'EVIDENCE_SUBMISSION':
        case 'EVIDENCE_SUBMITTED':
          // entityId is campaignId — need to get evidenceId from snapshot
          try {
            const evidenceId = snap.evidenceId;
            if (evidenceId) {
              liveData = await expenditureService.getEvidenceById(evidenceId);
            }
          } catch (e: any) {
            if (e.response?.status === 404) liveData = null;
            else throw e;
          }
          break;
        case 'EXPENDITURE_REVIEW':
        case 'EXPENDITURE_WITHDRAWAL':
        case 'EVIDENCE_REVIEW':
          // entityId is campaignId for these types — fetch campaign as live data
          try {
            liveData = await campaignService.getById(entityId);
          } catch (e: any) {
            if (e.response?.status === 404) liveData = null;
            else throw e;
          }
          break;
        case 'CAMPAIGN_COMMITMENT':
          try {
            liveData = await campaignService.getCommitment(entityId);
          } catch (e: any) {
            if (e.response?.status === 404) liveData = null;
            else throw e;
          }
          break;
        case 'KYC':
        case 'USER_KYC':
          try {
            liveData = await kycService.getByUserId(entityId);
          } catch (e: any) {
            if (e.response?.status === 404) liveData = null;
            else throw e;
          }
          break;
        default:
          toast(`Không hỗ trợ kiểm tra live cho loại ${selectedAudit.entityType}`, 'info');
          setIsCheckingLive(false);
          return;
      }

      if (!liveData) {
        toast('Dữ liệu không tồn tại trên Live DB (Có thể đã bị xóa) 🗑️', 'error');
        setIsCheckingLive(false);
        return;
      }

      // For entity types where the snapshot is a self-contained transaction record
      // (not a mirror of the live entity), only verify the entity exists on Live DB.
      // The snapshot fields (tid, counterAccountName, etc.) don't map to campaign fields.
      const selfContainedTypes = [
        'EXPENDITURE_REVIEW', 'EXPENDITURE_WITHDRAWAL',
        'EVIDENCE_REVIEW'
      ];

      if (selfContainedTypes.includes(selectedAudit.entityType)) {
        // Entity exists on Live DB — that's sufficient verification
        toast('Dữ liệu khớp hoàn toàn với Live DB ✅', 'success');
      } else {
        // Full field-by-field comparison for entity types where snapshot mirrors the entity
        const snapshot = JSON.parse(selectedAudit.dataSnapshot || '{}');
        let isMatch = true;
        const mismatchedFields: string[] = [];

        // Essential fields to check (ignoring timestamps and derived fields if they differ in format)
        const fieldsToIgnore = ['updatedAt', 'createdAt', 'approvedAt', 'id', 'source'];

        for (const key in snapshot) {
          if (Object.prototype.hasOwnProperty.call(snapshot, key) && !fieldsToIgnore.includes(key)) {
            const snapshotVal = snapshot[key];
            const liveVal = liveData[key];

            // If snapshot has the field, compare even if live doesn't have it (field removed = tamper)
            if (snapshotVal !== undefined && snapshotVal !== null && snapshotVal !== '') {
              if (liveVal === undefined || liveVal === null) {
                // Field exists in snapshot but missing from live data — treat as mismatch
                isMatch = false;
                mismatchedFields.push(`${key} (missing in live)`);
              } else if (String(snapshotVal) !== String(liveVal)) {
                // Convert to string for comparison to handle number/string/BigDecimal variations
                isMatch = false;
                mismatchedFields.push(key);
              }
            }
          }
        }

        if (isMatch) {
          toast('Dữ liệu khớp hoàn toàn với Live DB ✅', 'success');
        } else {
          toast(`Phát hiện sai lệch tại các trường: ${mismatchedFields.join(', ')} ⚠️`, 'error');
        }
      }
    } catch (err) {
      console.error('Check live error:', err);
      toast('Lỗi khi truy vấn dữ liệu Live DB', 'error');
    } finally {
      setIsCheckingLive(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast('Đã sao chép mã Hash!', 'success');
  };

  const getFriendlyType = (type: string, action: string) => {
    if (type === 'DONATION_TRANSACTION') {
      return action === 'EXPENDITURE_DISBURSED' ? 'Rút tiền giải ngân' : 'Nhận tiền ủng hộ';
    }
    const types: Record<string, string> = {
      'KYC': 'Xác thực danh tính',
      'USER_KYC': 'Hồ sơ KYC',
      'DONATION': 'Khoản quyên góp',
      'EXPENDITURE': 'Chi tiêu quỹ',
      'CAMPAIGN': 'Chiến dịch',
      'CAMPAIGN_COMMITMENT': 'Cam kết chiến dịch',
      'EVIDENCE_SUBMISSION': 'Minh chứng chi tiêu',
      'EXPENDITURE_REVIEW': 'Duyệt chi tiêu',
      'EXPENDITURE_WITHDRAWAL': 'Yêu cầu rút tiền',
      'EVIDENCE_REVIEW': 'Duyệt minh chứng'
    };
    return types[type] || type;
  };

  const getFriendlyAction = (action: string) => {
    const actions: Record<string, string> = {
      'CREATE': 'Tạo mới',
      'UPDATE': 'Cập nhật',
      'APPROVE': 'Phê duyệt',
      'REJECT': 'Từ chối',
      'SIGN': 'Ký tên',
      'DONATION_RECEIVED': 'Tiền đã vào tài khoản',
      'EXPENDITURE_DISBURSED': 'Đã chuyển tiền ra',
      'EXPENDITURE_APPROVED': 'Duyệt chi tiêu',
      'EXPENDITURE_REJECTED': 'Từ chối chi tiêu',
      'EXPENDITURE_CORRECTION_REQUESTED': 'Yêu cầu chỉnh sửa',
      'EXPENDITURE_COMPLETED': 'Hoàn tất chi tiêu',
      'WITHDRAWAL_REQUESTED': 'Yêu cầu rút tiền',
      'EVIDENCE_SUBMITTED': 'Nộp minh chứng',
      'EVIDENCE_APPROVED': 'Duyệt minh chứng',
      'EVIDENCE_REJECTED': 'Từ chối minh chứng',
      'EXPENDITURE_STATUS_CHANGED': 'Cập nhật trạng thái',
      'APPROVED': 'Duyệt (Thành công)',
      'REJECTED': 'Từ chối (Thành công)',
      'CORRECTION': 'Yêu cầu sửa (Thành công)'
    };
    return actions[action] || action;
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-x-hidden">
      {/* Super Slim Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-2 shrink-0 z-10 shadow-sm">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-slate-900" />
            <h1 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Kiểm toán Bất biến</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-slate-600 uppercase">Hệ thống: Trực tuyến</span>
            </div>
            <RefreshCw
              className={`h-3.5 w-3.5 text-slate-400 cursor-pointer hover:text-slate-900 ${isLoading ? 'animate-spin' : ''}`}
              onClick={() => fetchLogs()}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="w-full p-6">

          {/* Compressed Top Section */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4 items-stretch">

            {/* Search Box */}
            <div className="flex-[2] bg-white rounded-xl p-4 shadow-sm border border-slate-100 relative">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Truy xuất dữ liệu</h2>
                  <p className="text-[11px] text-slate-500">Xác minh hồ sơ qua Hash SHA-256</p>
                </div>
                <Database className="h-6 w-6 text-slate-100" />
              </div>

              <form onSubmit={handleSearch} className="relative flex items-center mb-3">
                <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nhập mã Hash, ID người dùng hoặc ID giao dịch..."
                  className="w-full h-9 pl-9 pr-24 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-900 transition-all"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-1 px-3 h-7 bg-slate-900 text-white rounded-md text-[9px] font-bold hover:bg-slate-800 transition-all"
                >
                  {isLoading ? '...' : 'TRUY VẤN'}
                </button>
              </form>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Immutable Logs</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Point-in-time Snapshots</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 flex flex-row lg:flex-col gap-3">
              <div className="flex-1 bg-slate-900 rounded-xl p-3 text-white flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Tổng Snapshot</span>
                  <span className="text-xl font-bold">{stats.total.toLocaleString()}</span>
                </div>
                <Activity className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="flex-1 bg-white rounded-xl p-3 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Độ tin cậy dữ liệu</span>
                  <span className="text-xl font-bold text-slate-900">{stats.integrity}</span>
                </div>
                <Lock className="h-5 w-5 text-slate-200" />
              </div>
            </div>
          </div>

          {/* Lower Section */}
          <div className="flex flex-col lg:flex-row gap-4 items-start">

            {/* Timeline */}
            <div className="w-full lg:w-[320px] shrink-0">
              <h3 className="text-[10px] font-bold text-slate-900 uppercase mb-2 px-1">Nhật ký mới nhất</h3>
              <div className="space-y-2">
                {auditLogs.length > 0 ? (
                  auditLogs.map((log) => (
                    <div
                      key={log.id}
                      onClick={() => handleSelectAudit(log)}
                      className={`bg-white p-3 rounded-lg border transition-all cursor-pointer ${selectedAudit?.id === log.id ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-100 shadow-sm'
                        }`}
                    >
                      <div className="flex gap-2">
                        <div className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${selectedAudit?.id === log.id ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'
                          }`}>
                          <FileText className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-0.5">
                            <span className={`text-[9px] font-bold uppercase truncate ${log.action === 'DONATION_RECEIVED' || log.action === 'CREATE' || log.action === 'EXPENDITURE_APPROVED' || log.action === 'EVIDENCE_APPROVED' || log.action === 'APPROVED' ? 'text-emerald-600' :
                              log.action === 'EXPENDITURE_DISBURSED' || log.action === 'REJECT' || log.action === 'EXPENDITURE_REJECTED' || log.action === 'EVIDENCE_REJECTED' || log.action === 'REJECTED' ? 'text-rose-600' :
                                log.action === 'EXPENDITURE_CORRECTION_REQUESTED' || log.action === 'WITHDRAWAL_REQUESTED' || log.action === 'CORRECTION' ? 'text-amber-600' : 'text-slate-900'
                              }`}>
                              {getFriendlyType(log.entityType, log.action)}
                            </span>
                            <span className="text-[8px] text-slate-400">
                              {new Date(log.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[10px] font-bold text-slate-900 truncate">
                            {log.actorName || 'Hệ thống'} — <span className="text-slate-500 font-medium">{getFriendlyAction(log.action)}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-white rounded-lg border border-dashed border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      {hasSearched ? 'Không tìm thấy kết quả' : 'Chưa có dữ liệu'}
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-3 px-1">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">
                    {totalElements} bản ghi • Trang {currentPage + 1}/{totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 0 || isLoading}
                      className="h-7 w-7 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      // Show pages around current page
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i;
                      } else if (currentPage < 3) {
                        pageNum = i;
                      } else if (currentPage > totalPages - 4) {
                        pageNum = totalPages - 5 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          disabled={isLoading}
                          className={`h-7 min-w-[28px] px-1 flex items-center justify-center rounded-md text-[9px] font-bold transition-all ${pageNum === currentPage
                            ? 'bg-slate-900 text-white border border-slate-900'
                            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1 || isLoading}
                      className="h-7 w-7 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Content Detail */}
            <div className="flex-1 w-full lg:sticky lg:top-6 lg:self-start">
              {selectedAudit ? (
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-slate-900" />
                      <h3 className="text-xs font-bold text-slate-900 uppercase">SNAPSHOT ID: #{selectedAudit.id}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={checkLiveData}
                        disabled={isCheckingLive}
                        className="text-[9px] font-bold px-2 py-1 border border-emerald-200 text-emerald-700 rounded hover:bg-emerald-50 bg-white shadow-sm flex items-center gap-1"
                      >
                        {isCheckingLive ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Database className="h-3 w-3" />}
                        KIỂM TRA LIVE DB
                      </button>
                      <button
                        onClick={() => copyToClipboard(selectedAudit.auditHash)}
                        className="text-[9px] font-bold px-2 py-1 border border-slate-200 rounded hover:bg-white bg-white shadow-sm flex items-center gap-1"
                      >
                        <Copy className="h-3 w-3" /> SAO CHÉP HASH
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                      <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                        <span className="text-[8px] font-bold text-slate-400 uppercase block">Thời điểm ghi nhận</span>
                        <span className="text-[11px] font-bold text-slate-900">
                          {new Date(selectedAudit.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                        <span className="text-[8px] font-bold text-slate-400 uppercase block">Người thực hiện</span>
                        <span className="text-[11px] font-bold text-slate-900">{selectedAudit.actorName || 'Hệ thống'}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                        <span className="text-[8px] font-bold text-slate-400 uppercase block">Trạng thái ghi nhận</span>
                        <span className="text-[11px] font-bold text-slate-900 italic">Bản ghi bất biến</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="text-[10px] font-bold text-slate-900 uppercase block mb-2 px-1">Dữ liệu gốc (Snapshot)</span>
                      <div className="bg-slate-50 rounded-lg p-3 font-mono text-[10px] text-slate-600 max-h-[150px] overflow-y-auto overflow-x-hidden custom-scrollbar border border-slate-100">
                        <pre className="whitespace-pre-wrap break-all">{JSON.stringify(JSON.parse(selectedAudit.dataSnapshot || '{}'), null, 2)}</pre>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg text-white relative overflow-hidden group">
                      <Fingerprint className="absolute -right-4 -bottom-4 h-24 w-24 text-white/5 group-hover:text-white/10 transition-all" />
                      <div className="relative z-10">
                        <span className="text-[8px] font-bold text-slate-500 uppercase block mb-1">AUDIT HASH (SHA-256)</span>
                        <div className="font-mono text-[10px] break-all text-emerald-400 leading-tight">
                          {selectedAudit.auditHash}
                        </div>
                        {selectedAudit.previousHash && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <span className="text-[8px] font-bold text-slate-500 uppercase block mb-1">PREVIOUS HASH (Chain Connection)</span>
                            <div className="font-mono text-[9px] break-all opacity-50 leading-tight whitespace-pre-wrap">
                              {selectedAudit.previousHash}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Integrity verification result — synced with ReconciliationTab style */}
                    {isVerifying && (
                      <div className="mt-4 flex items-center gap-2 p-3 rounded-lg border border-slate-200 bg-slate-50">
                        <RefreshCw className="h-4 w-4 text-slate-400 animate-spin" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Đang xác minh tính toàn vẹn...</span>
                      </div>
                    )}

                    {!isVerifying && integrityResult && integrityResult.valid && (
                      <div className="mt-4 flex items-center gap-2.5 p-3 rounded-lg border border-emerald-200 bg-emerald-50">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="text-[10px] font-bold text-emerald-800">Bản ghi toàn vẹn — Hash khớp & Chuỗi liên kết hợp lệ</span>
                      </div>
                    )}

                    {!isVerifying && integrityResult && !integrityResult.valid && (
                      <div className="mt-4 rounded-xl border-2 border-red-300 bg-gradient-to-br from-red-50 to-rose-50 p-4 space-y-3">
                        <div className="flex items-center gap-2 text-red-700">
                          <AlertTriangle className="h-5 w-5 shrink-0" />
                          <strong className="text-[12px] font-black uppercase tracking-tight">⚠️ Phát hiện giả mạo dữ liệu</strong>
                        </div>

                        {!integrityResult.dataValid && (
                          <div className="flex gap-3 items-start text-[11px] text-slate-800">
                            <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                            <div className="space-y-1.5">
                              <p className="font-bold text-[11px]">Hash bị thay đổi trực tiếp trong DB</p>
                              <p className="text-[10px] text-slate-500 leading-relaxed">Mã Hash lưu trong DB không khớp với SHA-256 tính lại từ dữ liệu gốc (dataSnapshot + previousHash).</p>
                              <div className="font-mono text-[9px] space-y-1">
                                <div>
                                  <span className="font-bold text-slate-500 font-sans text-[8px] uppercase">Hash lưu trong DB:</span>{' '}
                                  <code className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded break-all">{integrityResult.storedHash}</code>
                                </div>
                                <div>
                                  <span className="font-bold text-slate-500 font-sans text-[8px] uppercase">Hash tính lại:</span>{' '}
                                  <code className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded break-all">{integrityResult.actualHash}</code>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {integrityResult.chainValid === false && (
                          <div className="flex gap-3 items-start text-[11px] text-slate-800">
                            <Link2Off className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="font-bold text-[11px]">Chuỗi liên kết (Chain) bị đứt</p>
                              <p className="text-[10px] text-slate-500 leading-relaxed">Previous Hash của bản ghi này không khớp với Hash của bản ghi liền trước, có thể bản ghi trước đã bị chèn/xóa/sửa.</p>
                              {integrityResult.tamperedEntity && integrityResult.tamperedEntity !== 'None' && (
                                <p className="text-[10px] font-bold text-amber-700">Bản ghi bị nghi ngờ: <strong>{integrityResult.tamperedEntity}</strong></p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-slate-200">
                  <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                    <Info className="h-6 w-6 text-slate-200" />
                  </div>
                  <span className="text-xs font-bold text-slate-300 uppercase">Chọn một bản ghi kiểm toán để xem chi tiết</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Fingerprint(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12a10 10 0 0 1 18-6M2 12c0 5.22 4.05 9.5 9.25 9.95M2 12a10 10 0 0 0 1.5 5.2M12 12V2M12 12a10 10 0 0 1 10 10M12 12a10 10 0 0 0-10 10M12 12c-5.22 0-9.5-4.05-9.95-9.25M12 12a10 10 0 0 1 5.2-1.5M7 12a5 5 0 0 1 5-5M7 12a5 5 0 0 0 5 5M17 12a5 5 0 0 0-5-5M17 12a5 5 0 0 1-5 5" />
    </svg>
  );
}
