'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Wand2, X } from 'lucide-react';
import { aiService } from '@/services/aiService';
import { useToast } from '@/components/ui/Toast';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/ui/modal';

interface AIDescriptionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApply: (title: string, description: string) => void;
}

export default function AIDescriptionModal({ open, onOpenChange, onApply }: AIDescriptionModalProps) {
    const { toast } = useToast();
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ title: string; description: string } | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast('Vui lòng nhập thông tin về chiến dịch.', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const data = await aiService.generateDescription(prompt);
            if (!data.description) {
                toast('Không thể tạo mô tả cho nội dung này. Hãy thử nhập thông tin khác.', 'error');
                return;
            }
            setResult(data);
        } catch (error: any) {
            console.error('AI Generation error:', error);
            const message = error?.response?.data?.error || error?.message || '';
            if (message.includes('retryable') || message.includes('couldn\'t generate') || message.includes('rephrasing')) {
                toast('AI không thể tạo nội dung cho thông tin này. Hãy thử nhập cách khác.', 'error');
            } else if (message.includes('Network Error') || message.includes('network')) {
                toast('Không thể kết nối AI service. Hãy kiểm tra server.', 'error');
            } else {
                toast('Không thể tạo mô tả. Vui lòng thử lại.', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = () => {
        if (result) {
            onApply(result.title, result.description);
            onOpenChange(false);
            setResult(null);
            setPrompt('');
        }
    };

    return (
        <Modal open={open} onOpenChange={onOpenChange}>
            <ModalContent className="sm:max-w-[600px] rounded-[2.5rem] overflow-hidden border-none shadow-2xl bg-white">
                <ModalHeader className="bg-gray-50/50 px-8 py-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#dc2626] rounded-xl shadow-lg shadow-red-200">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <ModalTitle className="text-xl font-black text-black">AI Tạo Mô Tả Chiến Dịch</ModalTitle>
                    </div>
                </ModalHeader>

                <ModalBody className="p-8 space-y-6">
                    {!result ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-black/30 uppercase tracking-[2px] ml-1">
                                    Thông tin vắn tắt (Tên, hoàn cảnh, nhu cầu...)
                                </label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="VD: Bé Lan, 10 tuổi, mồ côi, ở vùng cao. Cần 20 triệu sửa mái nhà và mua sách vở..."
                                    className="w-full p-5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#dc2626] focus:bg-white transition-all text-sm font-bold min-h-[150px] outline-none resize-none"
                                    disabled={isLoading}
                                />
                            </div>
                            <p className="text-[11px] text-black/40 italic px-1">
                                * AI sẽ dựa trên thông tin bạn cung cấp để viết một bài mô tả chuyên nghiệp, cảm động và minh bạch.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#dc2626] uppercase tracking-[2px] ml-1">
                                    Tiêu đề gợi ý
                                </label>
                                <div className="p-4 rounded-xl bg-red-50 text-sm font-black text-black border border-red-100 max-h-[80px] overflow-y-auto custom-scrollbar">
                                    {result.title}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#dc2626] uppercase tracking-[2px] ml-1">
                                    Mô tả chi tiết
                                </label>
                                <div className="p-5 rounded-2xl bg-gray-50 text-sm font-medium text-gray-700 border border-gray-100 max-h-[250px] overflow-y-auto custom-scrollbar leading-relaxed whitespace-pre-wrap">
                                    {result.description}
                                </div>
                            </div>
                        </div>
                    )}
                </ModalBody>

                <ModalFooter className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-3">
                    {result ? (
                        <>
                            <button
                                onClick={() => setResult(null)}
                                className="px-6 h-12 rounded-full text-xs font-black text-black/40 hover:text-black transition-colors"
                            >
                                Viết Lại
                            </button>
                            <button
                                onClick={handleApply}
                                className="px-8 h-12 rounded-full bg-[#dc2626] text-white text-xs font-black shadow-lg shadow-red-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Wand2 className="h-4 w-4" />
                                Áp Dụng Ngay
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !prompt.trim()}
                            className="w-full h-14 rounded-full bg-[#dc2626] text-white text-sm font-black shadow-xl shadow-red-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Đang Sáng Tạo...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-5 w-5" />
                                    Tạo Bài Viết Chuyên Nghiệp
                                </>
                            )}
                        </button>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
