'use client';

import { ImageIcon, Video, FileText, AlertCircle, Paperclip, X, Star, HeartPulse, BookOpen, Leaf, Zap, Home, Users, Baby, Dog, Globe, Utensils, Hammer, Music, ShieldCheck, Flame, Sparkles } from 'lucide-react';
import AIDescriptionModal from './AIDescriptionModal';
import { mediaService } from '@/services/mediaService';
import { campaignCategoryService } from '@/services/campaignCategoryService';
import { formatApiError } from '@/utils/errorUtils';
import { useToast } from '@/components/ui/Toast';
import { useEffect, useState, useRef } from 'react';
import { type CampaignCategory } from '@/types/campaign';

interface Step2SetupProps {
    data: any;
    onChange: (key: any, value: any) => void;
    errors: Record<string, string>;
    showErrors: boolean;
    onPrev: () => void;
    onNext: () => void;
}

const LIMITS = {
    PHOTO: 10 * 1024 * 1024, // 10MB
    VIDEO: 50 * 1024 * 1024, // 50MB
    FILE: 20 * 1024 * 1024, // 20MB
};

export default function Step2Setup({ data, onChange, errors, showErrors, onPrev, onNext }: Step2SetupProps) {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadFilter, setUploadFilter] = useState<string>('*');
    const [categories, setCategories] = useState<CampaignCategory[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    const handleAIApply = (title: string, description: string) => {
        onChange('title', title);
        onChange('description', description);
        toast('Đã cập nhật tiêu đề và mô tả từ AI!', 'success');
    };

    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoadingCategories(true);
            try {
                const data = await campaignCategoryService.getAll();
                setCategories(data);
            } catch (err) {
                console.error('Failed to fetch categories:', err);
                toast('Không thể tải danh sách danh mục.', 'error');
            } finally {
                setIsLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

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
            // No auto-select cover: user chooses explicitly via the star button
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeAttachment = (index: number) => {
        const itemToRemove = currentAttachments[index];
        const updated = currentAttachments.filter((_: any, i: number) => i !== index);
        onChange('attachments', updated);

        // If the removed item was the cover, clear coverImage — user must re-pick
        if (data.coverImage === itemToRemove.url) {
            onChange('coverImage', '');
        }

        // Revoke object URL to prevent memory leaks if it's local
        if (itemToRemove.isLocal && itemToRemove.url.startsWith('blob:')) {
            URL.revokeObjectURL(itemToRemove.url);
        }
    };

    const setAsCover = (url: string) => {
        onChange('coverImage', url);
    };

    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const categoryRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
                setIsCategoryOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);



    const selectedCategory = categories.find(c => c.id === data.categoryId);

    return (
        <div className="max-w-4xl mx-auto w-full h-full flex flex-col justify-center">
            <div className="bg-white rounded-[3rem] shadow-[0_20px_70px_-20px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100">
                <div className="pt-10 px-10 pb-5 space-y-8">
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

                            <div className="space-y-2 relative" ref={categoryRef}>
                                <label className="text-[10px] font-black text-black/30 uppercase tracking-[2px] ml-1">Danh mục chiến dịch</label>

                                <button
                                    type="button"
                                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                    className={`w-full h-14 px-6 rounded-full flex items-center justify-between transition-all border-2 outline-none ${selectedCategory
                                        ? 'bg-white border-[#dc2626] text-black shadow-sm'
                                        : 'bg-gray-50/50 border-transparent text-gray-400 hover:bg-white hover:border-gray-200'
                                        }`}
                                >
                                    <span className={`font-bold text-sm tracking-wide ${selectedCategory ? 'text-black' : 'text-black/20'}`}>
                                        {selectedCategory ? selectedCategory.name : 'Chọn danh mục'}
                                    </span>
                                    <svg
                                        className={`w-5 h-5 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180 text-[#dc2626]' : 'text-gray-300'}`}
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {isCategoryOpen && (
                                    <div className="absolute top-full left-0 w-full mt-2 bg-white/95 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-50 overflow-hidden border border-gray-100 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="p-2 space-y-0.5 max-h-[280px] overflow-y-auto custom-scrollbar">
                                            {categories.map((cat) => {
                                                const isSelected = data.categoryId === cat.id;
                                                return (
                                                    <button
                                                        key={cat.id}
                                                        type="button"
                                                        onClick={() => {
                                                            onChange('categoryId', cat.id);
                                                            setIsCategoryOpen(false);
                                                        }}
                                                        className={`
                                                            w-full flex items-center justify-between px-5 py-3 rounded-2xl
                                                            transition-all duration-200 ease-out
                                                            hover:scale-[1.04] hover:shadow-md hover:z-10 relative
                                                            ${isSelected
                                                                ? 'bg-[#ff5a4d]/10 text-black scale-[1.04] shadow-sm'
                                                                : 'text-gray-600 hover:bg-[#ff5a4d]/10 hover:text-[#ff5a4d]'
                                                            }
                                                        `}
                                                    >
                                                        <span className={`font-bold text-sm ${isSelected ? 'text-[#ff5a4d]' : ''}`}>{cat.name}</span>
                                                        <div className={`h-8 w-8 rounded-full transition-all duration-200 flex items-center justify-center ${isSelected
                                                            ? 'bg-[#ff5a4d] text-white scale-110'
                                                            : 'bg-gray-100 text-gray-400'
                                                            }`}>
                                                            {cat.iconUrl ? (
                                                                <img src={cat.iconUrl} alt="" className={`h-5 w-5 object-contain`} />
                                                            ) : (
                                                                <ImageIcon className="h-4 w-4" />
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                            {isLoadingCategories && (
                                                <div className="p-4 text-center text-[10px] font-bold text-black/20 italic animate-pulse">
                                                    Đang tải danh mục...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {showErrors && errors.categoryId && (
                                    <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1 mt-1">{errors.categoryId}</div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-[10px] font-black text-black/30 uppercase tracking-[2px]">Mô tả hoàn cảnh</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsAIModalOpen(true)}
                                        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[#dc2626] border border-red-100 hover:bg-[#dc2626] hover:text-white transition-all group"
                                    >
                                        <Sparkles className="h-3 w-3 group-hover:animate-pulse" />
                                        <span className="text-[9px] font-black uppercase tracking-wider">AI Generate</span>
                                    </button>
                                </div>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => onChange('description', e.target.value)}
                                    rows={5}
                                    placeholder="Nêu rõ hoàn cảnh và mục đích sử dụng quỹ..."
                                    className={`w-full p-5 rounded-2xl border-2 transition-all text-sm font-bold outline-none resize-none leading-relaxed overflow-y-auto custom-scrollbar ${showErrors && errors.description ? 'bg-red-50/50 border-red-200' : 'bg-gray-50/50 border-transparent focus:border-[#dc2626] focus:bg-white'}`}
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
                                    <span className="text-[9px] font-bold text-red-500/60 italic flex items-center gap-1">
                                        <Star className="h-2.5 w-2.5 fill-current" />
                                        Nhấn sao để chọn ảnh bìa
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {mediaOptions.map((opt) => {
                                        const Icon = opt.icon;
                                        return (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => triggerUpload(opt.accept)}
                                                className="flex flex-col items-center justify-center p-2.5 rounded-[1.5rem] border-2 border-transparent bg-gray-50/50 hover:bg-white hover:border-[#dc2626] transition-all group"
                                            >
                                                <div className="h-9 w-9 rounded-full flex items-center justify-center mb-1.5 bg-white text-black/20 group-hover:bg-[#dc2626] group-hover:text-white transition-all">
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-black/30 group-hover:text-black">
                                                    + {opt.label}
                                                </span>
                                                <span className="mt-0.5 text-[7px] font-bold text-red-500/80 uppercase tracking-tighter">Tối đa {opt.limit}</span>
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
                            <div className="space-y-3 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
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
                                            <div className="text-[9px] font-black text-black/20 uppercase tracking-widest flex items-center gap-1">
                                                {item.type}
                                                {data.coverImage === item.url && (
                                                    <span className="text-[#dc2626] flex items-center gap-0.5"><Star className="h-2.5 w-2.5 fill-current" /> Ảnh bìa</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 transition-all">
                                            {item.type === 'image' && (
                                                <button
                                                    type="button"
                                                    onClick={() => setAsCover(item.url)}
                                                    title={data.coverImage === item.url ? 'Đang là ảnh bìa' : 'Đặt làm ảnh bìa'}
                                                    className={`p-2 rounded-lg transition-all shadow-sm ${data.coverImage === item.url
                                                        ? 'bg-[#ff5a4d] text-white'
                                                        : 'bg-gray-100 text-gray-400 hover:bg-[#ff5a4d]/20 hover:text-[#ff5a4d]'
                                                        }`}
                                                >
                                                    <Star className={`h-3 w-3 ${data.coverImage === item.url ? 'fill-current' : ''}`} />
                                                </button>
                                            )}
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
                                    <div className="py-8 flex flex-col items-center justify-center opacity-20 italic">
                                        <Paperclip className="h-8 w-8 mb-2" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Chưa có tệp đính kèm</span>
                                    </div>
                                )}
                            </div>

                            {/* Thank You Message */}
                            <div className="space-y-2 pt-2 border-t border-gray-50">
                                <label className="text-[10px] font-black text-black/30 uppercase tracking-[2px] ml-1">
                                    Lời cảm ơn người ủng hộ <span className="text-[#dc2626] ml-1">* bắt buộc</span>
                                </label>
                                <textarea
                                    value={data.thankMessage || ''}
                                    onChange={(e) => onChange('thankMessage', e.target.value)}
                                    rows={3}
                                    placeholder="Lời tri ân chân thành đến những người sẽ ủng hộ..."
                                    className="w-full p-5 rounded-2xl border-2 transition-all text-sm font-bold outline-none resize-none leading-relaxed overflow-y-auto custom-scrollbar bg-gray-50/50 border-transparent focus:border-[#dc2626] focus:bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="mt-12 flex justify-end items-center gap-4 py-2 px-1 border-t border-black/5 pt-6">
                        <button
                            type="button"
                            onClick={onPrev}
                            className="text-sm font-black text-black/20 hover:text-black transition-colors"
                        >
                            Prev
                        </button>
                        <div className="h-4 w-px bg-black/10" />
                        <button
                            type="button"
                            onClick={onNext}
                            className="text-sm font-black text-[#dc2626] hover:text-red-700 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <AIDescriptionModal
                open={isAIModalOpen}
                onOpenChange={setIsAIModalOpen}
                onApply={handleAIApply}
            />

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