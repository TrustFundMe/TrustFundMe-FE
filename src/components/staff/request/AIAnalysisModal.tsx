'use client';

import React from 'react';
import { 
    X, Sparkles, AlertCircle, CheckCircle, 
    ShieldCheck, Info, TrendingDown, TrendingUp,
    AlertTriangle, ShieldAlert
} from 'lucide-react';

interface AIAnalysisModalProps {
    result: {
        riskScore: number;
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
        summary: string;
        recommendation: string;
        redFlags: string[];
        spendingAnalysis: string[];
        confidence: 'LOW' | 'MEDIUM' | 'HIGH';
    };
    onClose: () => void;
}

export default function AIAnalysisModal({ result, onClose }: AIAnalysisModalProps) {
    const getRiskStyles = (score: number) => {
        if (score < 30) return 'text-emerald-500 border-emerald-100 bg-emerald-50';
        if (score < 70) return 'text-amber-500 border-amber-100 bg-amber-50';
        return 'text-rose-500 border-rose-100 bg-rose-50';
    };

    const getRiskLabel = (score: number) => {
        if (score < 30) return 'AN TOÀN';
        if (score < 70) return 'CẦN KIỂM TRA';
        return 'RỦI RO CAO';
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
                
                {/* Header Section */}
                <div className="p-5 bg-[#446b5f] text-white flex-shrink-0 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Sparkles className="h-5 w-5 text-emerald-300" />
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-tight leading-none">Kết quả kiểm toán AI</h3>
                            <p className="text-[10px] font-bold text-emerald-100/60 uppercase mt-1">Phân tích dữ liệu & rủi ro tài chính</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors">
                        <X className="h-5 w-5 text-white/70" />
                    </button>
                </div>

                {/* Content Section */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                    
                    {/* Risk Score */}
                    <div className="flex items-center justify-between p-5 rounded-xl border border-gray-100 bg-gray-50/50">
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Chỉ số rủi ro hệ thống</p>
                            <div className="flex items-center gap-3">
                                <span className={`text-4xl font-bold tracking-tighter ${getRiskStyles(result.riskScore).split(' ')[0]}`}>{result.riskScore}%</span>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase ${getRiskStyles(result.riskScore)}`}>
                                    {getRiskLabel(result.riskScore)}
                                </span>
                            </div>
                        </div>
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                            <div className={`h-full transition-all duration-1000 ${result.riskScore < 30 ? 'bg-emerald-500' : result.riskScore < 70 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${result.riskScore}%` }} />
                        </div>
                    </div>

                    {/* Summary */}
                    <section className="space-y-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tóm tắt kết luận</p>
                        <div className="text-[13px] font-medium text-gray-700 leading-relaxed bg-gray-50/50 p-4 rounded-xl border border-gray-50 italic">
                            "{result.summary}"
                        </div>
                    </section>
 
                    {/* Red Flags */}
                    {result.redFlags?.length > 0 && (
                        <section className="space-y-3">
                            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Cảnh báo bất thường ({result.redFlags.length})</p>
                            <div className="space-y-2">
                                {result.redFlags.map((flag, idx) => (
                                    <div key={idx} className="flex gap-3 p-3 rounded-xl border border-rose-100 bg-rose-50/30">
                                        <AlertTriangle className="h-4 w-4 text-rose-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-[12px] font-bold text-rose-900 leading-relaxed">{flag}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Spending Analysis */}
                    {result.spendingAnalysis?.length > 0 && (
                        <section className="space-y-3">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phân tích chi tiết</p>
                            <div className="divide-y divide-gray-50 border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
                                {result.spendingAnalysis.map((analysis, idx) => (
                                    <div key={idx} className="flex gap-3 p-3.5 hover:bg-gray-50/50 transition-colors">
                                        <Info className="h-4 w-4 text-gray-300 flex-shrink-0 mt-0.5" />
                                        <p className="text-[12px] font-medium text-gray-600 leading-relaxed">{analysis}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Recommendation */}
                    <section className="bg-emerald-50/30 p-5 rounded-xl border border-emerald-100 shadow-sm">
                        <div className="flex items-start gap-4">
                            <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
                            <div className="flex-1">
                                <h4 className="text-[10px] font-bold text-emerald-700 uppercase mb-1.5 tracking-widest">Kiến nghị xử lý</h4>
                                <p className="text-[12px] font-bold text-emerald-900 leading-relaxed">{result.recommendation}</p>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="p-5 border-t border-gray-100 bg-gray-50/30 flex-shrink-0">
                    <button onClick={onClose} 
                        className="w-full h-11 rounded-xl bg-white border border-gray-200 text-gray-500 text-[11px] font-bold uppercase hover:bg-gray-50 transition-all shadow-sm">
                        Đóng báo cáo kiểm toán
                    </button>
                </div>
            </div>
        </div>
    );
}
