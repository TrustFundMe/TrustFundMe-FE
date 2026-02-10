'use client';

import { useState, useRef } from 'react';
import { ImageIcon, Video, FileText, AlertCircle, Target, Type, Paperclip, Upload, X, Check, Star } from 'lucide-react';
import { mediaService } from '@/services/mediaService';
import { formatApiError } from '@/utils/errorUtils';
import { useToast } from '@/components/ui/Toast';

interface Step2SetupProps {
    data: any;
    onChange: (key: any, value: any) => void;
    errors: Record<string, string>;
    showErrors: boolean;
}

const LIMITS = {
    PHOTO: 10 * 1024 * 1024, // 10MB
    VIDEO: 50 * 1024 * 1024, // 50MB
    FILE: 20 * 1024 * 1024, // 20MB
};

export default function Step2Setup({ data, onChange, errors, showErrors }: Step2SetupProps) {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadFilter, setUploadFilter] = useState<string>('*');

    const mediaOptions = [
        { id: 'image', label: 'Ảnh', icon: ImageIcon, desc: 'JPG, PNG', type: 'PHOTO', accept: 'image/*', limit: '10MB' },
        { id: 'video', label: 'Video', icon: Video, desc: 'MP4, MOV', type: 'VIDEO', accept: 'video/*', limit: '50MB' },
        { id: 'file', label: 'Tệp', icon: FileText, desc: 'Tài liệu', type: 'FILE', accept: '.pdf,.docx,.xlsx,.txt,.zip', limit: '20MB' },
    ];

    const currentAttachments = data.attachments || [];

    const triggerUpload = (accept: string) => {
        setUploadFilter(accept);
        // Timeout to ensure state update before click if needed, though usually not needed for hidden inputs
        setTimeout(() => fileInputRef.current?.click(), 10);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newFiles = Array.from(files);

        for (const file of newFiles) {
            let mediaType: 'PHOTO' | 'VIDEO' | 'FILE' = 'FILE';
            if (file.type.startsWith('image/')) mediaType = 'PHOTO';
            else if (file.type.startsWith('video/')) mediaType = 'VIDEO';

            const limit = LIMITS[mediaType];
            if (file.size > limit) {
                const limitName = mediaType === 'PHOTO' ? '10MB' : mediaType === 'VIDEO' ? '50MB' : '20MB';
                toast(`Tệp "${file.name}" quá lớn. Dung lượng tối đa cho ${mediaType} là ${limitName}.`, 'error');
                continue;
            }

            const previewUrl = URL.createObjectURL(file);
            const newAttachment = {
                file, // Store the raw file for later upload
                type: mediaType.toLowerCase().replace('photo', 'image'),
                url: previewUrl,
                name: file.name,
                isLocal: true
            };

            const updatedAttachments = [...currentAttachments, newAttachment];
            onChange('attachments', updatedAttachments);

            if (!data.coverImage && mediaType === 'PHOTO') {
                onChange('coverImage', previewUrl);
            }
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeAttachment = (index: number) => {
        const itemToRemove = currentAttachments[index];
        const updated = currentAttachments.filter((_: any, i: number) => i !== index);
        onChange('attachments', updated);

        if (data.coverImage === itemToRemove.url) {
            const nextImage = updated.find((a: any) => a.type === 'image');
            onChange('coverImage', nextImage ? nextImage.url : '');
        }

        // Revoke object URL to prevent memory leaks if it's local
        if (itemToRemove.isLocal && itemToRemove.url.startsWith('blob:')) {
            URL.revokeObjectURL(itemToRemove.url);
        }
    };

    const setAsCover = (url: string) => {
        onChange('coverImage', url);
    };

    return (
        <div className="max-w-4xl mx-auto w-full h-full flex flex-col justify-center">
            <div className="bg-white rounded-[3rem] shadow-[0_20px_70px_-20px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100">
                <div className="p-10 space-y-8">
                    {/* Top Row: Title and Goals */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        <div className="md:col-span-12">
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => onChange('title', e.target.value)}
                                placeholder="Nhập tiêu đề chiến dịch của bạn..."
                                className="w-full text-2xl font-black text-black placeholder:text-black/10 border-none p-0 focus:ring-0 outline-none"
                            />
                            {showErrors && errors.title && (
                                <div className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-widest">{errors.title}</div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                        {/* Left Side: Inputs */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-black/30 uppercase tracking-[2px] ml-1">Mục tiêu tài chính</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={data.targetAmount === 0 ? '' : data.targetAmount.toLocaleString('vi-VN')}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            onChange('targetAmount', val === '' ? 0 : parseInt(val));
                                        }}
                                        placeholder="0"
                                        className={`w-full h-14 pl-5 pr-12 rounded-2xl border-2 transition-all text-lg font-black outline-none ${showErrors && errors.targetAmount ? 'bg-red-50/50 border-red-200' : 'bg-gray-50/50 border-transparent focus:border-[#dc2626] focus:bg-white'}`}
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-black/20 text-sm">VNĐ</span>
                                </div>
                                {showErrors && errors.targetAmount && (
                                    <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1">{errors.targetAmount}</div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-black/30 uppercase tracking-[2px] ml-1">Mô tả hoàn cảnh</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => onChange('description', e.target.value)}
                                    rows={8}
                                    placeholder="Nêu rõ hoàn cảnh và mục đích sử dụng quỹ..."
                                    className={`w-full p-5 rounded-2xl border-2 transition-all text-sm font-bold outline-none resize-none leading-relaxed ${showErrors && errors.description ? 'bg-red-50/50 border-red-200' : 'bg-gray-50/50 border-transparent focus:border-[#dc2626] focus:bg-white'}`}
                                />
                                {showErrors && errors.description && (
                                    <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1">{errors.description}</div>
                                )}
                            </div>
                        </div>

                        {/* Right Side: Media Manager */}
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-[10px] font-black text-black/30 uppercase tracking-[2px]">Đính kèm phương tiện (Nhiều tệp)</label>
                                    <span className="text-[9px] font-bold text-red-500/60 italic">(*) Ảnh đầu tiên sẽ là ảnh bìa</span>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {mediaOptions.map((opt) => {
                                        const Icon = opt.icon;
                                        return (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => triggerUpload(opt.accept)}
                                                className="flex flex-col items-center justify-center p-4 rounded-[2rem] border-2 border-transparent bg-gray-50/50 hover:bg-white hover:border-[#dc2626] transition-all group"
                                            >
                                                <div className="h-10 w-10 rounded-full flex items-center justify-center mb-2 bg-white text-black/20 group-hover:bg-[#dc2626] group-hover:text-white transition-all">
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-black/30 group-hover:text-black">
                                                    + {opt.label}
                                                </span>
                                                <span className="mt-1 text-[8px] font-bold text-red-500/80 uppercase tracking-tighter">Tối đa {opt.limit}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    accept={uploadFilter}
                                    multiple
                                />
                            </div>

                            {/* Media List */}
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {currentAttachments.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50/50 border border-transparent hover:border-gray-100 transition-all group">
                                        <div className="relative h-12 w-12 rounded-xl bg-white flex items-center justify-center overflow-hidden shrink-0 border border-gray-100">
                                            {item.type === 'image' ? (
                                                <img src={item.url} alt="" className="w-full h-full object-cover" />
                                            ) : item.type === 'video' ? (
                                                <Video className="h-5 w-5 text-[#dc2626]" />
                                            ) : (
                                                <FileText className="h-5 w-5 text-blue-500" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[11px] font-bold text-black truncate">{item.name || 'Tài liệu không tên'}</div>
                                            <div className="text-[9px] font-black text-black/20 uppercase tracking-widest">{item.type}</div>
                                        </div>
                                        <div className="flex items-center gap-1 transition-all">
                                            <button
                                                onClick={() => removeAttachment(idx)}
                                                className="p-2 rounded-lg bg-[#dc2626] text-white hover:bg-red-700 transition-all shadow-md"
                                                title="Xóa"
                                            >
                                                <X className="h-3 w-3 text-white" />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {currentAttachments.length === 0 && (
                                    <div className="py-10 flex flex-col items-center justify-center opacity-20 italic">
                                        <Paperclip className="h-8 w-8 mb-2" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Chưa có tệp đính kèm</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #e5e5e5;
                }
            `}</style>
        </div>
    );
}

const CheckCircle2 = (props: any) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);