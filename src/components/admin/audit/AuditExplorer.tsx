'use client';

import React, { useState } from 'react';
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
  Box
} from 'lucide-react';

const MOCK_AUDITS = [
  {
    id: "7d9b2e...5f1a",
    hash: "sha256:7d9b2e8c1a0f4b3d8e9c0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v",
    timestamp: "2026-05-01 14:23:45",
    category: "IDENTITY_VERIFICATION",
    target: "Alice Nguyen (User ID: 1042)",
    status: "VERIFIED",
    dataSize: "1.2 MB",
    actor: "Admin (System)"
  },
  {
    id: "a1c3e5...f7d9",
    hash: "sha256:a1c3e5g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5",
    timestamp: "2026-05-01 13:15:20",
    category: "EXPENDITURE_EVIDENCE",
    target: "Bill #123 (Campaign: Hope for Kids)",
    status: "VERIFIED",
    dataSize: "4.5 MB",
    actor: "Staff (Pham Hung)"
  }
];

export default function AuditExplorer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<any>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const found = MOCK_AUDITS.find(a => a.hash.includes(searchTerm) || a.id.includes(searchTerm));
      if (found) setSelectedAudit(found);
    }, 800);
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      {/* Super Slim Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-2 shrink-0 z-10 shadow-sm">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-slate-900" />
            <h1 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Kiểm toán Bất biến</h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-slate-600 uppercase">Hệ thống: Đồng bộ</span>
             </div>
             <RefreshCw className="h-3.5 w-3.5 text-slate-400 cursor-pointer hover:text-slate-900" />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-[1200px] mx-auto p-4">
          
          {/* Compressed Top Section */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4 items-stretch">
            
            {/* Search Box - No mt-auto, no unnecessary height */}
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
                    placeholder="Nhập mã Hash..."
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
                   <span className="text-[9px] font-bold text-slate-400 uppercase">Point-in-time</span>
                </div>
            </div>

            {/* Stats - Horizontal for more density */}
            <div className="flex-1 flex flex-row lg:flex-col gap-3">
               <div className="flex-1 bg-slate-900 rounded-xl p-3 text-white flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Snapshots</span>
                    <span className="text-xl font-bold">12,482</span>
                  </div>
                  <Activity className="h-5 w-5 text-emerald-500" />
               </div>
               <div className="flex-1 bg-white rounded-xl p-3 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">Sai lệch</span>
                    <span className="text-xl font-bold text-slate-900">0%</span>
                  </div>
                  <Lock className="h-5 w-5 text-slate-200" />
               </div>
            </div>
          </div>

          {/* Lower Section */}
          <div className="flex flex-col lg:flex-row gap-4 items-start">
            
            {/* Timeline */}
            <div className="w-full lg:w-[320px] shrink-0">
              <h3 className="text-[10px] font-bold text-slate-900 uppercase mb-2 px-1">Dòng thời gian</h3>
              <div className="space-y-2">
                {MOCK_AUDITS.map((audit) => (
                  <div 
                    key={audit.id}
                    onClick={() => setSelectedAudit(audit)}
                    className={`bg-white p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedAudit?.id === audit.id ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-100 shadow-sm'
                    }`}
                  >
                    <div className="flex gap-2">
                      <div className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${
                        selectedAudit?.id === audit.id ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'
                      }`}>
                        <FileText className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <span className="text-[9px] font-bold text-slate-900 uppercase truncate">{audit.category.split('_')[0]}</span>
                          <span className="text-[8px] text-slate-400">{audit.timestamp.split(' ')[1]}</span>
                        </div>
                        <p className="text-[10px] font-medium text-slate-600 truncate">{audit.target}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Detail */}
            <div className="flex-1 w-full">
              {selectedAudit ? (
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                       <ShieldCheck className="h-4 w-4 text-slate-900" />
                       <h3 className="text-xs font-bold text-slate-900 uppercase">CHI TIẾT: {selectedAudit.id}</h3>
                    </div>
                    <button className="text-[9px] font-bold px-2 py-1 border border-slate-200 rounded hover:bg-white bg-slate-50">SAO CHÉP HASH</button>
                  </div>
                  <div className="p-4">
                     <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                           <span className="text-[8px] font-bold text-slate-400 uppercase block">Thời điểm</span>
                           <span className="text-[11px] font-bold text-slate-900">{selectedAudit.timestamp}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                           <span className="text-[8px] font-bold text-slate-400 uppercase block">Người dùng</span>
                           <span className="text-[11px] font-bold text-slate-900">{selectedAudit.actor}</span>
                        </div>
                     </div>
                     <div className="space-y-2 mb-4">
                        {[
                          { l: "Thu thập dữ liệu", d: "KYC, Dữ liệu hồ sơ..." },
                          { l: "Mã hóa SHA-256", d: "Tạo chữ ký số độc bản." },
                          { l: "Ghi nhận Ledger", d: "Đóng dấu thời gian." }
                        ].map((s, i) => (
                          <div key={i} className="flex gap-3 items-center">
                             <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                             <span className="text-[10px] font-bold text-slate-700 uppercase w-24 shrink-0">{s.l}</span>
                             <span className="text-[10px] text-slate-400 truncate">{s.d}</span>
                          </div>
                        ))}
                     </div>
                     <div className="p-3 bg-slate-900 rounded-lg text-white">
                        <span className="text-[8px] font-bold text-slate-500 uppercase block mb-1">AUDIT HASH</span>
                        <div className="font-mono text-[10px] break-all opacity-90 leading-tight">
                           {selectedAudit.hash}
                        </div>
                     </div>
                  </div>
                </div>
              ) : (
                <div className="h-40 flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-slate-200">
                  <span className="text-xs font-bold text-slate-300 uppercase">Chọn một bản ghi</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
