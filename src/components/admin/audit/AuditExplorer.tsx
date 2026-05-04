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
  Info,
  CheckCircle2,
  Copy,
  ExternalLink,
  RefreshCw,
  Box,
  AlertCircle
} from 'lucide-react';
import { auditService, AuditLog } from '@/services/auditService';
import { useToast } from '@/components/ui/Toast';

export default function AuditExplorer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<AuditLog | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [integrityResult, setIntegrityResult] = useState<{ valid: boolean; currentHash?: string } | null>(null);
  const [stats, setStats] = useState({ total: 0, integrity: '100%' });
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const fetchLogs = async (query = '') => {
    setIsLoading(true);
    try {
      const data = await auditService.getAll(0, 20, query.trim());
      setAuditLogs(data.content);
      
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
    if (!searchTerm.trim()) {
      fetchLogs();
      setHasSearched(false);
      return;
    }
    fetchLogs(searchTerm.trim());
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast('Đã sao chép mã Hash!', 'success');
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
                      className={`bg-white p-3 rounded-lg border transition-all cursor-pointer ${
                        selectedAudit?.id === log.id ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-100 shadow-sm'
                      }`}
                    >
                      <div className="flex gap-2">
                        <div className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${
                          selectedAudit?.id === log.id ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'
                        }`}>
                          <FileText className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="text-[9px] font-bold text-slate-900 uppercase truncate">{log.entityType}</span>
                            <span className="text-[8px] text-slate-400">
                              {new Date(log.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[10px] font-bold text-slate-900 truncate">
                            {log.actorName || 'Hệ thống'} — <span className="text-slate-500 font-medium">{log.action}</span>
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
            </div>

            {/* Content Detail */}
            <div className="flex-1 w-full">
              {selectedAudit ? (
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                       <ShieldCheck className="h-4 w-4 text-slate-900" />
                       <h3 className="text-xs font-bold text-slate-900 uppercase">SNAPSHOT ID: #{selectedAudit.id}</h3>
                    </div>
                    <div className="flex items-center gap-2">
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

                     <div className={`mt-4 flex items-center justify-between p-3 rounded-lg border transition-all ${
                        isVerifying 
                          ? 'bg-slate-50 border-slate-200 opacity-60' 
                          : integrityResult?.valid 
                          ? 'bg-emerald-50 border-emerald-100' 
                          : 'bg-red-50 border-red-100 animate-bounce'
                      }`}>
                        <div className="flex items-center gap-2">
                           {isVerifying ? (
                             <RefreshCw className="h-4 w-4 text-slate-400 animate-spin" />
                           ) : integrityResult?.valid ? (
                             <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                           ) : (
                             <AlertCircle className="h-4 w-4 text-red-600" />
                           )}
                           <span className={`text-[10px] font-bold uppercase ${
                             isVerifying ? 'text-slate-500' : integrityResult?.valid ? 'text-emerald-800' : 'text-red-800'
                           }`}>
                             Trạng thái: {isVerifying ? 'Đang xác minh...' : integrityResult?.valid ? 'Toàn vẹn (Integrity Verified)' : !integrityResult?.dataValid ? 'CẢNH BÁO: DỮ LIỆU BỊ SỬA!' : 'CẢNH BÁO: PHÁT HIỆN GIAN LẬN!'}
                           </span>
                        </div>
                        <span className={`text-[9px] font-medium ${
                          integrityResult?.valid ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {isVerifying 
                            ? 'Vui lòng đợi trong giây lát...' 
                            : integrityResult?.valid 
                            ? 'Bản ghi này bất biến và không thể bị sửa đổi.' 
                            : !integrityResult?.dataValid 
                            ? 'Mã Hash dữ liệu hiện tại không khớp với mã niêm phong.'
                            : `Dữ liệu của ${integrityResult?.tamperedEntity} đã bị thay đổi trái phép!`}
                        </span>
                     </div>
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
