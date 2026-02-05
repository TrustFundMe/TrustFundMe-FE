'use client';

import { useState, useRef } from 'react';
import { ImageIcon, Video, FileText, AlertCircle, Calendar, Target, Type, Paperclip, Upload } from 'lucide-react';

interface Step2SetupProps {
    data: any;
    onChange: (key: any, value: any) => void;
    errors: Record<string, string>;
    showErrors: boolean;
}

type MediaType = 'image' | 'video' | 'file';

export default function Step2Setup({ data, onChange, errors, showErrors }: Step2SetupProps) {
    const [selectedMedia, setSelectedMedia] = useState<MediaType>('image');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const verificationInputRef = useRef<HTMLInputElement>(null);

    const mediaOptions = [
        { id: 'image', label: 'Ảnh', icon: ImageIcon, desc: 'JPG, PNG' },
        { id: 'video', label: 'Video', icon: Video, desc: 'MP4, MOV' },
        { id: 'file', label: 'Tệp', icon: FileText, desc: 'PDF, DOCX' },
    ];

    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    const triggerVerification = () => {
        verificationInputRef.current?.click();
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
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-black/30 uppercase tracking-[2px] ml-1">Bắt đầu</label>
                                    <input
                                        type="date"
                                        value={data.startDate}
                                        onChange={(e) => onChange('startDate', e.target.value)}
                                        className="w-full h-12 px-5 rounded-2xl bg-gray-50/50 border-2 border-transparent focus:border-[#dc2626] focus:bg-white transition-all text-sm font-bold outline-none text-left"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-black/30 uppercase tracking-[2px] ml-1">Kết thúc</label>
                                    <input
                                        type="date"
                                        value={data.endDate}
                                        onChange={(e) => onChange('endDate', e.target.value)}
                                        className="w-full h-12 px-5 rounded-2xl bg-gray-50/50 border-2 border-transparent focus:border-[#dc2626] focus:bg-white transition-all text-sm font-bold outline-none text-left"
                                    />
                                </div>
                            </div>

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
                                        className="w-full h-14 pl-5 pr-12 rounded-2xl bg-gray-50/50 border-2 border-transparent focus:border-[#dc2626] focus:bg-white transition-all text-lg font-black outline-none"
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-black/20 text-sm">VNĐ</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-black/30 uppercase tracking-[2px] ml-1">Mô tả hoàn cảnh</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => onChange('description', e.target.value)}
                                    rows={4}
                                    placeholder="Nêu rõ hoàn cảnh và mục đích sử dụng quỹ..."
                                    className="w-full p-5 rounded-2xl bg-gray-50/50 border-2 border-transparent focus:border-[#dc2626] focus:bg-white transition-all text-sm font-bold outline-none resize-none leading-relaxed"
                                />
                            </div>
                        </div>

                        {/* Right Side: Media Selection */}
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-black/30 uppercase tracking-[2px] ml-1">Phương thức truyền thông</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {mediaOptions.map((opt) => {
                                        const Icon = opt.icon;
                                        const isActive = selectedMedia === opt.id;
                                        return (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => setSelectedMedia(opt.id as MediaType)}
                                                className={`flex flex-col items-center justify-center p-4 rounded-[2rem] border-2 transition-all group ${isActive
                                                    ? 'border-[#dc2626] bg-[#dc2626]/5 shadow-sm'
                                                    : 'border-transparent bg-gray-50/50 hover:bg-gray-100'
                                                    }`}
                                            >
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 transition-all ${isActive ? 'bg-[#dc2626] text-white' : 'text-black/20 group-hover:text-black/40'
                                                    }`}>
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-black' : 'text-black/30'}`}>
                                                    {opt.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div
                                onClick={triggerUpload}
                                className="relative aspect-[4/3] rounded-[2.5rem] border-2 border-dashed border-gray-100 bg-gray-50/30 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-gray-200 transition-all group overflow-hidden"
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={(e) => onChange('coverImage', e.target.files?.[0] || null)}
                                    accept={selectedMedia === 'image' ? 'image/*' : selectedMedia === 'video' ? 'video/*' : '.pdf,.docx'}
                                />
                                {data.coverImage ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white p-4">
                                        <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
                                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                                        </div>
                                        <span className="text-xs font-bold text-black/60 truncate w-full text-center px-4">
                                            {data.coverImage.name}
                                        </span>
                                        <span className="mt-2 text-[10px] font-black text-[#dc2626] uppercase">Nhấn để thay đổi</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="h-14 w-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Upload className="h-6 w-6 text-black/20" />
                                        </div>
                                        <span className="text-xs font-black text-black/30 uppercase tracking-widest">Tải lên {mediaOptions.find(o => o.id === selectedMedia)?.label}</span>
                                        <span className="mt-1 text-[10px] font-bold text-black/10">Định dạng {mediaOptions.find(o => o.id === selectedMedia)?.desc}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom scrollbar and date picker indicator fix */}
            <style jsx global>{`
                textarea::-webkit-scrollbar {
                    width: 4px;
                }
                textarea::-webkit-scrollbar-thumb {
                    background: #eee;
                    border-radius: 10px;
                }
                input[type="date"] {
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                }
                input[type="date"]::-webkit-calendar-picker-indicator {
                    cursor: pointer;
                    opacity: 0.6;
                    transition: opacity 0.2s;
                    margin-left: auto;
                }
                input[type="date"]::-webkit-calendar-picker-indicator:hover {
                    opacity: 1;
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